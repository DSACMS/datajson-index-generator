import json
import base64
import argparse
import os

from codejson_index_generator import IndexGenerator

def main():
    parser = argparse.ArgumentParser(
        description = "Create an index of code.json files within agency organizations for code.gov compliance.",
        epilog = "Examples:"
               "  python script.py --orgs 'org1,org2' --output data-index.json --OR-- "
               "  python script.py --orgs 'GSA,USDC' "
    )

    parser.add_argument(
        "--orgs", 
        required = True,
        help = "Comma-separated list of GitHub organizations in your agency"
    )
    parser.add_argument(
        "--output", 
        default = "data-index.json",
        help = "Output filename (default: code.json)"
    )

    args = parser.parse_args()
    github_key = os.getenv("GITHUB_KEY")

    try:
        indexGen = IndexGenerator( 
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