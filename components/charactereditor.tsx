import * as React from "react";
import Image from "next/image";
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
  Input,
  FormControl,
} from "@mui/material";
import { Config } from "@/common/config";
import { estimateTokens } from "@/common/helper";

function CharacterEditor({ open, handleClose }: any) {
  const [headshoturl, setHeadshoturl] = React.useState("");
  const [context, setContext] = React.useState("");
  const [name, setName] = React.useState("");
  const [categories, setCategories] = React.useState([]);
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [personalitySummary, setPersonalitySummary] = React.useState("");
  const [scenario, setScenario] = React.useState("");
  const [dialoguesExample, setDialoguesExample] = React.useState("");
  const [firstMessage, setFirstMessage] = React.useState("");
  const [uploadFile, setUploadFile] = React.useState<any>(null);
  const [totaltoken, setTotaltoken] = React.useState(0);

  React.useEffect(() => {
    //startup cleanup
    setDescription("");
    setPersonalitySummary("");
    setScenario("");
    setDialoguesExample("");
    setFirstMessage("");
    setTotaltoken(0);
  }, [open]);

  //processing upload tavarnai character png/webp
  React.useEffect(() => {
    if (!uploadFile || !uploadFile.name) {
      return;
    }
    const GetInfoFromServerAsync = async () => {
      const formData = new FormData();
      formData.append("file", uploadFile, uploadFile.name);
      const response = await fetch(`/api/imginforeader`, {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      //console.log(json);
      if (json.headshoturl) {
        setHeadshoturl(json.headshoturl);
      }
      if (json.name) {
        setName(json.name);
      }
      if (json.description) {
        setDescription(json.description);
      }
      if (json.personalitySummary) {
        setPersonalitySummary(json.personalitySummary);
      }
      if (json.scenario) {
        setScenario(json.scenario);
      }
      if (json.dialoguesExample) {
        setDialoguesExample(json.dialoguesExample);
      }
      if (json.firstMessage) {
        setFirstMessage(json.firstMessage);
      }
      const allfields = `${json.name}'s Persona:${json.description}${json.personalitySummary}${json.scenario}${json.dialoguesExample}${json.firstMessage}`;
      setTotaltoken(estimateTokens(allfields));
    };
    GetInfoFromServerAsync();
  }, [uploadFile]);

  const handleSave = () => {
    //combine all necessary fields
    // {{name}}'s Persona:{{description}}
    // {{personalitySummary}}
    // {{scenario}}
    // {{dialoguesExample}}
    // {{firstMessage}}
    let allfields = `${name}'s Persona:${description}${personalitySummary}${scenario}${dialoguesExample}`;
    allfields = allfields.replaceAll("{{char}}", name);
    allfields = allfields.replaceAll("{{user}}", "you");
    allfields = allfields.replaceAll("\r", "");
    let fm = firstMessage.replaceAll("{{char}}", name);
    fm = fm.replaceAll("{{user}}", "you");
    fm = fm.replaceAll("\r", "");
    setTotaltoken(estimateTokens(allfields));
    handleClose(allfields, fm, headshoturl, name);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose("", "", "", "");
      }}
      maxWidth="xl"
      fullWidth={true}
    >
      <DialogTitle>Character Editor</DialogTitle>
      <List className="m-12">
        <ListItem
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <Image src={"/headshots/ai/00001-748567734.jpg"} width="100" height="100" alt="aiheadshot"></Image>
          <div>
            <FormControl>
              <Input
                type="file"
                onChange={(e: any) => {
                  if (e.target.files.length > 0) {
                    console.log(e.target.files[0].name);
                    setUploadFile(e.target.files[0]); // Get the first selected file
                  } else {
                    console.log("no file has been selected, quit");
                  }
                }}
              />
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="shortDescription"
              label="Short Description"
              type="text"
              fullWidth
              variant="standard"
              value={shortDescription}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setShortDescription(event.target.value);
              }}
            />
            <span>Total tokens: {totaltoken}</span>
          </div>
        </ListItem>
        <ListItem>
          <TextField
            autoFocus
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            variant="standard"
            value={description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDescription(event.target.value);
            }}
          />
        </ListItem>
        <ListItem>
          <TextField
            autoFocus
            margin="dense"
            id="personalitySummary"
            label="Personality Summary"
            type="text"
            multiline
            fullWidth
            variant="standard"
            value={personalitySummary}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPersonalitySummary(event.target.value);
            }}
          />
        </ListItem>
        <ListItem>
          <TextField
            autoFocus
            margin="dense"
            id="scenario"
            label="Scenario"
            type="text"
            multiline
            fullWidth
            variant="standard"
            value={scenario}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setScenario(event.target.value);
            }}
          />
        </ListItem>
        <ListItem>
          <TextField
            autoFocus
            margin="dense"
            id="dialoguesExample"
            label="Dialogues Example"
            type="text"
            multiline
            fullWidth
            variant="standard"
            value={dialoguesExample}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDialoguesExample(event.target.value);
            }}
          />
        </ListItem>
        <ListItem>
          <TextField
            autoFocus
            margin="dense"
            id="firstMessage"
            label="First Message"
            type="text"
            multiline
            fullWidth
            variant="standard"
            value={firstMessage}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFirstMessage(event.target.value);
            }}
          />
        </ListItem>
      </List>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose("", "", "", "");
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Load
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CharacterEditor;
