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
} from "@mui/material";
function DialogConfig({ open, handleClose }) {
  const [openaiKey, setOpenaiKey] = React.useState("");
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await fetch("/api/getconfig");
        const configData = await response.json();
        const { openaikey, version } = JSON.parse(configData);
        setOpenaiKey(openaikey);
        setVersion(version);
        console.log(
          `openaikey read from json: ${openaikey} version:${version}`
        );
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
      <DialogContent>
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
        <div>bbb</div>
        <Typography variant="caption">{version}</Typography>;
      </DialogContent>
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
