import React, { useState, useRef } from 'react';
import styles from './styles.module.css';
import { RecipeFormData } from '../../types';
import MarkdownEditor from '../MarkdownEditor/MarkdownEditor';
import { getRecipePhotoUrl } from '../../api/axios';

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  initialData?: RecipeFormData;
  submitLabel?: string;
}

const empty: RecipeFormData = { title: '', description: '', ingredientMd: '', processMd: '', photo: null, prepTimeMinutes: undefined, tags: [] };
const AVAILABLE_TAGS = [
  'VEGETARIAN',
  'VEGAN',
  'GLUTEN_FREE',
  'DAIRY_FREE',
  'NUT_FREE',
  'QUICK',
  'DESSERT',
  'MAIN_COURSE',
  'APPETIZER',
  'BREAKFAST',
  'LUNCH',
  'DINNER'
];

const isExternalUrl = (u: string) => /^https?:\/\//i.test(u);

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData, submitLabel = 'Create Recipe' }) => {
  const [form, setForm] = useState<RecipeFormData>(initialData || empty);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  // Decide initial mode: external URLs => 'url', internal/relative paths => 'upload'
  const initialPhotoModeValue: 'upload' | 'url' = initialData?.photoUrl && isExternalUrl(initialData.photoUrl) ? 'url' : 'upload';
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>(initialPhotoModeValue);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>(initialData?.photoUrl || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedRef = useRef(false); // ensure we only auto-hydrate once

  React.useEffect(() => {
    // Only attempt hydration once for existing (non-external) stored photos when editing
    if (hydratedRef.current) return;
    if (!initialData) return;
    if (form.photo) return; // user already selected a new file
    if (preview) return; // already have a preview
    const raw = (initialData.photoUrl || form.photoUrl || '').trim();
    if (!raw) return;
    // If it's an external URL we don't fetch a blob; user can see it in URL mode
    if (isExternalUrl(raw)) {
      if (photoMode === 'url') setPhotoUrlInput(raw);
      hydratedRef.current = true;
      return;
    }
    // Internal stored path -> fetch blob for preview (upload mode)
    const filename = raw.startsWith('/uploads/') ? raw.substring('/uploads/'.length) : raw;
    getRecipePhotoUrl(filename).then(objUrl => {
      if (objUrl) {
        setPreview(objUrl);
      }
    }).finally(() => { hydratedRef.current = true; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.photo, form.photoUrl, preview, photoMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm(prev => ({ ...prev, photo: file || null }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      // Switching to upload mode implicitly
      setPhotoMode('upload');
    } else {
      setPreview(null);
    }
  };

  const handleModeChange = (mode: 'upload' | 'url') => {
    if (photoMode === mode) return;
    setPhotoMode(mode);
    if (mode === 'upload') {
      // moving back to upload: clear URL fields, keep existing preview if any
      setPhotoUrlInput('');
      setForm(prev => ({ ...prev, photoUrl: undefined }));
    } else {
      // moving to URL mode: clear file/preview; don't allow hydration again
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setPreview(null);
      hydratedRef.current = true; // prevent any pending hydration from restoring old image
      setForm(prev => ({ ...prev, photo: null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTags = selectedTags.map(t => t.trim()).filter(Boolean);
    const payload: RecipeFormData = { ...form, tags: cleanedTags, prepTimeMinutes: form.prepTimeMinutes };
    if (photoMode === 'url') {
      const trimmed = photoUrlInput.trim();
      if (trimmed) {
        payload.photo = null;
        payload.photoUrl = trimmed; // new external URL
      } else {
        // User cleared URL. If there was an original image, send empty string to delete.
        if (initialData?.photoUrl || form.photoUrl === '') {
          payload.photo = null;
          payload.photoUrl = ''; // explicit deletion sentinel
        } else {
          payload.photoUrl = undefined; // nothing to change
          payload.photo = null;
        }
      }
    } else {
      // upload mode: if user removed image (photoUrl === '' sentinel) propagate deletion
      if (form.photoUrl === '') payload.photoUrl = '';
      else payload.photoUrl = undefined; // rely on new file or keep existing
    }
    onSubmit(payload);
  };

  const triggerFileDialog = () => fileInputRef.current?.click();

  const removeCurrentImage = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    setPhotoUrlInput('');
    hydratedRef.current = true; // prevent rehydration from initialData
    // Clear both photo and photoUrl; empty string signals removal
    setForm(prev => ({ ...prev, photo: null, photoUrl: '' }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={styles.colSpan2}>
          <label className={styles.label}>Title
            <input name="title" value={form.title} onChange={handleChange} required className={styles.input} />
          </label>
        </div>
        <div className={styles.colSpan2}>
          <label className={styles.label}>Short Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={styles.textarea} />
          </label>
        </div>
        <div className={styles.colSpan1}>
          <MarkdownEditor
            label="Ingredients (Markdown)"
            name="ingredientMd"
            value={form.ingredientMd}
            onChange={(val) => setForm(prev => ({ ...prev, ingredientMd: val }))}
            placeholder={"### For 2 prs" + '\n' + "- 2 cups flour." + '\n' + "- 1 tsp salt."}
            rows={10}
          />
        </div>
        <div className={styles.colSpan1}>
          <MarkdownEditor
            label="Process (Markdown)"
            name="processMd"
            value={form.processMd}
            onChange={(val) => setForm(prev => ({ ...prev, processMd: val }))}
            placeholder={"1. Preheat oven..." + '\n' + "2. Mix ingredients..."}
            rows={10}
          />
        </div>
        <div className={styles.colSpan2}>
          <div className={styles.metaGrid}>
            <label className={styles.label} style={{flex: '0 0 160px'}}>
              Preparation (min)
              <input
                type="number"
                min={1}
                name="prepTimeMinutes"
                value={form.prepTimeMinutes ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, prepTimeMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                className={styles.input}
                placeholder="e.g. 45"
              />
            </label>
            <label className={styles.label} style={{flex:1}}>
              Tags
              <div className={styles.tagsGrid}>
                {AVAILABLE_TAGS.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={active ? styles.tagChipActive : styles.tagChip}
                      aria-pressed={active}
                      onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    >
                      {tag.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <div className={styles.selectedHint}>{selectedTags.length} tag{selectedTags.length>1?'s':''} selected</div>
              )}
            </label>
          </div>
        </div>
        <div className={styles.colSpan2}>
          <div className={styles.photoToggleRow}>
            <div className={styles.photoModeSwitch}>
              <button type="button" className={photoMode === 'upload' ? styles.photoModeActive : styles.photoModeBtn} onClick={() => handleModeChange('upload')}>Upload Photo</button>
              <button type="button" className={photoMode === 'url' ? styles.photoModeActive : styles.photoModeBtn} onClick={() => handleModeChange('url')}>Photo URL</button>
            </div>
          </div>
          {photoMode === 'upload' && (
            <div className={styles.uploadRow}>
              <div className={styles.uploadWrapper}>
                <div className={styles.uploadBox} onClick={triggerFileDialog} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter') && triggerFileDialog()}>
                  {preview ? (
                    <img src={preview} alt="Preview" className={styles.previewImg} />
                  ) : (
                    <span className={styles.uploadPlaceholder}>Click to upload photo</span>
                  )}
                </div>
                {preview && (
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    aria-label="Remove image"
                    onClick={(e) => { e.stopPropagation(); removeCurrentImage(); }}
                  >×</button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className={styles.fileInput} onChange={handleFile} />
            </div>
          )}
          {photoMode === 'url' && (
            <label className={styles.label} style={{marginTop:'.6rem'}}>
              External Image URL
              <div className={styles.urlInputRow}>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={photoUrlInput}
                  onChange={(e) => {
                    setPhotoUrlInput(e.target.value);
                    setForm(prev => ({ ...prev, photoUrl: e.target.value }));
                  }}
                  className={styles.input}
                />
                {photoUrlInput && (
                  <button type="button" className={styles.inlineRemoveBtn} aria-label="Clear image URL" onClick={removeCurrentImage}>×</button>
                )}
              </div>
              {photoUrlInput && (/^https?:\/\//i.test(photoUrlInput)) && (
                <div className={styles.urlPreviewWrap}>
                  <img src={photoUrlInput} alt="URL preview" className={styles.urlPreviewImg} onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.opacity='0.3'; }} />
                  <button type="button" className={styles.removeImageBtn} aria-label="Remove image" onClick={(e) => { e.stopPropagation(); removeCurrentImage(); }}>×</button>
                </div>
              )}
            </label>
          )}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn}>{submitLabel}</button>
        </div>
      </div>
    </form>
  );
};

export default RecipeForm;
