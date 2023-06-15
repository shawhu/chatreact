import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import ExifReader from "exifreader";
import formidable from "formidable";
import sharp from "sharp";

const extract = require("png-chunks-extract");
const PNGtext = require("png-chunk-text");
const encode = require("png-chunks-encode");

const ProcessingImageAsync = async (source_img: string, tEXtdata: any, target_img: string) => {
  try {
    //get file extension
    // const matched = source_img.match(/\.([^.]+)$/);
    // let format = matched[1];
    let format = path.extname(source_img);

    // Load the image in any format
    sharp.cache(false);
    const filepath = path.join(process.cwd(), `public/${source_img}`);
    const targetpath = path.join(process.cwd(), `public/${target_img}`);
    const jobj = JSON.parse(tEXtdata);
    const pngjobj = {
      name: jobj.name,
      description: jobj.description,
      personality: jobj.personalitySummary,
      scenario: jobj.scenario,
      mes_example: jobj.dialoguesExample,
      first_mes: jobj.firstMessage,
    };
    const pngjson = JSON.stringify(pngjobj);
    switch (format) {
      case ".webp":
      case "webp":
        const imageBuffer = await fs.readFile(filepath);

        let stringByteArray = new TextEncoder().encode(pngjson).toString();
        const processedImage = await sharp(imageBuffer)
          .resize(400, 600)
          .webp({ quality: 95 })
          .withMetadata({
            exif: {
              IFD0: {
                UserComment: stringByteArray,
              },
            },
          })
          .toBuffer();
        await fs.writeFile(targetpath, processedImage);
        break;
      case ".png":
      case "png":
        var image = await sharp(filepath).resize(400, 600).toFormat("png").toBuffer(); // old 170 234
        // Get the chunks
        var chunks = extract(image);
        var tEXtChunks = chunks.filter((chunk: any) => chunk.name === "tEXt");
        // Remove all existing tEXt chunks
        for (var tEXtChunk of tEXtChunks) {
          chunks.splice(chunks.indexOf(tEXtChunk), 1);
        }
        // const selectedFields = {
        //   name: jobj.name,
        //   description: jobj.description,
        //   personalitySummary: jobj.personality,
        //   scenario: jobj.scenario,
        //   dialoguesExample: jobj.mes_example,
        //   firstMessage: jobj.first_mes,
        //   headshoturl: `/headshots/characters/${file.originalFilename}`,
        // };
        // Add new chunks before the IEND chunk
        var base64EncodedData = Buffer.from(pngjson, "utf8").toString("base64");
        chunks.splice(-1, 0, PNGtext.encode("chara", base64EncodedData));
        await fs.writeFile(targetpath, Buffer.from(encode(chunks)));
        break;
      default:
        break;
    }
  } catch (err) {
    throw err;
  }
};

export default async function imgSaveInfo(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }
  //get source_img,target_img and tEXt from req
  const { source_img, target_img, tEXt } = req.body;
  await ProcessingImageAsync(source_img, JSON.stringify(tEXt), target_img);

  console.log(`request is:\nsource_img:${source_img}\ntarget_img:${target_img}\ntEXt:${JSON.stringify(tEXt)}`);
  res.status(200).json({ exported: target_img });
  return;
}
