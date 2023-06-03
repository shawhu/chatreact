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

export default function SessionList({ refreshtimestamp }: any) {
  const [mySessions, setMySessions] = React.useState<Session[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  React.useEffect(() => {
    const ggg = async () => {
      const sessions = await SessionManager.ReloadAndGetAllSessions();
      const sessionIndex = sessions.findIndex(
        (session: Session) =>
          session.sessionId === SessionManager.currentSession.sessionId
      );
      setSelectedIndex(sessionIndex);
      setMySessions(sessions);
    };
    ggg();
  }, []);
  React.useEffect(() => {
    if (
      SessionManager.sessions &&
      SessionManager.sessions.length > 0 &&
      SessionManager.currentSession &&
      SessionManager.currentSession.sessionId
    ) {
      const sessions = SessionManager.sessions;
      const sessionIndex = sessions.findIndex(
        (session) =>
          session.sessionId === SessionManager.currentSession.sessionId
      );
      setSelectedIndex(sessionIndex);
      setMySessions(sessions);
    }
  }, [refreshtimestamp]);
  return (
    <List>
      <ListItem>
        <ListItemButton
          onClick={async () => {
            console.log("New session clicked");
            const newsession = await SessionManager.CreateSessionAsync();
            setMySessions(SessionManager.sessions);
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
            selected={selectedIndex === index}
            onClick={() => {
              //console.log("Clicked, session id:" + session.sessionId);
              SessionManager.SetCurrentSessionById(session.sessionId);
              setSelectedIndex(index);
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
