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

function ConversationPage() {
  const [messages, setMessages] = useState([]);
  console.log("testcon start");
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

  return (
    <List>
      <ListSubheader className="font-bold text-2xl ">
        Conversations between John and Mary
      </ListSubheader>
      {messages.map((message, index) => (
        <ListItem
          key={index}
          alignItems="flex-start"
          className={`flex justify-start ${
            message.sender === "John" ? "flex-row " : "flex-row-reverse"
          }`}
        >
          <ListItemText
            primary={<div dangerouslySetInnerHTML={{ __html: message.text }} />}
            secondary={message.sender + " 8:13 AM"}
            className={`rounded-t-xl p-4 max-w-[80%] ${
              message.sender === "John" ? "rounded-br-xl" : "rounded-bl-xl"
            } ${message.sender === "John" ? "bg-blue-50" : "bg-green-50"}
            ${message.sender === "John" ? "text-black" : "text-black"} ${
              message.sender === "John" ? "text-left" : "text-right"
            }`}
          />
          <ListItemAvatar className="flex justify-center">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </ListItemAvatar>
        </ListItem>
      ))}
    </List>
  );
}

export default ConversationPage;
