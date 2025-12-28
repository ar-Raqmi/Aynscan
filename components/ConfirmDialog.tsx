import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
    }}>
        <div className="dialog-content">
            <div className="dialog-header">{title}</div>
            <div className="dialog-body">{message}</div>
            <div className="dialog-actions">
                <button className="btn btn-text" onClick={onCancel}>Cancel</button>
                <button className="btn btn-danger" onClick={onConfirm}>Clear All</button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmDialog;