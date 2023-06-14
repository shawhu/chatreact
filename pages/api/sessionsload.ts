import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    try {
      await fs.access(jsonDirectory);
    } catch (error) {
      console.log(`Directory ${jsonDirectory} doesn't exist, create a new one`);
      await fs.mkdir(jsonDirectory);
    }

    const files = await fs.readdir(jsonDirectory);
    if (files.length == 0) {
      //sessions folder is empty, we should create them from sessions_template.json
      const template_file = path.join(process.cwd(), "json/sessions_template.json");
      const template = await fs.readFile(template_file, "utf-8");
      const template_sessions = JSON.parse(template);
      template_sessions.forEach(async (session: any) => {
        const sessionfile = path.join(process.cwd(), `json/sessions/${session.sessionId}.json`);
        const outcome = await fs.writeFile(sessionfile, JSON.stringify(session, null, 2), "utf-8");
      });
      return template_sessions;
    }
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
