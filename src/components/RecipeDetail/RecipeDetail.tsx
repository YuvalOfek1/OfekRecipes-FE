import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { getRecipeById, deleteRecipe, getRecipePhotoUrl } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface RecipeDetailType {
  id: number;
  title: string;
  authorName: string;
  authorEmail: string;
  description?: string; // added
  ingredientMd: string;
  processMd: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  tags?: string[];
}

type RecipeDetailProps = {
    id: string | undefined;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({id}: RecipeDetailProps) => {
  const { user, token } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;
    let blobUrl: string | null = null;
    const fetchRecipe = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) throw new Error('No recipe ID');
        const res = await getRecipeById(id, token || '');
        let resolvedPhoto: string | undefined;
        const photoRef = res.photoUrl || res.photo;
        if (photoRef) {
          const url = await getRecipePhotoUrl(photoRef);
          if (url) {
            blobUrl = url;
            resolvedPhoto = url;
          }
        }
        // extract prep time variants
        const prep = res.prepTimeMinutes ?? res.preparationTime ?? res.prepTime;
        let tags: string[] | undefined;
        if (Array.isArray(res.tags)) tags = res.tags.map((t: unknown) => String(t)).filter(Boolean);
        else if (typeof res.tags === 'string') tags = res.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        if (isCancelled) return;
        setRecipe({
          id: res.id,
          title: res.title,
          authorName: res.authorName || res.author || 'Unknown',
          authorEmail: res.authorEmail || '',
          description: res.description, // map description
          ingredientMd: res.ingredientMd,
          processMd: res.processMd,
          photoUrl: resolvedPhoto,
          prepTimeMinutes: prep ? Number(prep) : undefined,
          tags,
        });
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to load recipe');
          toast.error('Failed to load recipe');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchRecipe();
    return () => {
      isCancelled = true;
      if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl);
    };
  }, [id, token]);

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      if (!id) throw new Error('No recipe ID');
      await deleteRecipe(id, token || '');
      toast.success('Recipe deleted');
      navigate('/recipes');
    } catch {
      toast.error('Failed to delete recipe');
    }
  };

  if (loading) return <div className={styles.recipeDetail}>Loading...</div>;
  if (error || !recipe) return <div className={styles.recipeDetail}>{error || 'Recipe not found.'}</div>;

  const isOwner = user && ( (recipe.authorEmail && user.email === recipe.authorEmail) || (!recipe.authorEmail && user.name === recipe.authorName) );

  return (
    <div className={styles.recipeDetail}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{recipe.title}</h1>
          <p className={styles.meta}>By {recipe.authorName}</p>
          {recipe.description && (
            <p className={styles.description}>{recipe.description}</p>
          )}
          {(recipe.prepTimeMinutes || (recipe.tags && recipe.tags.length)) && (
            <div className={styles.metaLine}>
              {recipe.prepTimeMinutes && <span className={styles.timeBadge}>{recipe.prepTimeMinutes} min</span>}
              {recipe.tags && recipe.tags.map(tag => (
                <span key={tag} className={styles.tagChip}>{tag.replace('_',' ')}</span>
              ))}
            </div>
          )}
        </div>
        {isOwner && (
          <div className={styles.actions}>
            <button onClick={handleEdit} className={styles.secondaryBtn}>Edit</button>
            <button onClick={handleDelete} className={styles.dangerBtn}>Delete</button>
          </div>
        )}
      </div>
      {recipe.photoUrl && <div className={styles.heroWrap}><img src={recipe.photoUrl} alt={recipe.title} className={styles.photo} /></div>}
      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <div className={styles.markdown}><ReactMarkdown>{recipe.ingredientMd}</ReactMarkdown></div>
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Process</h2>
          <div className={styles.markdown}><ReactMarkdown>{recipe.processMd}</ReactMarkdown></div>
        </section>
      </div>
    </div>
  );
};

export default RecipeDetail;
