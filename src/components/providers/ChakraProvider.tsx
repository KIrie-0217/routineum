'use client';

import { ChakraProvider as ChakraProviderOriginal, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '@/contexts/AuthContext';

// Chakra UIのテーマを設定
const theme = extendTheme({
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProviderOriginal theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProviderOriginal>
  );
}
