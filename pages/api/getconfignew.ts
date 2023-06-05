import path from "path";
import { promises as fs } from "fs";

export default async function getconfignew(req: any, resp: any) {
  //Find the absolute path of the json directory
  const filePath = path.join(process.cwd(), "json/confignew.json");
  //first check if we have confignew.json
  try {
    await fs.access(filePath);
  } catch (error) {
    const defaultContents = `{"openaikey":"","ctrlenter":false,"maxtokencontext":4096,"maxtokenreply":2000,"voiceover":false,"currentsessionid":"","koboldapi":""}`;
    await fs.writeFile(filePath, defaultContents);
  }

  //Read the json data file data.json
  const fileContents = await fs.readFile(filePath, "utf8");
  //Return the content of the data file in json format
  resp.status(200).json(fileContents);
}
