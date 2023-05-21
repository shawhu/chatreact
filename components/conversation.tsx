import React, { useState, useEffect } from "react";
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
import { Configuration, OpenAIApi, Gpt } from "openai";

function Conversation({ className, prompt }) {
  //init openai
  const config = new Configuration({
    organization: "org-qCObSSvODFsozhqM6naZqOz1",
    apiKey: "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",
  });
  const openai = new OpenAIApi(config);
  //below is using openai to get response
  // Configure the axios instance used by the OpenAIApi class
  openai.axios.defaults.headers.common["User-Agent"] = undefined;

  //this is the load history chat logs
  useEffect(() => {
    // Fetch messages from your Next.js API endpoint
    fetch("/api/messages")
      .then((response) => response.json())
      .then((data) => {
        setMessages(data); // Update state with fetched messages
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }, []);

  const [messages, setMessages] = useState([]);
  const handlePrompt = async (prompt: string) => {
    if (!prompt) {
      return;
    }
    console.log("processing prompt:" + prompt);
    console.log("add messages first");
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "Harry", text: prompt },
    ]);

    //sending prompt to openai
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    //got the response, now add to messages
    console.log(completion.data.choices[0].message);
    //using regex to replace ```
    var processed = completion.data.choices[0].message.content
      .replace(
        /\n+```\s?([\s\S]*?)\s?```/g, //\s is whitespace including \n, \S is character
        `<br><pre style="background-color: black; color: white;"><code>$1</code></pre>`
      )
      .replace(/\n/g, "<br>");
    console.log(processed);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "AI", text: processed },
    ]);
  };
  useEffect(() => {
    handlePrompt(prompt);
  }, [prompt]);

  return (
    <List className={`${className} w-full overflow-auto min-h-[40vh] p-0`}>
      <ListSubheader className="font-bold text-2xl "></ListSubheader>
      {messages.map((message, index) => (
        <ListItem
          key={index}
          alignItems="flex-start"
          className={`flex justify-start ${
            message.sender === "AI" ? "flex-row " : "flex-row-reverse"
          }`}
        >
          <ListItemText
            primary={<div dangerouslySetInnerHTML={{ __html: message.text }} />}
            secondary={message.sender + " 8:13 AM"}
            className={`rounded-t-xl p-4 flex-1 ${
              message.sender === "AI" ? "rounded-br-xl" : "rounded-bl-xl"
            } ${message.sender === "AI" ? "bg-blue-100" : "bg-green-50"}
            ${message.sender === "AI" ? "text-black" : "text-black"} ${
              message.sender === "AI" ? "text-left" : "text-right"
            }`}
          />
          <ListItemAvatar className="flex justify-center">
            <Avatar alt="Remy Sharp" src="" />
          </ListItemAvatar>
        </ListItem>
      ))}
    </List>
  );
}

export default Conversation;
