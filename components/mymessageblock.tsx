import React, { useState, useEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  docco,
  dark,
  dracula,
  gradientDark,
  atomOneDarkReasonable,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
//docs reference
//https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_HLJS.MD
//this is the actual block that display the content returned by AI LLM
export default function MyMessageBlock({ rawtext }) {
  const [displaytexts, setDisplaytexts] = useState([]);
  useEffect(() => {
    //using regex to replace ```
    const regex = /```([^`]+?)```|```([^`]+?)$/g;
    //             ^match[1]       ^match[2]
    const matchesArray = Array.from(rawtext.matchAll(regex));
    const codeblocks = matchesArray.map((match) =>
      match[1] ? match[1] : match[2]
    );
    const processed = rawtext.replace(regex, `codeblock`);
    //here we add first block of text. if no code found, first block
    // is the one and only block.
    const textblocks = processed.split("codeblock");
    const textlines = textblocks[0].split("\n");
    const actualtext = textlines.join("<br>");
    var tempdisplaytexts = [{ type: "text", content: actualtext }];
    //if there's code block, we then add <code><text>,<code><text>, until the end
    if (textblocks.length > 1) {
      for (let i = 1; i < textblocks.length; i++) {
        //check to see if codeblock is empty
        if (!codeblocks[i - 1]) {
          break;
        }
        //processing codeblock to get first line and the rest
        const codelines = codeblocks[i - 1].split("\n");
        const language = codelines[0];
        //const actualcode = codelines.slice(1).join("\n"); //this removes the 1st line
        const actualcode = codelines.join("\n"); //this wont
        tempdisplaytexts.push({
          type: "code",
          content: actualcode,
          language: language,
        });
        const textlines = textblocks[i].split("\n");
        const actualtext = textlines.join("");
        tempdisplaytexts.push({ type: "text", content: actualtext });
      }
    }
    //finally we pass tempdisplaytexts to state variable and to re-render
    setDisplaytexts(tempdisplaytexts);
  }, [rawtext]);

  //return <div>{displaytext}</div>;
  return (
    <div>
      {displaytexts.map((displaytext, index) =>
        displaytext.type == "code" ? (
          <SyntaxHighlighter
            language={displaytext.language}
            style={atomOneDarkReasonable}
          >
            {displaytext.content}
          </SyntaxHighlighter>
        ) : (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: displaytext.content }}
          ></div>
        )
      )}
    </div>
  );
}
