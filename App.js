import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const completion = await groq.chat.completions.create({
        temperature:0.2,
        stop: 'i', //Negative -> Negati
        // max_completion_tokens:1000,
        // frequency_penalty:1, 
        // presence_penalty:1,
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"user",
                content:`Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
                Sentiment:`
            },
            {
                role:"system",
                content:"you are jarvis a smart review analyser.Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative. Output must be a single word. "
            }

        ]
    })
    // console.log(completion.choices[0])
    console.log(completion.choices[0].message.content)
    // console.log(completion)
}

main()

// to check 
// --env-file= envFileName mainFileName
//--env-file=.env app.js