// server/routes/langchain.js
import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const langchainRouter = express.Router();

langchainRouter.post('/ai', async (req, res) => {
  const { userMessage } = req.body;

  try {
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
      },
      model: "gpt-4o",
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant."],
      ["human", "{input}"],
    ]);

    const chain = prompt.pipe(model);

    const result = await chain.invoke({ input: userMessage });

    res.json({ response: result.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default langchainRouter;