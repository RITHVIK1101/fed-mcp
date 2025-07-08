from fastapi import FastAPI
from pydantic import BaseModel
import os
import openai
from dotenv import load_dotenv
from azure.identity import AzureCliCredential
from azure.mgmt.resource import ResourceManagementClient

load_dotenv()

app = FastAPI()
SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID")
openai.api_type = "azure"
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = "2024-02-15-preview"
DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")

# Azure SDK client
credential = AzureCliCredential()
resource_client = ResourceManagementClient(credential, SUBSCRIPTION_ID)

# Request schema
class MessageRequest(BaseModel):
    prompt: str
    session_id: str

# MCP endpoint
@app.post("/sendMessage")
def send_message(req: MessageRequest):
    resources = resource_client.resources.list()
    resource_data = []

    for res in resources:
        resource_data.append({
            "name": res.name,
            "type": res.type,
            "location": res.location
        })

    system_prompt = (
        "You are an assistant with access to the user's Azure resources. "
        "Answer their questions using the following JSON data:\n\n" +
        str(resource_data)
    )

    # Step 3: Call GPT-4o via Azure OpenAI
    completion = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )

    reply = completion["choices"][0]["message"]["content"]

    return {
        "session_id": req.session_id,
        "model": DEPLOYMENT_NAME,
        "response": reply
    }
