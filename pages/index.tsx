import * as React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import LoginIcon from "@mui/icons-material/Login";
import ContactsIcon from "@mui/icons-material/Contacts";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Menu as MenuIcon, Mail as MailIcon } from "@mui/icons-material";
import MuiAppBar, { AppBarProps } from "@mui/material/AppBar";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import DialogConfig from "@/components/dialogconfig";
import EditableLabel from "@/components/editablelabel";
import Conversation from "@/components/conversation";
import Conversationllmws from "@/components/conversationllmws";
import ConversationllmwsMultiChars from "@/components/conversationllmws_multichars";
import SessionList from "@/components/sessionlist";
import VoiceInputStreaming from "@/components/voiceinputstreaming";
import CharacterEditor from "@/components/charactereditor";
import { Session, Message, SessionManager } from "@/common/session";
import { Config } from "@/common/config";
import { GetStandarizedModelName, estimateTokens } from "@/common/helper";

// import dynamic from "next/dynamic";
// const VoiceInput = dynamic(() => import("@/components/voiceinput"), {
//   ssr: false,
// });

const PinkSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: pink[600],
    "&:hover": {
      backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: pink[600],
  },
}));
const GreenSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#33cf4d",
    "&:hover": {
      backgroundColor: alpha("#33cf4d", theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#33cf4d",
  },
}));

