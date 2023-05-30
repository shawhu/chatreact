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
The voice over is nearly done, here's some examples
In order to use this voice over, you will have to run a local tts server.

the demo uses a tts server like this. 

    tts-server --use_cuda true --model_name tts_models/en/jenny/jenny
    
if you don't have a powerful gpu, you can use the cpu version

    tts-server --model_name tts_models/en/jenny/jenny
