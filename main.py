import json
import base64
import argparse
import os

from codejson_index_generator import IndexGenerator

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