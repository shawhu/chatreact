import { NextApiResponse, NextApiRequest } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set up server-sent events response headers
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");

  // Send messages every second
  let counter = 0;
  const messageInterval = setInterval(() => {
    if (counter >= 10) {
      // End the connection after 10 messages
      clearInterval(messageInterval);
      res.status(200).end("event: end\ndata: Stream ended.\n\n");
    } else {
      // Send a message with the current counter value
      res.write(`event: message\ndata: text${counter}\n\n`);
      counter++;
    }
  }, 250);

  // Close the connection if the client disconnects
  req.on("close", () => {
    clearInterval(messageInterval);
    res.status(200).end();
  });
}
