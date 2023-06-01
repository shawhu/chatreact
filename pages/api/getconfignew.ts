import path from "path";
import { promises as fs } from "fs";

export default async function getconfignew(req: any, resp: any) {
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "json");
  //Read the json data file data.json
  const fileContents = await fs.readFile(
    `${jsonDirectory}/confignew.json`,
    "utf8"
  );
  //Return the content of the data file in json format
  resp.status(200).json(fileContents);
}
