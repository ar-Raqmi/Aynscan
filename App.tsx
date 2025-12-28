import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DocImage, ProcessingStatus, ProcessingStats } from './types';
import { extractTextFromImage } from './services/cloudflareService';
import { UploadIcon, SearchIcon, DeleteIcon, BookIcon, AlertIcon } from './components/Icons';
import StatsBar from './components/StatsBar';
import ImageCard from './components/ImageCard';
import Modal from './components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import Login from './components/Login';

const CONCURRENCY_LIMIT = 3;
const MAX_BATCH_SIZE = 100;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documents, setDocuments] = useState<DocImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocImage | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const stats: ProcessingStats = useMemo(() => {
    return {
      total: documents.length,
      completed: documents.filter(d => d.status === ProcessingStatus.COMPLETED).length,
      pending: documents.filter(d => d.status === ProcessingStatus.PENDING).length,
      processing: documents.filter(d => d.status === ProcessingStatus.PROCESSING).length,
      failed: documents.filter(d => d.status === ProcessingStatus.ERROR).length,
    };
  }, [documents]);

  useEffect(() => {
    const processQueue = async () => {
      const processingCount = documents.filter(d => d.status === ProcessingStatus.PROCESSING).length;
      
      if (processingCount < CONCURRENCY_LIMIT) {
        const nextDoc = documents.find(d => d.status === ProcessingStatus.PENDING);
        
        if (nextDoc) {
          setDocuments(prev => prev.map(d => 
            d.id === nextDoc.id ? { ...d, status: ProcessingStatus.PROCESSING } : d
          ));

          try {
            const text = await extractTextFromImage(nextDoc.file);
            
            setDocuments(prev => prev.map(d => 
              d.id === nextDoc.id ? { 
                ...d, 
                status: ProcessingStatus.COMPLETED, 
                extractedText: text 
              } : d
            ));
                      } catch (error) {
                       setDocuments(prev => prev.map(d => 
                        d.id === nextDoc.id ? { 
                          ...d, 
                          status: ProcessingStatus.ERROR, 
                          errorMessage: error instanceof Error ? error.message : "Failed to read image"
                        } : d
                      ));
                    }        }
      }
    };

    if (isAuthenticated) {
      processQueue();
    }
  }, [documents, isAuthenticated]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files: File[]) => {
    if (documents.length + files.length > MAX_BATCH_SIZE) {
        showToast(`Limit: Max ${MAX_BATCH_SIZE} images allowed.`, 'error');
        return;
    }

    const newDocs: DocImage[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: ProcessingStatus.PENDING,
      extractedText: null
    }));
    
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
      processFiles(imageFiles);
    }
  };

  const handleClearClick = () => {
    if (documents.length > 0) {
        setShowClearDialog(true);
    }
  };

  const performClear = () => {
    documents.forEach(d => URL.revokeObjectURL(d.previewUrl));
    setDocuments([]);
    setSearchQuery('');
    setShowClearDialog(false);
    showToast("All items cleared", 'success');
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteImage = (id: string) => {
    const docToDelete = documents.find(d => id === d.id);
    if (docToDelete) {
      URL.revokeObjectURL(docToDelete.previewUrl);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showToast("Item removed", 'success');
    }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Text copied! 📋", 'success');
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    if (doc.status !== ProcessingStatus.COMPLETED || !doc.extractedText) return false;
    return doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isCompact = documents.length > 0;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <header className={documents.length === 0 ? 'hero-header' : ''}>
        <h1>
            <BookIcon style={{fontSize: documents.length === 0 ? '7rem' : '3.5rem', transition: 'font-size 0.8s ease'}} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
              <span style={{ fontFamily: '"Climate Crisis", cursive' }}>AYNSCAN</span>
              <span style={{ 
                fontSize: documents.length === 0 ? '2.5rem' : '1.5rem', 
                fontFamily: 'Chathura, sans-serif', 
                color: 'var(--md-sys-color-on-surface-variant)',
                fontWeight: '700',
                letterSpacing: '1px',
                textShadow: 'none',
                transition: 'all 0.8s ease',
                marginTop: '-10px',
                alignSelf: 'flex-end',
                lineHeight: 0.8
              }}>by ar-Raqmi</span>
            </div>
        </h1>
        {documents.length > 0 && (
            <button className="btn btn-icon-btn" onClick={handleClearClick} aria-label="Clear All">
                <DeleteIcon />
            </button>
        )}
      </header>

      <main className="controls">
        
        <div className={`action-bar ${documents.length > 0 ? 'compact-layout' : ''}`}>
            <div className={`search-wrapper ${documents.length > 0 ? 'visible' : ''}`}>
                <div className="input-group">
                    <SearchIcon className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder=" " 
                        autoComplete="off"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <label className="floating-label">Search extracted text...</label>
                </div>
            </div>

            <div 
                className={`drop-zone ${isCompact ? 'compact' : ''} ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                
                <div className="drop-zone-content">
                    <UploadIcon className="drop-zone-icon" />
                    <div className="drop-zone-text-wrapper">
                        <div className="drop-zone-title">
                            {isCompact ? "Add Images" : "Tap or Drop Images Here"}
                        </div>
                        {!isCompact && (
                            <div className="drop-zone-sub">
                                Supports up to {MAX_BATCH_SIZE} images
                            </div>
                        )}
                    </div>
                </div>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
            </div>
        </div>

        <StatsBar stats={stats} />

        <div className="results-grid">
            {filteredDocuments.map((doc, index) => (
                <ImageCard 
                    key={doc.id} 
                    doc={doc} 
                    highlightText={searchQuery}
                    index={index}
                    onClick={() => setSelectedDoc(doc)}
                    onDelete={() => handleDeleteImage(doc.id)}
                />
            ))}
            
            {documents.length > 0 && filteredDocuments.length === 0 && (
                <div className="no-results">
                    <span className="material-symbols-outlined" style={{fontSize: '3rem', marginBottom: '10px', display:'block'}}>search_off</span>
                    No matching text found.
                </div>
            )}
        </div>

      </main>

      <Modal 
        doc={selectedDoc} 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onCopy={handleCopy}
      />

      <ConfirmDialog 
        isOpen={showClearDialog}
        title="Clear Workspace?"
        message="This will remove all uploaded images and extracted text. This action cannot be undone."
        onConfirm={performClear}
        onCancel={() => setShowClearDialog(false)}
      />

      <div className="toast-container">
        {toast && (
            <div className="toast" style={toast.type === 'error' ? {backgroundColor: 'var(--md-sys-color-error)', color: '#21005D'} : {}}>
                <span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                <span>{toast.msg}</span>
            </div>
        )}
      </div>
    </>
  );
};

export default App;