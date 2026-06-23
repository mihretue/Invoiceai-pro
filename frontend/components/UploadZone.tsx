'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useUploadDocument } from '@/hooks/useDocuments';
import Icon from './Icon';

interface UploadZoneProps {
  big?: boolean;
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export default function UploadZone({ big }: UploadZoneProps) {
  const [drag, setDrag]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const upload              = useUploadDocument();

  function validate(file: File): boolean {
    if (!ALLOWED_TYPES.includes(file.type) && !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      toast.error('Unsupported file type. Use PDF, PNG or JPG.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10 MB).');
      return false;
    }
    return true;
  }

  function handleFiles(files: FileList | null): void {
    if (!files?.length) return;
    const f = files[0];
    if (!validate(f)) return;
    upload.mutate(f);
  }

  if (upload.isPending) {
    return (
      <div className="dropzone" style={{ cursor: 'default' }}>
        <div className="spinner" />
        <div className="h3">Uploading…</div>
        <div className="small muted">Sending to server for AI extraction</div>
      </div>
    );
  }

  if (upload.isSuccess) {
    return (
      <div className="dropzone" style={{ cursor: 'default' }}>
        <div className="dz-ic" style={{ color: 'var(--green)' }}><Icon name="check" size={26} /></div>
        <div className="h3">Upload complete</div>
        <div className="small muted">Extraction is queued — results appear shortly</div>
        <button
          className={`btn btn-secondary${big ? ' btn-lg' : ''}`}
          style={{ marginTop: 6 }}
          onClick={() => upload.reset()}
        >
          Upload another
        </button>
      </div>
    );
  }

  return (
    <div
      className={`dropzone${drag ? ' drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
      <div className="dz-ic"><Icon name="upload" size={26} /></div>
      <div className="h3">{drag ? 'Drop to upload' : 'Drag & drop an invoice'}</div>
      <div className="small">PDF, PNG or JPG · up to 10 MB</div>
      <button
        className={`btn btn-primary${big ? ' btn-lg' : ''}`}
        style={{ marginTop: 6, pointerEvents: 'none' }}
      >
        <Icon name="upload" size={17} /> Browse files
      </button>
    </div>
  );
}
