import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
} from "@mui/material";
import DialogConfig from "../components/DialogConfig";
import { GetOpenAIConfig } from "../components/DialogConfig";

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
  const [open, setOpen] = React.useState(false); //this is to control sidebar open by default
  const [openDialogConfig, setOpenDialogConfig] = React.useState(false);

  //chat related
  const [message, setMessage] = React.useState(""); //这是用来显示文本框中的字
  //这是用来传给conversation控件处理，发送后message会变空，prompt会变成message内容
  const [prompt, setPrompt] = React.useState(""); //处理完成后prompt会变空
  const [openaiconfig, setOpenaiconfig] = React.useState({});
  React.useEffect(() => {
    // call the GetOpenAIKey function to get the API key
    async function fetchKeyAsync() {
      const config1 = await GetOpenAIConfig();
      //console.log(config1);
      setOpenaiconfig(config1);
    }
    fetchKeyAsync();
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
                console.log("登录 clicked");
              }}
            >
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary={"登录"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("设置 clicked");
                setOpenDialogConfig(true);
              }}
            >
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary={"设置"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <DialogConfig
        open={openDialogConfig}
        handleClose={() => setOpenDialogConfig(false)}
      />
      <Main className="h-screen p-0 flex flex-col justify-start" open={open}>
        <DrawerHeader />
        {/*this is the main chat area                       control chat window               control chat window*/}
        <Conversation
          prompt={prompt}
          config={openaiconfig}
          className="flex-1 bg-yellow-50"
        />
        {/*this is the input area with buttons*/}
        <Box className="w-full min-h-[130px] flex">
          <TextField
            className="flex-1 ml-1 bg-white"
            multiline
            minRows="4"
            id="outlined-basic"
            label="Your Prompt here"
            variant="outlined"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode == 13 && e.ctrlKey) {
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
            <Button variant="outlined">Rewind</Button>
            <Button
              variant="outlined"
              onClick={() => {
                console.log("TEST clicked");
                console.log(
                  `sessionmanager current sessions: ${JSON.stringify(
                    SessionManager.currentSession
                  )}`
                );
                //test to get current session info
              }}
            >
              TEST
            </Button>
          </Box>
        </Box>
      </Main>
    </Box>
  );
}
