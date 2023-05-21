import path from "path";
import { promises as fs } from "fs";

export default async function saveconfig(req, res) {
  try {
    const { openaikey, version } = req.body;

    const jsonDirectory = path.join(process.cwd(), "json");
    const configData = JSON.stringify({ openaikey, version }, null, 2);

    await fs.writeFile(`${jsonDirectory}/config.json`, configData, "utf8");
    //Return the content of the data file in json format
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
