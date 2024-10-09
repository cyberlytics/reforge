import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [format, setFormat] = useState('tex');
  const [language, setLanguage] = useState('deutsch');
  const [mainfile, setMainfile] = useState<string>('');
  const [isZipFile, setIsZipFile] = useState(false);
  const navigate = useNavigate();

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(event.target.value);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedExtensions = /(\.zip|\.docx)$/i;
  
      if (!allowedExtensions.exec(file.name)) {
        setUploadStatus('Error: Only .zip and .docx files are allowed.');
        setSelectedFile(null);
        return;
      }else{setUploadStatus('');}

      if (file && file.name.endsWith('.zip')) {
        setIsZipFile(true);
      } else {
        setIsZipFile(false);
      }
  
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleMainfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMainfile(event.target.value);
  };

  const handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Error: Please upload a file.');
      return;
    }

    if (!author || !title) {
      setUploadStatus('Error: Author or title missing.');
      return;
    }

    setUploadStatus('File is being processed...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('author', author);
    formData.append('title', title);
    formData.append('format', format);
    formData.append('language', language);
    formData.append('mainfile', mainfile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setUploadStatus('File successfully uploaded.');

        navigate('/download', { state: { downloadUrl: url, title: title, format: format } });
      } else {
        setUploadStatus('Error while uploading the file.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error uploading file:', error.response?.data || error.message);
        setUploadStatus(`An error has occurred: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        setUploadStatus('An unexpected error has occurred.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Reforge</h1>
        <div className='main-container'>
          <span className="boxtitle">Input</span>
          <p className='text'>You can only input a LaTeX .zip folder or a .docx file.</p>
          <input className="file-item" type="file" onChange={handleFileChange} />
        </div>
        <div className='main-container'>
          <span className="boxtitle">Parameter</span>
          <div className="auswahl-container">
            <div className='para-boxtitle'>
            <span className="para-text">Author:</span>
            <input
              className="text-container"
              type="text"
              placeholder="Author"
              value={author}
              onChange={handleAuthorChange}
            />
            </div>
            <div className='para-boxtitle'>
            <span className="para-text">Title:</span>
            <input
              className="text-container"
              type="text"
              placeholder="Title"
              value={title}
              onChange={handleTitleChange}
            />
            </div>
            {isZipFile && (
              <div className='para-boxtitle'>
                <label htmlFor="mainfile-input" className="para-text">
                  Main .tex file:
                </label>
                <input
                  id="mainfile-input"
                  className="text-container"
                  type="text"
                  placeholder="Master.tex"
                  value={mainfile}
                  onChange={handleMainfileChange}
                />
              </div>
            )}
          </div>
        </div>
        <div className='main-container'>
          <span className='boxtitle'>Output</span>
          <div className="auswahl-container">
            <div className="radios-container">
              <span className="output-text">Format:</span>
              <label className="radio-label">
                <input
                  className="radio-item"
                  type="radio"
                  value="tex"
                  checked={format === 'tex'}
                  onChange={handleFormatChange}
                />
                <span className="radio-text">LaTeX (IEEEtran)</span>
              </label>
              <label className="radio-label">
                <input
                  className="radio-item"
                  type="radio"
                  value="docx"
                  checked={format === 'docx'}
                  onChange={handleFormatChange}
                />
                <span className="radio-text">DOCX (OTH-Forschungsbericht)</span>
              </label>
            </div>
            <div className="radios-container">
            <span className="output-text">Language:</span>
              <label className="radio-label">
                <input
                  className="radio-item"
                  type="radio"
                  value="deutsch"
                  checked={language === 'deutsch'}
                  onChange={handleLanguageChange}
                />
                <span className="radio-text">Deutsch</span>
              </label>
              <label className="radio-label">
                <input
                  className="radio-item"
                  type="radio"
                  value="english"
                  checked={language === 'english'}
                  onChange={handleLanguageChange}
                />
                <span className="radio-text">English</span>
              </label>
            </div>
          </div>
        </div>
        <button onClick={handleUpload}>Start the generation</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </header>
    </div>
  );
};

export default UploadPage;