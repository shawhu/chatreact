import path from "path";
import { promises as fs } from "fs";

export default async function sessionsave(req: any, res: any) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    const configData = JSON.stringify(req.body, null, 2); //filter nothing, and indent 2 chars

    await fs.writeFile(
      `${jsonDirectory}/${req.body.sessionId}.json`,
      configData,
      "utf8"
    );
    //Return the content of the data file in json format
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
