import React, { useEffect, useState, useMemo } from 'react';
import styles from './styles.module.css';
import { Recipe, BackendRecipe } from '../../types';
import RecipeCard from '../RecipeCard/RecipeCard';
import { getRecipes, getRecipePhotoUrl } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface RecipeListProps { searchTerm?: string }
const RecipeList: React.FC<RecipeListProps> = ({ searchTerm = '' }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    let isCancelled = false;
    const blobUrls: string[] = [];
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRecipes();
        const mapped = await Promise.all(res.map(async (r: BackendRecipe) => {
          const photoRef = r.photoUrl || r.photo;
          let blobUrl: string | undefined;
          if (photoRef) {
            const url = await getRecipePhotoUrl(photoRef);
            if (url) {
              blobUrls.push(url);
              blobUrl = url;
            }
          }
          const prep = r.prepTimeMinutes ?? r.preparationTime ?? r.prepTime;
          let tags: string[] | undefined;
          if (Array.isArray(r.tags)) tags = r.tags.map(t => String(t)).filter(Boolean);
          else if (typeof r.tags === 'string') tags = r.tags.split(',').map(t => t.trim()).filter(Boolean);
          return {
            id: r.id,
            title: r.title,
            authorName: r.authorName || r.author || 'Unknown',
            authorEmail: r.authorEmail,
            description: r.description,
            photoUrl: blobUrl,
            prepTimeMinutes: prep ? Number(prep) : undefined,
            tags,
          } as Recipe;
        }));
        if (!isCancelled) setRecipes(mapped);
      } catch (err: unknown) {
        if (!isCancelled) {
          setError('Failed to load recipes');
          toast.error('Failed to load recipes');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchRecipes();
    return () => {
      isCancelled = true;
      blobUrls.forEach(u => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
    };
  }, []);

  const handleLocalDelete = (id: number) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return recipes;
    const q = searchTerm.toLowerCase();
    return recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
      (r.authorName && r.authorName.toLowerCase().includes(q))
    );
  }, [searchTerm, recipes]);

  if (loading) return <div className={styles.recipeList}><div className={styles.state}>Loading recipes…</div></div>;
  if (error) return <div className={styles.recipeList}><div className={styles.state}>{error}</div></div>;
  if (filtered.length === 0) return <div className={styles.recipeList}><div className={styles.state}>No recipes found.</div></div>;
  return (
    <div className={styles.recipeList}>
      {filtered.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleLocalDelete} canEdit={!!token && user?.email === recipe.authorEmail} />
      ))}
    </div>
  );
};

export default RecipeList;
