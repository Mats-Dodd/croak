import { openai } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages } from "ai";

export async function POST(req: Request) {
  const { messages, issue } = await req.json();

  console.log("HEHEH ISSUE: ", issue);
  if (issue !== undefined) {
    messages[messages.length - 1].content =
      `The user is asking you abut issues of nextjs, we've compiled the most important issues and the user is asking you about these issue, given the title of the issue, answer the user's question ISSUE TITLE: ${issue} USER MESSAGE: ${messages[messages.length - 1].content} `;
  }
  console.log("DUDE MESSAGES: ", messages);

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
