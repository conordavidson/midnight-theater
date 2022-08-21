import '../styles/globals.css';
import type { AppProps } from 'next/app';

import * as Theater from 'lib/theater';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Theater.ContextProvider>
      <Component {...pageProps} />
    </Theater.ContextProvider>
  );
}

export default MyApp;
