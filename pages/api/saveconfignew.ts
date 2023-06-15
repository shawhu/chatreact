import path from "path";
import { promises as fs } from "fs";

export default async function saveconfig(req: any, res: any) {
  try {
    const { whisperapi } = req.body;
    process.env.whisperapi = whisperapi;
    console.log(process.env.whisperapi);

    const jsonDirectory = path.join(process.cwd(), "json");
    const configData = JSON.stringify(req.body, null, 2); //filter nothing, and indent 2 chars

    await fs.writeFile(`${jsonDirectory}/confignew.json`, configData, "utf8");
    //Return the content of the data file in json format
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
