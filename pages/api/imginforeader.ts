import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import ExifReader from "exifreader";
import formidable from "formidable";
import sharp from "sharp";

const extract = require("png-chunks-extract");
const PNGtext = require("png-chunk-text");
const encode = require("png-chunks-encode");
export const config = {
  api: {
    bodyParser: false,
  },
};

const charaRead = async (file: any, input_format: string) => {
  let format;
  sharp.cache(false);
  if (input_format === undefined || input_format == "") {
    if (file.originalFilename.indexOf(".webp") !== -1) {
      format = "webp";
    } else {
      format = "png";
    }
  } else {
    format = input_format;
  }
  // write the file to the target directory
  const targetFilePath = path.join(process.cwd(), "public/headshots/characters/" + file.originalFilename);
  const filedata = await fs.readFile(file.filepath);
  try {
    await fs.writeFile(targetFilePath, filedata);
    console.log(`File saved to ${targetFilePath}.`);
  } catch (error) {
    console.error(`Error writing file: ${error}`);
  }
  //read file tEXt
  switch (format) {
    case "webp":
      try {
        let char_data;
        const exif_data = await ExifReader.load(filedata);
        if (exif_data && exif_data["UserComment"] && exif_data["UserComment"]["description"]) {
          let description = exif_data["UserComment"]["description"];
          try {
            JSON.parse(description);
            char_data = description;
          } catch {
            const byteArr = description.split(",").map(Number);
            const uint8Array = new Uint8Array(byteArr);
            const decoder = new TextDecoder("utf8");
            const char_data_string = decoder.decode(uint8Array);
            char_data = char_data_string;
          }
        } else {
          console.log("No description found in EXIF data.");
          return "";
        }
        return char_data;
      } catch (err) {
        console.log(err);
        return "";
      }
    case "png":
      const buffer = await fs.readFile(file.filepath);
      const chunks = extract(buffer);
      const textChunks = chunks
        .filter(function (chunk: any) {
          return chunk.name === "tEXt";
        })
        .map(function (chunk: any) {
          return PNGtext.decode(chunk.data);
        });
      var base64DecodedData = Buffer.from(textChunks[0].text, "base64").toString("utf8");
      return base64DecodedData;
    default:
      break;
  }
};

async function processFormData(fields: any, files: any, res: any) {
  // save to persistent data store
  //console.log("processing formdata...");
  try {
    const file = files.file;
    if (!file) {
      res.status(400).json({ error: "Missing file field" });
      return;
    }
    const jsonstr = await charaRead(file, "");
    return jsonstr;
  } catch (error) {
    console.error(error);
  }
}

async function handlePostFormReq(req: any, res: any) {
  const form = formidable({ multiples: true });
  const formData = new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        reject("error");
      }
      resolve({ fields, files });
    });
  });
  try {
    const { fields, files } = await formData;

    try {
      const result = await processFormData(fields, files, res);
      const jobj = result ? JSON.parse(result) : {};
      const file = files.file as any;

      const selectedFields = {
        name: jobj.name,
        description: jobj.description,
        personalitySummary: jobj.personality,
        scenario: jobj.scenario,
        dialoguesExample: jobj.mes_example,
        firstMessage: jobj.first_mes,
        headshoturl: `/headshots/characters/${file.originalFilename}`,
      };
      res.status(200).json(selectedFields);
      return;
    } catch {
      res.status(500).send({ status: "something went wrong" });
      return;
    }
  } catch {
    res.status(400).send({ status: "invalid submission" });
    return;
  }
}
const imgInfoReader = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }
  await handlePostFormReq(req, res);
};

export default imgInfoReader;
