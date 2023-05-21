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
  Box,
} from "@mui/material";

function TestComponent({ open, handleClose }) {
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
    <Box>
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
      />
      <div>aaa</div>
      <Typography variant="caption">{version}</Typography>;
    </Box>
  );
}

export default TestComponent;
