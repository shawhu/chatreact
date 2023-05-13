import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

function ConversationPage() {
  const messages = [
    { sender: "John", text: "Hello Mary, how are you?" },
    { sender: "Mary", text: "Hey John, I'm doing well. How about you?" },
    { sender: "John", text: "I'm good, thanks for asking" },
    { sender: "Mary", text: "What have you been up to lately?" },
    {
      sender: "John",
      text: "Not much, just working and hanging out with friends. How about you?",
    },
    {
      sender: "Mary",
      text: "I had a busy week with work, but looking forward to the weekend",
    },
    // Add more message objects here as needed
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Conversations with Mary</Typography>
      </Grid>
      <Grid item xs={12}>
        {messages.map((message, index) => (
          <Paper
            key={index}
            elevation={3}
            className={`p-4 rounded-lg ${
              message.sender === "John"
                ? "float-left bg-white"
                : "float-right bg-pink-100"
            }`}
          >
            <Typography variant="body1">
              {message.sender}: {message.text}
            </Typography>
          </Paper>
        ))}
      </Grid>
    </Grid>
  );
}

export default ConversationPage;
