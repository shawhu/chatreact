import * as React from "react";
import { useState, useEffect } from "react";
import { TextField, Typography, Box } from "@mui/material";
import { Session, Message, SessionManager } from "@/common/session";

export default function EditableLabel({ text, onModified }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  const handleTextFieldChange = async (event: any) => {
    setCurrentText(event.target.value);
    SessionManager.currentSession.sessionName = event.target.value;
    await SessionManager.SaveSessionToJson(SessionManager.currentSession);
  };

  const handleSave = () => {
    onModified();
    setIsEditing(false);
  };

  const handleBoxClick = () => {
    setIsEditing(true);
  };

  return (
    <Box onClick={handleBoxClick}>
      {isEditing ? (
        <TextField
          autoFocus
          required
          margin="dense"
          type="text"
          variant="outlined"
          value={currentText}
          onChange={handleTextFieldChange}
          onBlur={handleSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault(); // prevent default form submission
              handleSave(); // call the blur handler function
            }
          }}
          InputProps={{ sx: { fontSize: "1.5rem", color: "white" } }} // set font size of text field
        />
      ) : (
        <Typography variant="caption" sx={{ fontSize: "1.5rem" }}>
          {currentText}
        </Typography>
      )}
    </Box>
  );
}
