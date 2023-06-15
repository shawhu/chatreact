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
import { FileUploader } from "react-drag-drop-files";

function CharacterEditor({ open, handleClose }: any) {
  const [headshoturl, setHeadshoturl] = React.useState("/headshots/characters/placeholder.jpg");
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
    setName("");
    setTotaltoken(0);
    setHeadshoturl("/headshots/characters/placeholder.webp");
  }, [open]);

  //calculate and update total tokens
  React.useEffect(() => {
    let allfields = `description:\n${description}\n`;
    if (personalitySummary && personalitySummary.length > 0) {
      allfields += `personalitySummary:\n${personalitySummary}\n`;
    }
    if (scenario && scenario.length > 0) {
      allfields += `scenario:\n${scenario}\n`;
    }
    if (dialoguesExample && dialoguesExample.length > 0) {
      allfields += `dialoguesExample:\n${dialoguesExample}\n`;
    }
    setTotaltoken(estimateTokens(allfields));
  }, [description, personalitySummary, scenario, dialoguesExample, name]);

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
        let desc = json.description.replaceAll("\r", "");
        desc = desc.replaceAll("\n\n", "\n");
        setDescription(desc);
      }
      if (json.personalitySummary) {
        setPersonalitySummary(json.personalitySummary);
      }
      if (json.scenario) {
        setScenario(json.scenario);
      }
      if (json.dialoguesExample) {
        let dexample = json.dialoguesExample.replaceAll("\r", "");
        dexample = dexample.replaceAll("\n\n", "\n");
        setDialoguesExample(dexample);
      }
      if (json.firstMessage) {
        let fmsg = json.firstMessage.replaceAll("\r", "");
        fmsg = fmsg.replaceAll("\n\n", "\n");
        setFirstMessage(fmsg);
      }
      const allfields = `${json.name}'s Persona:${json.description}${json.personalitySummary}${json.scenario}\n${json.dialoguesExample}\n${json.firstMessage}`;
      setTotaltoken(estimateTokens(allfields));
    };
    GetInfoFromServerAsync();
  }, [uploadFile]);

  const ApplyCharacter = () => {
    //let allfields = `${name}'s Persona:${description}${personalitySummary}${scenario}${dialoguesExample}`;
    let allfields = `description:\n${description}\n`;
    if (personalitySummary && personalitySummary.length > 0) {
      allfields += `personalitySummary:\n${personalitySummary}\n`;
    }
    if (scenario && scenario.length > 0) {
      allfields += `scenario:\n${scenario}\n`;
    }
    if (dialoguesExample && dialoguesExample.length > 0) {
      allfields += `dialoguesExample:\n${dialoguesExample}\n`;
    }

    allfields = allfields.replaceAll("{{char}}", name);
    allfields = allfields.replaceAll("{{user}}:", "You:");
    allfields = allfields.replaceAll("{{user}}", "you");
    allfields = allfields.replaceAll("\r", "");
    allfields = allfields.replaceAll("you's", "your");
    let fm = firstMessage.replaceAll("{{char}}", name);
    fm = fm.replaceAll("{{user}}:", "You:");
    fm = fm.replaceAll("{{user}}", "you");
    fm = fm.replaceAll("\r", "");
    fm = fm.replaceAll("you's", "your");
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
      <DialogActions>
        <FileUploader
          label={"Upload TavernAI webp/png"}
          labelAfter={"done"}
          multiple={false}
          handleChange={(file: File) => {
            console.log(file);
            setUploadFile(file); // Get the first selected file
          }}
          name="file"
          types={["png", "webp"]}
          dropMessageStyle={{ backgroundColor: "rgba(0, 0, 0, 1)", color: "lightgreen" }}
        />
        <Button disabled={description == ""} variant="contained" onClick={ApplyCharacter} color="primary">
          Load Character
        </Button>
        <Button
          disabled={description == ""}
          variant="contained"
          onClick={async () => {
            const jobj = { name, description, personalitySummary, scenario, dialoguesExample, firstMessage };
            const exportjobj = {
              source_img: headshoturl,
              target_img: headshoturl.replaceAll("characters", "exported"),
              tEXt: jobj,
            };
            const response = await fetch(`/api/imgsaveinfo`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(exportjobj),
            });
            console.log("Save and export Image");
          }}
          color="primary"
        >
          Save & Export Image
        </Button>
        <Button
          onClick={() => {
            handleClose("", "", "", "");
          }}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
      <List className="m-12">
        <ListItem
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <Image src={headshoturl} width="200" height="300" alt="aiheadshot"></Image>
          <div>
            <TextField
              autoFocus
              margin="dense"
              id="ainame"
              label="Character Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setName(event.target.value);
              }}
            />
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
    </Dialog>
  );
}

export default CharacterEditor;
