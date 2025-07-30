import os
import subprocess
import sys
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

# Set working directory to the script's directory
script_dir = os.path.dirname(os.path.realpath(__file__))
os.chdir(script_dir)

# .env file
load_dotenv()

# Set up Azure GPT client
token_provider = get_bearer_token_provider(
    DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2024-04-01-preview",
    azure_ad_token_provider=token_provider
)

model = os.getenv("AZURE_OPENAI_MODEL")

def classify_prompt(prompt):
    """
    Classify user prompt as 'azure' or 'aws'
    """
    system_prompt = """Classify the following user request as either 'azure' or 'aws' based on the cloud service mentioned or implied.

Examples:
- "S3 bucket versioning" -> aws
- "Azure Blob Storage" -> azure
- "EC2 instances" -> aws
- "Virtual machines in Azure" -> azure
- "Lambda functions" -> aws
- "Azure Functions" -> azure

Only respond with one word: 'azure' or 'aws'."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=10
        )
        label = response.choices[0].message.content.strip().lower()
        return label if label in ['azure', 'aws'] else 'aws'
    except Exception as e:
        print(f"Classification failed: {e}")
        return 'aws'

def route_to_client(label, prompt):
    """
    Route prompt to correct script and return output
    """
    try:
        if label == "azure":
            result = subprocess.run(
                ["python3", "client_azure.py", prompt],
                capture_output=True,
                text=True
            )
        else:
            result = subprocess.run(
                ["python3", "client_aws.py", prompt],
                capture_output=True,
                text=True
            )

        return result.stdout.strip()

    except FileNotFoundError as e:
        return f"Client file not found: {e}"
    except Exception as e:
        return f"Error routing request: {e}"

def test_prerequisites():
    """
    Check that all required files and env vars exist
    """
    errors = []

    if not os.path.exists("client_aws.py"):
        errors.append("client_aws.py not found")
    if not os.path.exists("client_azure.py"):
        errors.append("client_azure.py not found")

    for var in ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_MODEL"]:
        if not os.getenv(var):
            errors.append(f"Missing env var: {var}")

    if errors:
        print("Prerequisites check failed:")
        for e in errors:
            print(f"  • {e}")
        return False

    return True

def main():
    """
    Main entry point for router
    """
    if not test_prerequisites():
        print("Fix the issues above and try again")
        return

    if len(sys.argv) < 2:
        print("No prompt provided.")
        return

    prompt = " ".join(sys.argv[1:]).strip()
    if not prompt:
        print(" Empty prompt.")
        return

    label = classify_prompt(prompt)
    output = route_to_client(label, prompt)
    print(output)

if __name__ == "__main__":
    main()
