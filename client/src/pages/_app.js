import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initAuth();
    initTheme();
  }, [initAuth, initTheme]);

  return (
    <>
      <Head>
        <title>Agentflow_AI | Agentic AI Operations Automation Platform</title>
        <meta name="description" content="Build, visualize, and execute multi-agent automation workflows from natural language prompts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
