import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DownloadPage.css';

interface LocationState {
  downloadUrl: string;
  title: string;
  format: string; 
}

const DownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadUrl, title, format } = location.state as LocationState;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${title}.${format}`); 
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="DownloadPage">
      <header className="App-header">
        <h1>Report Generated</h1>
        <button onClick={handleDownload}>Download Report</button>
        <button onClick={handleBack}>Generate Another Report</button>
      </header>
    </div>
  );
};

export default DownloadPage;


