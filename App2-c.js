// ===============================
// TOOL CALLING WITH GROQ + TAVILY
// ===============================

import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

import readline from 'node:readline/promises'

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

  const finalResult = response.results.map((r) => r.content).join("\n\n");

  return finalResult;
}

// -------------------------------
// MAIN FUNCTION
// -------------------------------
async function main() {
  const rl =readline.createInterface({
    input:process.stdin,
    output:process.stdout
  })
  const messages = [
    {
      role: "system",
      content: "You are a smart assistant. your task is to answer the question ",
    },
    /* {
      role: "user",
      content: "current weather in mumbai",
    }, */
  ];

 // outer while loop is for user
  while(true){
 const question = await rl.question('You: ')
 messages.push({
  role:'user',
  content: question

 })
 if(question==='bye'){
  break
 }


    // inside while loop is for LLM
    while(true){
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

  // 🔥 IMPORTANT — push assistant message, if not later model will forget
  messages.push(assistantMessage);
  // console.log("assistantMsg",assistantMessage) 

  const toolCalls = assistantMessage.tool_calls;
  // console.log("tool call",toolCalls)

  // -------------------------------
  // STEP 2 — If No Tool Call
  // -------------------------------
  if (!toolCalls) {
    console.log("Assistant:", assistantMessage.content);
    break; // imp to break loop
  }

  // -------------------------------
  // STEP 3 — Execute Tool
  // -------------------------------
  for (const tool of toolCalls) {
    const functionName = tool.function.name;
    const functionArgs = JSON.parse(tool.function.arguments);

    if (functionName === "webSearch") {
      const toolResult = await webSearch(functionArgs);
    //   console.log("tool result:",toolResult) 

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
/*   const finalCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages,
  });

  console.log("\n✅ Final Answer:");
    console.log(finalCompletion.choices[0].message.content);
    // console.log(finalCompletion); */

  }

  }
  rl.close() // this is important to exit from terminal 
}

main();




  /* [
  🔥 Ab messages array ka structure ho jayega:
  { role: "system", content: "You are a smart assistant." },

  { role: "user", content: "What is the current weather in Mumbai?" },

  {
    role: "assistant",
    content: null,
    tool_calls: [
      {
        id: "call_abc123",
        type: "function",
        function: {
          name: "webSearch",
          arguments: "{\"query\":\"current weather in Mumbai\"}"
        }
      }
    ]
  },

  {
    role: "tool",
    tool_call_id: "call_abc123",
    name: "webSearch",
    content: "Mumbai temperature is 29°C with scattered clouds."
  }
]
 */