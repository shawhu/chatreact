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
      const session = await LoadSessionById(sessionid as string);
      //Return the content of the data file in json format
      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "loading json file error." });
    }
  } else if (req.method === "DELETE") {
    try {
      const session = await DeleteSessionById(sessionid as string);
      //Return the content of the data file in json format
      res.status(200).json(`ok`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "delete json file error." });
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
async function DeleteSessionById(sessionid: string) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    // Get the file path
    const filePath = path.join(jsonDirectory, `${sessionid}.json`);
    // Delete the file
    await fs.unlink(filePath);
    console.log(`Session with id ${sessionid} deleted.`);
  } catch (error) {
    console.error(`Error deleting session with id ${sessionid}: `, error);
    throw error;
  }
}
