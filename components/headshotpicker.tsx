import React, { useState, useEffect } from "react";
import { Button, Box, Dialog, DialogActions, DialogTitle, Tabs, Tab, Grid } from "@mui/material";
import { Session, Message, SessionManager } from "@/common/session";
import Image from "next/image";

interface TabPanelProps {
  index: number;
  value: number;
  genre: string;
  handleClose: () => void;
  data: any[];
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function TabPanel(props: TabPanelProps) {
  const { value, index, genre, data, handleClose, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 8 }}>
            {data.map((headshot, index) => (
              <Grid
                item
                xs={1}
                sm={1}
                md={1}
                key={index}
                sx={{ cursor: "pointer" }}
                onClick={async () => {
                  console.log("image clicked " + headshot.url);
                  console.log("try to modify and change session headshot url");
                  SessionManager.currentSession.aiheadshotimg = headshot.url;
                  await SessionManager.SaveSessionToJson(SessionManager.currentSession);
                  handleClose();
                }}
              >
                <div>
                  <Image width={200} height={200} src={headshot.url} alt="Headshot of a Chatbot" />
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}

export default function HeadshotPicker({ show, handleClose }: { show: boolean; handleClose: () => void }) {
  //code to run tabs and UI
  const [value, setValue] = React.useState(0);
  useEffect(() => {}, []);
  const handleSave = async () => {
    handleClose();
  };
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  //mycode
  const [headshots, setHeadshots] = React.useState({
    genres: ["anime", "pure"],
    data: [
      { url: "headshots/00041-1887550735.jpg", genre: "anime" },
      { url: "headshots/00034-2484891565.jpg", genre: "pure" },
    ],
  });

  useEffect(() => {
    const fetchHeadshots = async () => {
      const response = await fetch("/api/getheadshots");
      const data = await response.json();
      setHeadshots(data);
    };
    fetchHeadshots();
  }, []);

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="xl" fullWidth={true}>
      <DialogTitle>Choose</DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {headshots.genres.map((genre, index) => (
            <Tab key={index} label={genre} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {headshots.genres.map((genre, index) => (
        <TabPanel
          key={index}
          value={value}
          index={index}
          genre={genre}
          handleClose={handleClose}
          data={headshots.data.filter((d) => d.genre == genre)}
        />
      ))}

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
