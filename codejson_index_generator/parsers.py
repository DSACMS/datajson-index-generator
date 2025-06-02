import json
import base64
import argparse
import os

from typing import Dict, Optional
from github import Github, Repository, GithubException, Organization


class IndexGenerator:
    def __init__(self, token: Optional[str] = None,):
        self.github = Github(token) if token else Github()

        # user can change agency and version depending on paramters
        self.index = {
            "files": []
        }

    def get_data_json(self, repo: Repository) -> Optional[Dict]:
        try:
            content = repo.get_contents("data.json", ref = repo.default_branch)
        except GithubException as e:
            print(f"GitHub Error: {e.data.get('message', 'No message available')}")
            return None

        try:
            decoded_content = base64.b64decode(content.content)
            return json.loads(decoded_content)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON Error: {str(e)}")
            return None
    
    def save_data_json(self, repo: Repository, output_path: str) -> Optional[str]:
        
        res = self.get_data_json(repo)

        if res:
            with open(output_path, 'w') as f:
                json.dump(res, f, indent=2)
        else:
            print(f"Error getting data.json file!")
        
        return res

    def update_index(self, index: Dict, data_json: Dict, org_name: str, repo_name: str) -> None:
        baseline = {
            'organization': org_name,
            'name': repo_name
        }

        baseline.update(data_json)
    
        index['files'].append(baseline)

    def get_org_repos(self, org_name: str) -> list[Organization]:
        try:
            org = self.github.get_organization(org_name)
            print(f"\nProcessing organization: {org_name}")

            total_repos = org.public_repos
            print(f"Found {total_repos} public repositories")

            return total_repos
        except GithubException as e:
            raise e

    def save_organization_files(self, org_name: str, dataJSONPath) -> None:
        raise NotImplementedError

    def process_organization(self, org_name: str, add_to_index=True, dataJSONPath=None) -> None:
        try:
            org = self.github.get_organization(org_name)
            total_repos = self.get_org_repos(org_name)
            
            for id, repo in enumerate(org.get_repos(type='public'), 1):
                print(f"\nChecking {repo.name} [{id}/{total_repos}]")
                
                if not dataJSONPath:
                    data_json = self.get_data_json(repo)
                else:
                    repoPath = os.path.join(dataJSONPath, (repo.name + '.json'))
                    data_json = self.save_data_json(repo,repoPath)

                if data_json and add_to_index:
                    print(f"✅ Found data.json in {repo.name}")
                    self.update_index(self.index, data_json, org_name, repo.name)
                elif not data_json:
                    print(f"❌ No data.json found in {repo.name}")
                    
        except GithubException as e:
            print(f"Error processing organization {org_name}: {str(e)}")

    def save_index(self, output_path: str) -> None:
        # sorts index by organizaiton then by name
        self.index['files'].sort(key=lambda x: (x.get('organization', ''), x.get('name', '')))

        with open(output_path, 'w') as f:
            json.dump(self.index, f, indent=2)
