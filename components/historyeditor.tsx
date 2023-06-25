import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { Session, Message, SessionManager } from "@/common/session";

export default function HistoryEditor({ show, contexttext, changemessagerequest, handleClose }: any) {
  const [context, setContext] = React.useState(changemessagerequest.content);
  useEffect(() => {
    //console.log(changemessagerequest);
    setContext(changemessagerequest.content);
  }, [changemessagerequest]);
  const handleSave = async () => {
    SessionManager.currentSession.messages[changemessagerequest.index].content = context;
    await SessionManager.SaveSessionToJson(SessionManager.currentSession);
    //handleClose will update conversation.tsx
    handleClose();
  };
  return (
    <Dialog open={show} onClose={handleClose} maxWidth="xl" fullWidth={true}>
      <DialogTitle>Change history</DialogTitle>
      <List className="m-12">
        <ListItem>
          <TextField
            autoFocus
            required
            margin="dense"
            id="contexttext"
            label="History text"
            type="text"
            value={context}
            fullWidth
            multiline
            variant="standard"
            onChange={(e) => {
              setContext(e.target.value);
            }}
          />
        </ListItem>
      </List>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
