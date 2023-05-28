import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
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
} from "@mui/material";
import DialogConfig from "../components/DialogConfig";
import { GetConfig } from "../components/DialogConfig";

import TestComponent from "../components/testcomponent";
import Conversation from "../components/conversation";
import SessionList from "../components/sessionlist";
import { Session, Message, SessionManager } from "@/common/session";

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

  //chat related
  const [message, setMessage] = React.useState(""); //这是用来显示文本框中的字
  //这是用来传给conversation控件处理，发送后message会变空，prompt会变成message内容
  const [prompt, setPrompt] = React.useState(""); //处理完成后prompt会变空
  const [myconfig, setMyconfig] = React.useState({});
  React.useEffect(() => {
    // call the GetConfig function to get the API key and other configs
    async function fetchKeyAsync() {
      const config1 = await GetConfig();
      //console.log(config1);
      setMyconfig(config1);
    }
    fetchKeyAsync();
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleClose = () => {
    setOpendialog(false);
  };

  const ChangeIndexPageConfig = (config) => {
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
        indexpageconfig={ChangeIndexPageConfig}
      />
      <Main className="h-screen p-0 flex flex-col justify-start" open={open}>
        <DrawerHeader />
        {/*this is the main chat area                       control chat window               control chat window*/}
        <Conversation
          prompt={prompt}
          config={myconfig}
          className="flex-1 bg-yellow-50"
        />
        {/*this is the input area with buttons*/}
        <Box className="w-full min-h-[130px] flex">
          <TextField
            className="flex-1 ml-1 bg-white"
            multiline
            minRows="4"
            id="outlined-basic"
            label={`Your prompt goes here. Press [${
              myconfig.usectrlenter ? "Ctrl+Enter" : "Enter"
            }] to submit. Set in config`}
            variant="outlined"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode == 13 && (e.ctrlKey || !myconfig.usectrlenter)) {
                console.log(`usectrlenter: ${myconfig.usectrlenter}`);
                e.preventDefault();
                setPrompt(message);
                setMessage("");
              }
            }}
          />
          <Box className="w-[150px] gap-1 p-1 grid grid-cols-2 bg-blue">
            <Button
              id="generate"
              variant="contained"
              onClick={() => {
                //console.log("gen clicked: message is :" + message);
                setPrompt(message);
                setMessage("");
                //console.log("prompt is :" + prompt);
              }}
            >
              Gen
            </Button>
            <Button variant="outlined">ReGen</Button>
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
                // console.log(
                //   `sessionmanager current sessions: ${JSON.stringify(
                //     SessionManager.currentSession
                //   )}`
                // );
                // const ss = await SessionManager.LoadSessionFromJson(
                //   "e7b2120a-663b-4024-9504-2397c99736fa"
                // );
                // console.log(ss);
                // const sessions = await SessionManager.ReloadAndGetAllSessions();
                // console.log(sessions);

                const aaa = [1, 2, 3, 4, 5, 6, 7];
                let fable = aaa.splice(2);
                console.log(fable);
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
