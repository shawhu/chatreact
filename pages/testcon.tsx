import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  ListSubheader,
} from "@mui/material";

function ConversationPage() {
  const messages = [
    { sender: "John", text: "Hello Mary, how are you?" },
    { sender: "Mary", text: "Hey John, I'm doing well. How about you?" },
    { sender: "John", text: "I'm good, thanks for asking." },
    { sender: "Mary", text: "What have you been up to lately?" },
    {
      sender: "John",
      text: "Not much, just hanging out with friends. How about you?",
    },
    {
      sender: "Mary",
      text: "I had a busy week with work, but looking forward to the weekend.",
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
          className={`flex ${
            message.sender === "John"
              ? "flex-row justify-start"
              : "flex-row-reverse"
          }`}
        >
          <ListItemText
            primary={message.text}
            secondary={message.sender}
            className={`rounded-t-xl p-4 max-w-[80%] ${
              message.sender === "John" ? "rounded-br-xl" : "rounded-bl-xl"
            } ${message.sender === "John" ? "bg-blue-500" : "bg-green-500"}
            ${message.sender === "John" ? "text-white" : "text-white"} ${
              message.sender === "John" ? "text-left" : "text-right"
            }`}
          />
          <div>adsf</div>
        </ListItem>
      ))}
    </List>
  );
}

export default ConversationPage;
