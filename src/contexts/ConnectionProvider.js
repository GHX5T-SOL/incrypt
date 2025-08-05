import React, { createContext, useContext, useMemo } from 'react';
import { Connection } from '@solana/web3.js';

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children, endpoint }) {
  const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

  return (
    <ConnectionContext.Provider value={{ connection, endpoint }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context.connection;
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnectionConfig must be used within a ConnectionProvider');
  }
  return { endpoint: context.endpoint };
}