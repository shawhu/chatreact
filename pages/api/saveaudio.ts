import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

const saveAudio = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }

  try {
    const audioData = req.body;
    const fileName = "recording.m4a";
    const filePath = path.join(process.cwd(), `/public/temp/${fileName}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving audio file" });
  }
};

export default saveAudio;
