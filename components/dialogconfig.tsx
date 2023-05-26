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

let openkey = "";
let maxtokenr = -1;
let maxtokenc = -1;
let usectrlenter = false;
let myResolve;

export function GetConfig(): Promise<{
  openaikey: string;
  maxtokenreply: number;
  maxtokencontext: number;
  ctrlenter: boolean;
}> {
  return new Promise((resolve) => {
    // if the key is not empty, resolve immediately
    if (openkey != "" && maxtokenr != -1 && maxtokenc != -1) {
      resolve({ openkey, maxtokenr, maxtokenc, usectrlenter });
    } else {
      // store the resolve function to call it later
      myResolve = resolve;
    }
  });
}

function DialogConfig({ open, handleClose, indexpageconfig }) {
  const [openaikey, setOpenaikey] = React.useState("");
  const [maxtokencontext, setMaxtokencontext] = React.useState(-1);
  const [maxtokenreply, setMaxtokenreply] = React.useState(-1);
  const [ctrlenter, setCtrlenter] = React.useState(false);
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await fetch("/api/getconfig");
        const configData = await response.json();
        const {
          openaikey,
          version,
          maxtokencontext,
          maxtokenreply,
          ctrlenter,
        } = JSON.parse(configData);
        setOpenaikey(openaikey);
        setVersion(version);
        setMaxtokencontext(maxtokencontext);
        setMaxtokenreply(maxtokenreply);
        setCtrlenter(ctrlenter);
        openkey = openaikey;
        maxtokenr = maxtokenreply;
        maxtokenc = maxtokencontext;
        usectrlenter = ctrlenter;
        // if the resolve function is defined, call it with the new value
        if (myResolve) {
          myResolve({ openkey, maxtokenr, maxtokenc, usectrlenter });
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
  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveconfig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openaikey,
          ctrlenter,
          maxtokencontext,
          maxtokenreply,
        }),
      });
      indexpageconfig({ openkey, maxtokenr, maxtokenc, usectrlenter });
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
            value={openaikey}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setOpenaikey(event.target.value);
              openkey = event.target.value;
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
                  usectrlenter = event.target.checked;
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
                maxtokenc = event.target.value;
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
                maxtokenr = event.target.value;
              }}
            />
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
