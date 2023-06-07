import React from "react";
import { Config } from "@/common/config";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [voiceRecorder, setVoiceRecorder] = React.useState(null);
  const [audioChunks, setAudioChunks] = React.useState([]);
  const [sttresult, setSttresult] = React.useState("");

  const StartRecording = async () => {
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
    if (!isRecording || !stream || !voiceRecorder) return;

    const tracks = stream.getAudioTracks();

    for (const track of tracks) {
      track.stop();
    }

    voiceRecorder.stop();

    setVoiceRecorder(null);
    setIsRecording(false);
  };
  /**
   * triggered when the recording is started
   */
  React.useEffect(() => {
    if (!isRecording || !voiceRecorder) return;
    //checking this how to add slice
    voiceRecorder.start(3000); //3 seconds a piece
    voiceRecorder.ondataavailable = ({ data }) => {
      //here we get a new piece of audio chunk
      console.log("ondataavailable triggered");
      //console.log("Got audio data chunk:", data);

      setAudioChunks((prevChunks) => {
        const newchunks = [...prevChunks, data];
        const callingwhisper = async (chunks, apiurl) => {
          const myconfig = await Config.GetConfigInstanceAsync();
          const mykey = myconfig.openaikey;
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
            formData.append("prompt", sttresult);
            console.log("sending to openai using newblob");
            console.log(newblob);

            const response = await fetch(apiurl, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${mykey}`,
              },
            });
            console.log(formData.entries());

            if (response.ok) {
              const jobj = await response.json();
              console.log(jobj);
              if (jobj && jobj.text) {
                setSttresult(jobj.text);
              }
            } else {
              console.error("OpenAI respond is not ok");
            }
          } catch (error) {
            console.error(error);
          }
        };

        callingwhisper(
          newchunks,
          `https://api.openai.com/v1/audio/transcriptions`
        );

        return newchunks;
      });
    };
  }, [isRecording, voiceRecorder]);

  /**
   * triggered when the recording is stopped
   */
  React.useEffect(() => {
    if (isRecording || !stream) return;
    setStream(null);
  }, [isRecording]);

  return (
    <div className="flex flex-col">
      <button onClick={!isRecording ? StartRecording : StopRecording}>
        {!isRecording ? "START" : "STOP"}
      </button>
      <button
        onClick={() => {
          console.log("test button clicked");
          //console.log(audioChunks);
          //console.log(sttresult);
          const myconfig = Config.GetConfig();
          console.log(myconfig);
        }}
      >
        TEST
      </button>
      <div>
        British logistics played a key role in the success of Operation
        Overlord, the Allied invasion of France in June 1944. The objective of
        the campaign was to secure a lodgement on the mainland of Europe for
        further operations.{" "}
      </div>
      <br />
      <div>sttresult:{sttresult}</div>
      {audioChunks.map((chunk, index) => (
        <audio
          key={index}
          src={URL.createObjectURL(
            new Blob(audioChunks.slice(0, index + 1), {
              type: "audio/webm; codecs=opus",
            })
          )}
          controls
        />
      ))}
    </div>
  );
};

export default AudioRecorder;
