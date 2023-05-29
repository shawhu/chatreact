import { estimateTokens } from "@/common/helper";
export class Message {
  role: "user" | "assistant" | "system";
  content: string = "";
  timestamp: number = "";
}
export class Session {
  sessionId: string = "";
  sessionName: string = "";
  messages: Message[] = [];
  model: string = "";
  maxToken: number = 0;
  aiheadshotimg: string = "";
  username: string = "";
  public GetMessagesWithTokenLimit(tokenLimit: number) {
    var newmessages: Message[] = [];
    for (let index = this.messages.length - 2; index >= 0; index--) {
      const msg = this.messages[index];
      newmessages.unshift(msg);
      const value = estimateTokens(JSON.stringify(newmessages));
      if (value > tokenLimit) {
        newmessages.shift(msg);
        break;
      }
    }
    return newmessages;
  }
}
export class SessionManager {
  public static sessions: Session[] = [];
  public static listnercallback: () => {};
  public static currentSession: Session = SessionManager.sessions[0];
  public static SetCurrentSessionById(sessionid: string) {
    // Find the session object in the array with the matching session ID
    const session = SessionManager.sessions.find(
      (s) => s.sessionId === sessionid
    );
    if (session) {
      // If a matching session was found, set it as the current session
      SessionManager.currentSession = session;
      //try to callback
      if (SessionManager.listnercallback) {
        SessionManager.listnercallback(); //trigger any component using session manager to re-render
      } else {
        console.error("listnercallback is undefined, can't call");
      }
    } else {
      // If no matching session was found, throw an error
      throw new Error(
        `Session with ID "${sessionid}" not found in session manager`
      );
    }
  }
  public static async SaveSessionToJson(session: Session) {
    try {
      const res = await fetch("/api/sessionsave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });
      //console.log(res);
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
  }
  public static async LoadSessionFromJson(sessionId: string): Promise<Session> {
    try {
      const res = await fetch(`/api/sessionload/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      //console.log(res);
      const sessionData = await res.json();
      const session = new Session();
      session.sessionId = sessionData.sessionId;
      session.sessionName = sessionData.sessionName;
      session.messages = sessionData.messages;
      session.model = sessionData.model;
      session.maxToken = sessionData.maxToken;
      session.aiheadshotimg = sessionData.aiheadshotimg;
      session.username = sessionData.username;
      return session;
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
  }
  public static async ReloadAndGetAllSessions() {
    try {
      const res = await fetch(`/api/sessionsload`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      //console.log(res);
      //the res.json<Session>() can't acutally return Session object it doesn't have methods
      const sessionsData = await res.json<Session[]>();
      const sessions = sessionsData.map((sessionData) => {
        const session = new Session();
        session.sessionId = sessionData.sessionId;
        session.sessionName = sessionData.sessionName;
        session.messages = sessionData.messages;
        session.model = sessionData.model;
        session.maxToken = sessionData.maxToken;
        session.aiheadshotimg = sessionData.aiheadshotimg;
        session.username = sessionData.username;
        return session;
      });
      SessionManager.sessions = sessions;
      SessionManager.currentSession = sessions[0];
      //to tell conversation.tsx that sessionmanager is loaded
      if (SessionManager.listnercallback) {
        SessionManager.listnercallback(); //trigger any component using session manager to re-render
      } else {
        console.error("listnercallback is undefined, can't call");
      }
      return sessions; // return the JSON data
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
  }
  public static async ResetSessionToOriginal(session: Session) {
    if (session) {
      //clean up
      session.messages = session.messages.slice(0, 2);
      //save to json
      await SessionManager.SaveSessionToJson(session);
      if (SessionManager.listnercallback) {
        SessionManager.listnercallback(); //trigger any component using session manager to re-render
      } else {
        console.error("listnercallback is undefined, can't call");
      }
    }
  }
  public static async RegenLastMessage(session: Session): string {
    const lastusermessage =
      session.messages[session.messages.length - 2].content;
    session.messages = session.messages.slice(0, -2); //delete both the user and ai response, last 2 messages
    if (SessionManager.listnercallback) {
      SessionManager.listnercallback(); //trigger any component using session manager to re-render
    } else {
      console.error("listnercallback is undefined, can't call");
    }
    return lastusermessage;
  }
}
