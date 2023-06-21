import React, { useState, useEffect, useRef } from "react";
import { List, ListItem, ListItemText, Typography, ListSubheader, ListItemAvatar, Avatar } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { Configuration, OpenAIApi } from "openai";
import { createParser } from "eventsource-parser";
import { Session, Message, SessionManager } from "@/common/session";
import Snackbar from "@mui/material/Snackbar";
import MyMessageBlock from "@/components/mymessageblock";
import { getFormattedDateTime } from "@/common/helper";
import { Config } from "@/common/config";
import HistoryEditor from "@/components/historyeditor";
import HeadshotPicker from "@/components/headshotpicker";

export default function Conversationllm({
  prompt,
  voiceover,
  llmname,
}: {
  prompt: {
    value: string;
  };
  voiceover: boolean;
  llmname: string;
}) {
  const target_bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
      const host = "/api/v1/generate";
      const requestjobj = {
        prompt: SessionManager.currentSession.GetPromptWithTokenLimit(1000, llmname),
        use_story: false,
        use_memory: false,
        use_authors_note: false,
        use_world_info: false,
        max_context_length: 2048,
        max_length: 180,
        rep_pen: 1.1,
        rep_pen_range: 1024,
        rep_pen_slope: 0.9,
        temperature: 0.65,
        tfs: 0.9,
        top_a: 0,
        top_k: 0,
        top_p: 0.9,
        typical: 1,
        sample_order: [6, 0, 1, 2, 3, 4, 5],
        stopping_string: ["\nYou"],
      };
      const requestbodystr = JSON.stringify(requestjobj);
      console.log("requesting to kobold api, here is the requesting body");
      console.log(requestjobj);
      console.log(requestbodystr);
      const response = await fetch(host, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestbodystr,
        signal: controller.signal,
      });
      if (!response.body) {
        return;
      }
      const reader = response.body.getReader();
      let chunks = [];
      let temptext = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const allChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (let chunk of chunks) {
            allChunks.set(chunk, offset);
            offset += chunk.length;
          }
          const decodedData = new TextDecoder("utf-8").decode(allChunks);
          temptext += decodedData;
          //console.log(decodedData);
          break;
        }
        chunks.push(value);
      }
      //temptext is string json
      let respjobj = JSON.parse(temptext);
      //reuse temptext
      temptext = respjobj.results[0].text.trim();
      //initial temptext may have redundent text
      console.log("initial temptext may have redundent text");
      console.log(temptext);
      const temptextarray = temptext.split("\nYou");
      if (temptextarray.length > 1) {
        temptext = temptextarray[0];
      }
      console.log("got response from koboldai, print it out now.");
      console.log(temptext);
      //now use the resp text to make changes to the local state variable messages
      setMessages((mmm) => {
        const newmessages = [...mmm];
        newmessages[newmessages.length - 1].content = temptext;
        newmessages[newmessages.length - 1].completets = Math.floor(Date.now() / 1000);
        setAudioText(temptext);
        SessionManager.currentSession.messages = newmessages;
        SessionManager.SaveSessionToJson(SessionManager.currentSession);
        return newmessages;
      });

      console.log("prompt handling complete");
    };
    //only when base change the prompt, will it trigger this handle function
    if (prompt && prompt.value != "") {
      handlePrompt(prompt.value);
      console.log(`conversation got the prompt prop changes: ${prompt}`);
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
    if (target_bottomRef.current) {
      target_bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <List className={`flex-1 bg-yellow-50 w-full overflow-auto min-h-[40vh] pb-10`}>
        <ListSubheader
          className="font-bold text-2xl "
          onClick={() => {
            console.log(`conversatoin header clicked`);
            console.log(`${JSON.stringify(messages)}`);
          }}
        >
          {audioText != "" && voiceover ? (
            <audio
              ref={audioRef}
              src={
                `http://localhost:5002/api/tts?text=${encodeURIComponent(
                  audioText
                )}&speaker_id=p248&style_wav=&language_id=`

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
              llm
            </div>
            <div className="w-3 h-3"></div>
            <ListItemText
              primary={<MyMessageBlock rawtext={message.content}></MyMessageBlock>}
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
