import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ApiDocsPage from './pages/ApiDocsPage';
import ImageUploader from './components/ImageUploader';
import ImageProcessor from './components/ImageProcessor';
import BulkProcessor from './components/BulkProcessor';
import { apiClient } from './services/apiClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    apiClient.get('/users/me').then(() => {
        setIsAuthenticated(true);
    }).catch(() => {
        setIsAuthenticated(false);
    }).finally(() => {
        setIsLoading(false);
    });
  }, []);

  const handleLogout = () => {
    apiClient.post('/auth/logout').then(() => {
        setIsAuthenticated(false);
    });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
                    <Route path="/login" element={!isAuthenticated ? <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
                    <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
                    <Route path="/api-docs" element={<ApiDocsPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    </Router>
  );
}

const MainContent = () => {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [image, setImage] = useState<File | null>(null);
    const [bulkFiles, setBulkFiles] = useState<File[]>([]);

    const handleImageUpload = (file: File) => {
        setImage(file);
    };

    const handleClear = () => {
        setImage(null);
        setBulkFiles([]);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="p-4">
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                    <button onClick={() => setMode('single')} className={`px-4 py-2 rounded-md transition ${mode === 'single' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}>Single Image</button>
                    <button onClick={() => setMode('bulk')} className={`px-4 py-2 rounded-md transition ${mode === 'bulk' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}>Bulk Images</button>
                </div>
            </div>

            { bulkFiles.length > 0 ? (
                <BulkProcessor files={bulkFiles} onClear={handleClear} />
            ) : image ? (
              <ImageProcessor image={image} onClear={handleClear} />
            ) : (
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                onBulkUpload={setBulkFiles}
                mode={mode} 
              />
            )}
        </div>
    );
};

export default App;

