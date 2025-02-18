// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 03:08:24
// Current User's Login: NUbivek

import { ModelProvider } from '@/contexts/ModelContext';
import '@/styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <ModelProvider>
      <Component {...pageProps} />
    </ModelProvider>
  );
}