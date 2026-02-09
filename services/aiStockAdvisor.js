async function getAIStockAdvice(prompt) {
  
  const response = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", 
          content: "You help store owners increase profit." },
          { role: "user",
            content: prompt }
        ],
        max_tokens: 300,
      }),
    }
  );

  const data = await response.json();

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    console.error("AI returned invalid JSON:", data.choices[0].message.content);
    return null;
  }
}
module.exports=getAIStockAdvice;