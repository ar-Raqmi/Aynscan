import React from 'react';
import { DocImage } from '../types';
import { CloseIcon, CopyIcon } from './Icons';

interface ModalProps {
  doc: DocImage | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
}

const Modal: React.FC<ModalProps> = ({ doc, isOpen, onClose, onCopy }) => {
  if (!doc) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
    }}>
        <div className="modal-content">
            <div className="modal-image-col">
                <img src={doc.previewUrl} alt="Full view" />
            </div>
            <div className="modal-text-col">
                <div className="modal-header">
                    <h3 style={{
                        color: 'var(--md-sys-color-primary)', 
                        fontSize: '1.5rem', 
                        maxWidth: '80%', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis'
                    }}>
                        {doc.file.name}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-extracted-text">
                    {doc.extractedText || "No text available."}
                </div>
                <div style={{marginTop: 'auto', paddingTop: '20px'}}>
                    <button className="btn" style={{width: '100%'}} onClick={() => onCopy(doc.extractedText || "")}>
                        <CopyIcon />
                        Copy Text
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Modal;