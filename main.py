import json
import base64
import argparse
import os

from typing import Dict, Optional
from github import Github, Repository, GithubException

class IndexGenerator:
    def __init__(self, agency: str, verison: str, token: Optional[str] = None,):
        self.github = Github(token) if token else Github()

        # user can change agency and version depending on paramters
        self.index = {
            "agency": agency,
            "version": verison,
            "measurementType": {
                "method": "projects"
            },
            "releases": []
        }

    def get_code_json(self, repo: Repository) -> Optional[Dict]:
        try:
            content = repo.get_contents("code.json", ref = "main")
        except GithubException as e:
            print(f"GitHub Error: {e.data.get('message', 'No message available')}")
            return None

        try:
            decoded_content = base64.b64decode(content.content)
            return json.loads(decoded_content)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON Error: {str(e)}")
            return None

    def update_index(self, index: Dict, code_json: Dict, org_name: str, repo_name: str) -> None:
        baseline = {
            'organization': org_name,
            'name': repo_name
        }

        baseline.update(code_json)
    
        index['releases'].append(baseline)

    def process_organization(self, org_name: str) -> None:
        try:
            org = self.github.get_organization(org_name)
            print(f"\nProcessing organization: {org_name}")

            total_repos = org.public_repos
            print(f"Found {total_repos} public repositories")
            
            for id, repo in enumerate(org.get_repos(type='public'), 1):
                print(f"\nChecking {repo.name} [{id}/{total_repos}]")
                
                code_json = self.get_code_json(repo)
                if code_json:
                    print(f"✅ Found code.json in {repo.name}")
                    self.update_index(self.index, code_json, org_name, repo.name)
                else:
                    print(f"❌ No code.json found in {repo.name}")
                    
        except GithubException as e:
            print(f"Error processing organization {org_name}: {str(e)}")

    def save_index(self, output_path: str) -> None:
        # sorts index by organizaiton then by name
        self.index['releases'].sort(key=lambda x: (x.get('organization', ''), x.get('name', '')))

        with open(output_path, 'w') as f:
            json.dump(self.index, f, indent=2)

def main():
    parser = argparse.ArgumentParser(
        description = "Create an index of code.json files within agency organizations for code.gov compliance.",
        epilog = "Examples:"
               "  python script.py --agency CMS --orgs 'org1,org2' --output code.json --OR-- "
               "  python script.py --agency TTS --orgs 'GSA,USDC' --version 2.0.0"
    )

    parser.add_argument(
        "--agency", 
        required = True,
        help = "Agency name for code.json index creation"
    )
    parser.add_argument(
        "--orgs", 
        required = True,
        help = "Comma-separated list of GitHub organizations in your agency"
    )
    parser.add_argument(
        "--output", 
        default = "code.json",
        help = "Output filename (default: code.json)"
    )
    parser.add_argument(
        "--version", 
        default = "1.0.0",
        help = "Code.json file version (e.g., 1.0.0, 2.1.0)"
    )

    args = parser.parse_args()
    github_key = os.getenv("GITHUB_KEY")

    try:
        indexGen = IndexGenerator(
            agency = args.agency,
            verison = args.version, 
            token = github_key
        )

        for org in args.orgs.split(","):
            org = org.strip()
            indexGen.process_organization(org)

        indexGen.save_index(args.output)
        print(f"\nIndexing complete. Results saved to {args.output}")
        
    except Exception as e:
        print(f"Error: {e}")
        return

if __name__ == "__main__":
    main()