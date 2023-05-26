import path from "path";
import { promises as fs } from "fs";
import { Session, Message } from "@/common/session";

export async function SaveSession(session: Session, res: any) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    const sessionstring = JSON.stringify(session);

    await fs.writeFile(
      `${jsonDirectory}/${session.sessionId}.json`,
      sessionstring,
      "utf8"
    );
    //Return the content of the data file in json format
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
export function LoadSessions(res: any) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json/sessions");
    var sessions: Session[] = [];
    //loading files
    const jsonFiles = fs
      .readdirSync(jsonDirectory)
      .filter((fileName) => /\.json$/.test(fileName));
    jsonFiles.forEach((jsonfile) => {
      const filePath = path.join(jsonDirectory, jsonfile);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const session = JSON.parse(fileContent) as Session;
      sessions.push(session);
    });
    //Return the content of the data file in json format
    res.status(200).json({ data: sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
