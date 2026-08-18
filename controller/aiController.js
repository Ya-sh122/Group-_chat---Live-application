const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getChatSuggestion = async (req, res) => {
  try {
    const { context } = req.body;

    if (!context || context.length === 0) {
      return res.status(400).json({ message: "Context is required for suggestions." });
    }

    // Get the model (using a currently supported Gemini model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a prompt based on the last few messages
    const prompt = `
      You are an AI assistant helping a user write a reply in a group chat. 
      Here are the last few messages in the conversation: 
      "${context}"
      
      Generate exactly 3 short, natural-sounding reply suggestions for the user to pick from. 
      Provide them as a simple comma-separated list, with no extra text or numbering. 
      Keep them casual and appropriate for a standard chat.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up the response to get an array of 3 strings
    const suggestions = responseText.split(',').map(s => s.trim()).filter(s => s.length > 0);

    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("Gemini AI Error:", err);
    res.status(500).json({ message: "Failed to generate AI suggestion." });
  }
};