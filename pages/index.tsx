import * as React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import LoginIcon from "@mui/icons-material/Login";
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
import SessionList from "@/components/sessionlist";
import { Session, Message, SessionManager } from "@/common/session";
import { Config } from "@/common/config";
//import VoiceInput from "@/components/voiceinput";
import dynamic from "next/dynamic";
const VoiceInput = dynamic(() => import("@/components/voiceinput"), {
  ssr: false,
});

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

const drawerWidth = 200;
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
  const [open, setOpen] = React.useState(true); //this is to control sidebar open by default
  const [openDialogConfig, setOpenDialogConfig] = React.useState(false); //control config dialog to show
  const [opendialog, setOpendialog] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState("");
  const [voiceoverChecked, setvoiceoverChecked] = React.useState(false);
  const [sessionlistrefreshtimestamp, setSessionlistrefreshtimestamp] =
    React.useState(0);

  //this is to show current session name on the top
  const [sessionname, setSessionname] = React.useState("");
  //this's to show session model
  const [model, setModel] = React.useState("");

  //chat related
  const [message, setMessage] = React.useState(""); //这是用来显示文本框中的字
  //这是用来传给conversation控件处理，发送后message会变空，prompt会变成message内容
  const [prompt, setPrompt] = React.useState({ value: "" }); //处理完成后prompt会变空
  const [myconfig, setMyconfig] = React.useState(new Config());
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
      console.log("Index page indexpagecallback triggered");
      setSessionname(SessionManager.currentSession.sessionName);
      setModel(SessionManager.currentSession.model);
      setPrompt("");
    };
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleClose = () => {
    setOpendialog(false);
  };

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
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <EditableLabel text={sessionname} onModified={RefreshSessionList} />
          <div className="flex items-center">
            <span className="ml-10">Choose Model:</span>
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
                onChange={async (event: SelectChangeEvent) => {
                  SessionManager.currentSession.model = event.target.value;
                  await SessionManager.SaveSessionToJson(
                    SessionManager.currentSession
                  );
                  setModel(SessionManager.currentSession.model);
                }}
              >
                <MenuItem value={"kobold"}>kobold</MenuItem>
                <MenuItem value={"gpt-3.5-turbo"}>gpt-3.5-turbo</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="flex-1 flex justify-end">
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
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <SessionList refreshtimestamp={sessionlistrefreshtimestamp} />
        <Divider />
        <List>
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
      </Drawer>
      <DialogConfig
        open={openDialogConfig}
        handleClose={() => setOpenDialogConfig(false)}
        refreshindexpageconfig={RefreshIndexPageConfig}
      />
      <Main className="h-screen p-0 flex flex-col justify-start" open={open}>
        <DrawerHeader />
        {/*this is the main chat area                       control chat window               control chat window*/}
        {model == "gpt-3.5-turbo" ? (
          <Conversation
            prompt={prompt}
            voiceover={voiceoverChecked}
            initialmessages={SessionManager.currentSession.messages}
          />
        ) : (
          <Conversationllmws
            prompt={prompt}
            voiceover={voiceoverChecked}
            initialmessages={SessionManager.currentSession.messages}
          />
        )}

        {/*this is the input area with buttons  this is the input area with buttons  this is the input area with buttons  */}
        <Box className="w-full min-h-[130px] flex">
          <div className="flex-1 ml-1">
            <VoiceInput
              sendbacktext={(text: string) => {
                setMessage(text);
              }}
            />
            <TextField
              fullWidth
              multiline
              minRows="4"
              id="outlined-basic"
              label={`Your prompt goes here. Press [${
                myconfig.ctrlenter ? "Ctrl+Enter" : "Enter"
              }] to submit. Set in config`}
              variant="outlined"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={async (e) => {
                // console.log(
                //   `onKeyDown checking ctrlenter: ${myconfig.ctrlenter}`
                // );
                if (e.keyCode == 13 && (e.ctrlKey || !myconfig.ctrlenter)) {
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
              onClick={() => {
                console.log("gen clicked: message is: " + message);
                setPrompt({ value: message });
                setMessage("");
                console.log("prompt is: " + prompt);
              }}
            >
              Gen
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                //remove the last message
                const previousPrompt = await SessionManager.RegenLastMessage(
                  SessionManager.currentSession
                );
                setMessage(`${previousPrompt}`);
                console.log("regen clicked");
              }}
            >
              R.Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogMessage(
                  "Do you want to delete all messages from this session?"
                );
                setOpendialog(true);
              }}
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                console.log("TEST clicked");
                const ccc = await Config.GetConfigInstanceAsync();
                console.log(ccc);
                console.log(
                  SessionManager.currentSession.GetPromptWithTokenLimit(1000)
                );
                console.log(SessionManager.currentSession);
                console.log("prompt is:");
                console.log(prompt);
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
        <Dialog open={opendialog} onClose={handleClose}>
          <DialogTitle>Clean up</DialogTitle>
          <DialogContent>{dialogMessage}</DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={async () => {
                await SessionManager.ResetSessionToOriginal(
                  SessionManager.currentSession.sessionId
                );
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
      </Main>
    </Box>
  );
}
