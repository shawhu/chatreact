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

function DialogConfig({ open, handleClose, refreshindexpageconfig }) {
  const [openaikey, setOpenaikey] = React.useState("");
  const [maxtokencontext, setMaxtokencontext] = React.useState(-1);
  const [maxtokenreply, setMaxtokenreply] = React.useState(-1);
  const [ctrlenter, setCtrlenter] = React.useState(false);
  const [voiceover, setVoiceover] = React.useState(false);

  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const myconfig = await Config.GetConfigInstanceAsync();
        setOpenaikey(myconfig.openaikey);
        setMaxtokencontext(myconfig.maxtokencontext);
        setMaxtokenreply(myconfig.maxtokenreply);
        setCtrlenter(myconfig.ctrlenter);
        setVoiceover(myconfig.voiceover);
      } catch (error) {
        console.error(error);
      }
    };
    fetchConfigData();
  }, []);
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
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth={true}>
      <DialogTitle>Dialog Title</DialogTitle>
      <List className="m-12">
        <ListItem>
          <TextField
            autoFocus
            required
            margin="dense"
            id="openaikey"
            label="OpenAI Key"
            type="text"
            fullWidth
            variant="standard"
            value={openaikey}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setOpenaikey(event.target.value);
            }}
          />
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={
              <Checkbox
                checked={ctrlenter}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setCtrlenter(event.target.checked);
                }}
              />
            }
            label="Use Ctrl + Enter to submit"
          />
        </ListItem>
        <ListItem>
          <Typography variant="caption">
            <TextField
              autoFocus
              required
              margin="dense"
              id="MaxTokenContext"
              label="MaxTokenContext"
              type="number"
              fullWidth
              variant="standard"
              value={maxtokencontext}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setMaxtokencontext(event.target.value);
              }}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="caption">
            <TextField
              autoFocus
              required
              margin="dense"
              id="MaxTokenReply"
              label="MaxTokenReply"
              type="number"
              fullWidth
              variant="standard"
              value={maxtokenreply}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setMaxtokenreply(event.target.value);
              }}
            />
          </Typography>
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

export default DialogConfig;
