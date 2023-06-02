import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";

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
