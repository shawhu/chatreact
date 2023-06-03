This is a [Next.js](https://nextjs.org/) project. It's a OpenAI chat UI.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn next dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start chatting with openai.
You will have to get a apikey from platform.openai.com first. https://platform.openai.com/account/api-keys
To apply your openai key, click the config in the UI and apply it.

Updates:
The voice over is nearly done, here's one example.


https://github.com/shawhu/chatreact/assets/1240808/a4c4fae0-0a49-4a04-9bf1-47a0d82756da


In order to use voice over, you will have to run a local tts server.
the demo uses a tts server like this. 

    tts-server --use_cuda true --model_name tts_models/en/jenny/jenny
    
if you don't have a powerful gpu, you can use the cpu version

    tts-server --model_name tts_models/en/jenny/jenny

I use coqui-tts https://github.com/coqui-ai/TTS but it can work with any tts that has a http webapi

Another demo shows stt, using openai whisper running at local computer. sorry for the loud noises, I was using a webcam.


https://github.com/shawhu/chatreact/assets/1240808/2b7baeb1-1a7a-4052-af53-66ab01d6cce5


