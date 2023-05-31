import * as React from "react";
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
import { Config } from "@/common/config";

export default function CharacterPicker({ show, handleClose }) {
  const handleSave = async () => {
    const myconfig = await Config.GetConfigInstanceAsync();
    myconfig.openaikey = openaikey;
    myconfig.maxtokencontext = maxtokencontext;
    myconfig.maxtokenreply = maxtokenreply;
    myconfig.ctrlenter = ctrlenter;
    myconfig.voiceover = voiceover;

    await myconfig.SaveAsync();
    refreshindexpageconfig(myconfig);
    handleClose();
  };
  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth={true}>
      <DialogTitle>Customize your character</DialogTitle>
      <List className="m-12">
        <ListItem>
          <TextField
            autoFocus
            required
            margin="dense"
            id="openaikey"
            label="Context"
            type="text"
            fullWidth
            variant="standard"
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
