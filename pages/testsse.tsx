import { useEffect, useState } from "react";

interface MyMessage {
  event: string;
  data: string;
}

export default function TestSSE() {
  const [messages, setMessages] = useState<MyMessage[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | undefined;

    if (started) {
      const postData = async () => {
        try {
          const resposne = await fetch("/api/llmstreamerws", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt:
                "Megumin's Persona: Megumin is an Arch Wizard of the Crimson Magic Clan. Megumin is 14 years old girl. Megumin's height 152 cm. Megumin has shoulder-length dark brown hair, fair skin, flat chest, light complexion and doll-like features, crimson eyes. Megumin wears black cloak with gold border, choker, wizard's hat, fingerless gloves, eyepatch, orange boots. Megumin's weapon is a big black staff. Megumin is a loud, boisterous, and eccentric girl with a flair for theatrics. Megumin has chuunibyou tendencies. Megumin is very intelligent, but has very little self-control. Megumin love explosion magic. Megumin is generally calm and cheerful, but she can easily become aggressive when she feels slighted or challenged. Megumin has only one but a powerful ability, once a day she can use powerful explosion magic after which she cannot move for a while.\nPersonality: loud, intelligent, theatrical, hyperactive sometimes\nScenario: Megumin went out of city to train explosion magic.\n<START>\nYou: Hi, I heard you're the best mage in town.\nMegumin: *nods* Indeed. I am the greatest user of Explosion magic in all the land. And you are?\nYou: I'm a new adventurer and I need your help to defeat a powerful demon.\nMegumin: *smirks* A demon, you say? That sounds like quite the challenge. I'll help you, but only if you can keep up with me.\nYou: I'll do my best, let's go.\nMegumin: *nods* Very well. Follow me and be prepared for a show of the most powerful magic in existence! starts walking\nMegumin: *It was day, the weather was sunny and windless. We accidentally crossed paths near the city in a clearing, I was going to train explosion magic. When I noticed you I stand up in a pretentious and personable pose, and say loudly* I'm Megumin! The Arch Wizard of the Crimson Magic Clan! And I'm the best at explosion magic!! What are you doing here?\nYou: hello\nMegumin:",
              use_story: false,
              use_memory: false,
              use_authors_note: false,
              use_world_info: false,
              max_context_length: 2048,
              max_length: 180,
              rep_pen: 1.1,
              rep_pen_range: 1024,
              rep_pen_slope: 0.9,
              temperature: 0.65,
              tfs: 0.9,
              top_a: 0,
              top_k: 0,
              top_p: 0.9,
              typical: 1,
              sample_order: [6, 0, 1, 2, 3, 4, 5],
            }),
          });
          // if (!response.ok) {
          //   throw new Error("HTTP error " + response.status);
          // }
          eventSource = new EventSource("/api/llmstreamerws");

          eventSource.addEventListener("message", (event) => {
            console.log("got message event");
            const message: MyMessage = {
              event: "message",
              data: event.data,
            };

            setMessages((msgs) => [...msgs, message]);
          });

          eventSource.addEventListener("end", (event) => {
            console.log("got end event");
            const message: MyMessage = {
              event: "end",
              data: event.data,
            };

            setMessages((msgs) => [...msgs, message]);
            eventSource.close();
            setStarted(false);
          });
        } catch (error) {
          console.error("Request failed", error);
          // handle any request errors
        }
      };
      //start and call server
      postData();
    } else {
      if (eventSource) {
        eventSource.close();
      }
    }
  }, [started]);

  const messageText = messages.map((msg, index) => msg.data).join("\n");

  return (
    <div>
      <button onClick={() => setStarted(true)}>START</button>
      <br />
      <br />
      <textarea
        readOnly
        style={{ width: "100%", height: "300px" }}
        value={messageText}
      />
    </div>
  );
}
