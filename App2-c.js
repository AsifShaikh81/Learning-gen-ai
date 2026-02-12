// ===============================
// TOOL CALLING WITH GROQ + TAVILY
// ===============================

import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY
});

// -------------------------------
// Web Search Tool Function
// -------------------------------
async function webSearch({ query }) {
  console.log(" Calling webSearch tool...");

  const response = await tvly.search(query);

  const finalResult = response.results
    .slice(0, 5)
    .map((r) => r.content)
    .join("\n\n");

  return finalResult;
}

// -------------------------------
// MAIN FUNCTION
// -------------------------------
async function main() {
  const messages = [
    {
      role: "system",
      content: "You are a smart assistant. your task is to answer the question ",
    },
    {
      role: "user",
      content: "Tell me about the movie Dhurandhar",
    },
  ];

  // -------------------------------
  // STEP 1 — First Model Call
  // -------------------------------
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    
    tool_choice: "auto",
  });

  const assistantMessage = completion.choices[0].message;

  // 🔥 IMPORTANT — push assistant message
  messages.push(assistantMessage);
  console.log("assistantMsg",assistantMessage) 

  const toolCalls = assistantMessage.tool_calls;
  console.log("tool call",toolCalls)

  // -------------------------------
  // STEP 2 — If No Tool Call
  // -------------------------------
  if (!toolCalls) {
    console.log("Assistant:", assistantMessage.content);
    return;
  }

  // -------------------------------
  // STEP 3 — Execute Tool
  // -------------------------------
  for (const tool of toolCalls) {
    const functionName = tool.function.name;
    const functionArgs = JSON.parse(tool.function.arguments);

    if (functionName === "webSearch") {
      const toolResult = await webSearch(functionArgs);

      messages.push({
        role: "tool",
        tool_call_id: tool.id,
        name: functionName,
        content: String(toolResult),
      });
    }

  }

  // -------------------------------
  // STEP 4 — Second Model Call
  // -------------------------------
  const finalCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages,
  });

  console.log("\n✅ Final Answer:");
  console.log(finalCompletion.choices[0].message.content);
}

main();
