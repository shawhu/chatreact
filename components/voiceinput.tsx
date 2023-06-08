import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Config } from "@/common/config";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import GlobalValues from "@/common/globalvalues";
import { ReactMediaRecorder } from "react-media-recorder";
// const ReactMediaRecorder = dynamic(
//   () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
//   {
//     ssr: false,
//   }
// );

const VoiceInput = ({ sendbacktext }: any) => {
  const [isRecording, setIsRecording] = React.useState(false);
  return (
    <Box className="absolute z-10 right-56 m-1">
      <ReactMediaRecorder
        audio
        onStop={async (blobUrl, blob) => {
          console.log("recording onStop triggered");
          console.log(blobUrl);
          //checking if readytosend
          if (!GlobalValues.readytosend) {
            console.log("not readytosend, cancel it");
            return;
          }
          //seding blob to api
          const formData = new FormData();
          formData.append("file", blob, "recording.m4a");
          formData.append("model", "whisper-1");
          const config = await Config.GetConfigInstanceAsync();
          try {
            const response = await fetch(
              `/api/transcribe`, //localrun whisper
              //`https://api.openai.com/v1/audio/transcriptions`,
              {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${config.openaikey}` },
              }
            );

            if (response.ok) {
              const jobj = await response.json();
              console.log(jobj);
              if (jobj && jobj.text) {
                sendbacktext(jobj.text);
              }
            } else {
              console.error("calling whisper is failed");
            }
          } catch (error) {
            console.error(error);
          }
        }}
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div className="flex flex-col gap-1">
            {isRecording ? (
              <>
                <Button
                  onClick={() => {
                    console.log("start recording triggered");
                    GlobalValues.readytosend = true;
                    stopRecording();
                    setIsRecording(false);
                  }}
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
                <Button
                  onClick={() => {
                    console.log("stop recording triggered");
                    GlobalValues.readytosend = false;
                    stopRecording();
                    setIsRecording(false);
                  }}
                  variant="contained"
                  size="small"
                  endIcon={<StopIcon />}
                >
                  Stop
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  console.log("start recording triggered");
                  GlobalValues.readytosend = false;
                  startRecording();
                  setIsRecording(true);
                }}
                variant="contained"
                size="small"
                startIcon={<MicIcon />}
              >
                Record
              </Button>
            )}
          </div>
        )}
      />
    </Box>
  );
};

export default VoiceInput;
