import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import ExifReader from "exifreader";
import sharp from "sharp";
//import { extract } from "png-chunks-extract";
const extract = require("png-chunks-extract");
const PNGtext = require("png-chunk-text");

const pngInfoReader = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method !== "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }

  try {
    const imgurl = req.body.imgurl;
    if (!imgurl || imgurl == "") {
      res.status(400).json({ error: "Missing imgurl field" });
      return;
    }
    const text = await charaRead(imgurl);
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing image file" });
  }
};

const charaRead = async (img_url, input_format) => {
  let format;
  sharp.cache(false);
  if (input_format === undefined) {
    if (img_url.indexOf(".webp") !== -1) {
      format = "webp";
    } else {
      format = "png";
    }
  } else {
    format = input_format;
  }
  const filepath = path.join(process.cwd(), img_url);
  switch (format) {
    case "webp":
      try {
        sharp.cache(false);
        let char_data;

        const exif_data = await ExifReader.load(await fs.readFile(filepath));

        if (exif_data["UserComment"]["description"]) {
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
      const buffer = await fs.readFile(filepath);
      const chunks = extract(buffer);
      const textChunks = chunks
        .filter(function (chunk) {
          return chunk.name === "tEXt";
        })
        .map(function (chunk) {
          return PNGtext.decode(chunk.data);
        });
      var base64DecodedData = Buffer.from(
        textChunks[0].text,
        "base64"
      ).toString("utf8");
      return base64DecodedData;
    default:
      break;
  }
};

export default pngInfoReader;
