import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // sessionid is undefined, we shall return all sessions
    const sessions = await LoadAllSessions();
    res.status(200).json(sessions);
    return;
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
async function LoadAllSessions() {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    const files = await fs.readdir(jsonDirectory);
    const jsonfiles = files.filter((f) => f.endsWith(".json"));
    var sessions = [];

    for (let i = 0; i < jsonfiles.length; i++) {
      const file = jsonfiles[i];
      const filePath = path.join(jsonDirectory, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const session = JSON.parse(fileContent);
      sessions.push(session);
    }
    return sessions;
  } catch (error) {
    console.error(error);
    throw error;
  }
}