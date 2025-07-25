import os, sys, json, asyncio, subprocess
from dotenv import load_dotenv
from typing import Dict, Any, List
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("CLAUDE_API_KEY"),
    base_url=os.getenv("CLAUDE_API_BASE", "https://api.anthropic.com/v1")
)

def validate_schema(schema: Dict[str, Any]) -> bool:
    schema_str = json.dumps(schema)
    return not any(p in schema_str for p in ["str | None", "string | null", '"anyOf"', '"oneOf"'])

def clean_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(schema, dict):
        cleaned = {}
        for key, value in schema.items():
            if key == "type" and isinstance(value, list):
                cleaned[key] = value[0] if value else "string"
            elif key in {"anyOf", "oneOf"}:
                continue
            elif isinstance(value, dict):
                cleaned[key] = clean_schema(value)
            elif isinstance(value, list):
                cleaned[key] = [clean_schema(item) if isinstance(item, dict) else item for item in value]
            else:
                cleaned[key] = value
        return cleaned
    return schema

async def run(prompt: str):
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    # Try `uv tool run` first
    server_params = StdioServerParameters(
        command="uv",
        args=["tool", "run", "awslabs.aws-documentation-mcp-server@latest"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_response = await session.list_tools()

            tools = []
            for tool in tools_response.tools:
                if tool.inputSchema and validate_schema(tool.inputSchema):
                    cleaned = clean_schema(tool.inputSchema)
                    tools.append({
                        "type": "function",
                        "function": {
                            "name": tool.name,
                            "description": tool.description or f"AWS Tool: {tool.name}",
                            "parameters": cleaned
                        }
                    })

            # Round 1: Let Claude choose tool
            response = client.chat.completions.create(
                model=os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229"),
                messages=[{"role": "user", "content": prompt}],
                tools=tools,
                max_tokens=4000
            )
            resp_msg = response.choices[0].message

            messages = [{"role": "user", "content": prompt}, resp_msg.model_dump()]

            # Tool usage
            if resp_msg.tool_calls:
                for call in resp_msg.tool_calls:
                    try:
                        args = json.loads(call.function.arguments)
                        result = await session.call_tool(call.function.name, args)
                        content = result.content or "Tool returned nothing"
                        messages.append({
                            "tool_call_id": call.id,
                            "role": "tool",
                            "name": call.function.name,
                            "content": content
                        })
                    except Exception as e:
                        messages.append({
                            "tool_call_id": call.id,
                            "role": "tool",
                            "name": call.function.name,
                            "content": f"Tool call failed: {e}"
                        })

                # Final answer from Claude
                final = client.chat.completions.create(
                    model=os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229"),
                    messages=messages,
                    max_tokens=4000
                )
                print(final.choices[0].message.content)
            else:
                # Claude gave direct answer
                print(resp_msg.content)

async def fallback(prompt: str):
    fallback_prompt = f"""
    You are an AWS expert. Please answer this question with best practices, examples, and clarity:

    {prompt}
    """
    try:
        response = client.chat.completions.create(
            model=os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229"),
            messages=[{"role": "user", "content": fallback_prompt}],
            max_tokens=4000
        )
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Claude fallback error: {e}")

async def main():
    if len(sys.argv) < 2:
        print("❌ No prompt received.")
        return
    prompt = " ".join(sys.argv[1:])

    try:
        await run(prompt)
    except Exception as e:
        print(f"⚠️ MCP failed, using fallback Claude response: {e}")
        await fallback(prompt)

if __name__ == "__main__":
    asyncio.run(main())
