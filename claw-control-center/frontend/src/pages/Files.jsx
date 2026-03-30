import React, { useState, useEffect } from 'react';
import { FolderOpen, File, ChevronRight, Download, Trash2, Upload } from 'lucide-react';

function Files() {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  async function fetchFiles() {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  }

  function navigateTo(file) {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else {
      setSelectedFile(file);
    }
  }

  function navigateUp() {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
  }

  return (
    <div className="files-page">
      <header className="page-header">
        <h1><FolderOpen size={20} /> Files</h1>
        <div className="header-actions">
          <button className="btn">
            <Upload size={16} />
            Upload
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => setCurrentPath('')}>Root</button>
        {currentPath && (
          <>
            <ChevronRight size={16} />
            {currentPath.split('/').map((part, i, arr) => (
              <React.Fragment key={i}>
                <button onClick={() => setCurrentPath(arr.slice(0, i + 1).join('/'))}>
                  {part}
                </button>
                {i < arr.length - 1 && <ChevronRight size={16} />}
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* File List */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPath && (
              <tr onClick={navigateUp} style={{ cursor: 'pointer' }}>
                <td colSpan={3}>📁 ..</td>
              </tr>
            )}
            {files.map(file => (
              <tr key={file.path} onClick={() => navigateTo(file)} style={{ cursor: 'pointer' }}>
                <td>
                  {file.type === 'directory' ? '📁' : '📄'} {file.name}
                </td>
                <td>{file.type}</td>
                <td>
                  <button className="action-btn">
                    <Download size={16} />
                  </button>
                  <button className="action-btn danger">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Files;
