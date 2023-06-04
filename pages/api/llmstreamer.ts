import type { NextApiRequest, NextApiResponse } from "next";

const llmstreamer = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }

  try {
    const promptRequest = req.body;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving audio file" });
  }
};

export default llmstreamer;
