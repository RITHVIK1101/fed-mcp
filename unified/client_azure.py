import os, sys, json, asyncio
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

## load environment variables and setup azure client. AD based auth 
load_dotenv()

token_provider = get_bearer_token_provider(
    DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2024-04-01-preview",
    azure_ad_token_provider=token_provider
)

## initialize mcp through stdio  and npx -y for auto install 
async def run(prompt: str):
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@azure/mcp@latest", "server", "start"]
    )
    ## live mcp session
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            ## covert to LLM tools format. doesnt clean or validate schema like aws
            tool_schemas = [{
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description or t.name,
                    "parameters": t.inputSchema
                }
            } for t in tools.tools]
            # tool call and response from azure
            messages = [{"role": "user", "content": prompt}]
            response = client.chat.completions.create(
                model=os.getenv("AZURE_OPENAI_MODEL"),
                messages=messages,
                tools=tool_schemas
            )

            message = response.choices[0].message
            messages.append(message)

            if message.tool_calls:
                for tool_call in message.tool_calls:
                    args = json.loads(tool_call.function.arguments)
                    result = await session.call_tool(tool_call.function.name, args)
                    tool_response = result.content or "(no response)"
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": tool_call.function.name,
                        "content": tool_response
                    })

                final = client.chat.completions.create(
                    model=os.getenv("AZURE_OPENAI_MODEL"),
                    messages=messages
                )
                # Only output the final response
                print(final.choices[0].message.content.strip())
            else:
                print(message.content.strip())

