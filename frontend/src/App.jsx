import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/Home';
import Room from './components/Room';
import ViewerRoom from './components/ViewerRoom';
import CodeShare from './components/CodeShare';
import FileShare from './components/FileShare';
import AiChat from './components/AiChat';
import MusicRoom from './components/MusicRoom';
import { SocketProvider } from './context/SocketContext';
import { MusicProvider } from './context/MusicContext';
import { generateRoomId } from './utils/roomUtils';
import './App.css';

function App() {
  return (
    <Router>
      <MusicProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/viewer/:roomId" element={<ViewerRoom />} />
            <Route path="/code/:roomId" element={<CodeShare />} />
            <Route path="/fileshare" element={<FileShare />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/music/:roomId" element={<MusicRoom />} />
            <Route
              path="/music"
              element={<Navigate to={`/music/${generateRoomId()}`} replace />}
            />
          </Routes>
        </SocketProvider>
      </MusicProvider>
    </Router>
  );
}

export default App;
