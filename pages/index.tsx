import * as React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
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
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import DialogConfig from "../components/DialogConfig";

import TestComponent from "../components/testcomponent";
import Conversation from "../components/conversation";
import SessionList from "../components/sessionlist";
import { Session, Message, SessionManager } from "@/common/session";
import { Config } from "@/common/config";
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

interface AppBarProps extends AppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
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

  //chat related
  const [message, setMessage] = React.useState(""); //这是用来显示文本框中的字
  //这是用来传给conversation控件处理，发送后message会变空，prompt会变成message内容
  const [prompt, setPrompt] = React.useState(""); //处理完成后prompt会变空
  const [myconfig, setMyconfig] = React.useState({});
  React.useEffect(() => {
    // call the GetConfig function to get the API key and other configs
    async function fetchKeyAsync() {
      const config1 = await Config.GetConfigInstanceAsync();
      //console.log(config1);
      setMyconfig(config1);
      setvoiceoverChecked(config1.voiceover);
    }
    fetchKeyAsync();
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

  const RefreshIndexPageConfig = (config) => {
    console.log("got config callback from dialogconfig");
    console.log(config);
    setMyconfig(config);
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
          <Typography variant="h6" noWrap component="div">
            这是一个很欢乐的聊天
          </Typography>
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
        <SessionList />
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("Login clicked");
              }}
            >
              <ListItemIcon>
                <MailIcon />
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
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary={"Config"} />
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
        <Conversation prompt={prompt} />
        {/*this is the input area with buttons*/}
        <Box className="w-full min-h-[130px] flex">
          <TextField
            className="flex-1 ml-1 bg-white"
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
              console.log(
                `onKeyDown checking ctrlenter: ${myconfig.ctrlenter}`
              );
              if (e.keyCode == 13 && (e.ctrlKey || !myconfig.ctrlenter)) {
                console.log(`send by enter or ctrlenter`);
                e.preventDefault();
                setPrompt({ value: message });
                setMessage("");
              }
            }}
          />
          {/*this is prompt buttons*/}
          <Box className="w-[150px] gap-1 p-1 grid grid-cols-2 bg-blue">
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
              Delete All
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                console.log("TEST clicked");
                const ccc = await Config.GetConfigInstanceAsync();
                console.log(ccc);
                console.log(`prompt: ${prompt}`);
                console.log(`message: ${message}`);
              }}
            >
              TEST
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
                SessionManager.ResetSessionToOriginal(
                  SessionManager.currentSession
                );
                console.log("delete all executed.");
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
