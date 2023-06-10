import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import ExifReader from "exifreader";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function uploader(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== "POST") {
    res.status(405).json({ error: "Only POST requests are allowed" });
    return;
  }

  await handlePostFormReq(req, res);
}

async function processFormData(fields, files) {
  // save to persistent data store
  console.log("processing formdata...");
  console.log(fields);
  console.log(files);
}

async function handlePostFormReq(req, res) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
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
      await processFormData(fields, files);
      res.status(200).send({ status: "submitted" });
      return;
    } catch (e) {
      res.status(500).send({ status: "something went wrong" });
      return;
    }
  } catch (e) {
    res.status(400).send({ status: "invalid submission" });
    return;
  }
}
