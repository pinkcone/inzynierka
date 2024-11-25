// SocketProviderLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SocketContext, socket } from './SocketContext';

const SocketProviderLayout = () => {
  return (
    <SocketContext.Provider value={socket}>
      <Outlet />
    </SocketContext.Provider>
  );
};

export default SocketProviderLayout;
