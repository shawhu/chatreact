import React, { useState, useEffect, useRef } from "react";
import { List, ListItem, ListItemText, Typography, ListSubheader, ListItemAvatar, Avatar } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { Configuration, OpenAIApi } from "openai";
import { createParser } from "eventsource-parser";
import { Session, Message, SessionManager } from "@/common/session";
import Snackbar from "@mui/material/Snackbar";
import MyMessageBlock from "@/components/mymessageblock";
import { getFormattedDateTime, TrimAndGetTextInQuote } from "@/common/helper";
import { Config } from "@/common/config";
import HistoryEditor from "@/components/historyeditor";
import HeadshotPicker from "@/components/headshotpicker";

export async function handleSSE(response: Response, onMessage: (message: string) => void) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.log(error ? JSON.stringify(error) : `${response.status} ${response.statusText}`);
    onMessage(error ? JSON.stringify(error) : `${response.status} ${response.statusText}`);
    onMessage("[DONE]");
    return;
  }
  if (response.status !== 200) {
    console.log(`Error from OpenAI: ${response.status} ${response.statusText}`);
    onMessage(`Error from OpenAI: ${response.status} ${response.statusText}`);
    onMessage("[DONE]");
    return;
  }
  if (!response.body) {
    console.log("No response body");
    return;
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
export async function* iterableStreamAsync(stream: ReadableStream): AsyncIterableIterator<Uint8Array> {
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
export default function Conversation({
  prompt,
  voiceover,
  initialmessages,
  initialainame,
  refreshsessionlist,
}: {
  prompt: {
    value: string;
  };
  voiceover: boolean;
  initialmessages: Message[];
  initialainame: string;
  refreshsessionlist: () => void;
}) {
  const target_bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(initialmessages);
  const [ainame, setAiname] = useState<string>(initialainame);
  const [changemessagerequest, setChangemessagerequest] = React.useState({
    index: 0,
    content: "",
  });

  const [toastopen, setToastopen] = React.useState(false);
  const [toastmessage, setToastmessage] = React.useState("");
  const [showhistoryeditor, setShowhistoryeditor] = React.useState(false);
  //Hello, I'm your friendly AI assistant. What can I do for you today?
  const [audioText, setAudioText] = React.useState("");
  const [headshotopen, setHeadshotopen] = React.useState(false);

  const audioRef = useRef(null);
  const ClearAudioText = () => {
    setAudioText("");
  };

  //this handle prompt change, prompt is a prop
  useEffect(() => {
    const handlePrompt = async (prompt: string) => {
      if (!prompt) {
        return;
      }
      const config = await Config.GetConfigInstanceAsync();
      //console.log(config);
      console.log("processing prompt:" + prompt);
      console.log("add user prompt question message AND assistant placeholder response first");
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const newmessages = [
        ...SessionManager.currentSession.messages,
        new Message({
          role: "user",
          content: prompt,
          completets: Math.floor(Date.now() / 1000),
        }),
        new Message({
          role: "assistant",
          content: "Thinking...",
          completets: Math.floor(Date.now() / 1000),
        }),
      ];
      setMessages(newmessages);
      SessionManager.currentSession.messages = newmessages;
      SessionManager.SaveSessionToJson(SessionManager.currentSession);
      // abort signal for fetch
      const controller = new AbortController();

      //actual calling api to get a response stream
      const host = "https://api.openai.com";
      //console.log(`${config.openaikey} ${config.maxtokenreply}`);
      //before calling api, do a sanity check
      //last one is assistant placeholder message
      //this will check the 2nd to last message to see if it's from the user
      if (SessionManager.currentSession.messages.slice(-2)[0].role != "user") {
        //this is an error, the last message should the one sent from the user
        console.log("error, the role of the last message is assistant. stop the processing");
        setToastmessage("error, the role of the last message is assistant. stop the processing");
        setToastopen(true);
        return;
      }
      const response = await fetch(`${host}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.openaikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: SessionManager.currentSession
            .GetMessagesWithTokenLimit(4096 - config.maxtokenreply)
            .map(({ role, content }) => ({ role, content })),
          model: "gpt-3.5-turbo-0613",
          max_tokens: config.maxtokenreply,
          stream: true,
        }),
        signal: controller.signal,
      });

      let temptext = "";
      await handleSSE(response, (message) => {
        if (message === "[DONE]") {
          console.log("try to save session");
          const last_message =
            SessionManager.currentSession.messages[SessionManager.currentSession.messages.length - 1];
          last_message.completets = Math.floor(Date.now() / 1000);
          //process the content
          //get rid of italic items
          let regexpattern = /\*([\s\S]*?)\*/g;
          let tempaudiotext = last_message.content.replace(regexpattern, ``);
          //get rid of codeblocks
          regexpattern = /```([\s\S]*?)```/g;
          tempaudiotext = tempaudiotext.replace(regexpattern, ``);
          setAudioText(tempaudiotext);
          //
          //since it's done, try to ask openai for session name
          //
          const currentSessionName = SessionManager.currentSession.sessionName.trim();
          if (currentSessionName == "New Session") {
            let asknamemessage = SessionManager.currentSession
              .GetMessagesWithTokenLimit(2000)
              .map(({ role, content }) => ({ role, content }));
            asknamemessage.push({ role: "user", content: "name this session concisely with less than 5 tokens" });
            fetch(`${host}/v1/chat/completions`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${config.openaikey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: asknamemessage,
                model: "gpt-3.5-turbo-0613",
                max_tokens: config.maxtokenreply,
                stream: false,
              }),
              signal: controller.signal,
            })
              .then((respname) => respname.json())
              .then((data) => {
                console.log(`the result of the naming task  is:${JSON.stringify(data)}`);
                let returnedName = data.choices[0].message.content;
                returnedName = TrimAndGetTextInQuote(returnedName);
                SessionManager.currentSession.sessionName = returnedName;
                // here we should inform the sessionlist to refresh...
                refreshsessionlist();
              })
              .catch((error) => {
                console.error("the naming task failed, Error:", error);
              });
          }
          //save session to disk
          SessionManager.SaveSessionToJson(SessionManager.currentSession);
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
          return;
        }
        const text = data.choices[0]?.delta?.content;
        if (text !== undefined) {
          temptext += text;
          //console.log(`temptext:${temptext}`);

          setMessages((mmm) => {
            const newmessages = [...mmm];
            newmessages[newmessages.length - 1].content = temptext;
            SessionManager.currentSession.messages = newmessages;
            return newmessages;
          });
        }
      });
      //end of async way----------------------------------------------------------
      console.log("prompt handling complete");
    };
    //only when base change the prompt, will it trigger this handle function
    if (prompt && prompt.value != "") {
      handlePrompt(prompt.value);
      console.log(`conversation got the prompt prop changes:${JSON.stringify(prompt)}`);
    }
  }, [prompt]);
  //this loads session history
  useEffect(() => {
    const trigger = () => {
      //console.log("conversation useEffect triggered, loading a new session");
      setMessages(SessionManager.currentSession.messages);
    };
    SessionManager.listenercallback = trigger;
    //trigger();
  });
  //this helps to scroll to the bottom when messages changes.
  useEffect(() => {
    // scrollIntoView function will be called when messages are updated
    //console.log("conversation: trying to scroll to the bottom");
    setTimeout(() => {
      if (target_bottomRef.current) {
        target_bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [messages]);

  return (
    <>
      <List
        className={`flex-1 bg-yellow-50 w-full overflow-auto min-h-[40vh] pb-10 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100`}
      >
        <ListSubheader
          className="bg-white/10"
          onClick={() => {
            console.log(`conversatoin header clicked`);
            console.log(`${JSON.stringify(messages)}`);
          }}
        >
          {audioText != "" && voiceover ? (
            <audio
              ref={audioRef}
              src={
                //english
                `http://localhost:5002/api/tts?text=${encodeURIComponent(
                  audioText
                )}&speaker_id=p248&style_wav=&language_id=`
                //chinese
                // `http://localhost:5002/api/tts?text=${encodeURIComponent(
                //   audioText
                // )}&speaker_id=&style_wav=&language_id=`

                //'female-en-5': 0, 'female-en-5\n': 1, 'female-pt-4\n': 2, 'male-en-2': 3, 'male-en-2\n': 4, 'male-pt-3
                // `http://localhost:5002/api/tts?text=${encodeURIComponent(
                //   audioText
                // )}&speaker_id=female-en-5&style_wav=&language_id=en`
              }
              controls
              autoPlay
            />
          ) : (
            <></>
          )}
        </ListSubheader>
        {messages.map((message, index) => (
          <ListItem
            key={`message_${index}`}
            alignItems="flex-start"
            className={`flex justify-start ${
              message.role === "assistant" || message.role === "system" ? "flex-row " : "flex-row-reverse"
            }`}
          >
            <div>
              <ListItemAvatar
                className="flex justify-center cursor-pointer"
                onClick={() => {
                  if (message.role === "assistant" || message.role === "system") {
                    setHeadshotopen(true);
                  }
                }}
              >
                <Avatar
                  className="w-20 h-20"
                  alt="Remy Sharp"
                  src={`${
                    message.role === "assistant" || message.role === "system"
                      ? SessionManager.currentSession.aiheadshotimg
                      : ""
                  }`}
                />
              </ListItemAvatar>
              <div className="text-center">
                {message.role === "assistant" || message.role === "system" ? ainame : ""}
              </div>
            </div>
            <div className="w-3 h-3"></div>
            <ListItemText
              primary={<MyMessageBlock rawtext={message.content} ainame={"assistant"}></MyMessageBlock>}
              secondary={`${getFormattedDateTime(message.completets)}`}
              className={`rounded-t-xl p-4 cursor-pointer ${
                message.role === "assistant" || message.role === "system"
                  ? "rounded-br-xl bg-blue-100 text-black text-left flex-1"
                  : "rounded-bl-xl bg-green-100 text-black text-left flex-1 max-w-full min-w-0"
              } `}
              onClick={() => {
                setChangemessagerequest({ index, content: message.content });
                setShowhistoryeditor(true);
              }}
            />
          </ListItem>
        ))}
        <div ref={target_bottomRef} className="text-yellow-50">
          thebottom
        </div>
      </List>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toastopen}
        autoHideDuration={1000}
        message={toastmessage}
        onClose={() => {
          setToastopen(false);
        }}
      />
      <HistoryEditor
        show={showhistoryeditor}
        contexttext={messages.length > 0 ? messages[0].content : ""}
        changemessagerequest={changemessagerequest}
        handleClose={() => {
          setShowhistoryeditor(!showhistoryeditor);
        }}
      />
      <HeadshotPicker
        show={headshotopen}
        handleClose={() => {
          setHeadshotopen(false);
        }}
      />
    </>
  );
}
