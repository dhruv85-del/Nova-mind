import "dotenv/config";

const getOpenAIResponse = async (message) => {
     const options={
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.API_KEY}`
        },
        body: JSON.stringify({
            model:"google/gemma-4-31b-it:free",
            messages:[{"role": "user", "content": message || "Hello"}]
        })
    };

    try{
       const response= await fetch("https://openrouter.ai/api/v1/chat/completions", options);
       console.log("Status:", response.status);
             const data = await response.json();
             console.log("Response:", data);
             // Try common response shapes and return plain text
             if (data?.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
                 return data.choices[0].message.content;
             }
             if (data?.output && Array.isArray(data.output) && typeof data.output[0]?.content === 'string') {
                 return data.output[0].content;
             }
             if (typeof data?.text === 'string') {
                 return data.text;
             }
             // Fallback to stringifying the whole response
             return JSON.stringify(data);
    } catch(err){
        console.log("Error:", err);
        throw err;
    }
}

export default getOpenAIResponse;