'use client';

import { ApolloProvider } from '@apollo/client';
import apolloClient from './apollo';

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}