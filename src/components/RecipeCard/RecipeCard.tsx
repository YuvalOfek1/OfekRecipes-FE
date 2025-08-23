import React from 'react';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../../types';
import { deleteRecipe } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface RecipeCardProps {
  recipe: Recipe;
  canEdit?: boolean;
  onDelete?: (id: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, canEdit = false, onDelete }) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const openDetail = () => navigate(`/recipes/${recipe.id}`);
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recipes/${recipe.id}/edit`);
  };
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(String(recipe.id), token);
      onDelete?.(recipe.id);
      toast.success('Recipe deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className={styles.recipeCard} onClick={openDetail} role="button" tabIndex={0} onKeyDown={(e)=> e.key==='Enter' && openDetail()}>
      {canEdit && (
        <div className={styles.actions} onClick={(e)=> e.stopPropagation()}>
          <button type="button" className={styles.iconBtn} aria-label="Edit recipe" onClick={handleEdit}>✎</button>
          <button type="button" className={styles.iconBtnDanger} aria-label="Delete recipe" onClick={handleDelete}>✕</button>
        </div>
      )}
      {recipe.photoUrl && (
        <img src={recipe.photoUrl} alt={recipe.title} className={styles.thumbnail} />
      )}
      <div className={styles.info}>
        <h3>{recipe.title}</h3>
        {recipe.description && (
          <p className={styles.desc} title={recipe.description}>{recipe.description}</p>
        )}
        <p className={styles.author}>By {recipe.authorName}</p>
        {(recipe.prepTimeMinutes || (recipe.tags && recipe.tags.length)) && (
          <div className={styles.metaLine}>
            {recipe.prepTimeMinutes && (
              <span className={styles.time}>{recipe.prepTimeMinutes} min</span>
            )}
            {recipe.tags && recipe.tags.slice(0,3).map(tag => (
              <span key={tag} className={styles.tag}>{tag.replace('_',' ')}</span>
            ))}
            {recipe.tags && recipe.tags.length > 3 && (
              <span className={styles.moreTag}>+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
