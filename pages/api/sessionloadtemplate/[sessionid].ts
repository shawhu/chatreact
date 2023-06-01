import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.sessionid) {
    res.status(400).json({ error: "sessionid is empty" });
    return;
  }
  const { sessionid } = req.query;
  if (req.method === "GET") {
    try {
      const session = await LoadSessionFromTemplateById(sessionid as string);
      //Return the content of the data file in json format
      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "loading json file error." });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
async function LoadSessionFromTemplateById(sessionid: string) {
  try {
    const jsonDirectory = path.join(
      process.cwd(),
      "json/sessions_template.json"
    );
    //loading file
    const filePath = jsonDirectory;
    const fileContent = await fs.readFile(filePath, "utf-8");
    const sessions = JSON.parse(fileContent);
    const session = sessions.find((s: any) => s.sessionId == sessionid);
    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
