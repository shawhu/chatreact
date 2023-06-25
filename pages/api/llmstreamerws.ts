import { NextApiRequest, NextApiResponse } from "next";
import { WebSocket } from "ws";
import { Readable } from "stream";

const doTask = async (text: string) => {
  console.log(`doTask running, text:${text}`);
};

//url: "ws://192.168.42.120:5005/api/v1/stream",
const llmstreamerws = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set up server-sent events response headers
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  if (req.method != "POST") {
    res.status(400).json({ error: "Only POST requests are allowed" });
    return;
  }

  try {
    const url = req.body.koboldapi;
    const bodytext = JSON.stringify(req.body.data);
    if (!url || url == "" || !bodytext || bodytext == "") {
      res.status(400).json({ error: "Missing koboldapi or data field" });
      return;
    }
    //console.log(bodytext);
    // Create a WebSocket client and connect to the external API
    const ws = new WebSocket(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    ws.once("open", () => {
      // Send the request payload to the API using the WebSocket connection
      ws.send(bodytext, (err) => {
        if (err) throw err;
      });
    });
    let fulltext = "";
    // Listen for incoming WebSocket messages and push them to the stream
    ws.on("message", (data: string | ArrayBuffer) => {
      const byteArrayData = new Uint8Array(data as ArrayBuffer);
      const message = new TextDecoder().decode(byteArrayData);
      const jobj = JSON.parse(message);

      if (jobj.event == "text_stream") {
        if (fulltext == "" && jobj.text.trim() == "") {
          return;
        }
        fulltext += jobj.text;
        //console.log(fulltext);
        let checkingarray = fulltext.split("\nYou:");
        if (checkingarray.length > 1) {
          //found \nYou, close the ws and send ending
          //console.log("found \\nYou, trying to close the ");
          res.status(200).end("data: [DONE]\n\n");
          ws.close();
          doTask(fulltext);
          return;
        }
        checkingarray = fulltext.split("\nyou:");
        if (checkingarray.length > 1) {
          //found \nYou, close the ws and send ending
          //console.log("found \\nYou, trying to close the ");
          res.status(200).end("data: [DONE]\n\n");
          ws.close();
          doTask(fulltext);
          return;
        }
        //const output = `event: message\ndata: ${jobj.text}\n\n`;
        const outputdata = JSON.stringify({
          choices: [{ delta: { content: jobj.text } }],
        });
        //const output = `data: abc`;
        res.write(`data: ${outputdata}\n\n`);
      } else {
        //console.log("message end. trying to close ws connection");
        res.status(200).end("data: [DONE]\n\n");
        ws.close();
      }
    });
    // When the WebSocket connection is closed, end the stream
    ws.once("close", () => {
      //console.log("ws closed");
      res.status(200).end();
      return;
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      ws.close();
      res.status(500).json({ error: "WebSocket connection error" });
      return;
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export default llmstreamerws;
