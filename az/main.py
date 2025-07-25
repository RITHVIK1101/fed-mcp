from fastapi import FastAPI
from pydantic import BaseModel
import os
import openai
from dotenv import load_dotenv
from azure.identity import AzureCliCredential
from azure.mgmt.resource import ResourceManagementClient

import sys

print("🚀 Starting Azure MCP FastAPI server...", file=sys.stderr)

# Load environment variables
load_dotenv()

app = FastAPI()

# Azure + OpenAI Config
SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID")
DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")

openai.api_type = "azure"
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = "2024-02-15-preview"

# Azure SDK Client
credential = AzureCliCredential()
resource_client = ResourceManagementClient(credential, SUBSCRIPTION_ID)

# Schema for request body
class MessageRequest(BaseModel):
    prompt: str
    session_id: str

@app.post("/sendMessage")
def send_message(req: MessageRequest):
    print("✅ Prompt received:", req.prompt, file=sys.stderr)

    # Fetch Azure resources
    resources = resource_client.resources.list()
    resource_data = [{"name": r.name, "type": r.type, "location": r.location} for r in resources]

    # System prompt context
    system_prompt = (
        "You are an assistant with access to the user's Azure resources. "
        "Answer their questions using the following JSON data:\n\n" +
        str(resource_data)
    )

    # Call Azure OpenAI
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.prompt}
        ],
        max_tokens=500
    )

    reply = response["choices"][0]["message"]["content"]

    return {
        "session_id": req.session_id,
        "model": DEPLOYMENT_NAME,
        "response": reply
    }
