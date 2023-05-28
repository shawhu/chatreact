import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    if (!req.query.sessionid) {
      res.status(400).json({ error: "sessionid is empty" });
      return;
    }
    const { sessionid } = req.query;
    try {
      const session = await LoadSessionById(sessionid);
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
async function LoadSessionById(sessionid: string) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    //loading files
    const filePath = path.join(jsonDirectory, `${sessionid}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const session = JSON.parse(fileContent);
    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
