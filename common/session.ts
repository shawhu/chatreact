import { estimateTokens } from "@/common/helper";
import { Config } from "@/common/config";
import { v4 as uuidv4 } from "uuid";

export class Message {
  role: string = "";
  content: string = "";
  completets?: number = -1;

  constructor({ role, content, completets }: { role: string; content: string; completets?: number }) {
    this.role = role as "user" | "assistant" | "system";
    this.content = content;
    this.completets = completets ?? -1;
  }
}
export class Session {
  sessionId: string = "";
  sessionName: string = "";
  messages: Message[] = [];
  model: string = "";
  maxToken: number = 0;
  aiheadshotimg: string = "";
  ainame: string = "";
  username: string = "";
  create_ts: number = 0;
  //used by chatgpt
  public GetMessagesWithTokenLimit(tokenLimit: number) {
    var newmessages: Message[] = [];
    const systeMsgTokens = estimateTokens(this.messages[0].content);
    //this.messages.length - 2 because the last one is assistant is thinking...
    for (let index = this.messages.length - 2; index >= 0; index--) {
      const msg = this.messages[index];
      newmessages.unshift(msg);
      const tokenscount = estimateTokens(JSON.stringify(newmessages));
      if (tokenscount + systeMsgTokens > tokenLimit) {
        newmessages.shift();
        break;
      }
    }
    //add system message at the top
    newmessages.unshift(this.messages[0]);
    return newmessages;
  }
  //used by local run llm
  public GetPromptWithTokenLimit(tokenLimit: number, llmname: string) {
    if (!this.messages || this.messages.length == 0) {
      return "";
    }
    var newmessages: Message[] = [];
    const systemtokenscount = estimateTokens(this.messages[0].content);
    //this.messages.length - 2 because the last one is assistant is thinking...
    for (let index = this.messages.length - 2; index >= 0; index--) {
      const msg = this.messages[index];
      newmessages.unshift(msg); //add to the top
      const tokenscount = estimateTokens(JSON.stringify(newmessages));
      if (tokenscount > tokenLimit - systemtokenscount) {
        newmessages.shift();
        newmessages.unshift(this.messages[0]); //add system
        break;
      }
    }

    let prompt = "";
    //adding instruction if model requires it
    if (llmname.toLowerCase().includes("pygmalion")) {
      prompt += `${this.ainame}'s Persona: `;
    } else if (llmname.toLowerCase().includes("wizardcoder") || llmname.toLowerCase().includes("alpaca")) {
      //Alpaca instruction
      prompt += `Continue the chat dialogue below. Write a single reply for the character "### Response".\n`;
    } else if (llmname.toLowerCase().includes("orca")) {
      //Chat mode, not instruction mode
      prompt += `### System:\n`;
    } else {
      //same as vicuna 1.1 and samantha
      prompt += `Continue the chat dialogue below. Write a single reply for the character "ASSISTANT".\n`;
    }
    //adding context or system message on top
    if (llmname.toLowerCase().includes("pygmalion")) {
      prompt += `${newmessages[0].content}\n`;
      prompt += "<START>\n";
    } else if (llmname.toLowerCase().includes("wizardcoder")) {
      prompt += `${newmessages[0].content}\n`;
    } else if (llmname.toLowerCase().includes("orca")) {
      prompt += `${newmessages[0].content}\n\n`;
    } else {
      //same as vicuna 1.1 and samantha
      prompt += `${newmessages[0].content}\n`;
    }

    for (let index = 1; index < newmessages.length; index++) {
      const message = newmessages[index];
      if (message.role == "user") {
        const userstring = `${this.username.charAt(0).toUpperCase() + this.username.slice(1)}:`;
        if (llmname.toLowerCase().includes("wizardcoder") || llmname.toLowerCase().includes("alpaca")) {
          //Alpaca instruction
          prompt += `### Instruction:\n${message.content}\n\n`;
        } else if (llmname.toLowerCase().includes("pygmalion")) {
          //pygmalion etc
          prompt += `${userstring}${message.content}\n`;
        } else if (llmname.toLowerCase().includes("orca")) {
          //orca
          prompt += `### User:\n${message.content}\n\n`;
        } else {
          //vicuna 1.1 instruction and samantha
          prompt += `USER:${message.content}\n`;
        }
      } else if (message.role == "assistant") {
        if (llmname.toLowerCase().includes("wizardcoder") || llmname.toLowerCase().includes("alpaca")) {
          //Alpaca instruction
          if (index == newmessages.length - 1) {
            prompt += `### Response:\n`;
          } else {
            prompt += `### Response:\n${message.content}\n\n`;
          }
        } else if (llmname.toLowerCase().includes("pygmalion")) {
          //pygmalion style
          if (index == newmessages.length - 1) {
            prompt += `${this.ainame}:`;
          } else {
            prompt += `${this.ainame}:${message.content}\n`;
          }
        } else if (llmname.toLowerCase().includes("orca")) {
          //orca style
          if (index == newmessages.length - 1) {
            prompt += `### Response:\n`;
          } else {
            prompt += `### Response:\n${message.content}\n\n`;
          }
        } else {
          //vicuna 1.1 instruction and samantha
          if (index == newmessages.length - 1) {
            prompt += `ASSISTANT:`;
          } else {
            prompt += `ASSISTANT:${message.content}</s>\n`;
          }
        }
      }
    }

    //finally pre add assistant: at the end
    if (llmname.toLowerCase().includes("wizardcoder") || llmname.toLowerCase().includes("alpaca")) {
      prompt += `### Response:\n`;
    } else if (llmname.toLowerCase().includes("pygmalion")) {
      prompt += `${this.ainame}:`;
    } else if (llmname.toLowerCase().includes("orca")) {
      prompt += `### Response:\n`;
    } else {
      //vicuna 1.1 and samantha
      prompt += `ASSISTANT:`;
    }

    return prompt;
  }
}
export class SessionManager {
  public static sessions: Session[] = [new Session()];
  public static listenercallback: () => void;
  public static indexpagecallback: () => void; //call index page
  public static currentSession: Session = SessionManager.sessions[0];
  private static dolistenercallback() {
    if (SessionManager.listenercallback) {
      SessionManager.listenercallback(); //call conversation, conversationllm
    } else {
      console.log(
        "SessionManager: conversation or conversaionllm is not loaded, listenercallback is undefined, skip calling"
      );
    }
  }
  public static async SetCurrentSessionById(sessionid: string) {
    // Find the session object in the array with the matching session ID
    const session = SessionManager.sessions.find((s) => s.sessionId === sessionid);
    if (session) {
      // If a matching session was found, set it as the current session
      SessionManager.currentSession = session;
      //save to config
      const config = await Config.GetConfigInstanceAsync();
      config.currentsessionid = session.sessionId;
      await config.SaveAsync();
      //try to callback
      SessionManager.dolistenercallback();
      SessionManager.indexpagecallback();
    } else {
      // If no matching session was found, throw an error
      throw new Error(`Session with ID "${sessionid}" not found in session manager`);
    }
  }
  public static async SaveSessionToJson(session: Session) {
    if (!session.sessionId || session.sessionId == "") {
      console.error("sessionid is empty, skip session saving");
      return;
    }
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
  public static async CreateSessionAsync() {
    const newsession = new Session();
    newsession.sessionId = uuidv4();
    newsession.sessionName = "New Session";
    newsession.create_ts = Math.floor(Date.now() / 1000);
    newsession.model = "ChatGPT";
    newsession.username = "You";
    newsession.ainame = "assistant";
    newsession.aiheadshotimg = "/headshots/ai/00001-748567734.jpg";
    newsession.maxToken = 1000;
    newsession.messages = [
      {
        role: "system",
        content: "You are an AI assistant that follows instruction extremely well. Help as much as you can.",
      },
      {
        role: "user",
        content: "Hello",
      },
      {
        role: "assistant",
        content: "Hi dear, What can I help you today?",
      },
    ];

    try {
      const res = await fetch("/api/sessionsave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsession),
      });
      //console.log(res);
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
    SessionManager.sessions = [newsession, ...SessionManager.sessions];
  }
  //doesn't have any usage
  public static async LoadSessionFromJson(sessionId: string): Promise<Session> {
    const session = new Session();
    try {
      const res = await fetch(`/api/sessionload/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      //console.log(res);
      const sessionData = await res.json();

      session.sessionId = sessionData.sessionId;
      session.sessionName = sessionData.sessionName;
      session.messages = sessionData.messages;
      session.model = sessionData.model;
      session.maxToken = sessionData.maxToken;
      session.aiheadshotimg = sessionData.aiheadshotimg;
      session.username = sessionData.username;
      session.ainame = sessionData.ainame;
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
    return session;
  }
  public static async ReloadAndGetAllSessions() {
    console.log("session class: ReloadAndGetAllSessions");

    try {
      //this is going to add 3 session json files to the sessions folder if the folder is empty
      const res = await fetch(`/api/sessionsload`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      //console.log(res);
      //the res.json<Session>() can't acutally return Session object it doesn't have methods
      const sessionsData = await res.json();
      const sessions = sessionsData
        .map((sessionData: any) => {
          const session = new Session();
          session.sessionId = sessionData.sessionId;
          session.sessionName = sessionData.sessionName;
          session.messages = sessionData.messages;
          session.model = sessionData.model;
          session.maxToken = sessionData.maxToken;
          session.aiheadshotimg = sessionData.aiheadshotimg;
          session.username = sessionData.username;
          session.ainame = sessionData.ainame;
          session.create_ts = sessionData.create_ts;
          return session;
        })
        .sort((a: Session, b: Session) => b.create_ts - a.create_ts); // sort by create_ts in descending order
      SessionManager.sessions = sessions;

      const config = await Config.GetConfigInstanceAsync();
      //console.log(config);
      if (config.currentsessionid && config.currentsessionid != "") {
        //console.log("found history sessionid");
        const current_session = SessionManager.sessions.find((session) => session.sessionId == config.currentsessionid);
        if (current_session) {
          SessionManager.currentSession = current_session;
        } else {
          SessionManager.currentSession = sessions[0];
          config.currentsessionid = SessionManager.currentSession.sessionId;
          await config.SaveAsync();
        }
      } else {
        console.log("no history sessionid has been found");
        SessionManager.currentSession = sessions[0];
        config.currentsessionid = SessionManager.currentSession.sessionId;
        await config.SaveAsync();
      }

      //to tell conversation.tsx that sessionmanager is loaded
      SessionManager.dolistenercallback();
      SessionManager.indexpagecallback();
      return sessions; // return the JSON data
    } catch (error) {
      console.log("server error");
      console.error(error);
    }
  }
  public static async ResetSessionToOriginal(sessionid: string) {
    //clean up
    try {
      const res = await fetch(`/api/sessionloadtemplate/${sessionid}`, {
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
      session.ainame = sessionData.ainame;
      //save to json
      await SessionManager.SaveSessionToJson(session);
      SessionManager.currentSession = session;
      //replace session in sessions
      const index = SessionManager.sessions.findIndex((s) => s.sessionId == sessionid);
      if (index >= 0) {
        SessionManager.sessions[index] = session;
      }
      SessionManager.dolistenercallback();
    } catch (error) {
      console.log("server error, can't find session in template");
      console.log("will delete all messages until 2 left");

      SessionManager.currentSession.messages = SessionManager.currentSession.messages.slice(0, 3);
      //save to json
      await SessionManager.SaveSessionToJson(SessionManager.currentSession);
      SessionManager.dolistenercallback();
    }
  }
  public static async RegenLastMessage(session: Session): Promise<string> {
    const lastusermessage = session.messages[session.messages.length - 2].content;
    session.messages = session.messages.slice(0, -2); //delete both the user and ai response, last 2 messages
    SessionManager.dolistenercallback();
    return lastusermessage;
  }
  public static async DeleteSessionAsync(sessionid: string): Promise<Session[]> {
    const newSessions = SessionManager.sessions.filter((session) => session.sessionId !== sessionid);
    SessionManager.sessions = newSessions;
    //call api to actually delete the file
    try {
      const res = await fetch(`/api/sessionload/${sessionid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseText = await res.text(); // read the response body as text
      if (res.ok) {
        console.log(responseText); // "ok"
      } else {
        console.error(`HTTP error ${res.status}: ${responseText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    //callback
    SessionManager.dolistenercallback();
    return newSessions;
  }
}
