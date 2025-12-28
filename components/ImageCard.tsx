import React from 'react';
import { DocImage, ProcessingStatus } from '../types';
import { FileIcon, LoaderIcon, AlertIcon, DeleteIcon } from './Icons';

interface ImageCardProps {
  doc: DocImage;
  highlightText: string;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ doc, highlightText, index, onClick, onDelete }) => {
  
  const renderText = () => {
    if (doc.status === ProcessingStatus.PENDING || doc.status === ProcessingStatus.PROCESSING) {
        const isProcessing = doc.status === ProcessingStatus.PROCESSING;
        const skeletonClass = isProcessing ? 'processing-skeleton' : '';
        
        return (
            <>
                <div 
                    className={skeletonClass} 
                    style={{
                        height:'12px', 
                        width:'50%', 
                        background:'#494059', 
                        borderRadius:'4px', 
                        marginBottom:'8px',
                        transition: 'all 0.3s ease'
                    }}
                ></div>
                <div 
                    className={skeletonClass}
                    style={{
                        height:'12px', 
                        width:'80%', 
                        background:'#494059', 
                        borderRadius:'4px',
                        animationDelay: isProcessing ? '0.2s' : '0s'
                    }}
                ></div>
                {isProcessing && (
                    <span 
                        className="processing-text-anim" 
                        style={{
                            fontSize: '0.8rem', 
                            marginTop: '12px', 
                            display:'block',
                            fontWeight: 600
                        }}
                    >
                        AI is reading...
                    </span>
                )}
            </>
        );
    }

    if (doc.status === ProcessingStatus.ERROR) {
        return <span style={{color: 'var(--md-sys-color-error)'}}>Failed to extract text.</span>;
    }

    const text = doc.extractedText || "(No text detected)";

    if (!highlightText) {
        return text;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = highlightText.toLowerCase();
    
    if (!lowerText.includes(lowerQuery)) {
        return text;
    }

    const parts = text.split(new RegExp(`(${highlightText})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === lowerQuery ? 
                <span key={i} className="highlight">{part}</span> : 
                part
            )}
        </>
    );
  };

  const animationStyle = {
      animation: `popInCard 0.5s var(--md-sys-motion-easing-expressive) forwards`,
      animationDelay: `${Math.min(index * 60, 1000)}ms`,
      opacity: 0
  };

  return (
    <div 
        className="card" 
        onClick={onClick}
        style={animationStyle}
    >
        <button 
            className="card-delete-btn" 
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            aria-label="Delete image"
        >
            <DeleteIcon style={{ fontSize: '1.2rem' }} />
        </button>
        <div className="card-img-wrapper">
            <img src={doc.previewUrl} className="card-img" alt="Thumbnail" />
        </div>
        <div className="card-content">
            <div className="card-title">
                {doc.status === ProcessingStatus.ERROR ? <AlertIcon style={{color: 'var(--md-sys-color-error)'}} /> : <FileIcon style={{fontSize: '1.2rem'}} />}
                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'}}>
                    {doc.file.name}
                </span>
            </div>
            <div className="card-text">
                {renderText()}
            </div>
        </div>
    </div>
  );
};

export default ImageCard;
