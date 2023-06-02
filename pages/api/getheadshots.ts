import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

const headshotsdir = "public/headshots";
const urlprefix = "headshots";
class HeadShot {
  url: string = "";
  genre: string = "";
}
async function LoadAllHeadshots() {
  const subDirs = await ListSubDirsAsync(headshotsdir);
  const headshots: HeadShot[] = [];

  for (let index = 0; index < subDirs.length; index++) {
    const subdir = subDirs[index];
    const subDirName = path.basename(subdir);
    const jpgfiles = (await ListFilesFromDirAsync(subdir)).forEach(
      (filename) => {
        const hs = new HeadShot();
        hs.url = `/${urlprefix}/${subDirName}/${filename}`;
        hs.genre = subDirName;
        headshots.push(hs);
      }
    );
  }

  // Get distinct genres from headshots array
  const genres = [...new Set(headshots.map((hs) => hs.genre))];

  // Return object with genres and headshots
  return {
    genres,
    data: headshots,
  };
}

async function ListSubDirsAsync(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const subDirectories = files
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(dirPath, dirent.name));
    return subDirectories;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function ListFilesFromDirAsync(dir: string) {
  try {
    const jsonDirectory = path.join(process.cwd(), dir);
    const files = await fs.readdir(jsonDirectory);
    if (files.length == 0) {
      return [];
    }
    const filtered_files = files.filter((f) => f.endsWith(".jpg"));
    return filtered_files;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // sessionid is undefined, we shall return all sessions
    const result = await LoadAllHeadshots();
    res.status(200).json(result);
    return;
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
