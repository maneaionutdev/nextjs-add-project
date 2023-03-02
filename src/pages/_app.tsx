import '@/styles/globals.css';
import 'react-medium-image-zoom/dist/styles.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
