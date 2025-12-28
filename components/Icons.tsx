import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UploadIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>cloud_upload</span>
);

export const SearchIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>search</span>
);

export const LoaderIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>hourglass_top</span>
);

export const CheckIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>check_circle</span>
);

export const AlertIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>error</span>
);

export const FileIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>image</span>
);

export const CloseIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>close</span>
);

export const DeleteIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>delete</span>
);

export const CopyIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>content_copy</span>
);

export const BookIcon = ({ className, style }: IconProps) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={style}>document_scanner</span>
);