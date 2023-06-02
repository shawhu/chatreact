import React, { useState, useEffect, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from "@mui/material/Snackbar";

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
export default function MyMessageBlock({ rawtext }: any) {
  const [displaytexts, setDisplaytexts] = useState<
    {
      type: string;
      content: any;
      language: string;
    }[]
  >([]);
  const [toastopen, setToastopen] = React.useState(false);
  useEffect(() => {
    //using regex to replace ```

    // const regex = /```([^`]+)(?:```)?/g;
    // const matchesArray = Array.from(rawtext.matchAll(regex));
    // const codeblocks = matchesArray.map(
    //   (match) =>
    //     //match[1] ? match[1] : match[2]
    //     match[1]
    // );

    const regex = /```([^`]+)(?:```)?/g;
    const matchesArray = Array.from(rawtext.matchAll(regex));
    const codeblocks: string[] = matchesArray.map(
      (match: any) =>
        //match[1] ? match[1] : match[2]
        match[1]
    );

    const processed = rawtext.replace(regex, `codeblock`);
    //here we add first block of text. if no code found, first block
    // is the one and only block.
    const textblocks = processed.split("codeblock");
    const textlines = textblocks[0].split("\n");
    const actualtext = textlines.join("<br>");
    var tempdisplaytexts = [
      { type: "text", content: actualtext, language: "" },
    ];
    //if there's code block, we then add <code><text>,<code><text>, until the end
    if (textblocks.length > 1) {
      for (let i = 1; i < textblocks.length; i++) {
        //check to see if codeblock is empty
        if (!codeblocks[i - 1]) {
          break;
        }
        //processing codeblock
        //processing codeblock to get first line and the rest
        const codelines = codeblocks[i - 1].split("\n");
        const language = codelines[0];
        const actualcode = codelines.slice(1).join("\n"); //this removes the 1st line
        //const actualcode = codelines.join("\n"); //this wont
        tempdisplaytexts.push({
          type: "code",
          content: actualcode,
          language: language,
        });
        //processing textblock after this codeblock
        const textlines = textblocks[i].split("\n");
        const actualtext = textlines.join("<br>");
        tempdisplaytexts.push({
          type: "text",
          content: actualtext,
          language: "",
        });
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
          <div key={index} className="flex flex-col ">
            {/*this's code block toolbar*/}
            <div className="flex flex-row justify-between bg-black text-white rounded-tl-lg rounded-tr-lg pl-2">
              <span className="pt-1">{`${displaytext.language.toUpperCase()}`}</span>
              <IconButton
                id="copytoclipboard"
                color="primary"
                aria-label="copy to clipboard"
                onClick={() => {
                  console.log(`copytoclipboard triggered`);
                  navigator.clipboard.writeText(displaytext.content);
                  setToastopen(true);
                }}
              >
                <ContentCopyIcon color="primary" fontSize="small" />
              </IconButton>
            </div>
            {/*end of code block toolbar*/}
            <SyntaxHighlighter
              language={displaytext.language}
              style={atomOneDarkReasonable}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
              }}
              onClick={(e: any) => {
                e.stopPropagation();
              }}
            >
              {displaytext.content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: displaytext.content }}
          ></div>
        )
      )}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toastopen}
        autoHideDuration={1000}
        message="Copied to the clipboard"
        onClose={() => {
          setToastopen(false);
        }}
      />
    </div>
  );
}
