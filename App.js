import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const completion = await groq.chat.completions.create({
    //  temperature:1,
       // stop: 'i', Negative -> Negati
        // max_completion_tokens:1000,
        // frequency_penalty:1, 
        // presence_penalty:1,
        response_format:{type:"json_object"}, // to get structured output
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"user",
                content:`Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week. You must return valid JSON structure
                example: {"sentiment":"Negative"}
                `
            },
            {
                role:"system",
                content:"you are jarvis a smart review analyser.Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative. Output must be a single word. "
            }

        ],
        
    })
    // console.log(completion.choices[0])
    // console.log(completion.choices[0].message.role)
    // console.log(completion.choices[0].message.content)
    console.log(completion)
}

main()

// to check 
// node --env-file= envFileName mainFileName
//node --env-file=.env app.js