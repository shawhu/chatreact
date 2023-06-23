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
export default function MyMessageBlock({ rawtext, ainame }: any) {
  const [displaytexts, setDisplaytexts] = useState<
    {
      type: string;
      content: any;
      language: string;
    }[]
  >([]);
  const [toastopen, setToastopen] = React.useState(false);
  useEffect(() => {
    let textblocks = [];
    let codeblocks = [];
    let textlines = [];
    const lines = rawtext.split("\n");
    // Iterate through all the lines and perform some process
    let isCode: boolean = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("```")) {
        if (!isCode) {
          const language = line.substring(3);
          codeblocks.push(`${language}\n`);
        }
        isCode = !isCode;
        continue;
      }
      //adding line to textblocks or codeblocks
      if (isCode) {
        codeblocks[codeblocks.length - 1] += line + "\n";
      } else {
        if (textblocks.length == 0 || textblocks.length <= codeblocks.length) textblocks.push("");
        textblocks[textblocks.length - 1] += line + "\n";
      }
    }
    //add first piece of textblock
    textlines = textblocks[0].split("\n");
    let actualtext = textlines.join("<br>");
    //find italic items
    const regexpattern = /\*([\s\S]*?)\*/g;
    if (ainame.toLowerCase() != "assistant") {
      actualtext = actualtext.replace(regexpattern, `<em style="Color: #238442">$1</em>`);
    }
    var tempdisplaytexts = [{ type: "text", content: actualtext, language: "" }];

    //if there's code block, we then add <code><text>,<code><text>, until the end
    let codeindex = 0;
    while (codeblocks.length >= codeindex + 1 || textblocks.length >= codeindex + 2) {
      if (codeblocks.length >= codeindex + 1) {
        //processing codeblock
        //processing codeblock to get first line and the rest
        const codelines = codeblocks[codeindex].split("\n");
        const language = codelines[0];
        const actualcode = codelines.slice(1).join("\n"); //this removes the 1st line
        //const actualcode = codelines.join("\n"); //this wont
        tempdisplaytexts.push({
          type: "code",
          content: actualcode,
          language: language,
        });
      }
      if (textblocks.length >= codeindex + 2) {
        //processing textblock
        const textlines = textblocks[codeindex + 1].split("\n");
        const actualtext = textlines.join("<br>");

        tempdisplaytexts.push({
          type: "text",
          content: actualtext,
          language: "",
        });
      }
      codeindex++;
    }

    //finally we pass tempdisplaytexts to state variable and to re-render
    setDisplaytexts(tempdisplaytexts);
  }, [rawtext, ainame]);

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
                onClick={(e: any) => {
                  console.log(`copytoclipboard triggered`);
                  navigator.clipboard.writeText(displaytext.content);
                  setToastopen(true);
                  e.stopPropagation();
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
          <div key={index} dangerouslySetInnerHTML={{ __html: displaytext.content }}></div>
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
