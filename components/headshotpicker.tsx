import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  List,
  ListItem,
  FormControlLabel,
  Tabs,
  Tab,
  Grid,
  Item,
} from "@mui/material";
import { Session, Message, SessionManager } from "@/common/session";
import Image from "next/image";

interface TabPanelProps {
  index: number;
  value: number;
  genre: string;
  data: [];
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function TabPanel(props: TabPanelProps) {
  const { value, index, genre, data, ...other } = props;

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
          <Grid
            container
            spacing={2}
            columns={{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }}
          >
            {data.map((headshot, index) => (
              <Grid item xs={1} sm={1} md={1} key={index}>
                <div>
                  <Image width={200} height={200} src={headshot.url} />
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}
export default function HeadshotPicker({ show, handleClose }: any) {
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
    <Dialog open={show} onClose={handleClose} maxWidth="xxl" fullWidth={true}>
      <DialogTitle>Choose</DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {headshots.genres.map((genre, index) => (
            <Tab key={index} label={genre} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {headshots.genres.map((genre, index) => (
        <TabPanel
          value={value}
          index={index}
          data={headshots.data.filter((d) => d.genre == genre)}
        />
      ))}

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
