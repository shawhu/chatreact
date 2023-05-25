import * as React from "react";
import { createParser } from "eventsource-parser";

function TestPage() {
  console.log("test start");
  const host = "https://api.openai.com";
  const modelName = "gpt-3.5-turbo";
  const [openaiKey, setOpenaiKey] = React.useState("");
  const [maxtokencontext, setMaxtokencontext] = React.useState("");
  const [maxtokenreply, setMaxtokenreply] = React.useState("");
  const [fullText, setFullText] = React.useState("sometext");
  const fullTextRef = React.useRef("sometext"); // Use useRef to keep track of

  //get openaiKey, maxtokencontext and maxtokenreply
  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await fetch("/api/getconfig");
        const configData = await response.json();
        const { openaikey, maxtokencontext, maxtokenreply } =
          JSON.parse(configData);
        setOpenaiKey(openaikey);
        setMaxtokencontext(maxtokencontext);
        setMaxtokenreply(maxtokenreply);
        console.log(
          `openaikey read from json: ${openaikey} maxtokencontext:${maxtokencontext} maxtokenreply:${maxtokenreply}`
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchConfigData();
  }, []);

  async function clickHander(e) {
    console.log("clicked triggered by id: " + e.target.id);
    console.log("now try to call openai and get a response");
    // abort signal for fetch
    const controller = new AbortController();
    const cancel = () => {
      hasCancel = true;
      controller.abort();
    };

    const response = await fetch(`${host}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hello" }],
        model: modelName,
        max_tokens: maxtokenreply,
        stream: true,
      }),
      signal: controller.signal,
    });
    let temptext = "";
    await handleSSE(response, (message) => {
      if (message === "[DONE]") {
        return;
      }
      const data = JSON.parse(message);
      if (data.error) {
        throw new Error(`Error from OpenAI: ${JSON.stringify(data)}`);
      }
      const text = data.choices[0]?.delta?.content;
      if (text !== undefined) {
        temptext += text;
        setFullText(`${temptext}`);

        console.log(`fulltext:${fullText}`);
        console.log(`temptext:${temptext}`);
      }
    });
  }

  return (
    <div>
      <div
        id="clickbutton_id"
        onClick={clickHander}
        className="w-28 h-12 bg-stone-200"
      >
        测试按钮
      </div>
      <div>ABORT</div>
      <div>{fullText}</div>
    </div>
  );
}

export default TestPage;

export async function handleSSE(
  response: Response,
  onMessage: (message: string) => void
) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error
        ? JSON.stringify(error)
        : `${response.status} ${response.statusText}`
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Error from OpenAI: ${response.status} ${response.statusText}`
    );
  }
  if (!response.body) {
    throw new Error("No response body");
  }
  const parser = createParser((event) => {
    if (event.type === "event") {
      onMessage(event.data);
    }
  });
  for await (const chunk of iterableStreamAsync(response.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}

export async function* iterableStreamAsync(
  stream: ReadableStream
): AsyncIterableIterator<Uint8Array> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      } else {
        yield value;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
