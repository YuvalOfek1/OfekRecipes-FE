import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.module.css';

interface MarkdownEditorProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ label, name, value, onChange, placeholder, rows = 10 }) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyWrap = (before: string, after: string = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const insertLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const beforeText = value.slice(0, start);
    const sel = value.slice(start, end) || 'item';
    const afterText = value.slice(end);
    const lines = sel.split(/\n/).map(l => (l.startsWith(prefix) ? l : prefix + l));
    const block = lines.join('\n');
    const newVal = beforeText + block + afterText;
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + block.length);
    });
  };

  return (
    <div className={styles.wrapper} data-mode={mode}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={styles.tabs}>
          <button type="button" className={mode === 'edit' ? styles.activeTab : styles.tab} onClick={() => setMode('edit')}>Edit</button>
          <button type="button" className={mode === 'preview' ? styles.activeTab : styles.tab} onClick={() => setMode('preview')}>Preview</button>
        </div>
      </div>
      {mode === 'edit' && (
        <>
          <div className={styles.toolbar}>
            <button type="button" onClick={() => applyWrap('**')} title="Bold">B</button>
            <button type="button" onClick={() => applyWrap('*')} title="Italic">I</button>
            <button type="button" onClick={() => applyWrap('`')} title="Code">{`</>`}</button>
            <button type="button" onClick={() => insertLinePrefix('- ')} title="Bulleted list">• List</button>
            <button type="button" onClick={() => insertLinePrefix('1. ')} title="Numbered list">1.</button>
            <button type="button" onClick={() => insertLinePrefix('### ')} title="Heading">H3</button>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            name={name}
            value={value}
            placeholder={placeholder}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className={styles.hint}>Markdown supported: **bold**, *italic*, lists, headings, code.</div>
        </>
      )}
      {mode === 'preview' && (
        <div className={styles.preview}>
          {value.trim() ? <ReactMarkdown>{value}</ReactMarkdown> : <span className={styles.placeholder}>Nothing to preview.</span>}
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;

