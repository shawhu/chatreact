import * as React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { Session, Message, SessionManager } from "@/common/session";

export default function SessionList() {
  const [mySessions, setMySessions] = React.useState<[Session]>([]);
  React.useEffect(() => {
    setMySessions(SessionManager.sessions);
  }, []);
  return (
    <List>
      {mySessions.map((session, index) => (
        <ListItem key={session.sessionId} disablePadding>
          <ListItemButton
            onClick={() => {
              //console.log("Clicked, session id:" + session.sessionId);
              SessionManager.SetCurrentSessionById(session.sessionId);
            }}
          >
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={session.sessionName} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
