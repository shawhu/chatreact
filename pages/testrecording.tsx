import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Config } from "@/common/config";

const ReactMediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  {
    ssr: false,
  }
);

const RecordView = () => (
  <div>
    <ReactMediaRecorder
      audio
      onStop={async (blobUrl, blob) => {
        console.log("recording onStop triggered");
        console.log(blobUrl);
        //seding blob to api
        const formData = new FormData();
        formData.append("file", blob, "recording.m4a");
        formData.append("model", "whisper-1");
        const config = await Config.GetConfigInstanceAsync();
        try {
          const host = "https://api.openai.com";
          const response = await fetch(`${host}/v1/audio/transcriptions`, {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${config.openaikey}` },
          });

          if (response.ok) {
            const jobj = await response.json();
            console.log(jobj);
          } else {
            console.error("Unable to save audio file");
          }
        } catch (error) {
          console.error(error);
        }
      }}
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button
            onClick={() => {
              console.log("starting the recording");
              startRecording();
            }}
          >
            Start Recording
          </button>
          <button
            onClick={() => {
              console.log("stopping the recording");
              stopRecording();
              //sending to api
            }}
          >
            Stop Recording
          </button>
          <audio src={mediaBlobUrl} controls autoPlay />
        </div>
      )}
    />
  </div>
);

export default function TestRecording() {
  return (
    <div>
      <RecordView></RecordView>
    </div>
  );
}
