//*Tool Calling
import Groq from "groq-sdk";

//*step 6 - using tavily for web search
import { tavily } from  "@tavily/core"
// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {

  const message = [
     {
        role: "system",
        content: `you are smart perso assistant, your task is to answer the question.
                `,
      },
      {
        role: "user",
        content:"when IPhone 16 was launched"
        // "what is mumbai weather",
      },
  ]
  const completion = await groq.chat.completions.create({
    temperature: 0,
    model: "llama-3.3-70b-versatile",
    messages: message,
    //*STEP 2 - define tool
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet ",
            //query = parameters
          parameters: {
            // JSON Schema object
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",          
  });

  // message.push(completion.choices[0].message)
  // console.log(completion.choices[0])
  // console.log(completion.choices[0].message.content);
  // console.log(JSON.stringify(completion.choices[0].message.content));
  // console.log(completion)
  
  
  
  //* step 3 GETTING tool_call
  const toolCalls = completion.choices[0].message.tool_calls;
  // console.log("toolCalls", toolCalls)
  
  //* step 4 checks
  // if no tool call menas LLM  generaated final ans
  if (!toolCalls) {
    console.log(`Assistant: ${completion.choices[0].message.content}`);
    return;
  }
  
  //*step 5 looping through tool
  for (const tool of toolCalls) {
    console.log("tool:", tool);
    const functionName = tool.function.name;
    const functionParams = tool.function.arguments;
    
    if (functionName === "webSearch") {
      //webSearch({query}) , query -> LLM provide query
      const toolResult = await webSearch(JSON.parse(functionParams));
      console.log('Tool-result: ',toolResult);
      
      message.push({
        tool_call_id:tool.id,
        role:"tool",
        name:functionName,
        content:toolResult
      })
    }
  }
  //*step 7
  const completion2 = await groq.chat.completions.create({
    temperature: 0,
    model: "llama-3.3-70b-versatile",
    messages: message,
  
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
          "Search the latest information and realtime data on the internet ",
          //query = parameters
          parameters: {
            // JSON Schema object
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",          
  });
  
  console.log(JSON.stringify(completion2.choices[0].message ,null,2));
  // console.log(completion)
}
//*note - keep tool and function name same it will make your life easy
//*     - LLM tells when to call tool 
main();

//TOOLS
//Serper ai
// brave search api
// tavily search - using this

//*step 1 create tool
//*implementing web search tool
// query -> LLM will provide this query
async function webSearch({ query }) {
  //here we will do tavily api call
  console.log("calling websearch...");
  const response = await tvly.search(query);
  // console.log("Respone",response)

  // getting the content only from result
  const finalResult = response.results.map(r=>r.content).join('\n\n')

  return finalResult
}
