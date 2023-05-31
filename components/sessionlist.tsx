import * as React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Session, Message, SessionManager } from "@/common/session";

export default function SessionList() {
  const [mySessions, setMySessions] = React.useState<[Session]>([]);
  React.useEffect(() => {
    const ggg = async () => {
      setMySessions(await SessionManager.ReloadAndGetAllSessions());
    };
    ggg();
  }, []);
  return (
    <List>
      <ListItem>
        <ListItemButton
          onClick={() => {
            console.log("New");
          }}
        >
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
          <ListItemText primary={"New"} />
        </ListItemButton>
      </ListItem>
      {mySessions.map((session, index) => (
        <ListItem key={session.sessionId} disablePadding>
          <ListItemButton
            onClick={() => {
              //console.log("Clicked, session id:" + session.sessionId);
              SessionManager.SetCurrentSessionById(session.sessionId);
            }}
          >
            <ListItemText className="flex-1" primary={session.sessionName} />
            <ListItemIcon>
              <DeleteIcon
                onClick={async (event) => {
                  console.log("session delete clicked");
                  event.stopPropagation();
                  const newsessions = await SessionManager.DeleteSessionAsync(
                    session.sessionId
                  );
                  setMySessions(newsessions);
                }}
              />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
