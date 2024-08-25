import React from 'react';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Head from 'next/head';
import '../styles/index.css';
import '../styles/github-alerts.css';
import '@fontsource/geist-sans';
import '@fontsource/ia-writer-duo';
import '@fontsource/jetbrains-mono';
import 'github-markdown-css';
import { TextProvider } from '../components/markdown/TextContent';


// Prevents 'useEffectLayout does nothing on the server' warning that comes from Vaul
// Source: https://github.com/emilkowalski/vaul/issues/367 and https://github.com/emilkowalski/vaul/pull/368
// https://stackoverflow.com/questions/58070996/how-to-fix-the-warning-uselayouteffect-does-nothing-on-the-server
React.useLayoutEffect = React.useEffect 

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Notetxt</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0 maximum-scale=1" />
      </Head>
      <TextProvider>
        <div className="selection:bg-neutral-700 selection:text-zinc-300">
          <Component {...pageProps} />
        </div>
      </TextProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default MyApp;