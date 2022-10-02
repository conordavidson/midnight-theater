import '../styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';

import * as Theater from 'lib/theater';
import * as Ui from 'lib/ui';

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const ReactDOM = require('react-dom');
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Theater.ContextProvider>
      <Ui.Page>
        <Component {...pageProps} />
      </Ui.Page>
    </Theater.ContextProvider>
  );
}

export default MyApp;
