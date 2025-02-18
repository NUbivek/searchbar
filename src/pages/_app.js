// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 16:47:52
// Current User's Login: NUbivek

import { ModelProvider } from '../contexts/ModelContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <ModelProvider>
      <Component {...pageProps} />
    </ModelProvider>
  );
}