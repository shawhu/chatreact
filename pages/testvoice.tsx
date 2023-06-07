import React from "react";

/**
 * Components
 */
import AudioRecorder from "@/components/voiceinputstreaming";

interface IOnFinish {
  id: string;
  audio: Blob;
}

interface IMessage {
  id: string;
  audio: Blob;
}

const Index: React.FC = () => {
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  return (
    <div>
      <AudioRecorder />
    </div>
  );
};

export default Index;
