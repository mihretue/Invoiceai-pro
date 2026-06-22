'use client';
import { useState, useRef, useEffect } from 'react';
import { fabricateInvoice } from '@/lib/data';
import { fmtMoney } from '@/lib/formatters';
import Icon from './Icon';

export default function UploadZone({ onExtracted, pushToast, big }) {
  const [state, setState] = useState('idle'); // idle | uploading | processing
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function validate(file) {
    const okTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (file && !okTypes.includes(file.type) && !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      pushToast('Unsupported file type. Use PDF, PNG or JPG.', 'error');
      return false;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      pushToast('File too large (max 10 MB).', 'error');
      return false;
    }
    return true;
  }

  function run(name) {
    setFileName(name);
    setState('uploading');
    setProgress(0);
    pushToast(`Uploading ${name}…`, 'info');

    let p = 0;
    const tick = () => {
      p += 8 + Math.random() * 16;
      if (p >= 100) {
        setProgress(100);
        timers.current.push(setTimeout(() => setState('processing'), 300));
        timers.current.push(setTimeout(() => {
          const inv = fabricateInvoice(name);
          setState('idle');
          setProgress(0);
          setFileName('');
          onExtracted(inv);
          pushToast(`Extracted ${inv.vendor} · ${fmtMoney(inv.amount)}`, 'success');
        }, 2100));
      } else {
        setProgress(p);
        timers.current.push(setTimeout(tick, 120));
      }
    };
    timers.current.push(setTimeout(tick, 150));
  }

  function handleFiles(files) {
    if (!files || !files.length) return;
    const f = files[0];
    if (!validate(f)) return;
    run(f.name || 'invoice.pdf');
  }

  if (state === 'uploading' || state === 'processing') {
    return (
      <div className="dropzone" style={{ cursor: 'default' }}>
        {state === 'processing'
          ? <div className="spinner" />
          : <div className="dz-ic"><Icon name="doc" size={26} /></div>}
        <div className="h3">{state === 'processing' ? 'Extracting data…' : 'Uploading…'}</div>
        <div className="small" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </div>
        {state === 'uploading'
          ? <div className="progress" style={{ maxWidth: 280 }}><div style={{ width: progress + '%' }} /></div>
          : <div className="small muted">Reading vendor, amount &amp; line items</div>}
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
