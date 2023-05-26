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
}
export class SessionManager {
  public static sessions: Session[] = [
    {
      sessionId: "e7b2120a-663b-4024-9504-2397c99736fa",
      sessionName: "Friendly Assistant",
      model: "chatgpt3.5",
      maxToken: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are a friendly assistant and you will happily answer all questions.",
        },
        {
          role: "assistant",
          content: "Hello, I'm an AI, nice to meet you. How can I help you?",
        },
      ],
    },
    {
      sessionId: "e7b2120a-663b-4024-9504-2397c99736fb",
      sessionName: "Translator",
      model: "chatgpt3.5",
      maxToken: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are a friendly translator and you will translate user input to Chinese",
        },
        {
          role: "assistant",
          content:
            "Hello, I'm an AI, nice to meet you. I will translate anything to Chinese.",
        },
      ],
    },
    {
      sessionId: "e7b2120a-663b-4024-9504-2397c99736fc",
      sessionName: "中文助理",
      model: "chatgpt3.5",
      maxToken: 2048,
      messages: [
        {
          role: "system",
          content:
            "你是一个能用中文对话的助理，你很喜欢聊天并且你最爱的人是Harry。",
        },
        {
          role: "assistant",
          content: "今天需要我做什么呢？",
        },
      ],
    },
  ];
  public static listnercallback: () => {};
  public static currentSession = SessionManager.sessions[0];
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
  public static SaveSessionToJson(session: Session) {}
}
