import React, { useState, useEffect, useRef } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  ListSubheader,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { Configuration, OpenAIApi } from "openai";
import { createParser } from "eventsource-parser";
import { Session, Message, SessionManager } from "@/common/session";

function Conversation({ className, prompt, config }) {
  const target_bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  //this loads session history
  useEffect(() => {
    const trigger = () => {
      //console.log("conversation useEffect triggered, loading a new session");
      setMessages(SessionManager.currentSession.messages);
    };
    SessionManager.listnercallback = trigger;
    trigger();
  });
  //this handle prompt change, prompt is a prop
  useEffect(() => {
    //only when base change the prompt, will it trigger this handle function
    if (prompt && prompt != "") {
      handlePrompt(prompt);
      console.log(`conversation got the prompt prop changes: ${prompt}`);
    }
  }, [prompt]);
  //this helps to scroll to the bottom when messages changes.
  useEffect(() => {
    // scrollIntoView function will be called when messages are updated
    target_bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePrompt = async (prompt: string) => {
    if (!prompt) {
      return;
    }
    console.log(config);
    console.log("processing prompt:" + prompt);
    console.log(
      "add user prompt question message AND assistant placeholder response first"
    );
    const newmessages = [
      ...messages,
      { role: "user", content: prompt },
      { role: "assistant", content: "Thinking..." },
    ];
    SessionManager.currentSession.messages = newmessages;
    setMessages(newmessages);

    // abort signal for fetch
    const controller = new AbortController();
    const cancel = () => {
      hasCancel = true;
      controller.abort();
    };

    //actual calling api to get a response stream
    const host = "https://api.openai.com";
    console.log(`${config.openkey} ${config.maxtokenr}`);
    const response = await fetch(`${host}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openkey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: SessionManager.currentSession.messages,
        model: "gpt-3.5-turbo",
        max_tokens: config.maxtokenr,
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
        //throw new Error(`Error from OpenAI: ${JSON.stringify(data)}`);
        setMessages((mmm) => {
          const newmessages = [...mmm];
          newmessages[newmessages.length - 1].content = JSON.stringify(data);
          SessionManager.currentSession.messages = newmessages;
          return newmessages;
        });
      }
      const text = data.choices[0]?.delta?.content;
      if (text !== undefined) {
        temptext += text;
        console.log(`temptext:${temptext}`);
        //using regex to replace ```
        var processed = temptext
          .replace(
            /```\s?([\s\S]*?)\s?```/g, //\s is whitespace including \n, \S is character
            `<br><pre style="background-color: black; color: white;"><code>$1</code></pre>`
          )
          .replace(/\n/g, "<br>")
          .replace(/by OpenAI/g, "by Harry Xiao [萧和]");
        setMessages((mmm) => {
          const newmessages = [...mmm];
          newmessages[newmessages.length - 1].content = processed;
          SessionManager.currentSession.messages = newmessages;
          return newmessages;
        });
      }
    });
    //end of async way----------------------------------------------------------
  };

  return (
    <List className={`${className} w-full overflow-auto min-h-[40vh] pb-10`}>
      <ListSubheader
        className="font-bold text-2xl "
        onClick={() => {
          console.log(`conversatoin header clicked`);
          console.log(`${JSON.stringify(messages)}`);
        }}
      >
        这里是conversaion
      </ListSubheader>
      {messages.map((message, index) => (
        <ListItem
          key={index}
          alignItems="flex-start"
          className={`flex justify-start ${
            (message.role === "assistant") | (message.role === "system")
              ? "flex-row "
              : "flex-row-reverse"
          }`}
        >
          <ListItemAvatar className="flex justify-center">
            <Avatar
              className="w-20 h-20"
              alt="Remy Sharp"
              src={`${
                (message.role === "assistant") | (message.role === "system")
                  ? "/headshots/pure/00033-3165699849.jpg"
                  : ""
              }`}
            />
          </ListItemAvatar>
          <div className="w-3 h-3"></div>
          <ListItemText
            primary={
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            }
            secondary={message.role + " 8:13 AM"}
            className={`rounded-t-xl p-4 flex-1 ${
              (message.role === "assistant") | (message.role === "system")
                ? "rounded-br-xl"
                : "rounded-bl-xl"
            } ${
              (message.role === "assistant") | (message.role === "system")
                ? "bg-blue-100"
                : "bg-green-50"
            }
            ${
              (message.role === "assistant") | (message.role === "system")
                ? "text-black"
                : "text-black"
            } ${
              (message.role === "assistant") | (message.role === "system")
                ? "text-left"
                : "text-right"
            }`}
          />
        </ListItem>
      ))}
      <ListItem ref={target_bottomRef}>thebottom</ListItem>
    </List>
  );
}

export default Conversation;
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
