import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
        <title>0ddchatbot</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
