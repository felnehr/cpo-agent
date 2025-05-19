import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// OpenAI system prompt
const SYSTEM_PROMPT = `
You are the CPO Assistant. Your task:
1) Ask clarifying questions to gather feature context, requirements, edge cases and best practices.
2) When ready, emit a JSON string block labeled \`TICKET_PAYLOAD\` containing \`title\` (string) and \`description\` (markdown string).

Example output format when ready to create a ticket:

I've gathered enough information to create a ticket for this feature. Here's what I'll submit:

TICKET_PAYLOAD
\`\`\`json
{
  "title": "Implement user authentication with social login",
  "description": "## Overview\\n\\nAdd social login (Google, GitHub) to the authentication flow.\\n\\n## Requirements\\n\\n- Support Google and GitHub OAuth\\n- Maintain existing email/password login\\n- Update user profile with information from social providers"
}
\`\`\`

Is there anything you'd like to adjust before I create this ticket?
`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Use OpenAI via the AI SDK
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: SYSTEM_PROMPT,
  });

  return result.toDataStreamResponse();
}