const drawerWidth = 300;
console.log("main app started");
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface MyAppBarProps extends AppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<MyAppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const backendCallingInterval = 20000; //20 seconds
  const [open, setOpen] = React.useState(true); //this is to control sidebar open by default
  const [openDialogConfig, setOpenDialogConfig] = React.useState(false); //control config dialog to show
  const [openDialogCharacterEditor, setOpenDialogCharacterEditor] = React.useState(false); //control config dialog to show
  const [opendialog, setOpendialog] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState("");
  const [voiceoverChecked, setvoiceoverChecked] = React.useState(false);
  const [sessionlistrefreshtimestamp, setSessionlistrefreshtimestamp] = React.useState(0);

  //this is to show current session name on the top
  const [sessionname, setSessionname] = React.useState("");
  //this's to show session model
  const [model, setModel] = React.useState("");
  const [modelname, setModelname] = React.useState("");
  const [timerId, setTimerId] = React.useState<NodeJS.Timeout>();
  const [connected, setConnected] = React.useState(false);
  //chat related
  const [message, setMessage] = React.useState(""); //这是用来显示文本框中的字
  //这是用来传给conversation控件处理，发送后message会变空，prompt会变成message内容
  const [prompt, setPrompt] = React.useState({ value: "" }); //处理完成后prompt会变空
  const [myconfig, setMyconfig] = React.useState(new Config());

  const backendProbe = () => {
    let apiEndpoint = "";
    //console.log("inside interval model: " + SessionManager.currentSession.model);
    if (SessionManager.currentSession.model.toLowerCase() === "chatgpt") {
      apiEndpoint = "https://api.openai.com/v1/models";
    } else if (SessionManager.currentSession.model.toLowerCase().includes("kobold")) {
      apiEndpoint = "/api/v1/model";
    }
    fetch(apiEndpoint, {
      headers: {
        Authorization: `Bearer ${Config.GetConfig()?.openaikey}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        const respjson = await res.json();
        if (respjson.result) {
          const modelname = GetStandarizedModelName(respjson.result);
          //console.log(`backendProbe response: ${modelname}`);
          setModelname(modelname);
        }
        if (respjson.data) {
          //console.log(`backendProbe response: gpt-3.5-turbo`);
          //setModelname(`gpt-3.5-turbo`);
          setModelname(`gpt-4`);
        }

        if (res.status > 210) {
          //console.error("Backend probe return error");
          setConnected(false);
        } else {
          setConnected(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setConnected(false);
      });
  };
  React.useEffect(() => {
    if (!model || model == "") {
      return;
    }
    console.log("indexpage: model probe is running, model changed to " + model);
    //setup and run the probe
    clearInterval(timerId); // clear previous interval
    backendProbe();
    const newTimerId = setInterval(backendProbe, backendCallingInterval);
    setTimerId(newTimerId); // set new timerId
    return () => clearInterval(newTimerId);
  }, [model]);
  React.useEffect(() => {
    // call the GetConfig function to get the API key and other configs
    async function getvoiceoverAsync() {
      const config1 = await Config.GetConfigInstanceAsync();
      //console.log(config1);
      setMyconfig(config1);
      setvoiceoverChecked(config1.voiceover);
    }
    getvoiceoverAsync();
    SessionManager.indexpagecallback = () => {
      console.log(
        `indexpage: indexpagecallback triggered from SessionManager, sessionname:${SessionManager.currentSession.sessionName} model:${SessionManager.currentSession.model}`
      );
      setSessionname(SessionManager.currentSession.sessionName);
      setModel(SessionManager.currentSession.model);
      //cancel interval calling probe
      setConnected(false);
      setPrompt({ value: "" });
      backendProbe();
    };
  });

  const RefreshIndexPageConfig = (config: any) => {
    console.log("got config callback from dialogconfig");
    console.log(config);
    setMyconfig(config);
  };
  const RefreshSessionList = () => {
    console.log("setSessionlistrefreshtimestamp triggered");
    setSessionlistrefreshtimestamp(sessionlistrefreshtimestamp + 1);
  };
  return (
    <Box className="flex">
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => {
              setOpen(true);
            }}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          {/* Modify session name */}
          <EditableLabel text={sessionname} onModified={RefreshSessionList} />
          <IconButton
            onClick={() => {
              console.log("popup character editor");
              setOpenDialogCharacterEditor(true);
            }}
            className="ml-4"
            color="secondary"
            aria-label="Character"
          >
            <ContactsIcon />
          </IconButton>
          <div className="flex-1 flex justify-end">
            {/* Modify session backend */}
            <div className="flex items-center mr-4">
              <Box className="text-xs">[{modelname}]</Box>
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <Select
                  sx={{
                    bgcolor: "white",
                    color: "black",
                    border: "1px solid black",
                  }}
                  labelId="backend-select-label"
                  id="backend-select"
                  value={model}
                  onChange={async (event: any) => {
                    SessionManager.currentSession.model = event.target.value;
                    await SessionManager.SaveSessionToJson(SessionManager.currentSession);
                    setModel(SessionManager.currentSession.model);
                    setConnected(false);
                  }}
                >
                  <MenuItem value={"kobold"}>kobold</MenuItem>
                  <MenuItem value={"koboldmc"}>koboldmc</MenuItem>
                  <MenuItem value={"ChatGPT"}>ChatGPT</MenuItem>
                </Select>
              </FormControl>
              {connected ? <WifiIcon /> : <WifiOffIcon />}
            </div>
            {/* Turn voice-over on/off */}
            <FormControlLabel
              control={
                <GreenSwitch
                  color="default"
                  checked={voiceoverChecked}
                  onChange={async () => {
                    setvoiceoverChecked(!voiceoverChecked);
                    //save this to config
                    let config = await Config.GetConfigInstanceAsync();
                    config.voiceover = !voiceoverChecked;
                    await config.SaveAsync();
                    //tell conversation to clear audiotext
                  }}
                />
              }
              label="Turn on voice-over"
            />
          </div>
        </Toolbar>
      </AppBar>
      {/* Left sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        {/* 3bar menu icon */}
        <DrawerHeader>
          <IconButton
            onClick={() => {
              setOpen(false);
            }}
          >
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box className="h-full flex flex-col justify-between overflow-y-hidden">
          {/* sessionlist */}
          <SessionList
            className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100"
            refreshtimestamp={sessionlistrefreshtimestamp}
          />
          {/* sidebar buttons */}
          <List>
            <Divider />
            {/* Login button */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  console.log("Login clicked");
                }}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={"Login"} />
              </ListItemButton>
            </ListItem>
            {/* Settings button */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  console.log("Config clicked");
                  setOpenDialogConfig(true);
                }}
              >
                <ListItemIcon>
                  <TuneIcon />
                </ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/* Settings dialog */}
      <DialogConfig
        open={openDialogConfig}
        handleClose={() => {
          setOpenDialogConfig(false);
          backendProbe();
        }}
        refreshindexpageconfig={RefreshIndexPageConfig}
      />
      {/* chat area */}
      <Main className="h-screen p-0 flex flex-col justify-start" open={open}>
        <DrawerHeader />
        {/*this is the main chat area                       control chat window               control chat window*/}
        {model == "ChatGPT" ? (
          <Conversation
            prompt={prompt}
            voiceover={voiceoverChecked}
            initialmessages={SessionManager.currentSession.messages}
            initialainame={SessionManager.currentSession.ainame}
            refreshsessionlist={RefreshSessionList}
          />
        ) : (
          <></>
        )}
        {model == "kobold" ? (
          <Conversationllmws
            prompt={prompt}
            voiceover={voiceoverChecked}
            initialmessages={SessionManager.currentSession.messages}
            initialainame={SessionManager.currentSession.ainame}
            llmname={modelname}
          />
        ) : (
          <></>
        )}
        {model == "koboldmc" ? (
          <ConversationllmwsMultiChars
            prompt={prompt}
            voiceover={voiceoverChecked}
            initialmessages={SessionManager.currentSession.messages}
            initialainame={SessionManager.currentSession.ainame}
            llmname={modelname}
          />
        ) : (
          <></>
        )}

        {/*this is the input area with buttons*/}
        <Box className="w-full min-h-[130px] flex">
          <div className="flex-1 ml-1">
            <VoiceInputStreaming
              sliceduration={1000} //this only works for voiceinputstreaming
              sendbacktext={(text: string) => {
                setMessage(text);
              }}
            />
            <TextField
              fullWidth
              multiline
              minRows="4"
              id="outlined-basic"
              label={`Token: ${estimateTokens(message)}, Press [${
                myconfig.ctrlenter ? "Ctrl/Shift+Enter" : "Enter"
              }] to submit`}
              variant="outlined"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={async (e) => {
                // console.log(
                //   `onKeyDown checking ctrlenter: ${myconfig.ctrlenter}`
                // );
                if (e.keyCode == 13 && (e.ctrlKey || e.shiftKey || !myconfig.ctrlenter)) {
                  console.log(`send by enter or ctrlenter`);
                  e.preventDefault();
                  setPrompt({ value: message });
                  setMessage("");
                }
              }}
            />
          </div>
          {/*this is prompt buttons*/}
          <Box className="w-[220px] gap-1 p-1 grid grid-cols-3 bg-blue">
            <Button
              id="generate"
              variant="contained"
              disabled={!connected}
              onClick={() => {
                //console.log("gen clicked: message is: " + message);
                setPrompt({ value: message });
                setMessage("");
                //console.log("prompt is:" + JSON.stringify(prompt));
              }}
            >
              Gen
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                //remove the last message
                const previousPrompt = await SessionManager.RegenLastMessage(SessionManager.currentSession);
                setMessage(`${previousPrompt}`);
                console.log("regen clicked");
              }}
            >
              R.Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogMessage("Do you want to delete all messages from this session?");
                setOpendialog(true);
              }}
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                console.log("TEST clicked");
                console.log(SessionManager.currentSession);
              }}
            >
              TEST1
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                console.log("TEST2 button clicked");
              }}
            >
              TEST2
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                console.log("test3 clicked");
              }}
            >
              TEST3
            </Button>
          </Box>
        </Box>
        <Dialog
          open={opendialog}
          onClose={() => {
            setOpendialog(false);
          }}
        >
          <DialogTitle>Clean up</DialogTitle>
          <DialogContent>{dialogMessage}</DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpendialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await SessionManager.ResetSessionToOriginal(SessionManager.currentSession.sessionId);
                console.log("Reset session to original");
                RefreshSessionList();
                setOpendialog(false);
              }}
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
        <CharacterEditor
          open={openDialogCharacterEditor}
          handleClose={(allfields: string, firstmessage: string, headshoturl: string, ainame: string) => {
            //console.log(`index page got allfields: ${allfields}`);
            if (allfields && allfields != "") {
              console.log("try to load characters to currentsession");
              if (SessionManager.currentSession.messages.length > 0) {
                SessionManager.currentSession.ainame = ainame;
                SessionManager.currentSession.username = "you";
                SessionManager.currentSession.aiheadshotimg = headshoturl;
                SessionManager.currentSession.messages[0].content = allfields;
                //check if there's a first message
                if (
                  SessionManager.currentSession.messages.length > 1 &&
                  SessionManager.currentSession.messages[1].role == "assistant" &&
                  firstmessage != ""
                ) {
                  SessionManager.currentSession.messages[1].content = firstmessage;
                }
                SessionManager.SaveSessionToJson(SessionManager.currentSession);
              } else {
                const messagesystem = new Message({
                  role: "system",
                  content: allfields,
                  completets: Math.floor(Date.now() / 1000),
                });
                const messageassistant = new Message({
                  role: "assistant",
                  content: firstmessage,
                  completets: Math.floor(Date.now() / 1000) + 1,
                });
                SessionManager.currentSession.ainame = ainame;
                SessionManager.currentSession.username = "you";
                SessionManager.currentSession.aiheadshotimg = headshoturl;
                SessionManager.currentSession.messages.push(messagesystem);
                SessionManager.currentSession.messages.push(messageassistant);
                SessionManager.SaveSessionToJson(SessionManager.currentSession);
              }
            }
            setOpenDialogCharacterEditor(false);
          }}
        />
      </Main>
    </Box>
  );
}
