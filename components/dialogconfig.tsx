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
} from "@mui/material";

let openkey = "";
let maxtokenr = "";
let maxtokenc = "";
let myResolve;

export function GetOpenAIConfig(): Promise<{
  openaikey: string;
  maxtokenreply: string;
  maxtokencontext: string;
}> {
  return new Promise((resolve) => {
    // if the key is not empty, resolve immediately
    if (openkey !== "" && maxtokenr != "" && maxtokenc != "") {
      resolve({ openkey, maxtokenr, maxtokenc });
    } else {
      // store the resolve function to call it later
      myResolve = resolve;
    }
  });
}

function DialogConfig({ open, handleClose }) {
  const [openaiKey, setOpenaiKey] = React.useState("");
  const [maxtokencontext, setMaxtokencontext] = React.useState("");
  const [maxtokenreply, setMaxtokenreply] = React.useState("");
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await fetch("/api/getconfig");
        const configData = await response.json();
        const { openaikey, version, maxtokencontext, maxtokenreply } =
          JSON.parse(configData);
        setOpenaiKey(openaikey);
        setVersion(version);
        setMaxtokencontext(maxtokencontext);
        setMaxtokenreply(maxtokenreply);
        openkey = openaikey;
        maxtokenr = maxtokenreply;
        maxtokenc = maxtokencontext;
        // if the resolve function is defined, call it with the new value
        if (myResolve) {
          myResolve({ openkey, maxtokenr, maxtokenc });
        }
        // console.log(
        //   `openaikey read from json: ${openaikey} version:${version}`
        // );
      } catch (error) {
        console.error(error);
      }
    };
    fetchConfigData();
  }, []);
  const handleChange = (event) => {
    setOpenaiKey(event.target.value);
  };
  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveconfig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openaikey: openaiKey, version: version }),
      });
      handleClose();
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
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
            value={openaiKey}
            onChange={handleChange}
          />
        </ListItem>
        <ListItem>
          <Typography variant="caption">
            MaxTokenContext: {maxtokencontext}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="caption">
            MaxTokenReply: {maxtokenreply}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="caption">Version: {version}</Typography>
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
