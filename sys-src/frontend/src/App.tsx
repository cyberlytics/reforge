import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage/UploadPage.tsx';
import DownloadPage from './components/DownloadPage/DownloadPage.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
};

export default App;