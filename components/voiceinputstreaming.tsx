import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Config } from "@/common/config";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import GlobalValues from "@/common/globalvalues";

const VoiceInputStreaming = ({ sliceduration, sendbacktext }: any) => {
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [voiceRecorder, setVoiceRecorder] = React.useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = React.useState<any[]>([]);

  const StartRecording = async () => {
    console.log("StartRecording");
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(audioStream);
      setStream(audioStream);
      setVoiceRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (e) {
      console.log("User didn't allowed us to access the microphone.");
    }
  };
  const StopRecording = () => {
    console.log("StopRecording");
    if (!isRecording || !stream || !voiceRecorder) return;
    const tracks = stream.getAudioTracks();
    for (const track of tracks) {
      track.stop();
    }
    voiceRecorder.stop();
    setVoiceRecorder(null);
    setIsRecording(false);
  };
  //try to call api
  React.useEffect(() => {
    if (chunks.length == 0) {
      return;
    }

    if (!GlobalValues.isWaitingForWhisper) {
      GlobalValues.isWaitingForWhisper = true;
      console.log(`calling whisper with ${chunks.length} chunks`);
      const callingwhisper = async (chunks: any, apiurl: string) => {
        //try the openai whisper api
        try {
          const newblob = new Blob(chunks, {
            type: "audio/webm; codecs=opus",
          });
          const file = new File([newblob], "speech.webm", {
            type: "audio/webm; codecs=opus",
          });
          //seding blob to api
          const formData = new FormData();
          formData.append("file", file, "recording.webm");
          formData.append("model", "whisper-1");
          //formData.append("language", "en");
          //formData.append("prompt", "");

          //console.log(newblob);
          const myconfig = await Config.GetConfigInstanceAsync();
          const mykey = myconfig.openaikey;
          const response = await fetch(apiurl, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${mykey}`,
            },
          });
          GlobalValues.isWaitingForWhisper = false;
          //console.log(formData.entries());
          if (response.ok) {
            const jobj = await response.json();
            //console.log(jobj);
            if (jobj && jobj.text) {
              sendbacktext(jobj.text);
            }
          } else {
            console.error("OpenAI respond is not ok");
          }
        } catch (error) {
          console.error(error);
        }
      };
      callingwhisper(chunks, `/api/transcribe`);
    } else {
      console.log("isWaitingForWhisper, skip this calling ");
    }

    if (!isRecording) {
      setChunks([]);
    }
  }, [chunks]);
  //triggered when the recording is started
  React.useEffect(() => {
    if (!isRecording || !voiceRecorder) return;
    //checking this how to add slice
    voiceRecorder.start(sliceduration); //3 seconds a piece
    voiceRecorder.ondataavailable = ({ data }) => {
      //here we get a new piece of audio chunk
      console.log("ondataavailable triggered");
      //console.log("Got audio data chunk:", data);
      setChunks((prevChunks) => [...prevChunks, data]);
    };
  }, [isRecording, voiceRecorder, sliceduration]);

  //triggered when the recording is stopped
  React.useEffect(() => {
    if (!isRecording && stream) {
      setStream(null);
    }
  }, [isRecording, stream]);

  return (
    <Box className="absolute z-10 right-32 bottom-32 m-1">
      <Button
        onClick={isRecording ? StopRecording : StartRecording}
        variant="contained"
        size="small"
        color={isRecording ? "error" : "primary"} // dynamically set color based on isRecording
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
      >
        {isRecording ? "Stop" : "Start"}
      </Button>
    </Box>
  );
};

export default VoiceInputStreaming;
