import React from "react";
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
  const messages = [
    { sender: "John", text: "Hello Mary, how are you?" },
    { sender: "Mary", text: "Hey John, I'm doing well. How about you?" },
    { sender: "John", text: "I'm good, <strong>thanks</strong> for asking." },
    { sender: "Mary", text: "What have you been up to lately?" },
    {
      sender: "John",
      text: "Not much, just hanging out with friends. How about you?",
    },
    {
      sender: "Mary",
      text: "I had a busy week with work, but looking forward to the weekend. I had a busy week with work, but looking forward to the weekend. I had a busy week with work, but looking forward to the weekend.",
    },
    {
      sender: "Mary",
      text: "Me too! Let's catch up then.",
    },
    // Add more message objects here as needed
  ];

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
