import React from 'react';
import { Box } from '@chakra-ui/react';

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box as="main" minH="100vh" bg="gray.50" py={4}>
      {children}
    </Box>
  );
}
