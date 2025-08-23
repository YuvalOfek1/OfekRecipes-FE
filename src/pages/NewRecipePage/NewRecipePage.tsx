import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import { createRecipe } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { RecipeFormData } from '../../types';
import toast from 'react-hot-toast';

const NewRecipePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RecipeFormData) => {
    if (!token) {
      setError('You must be logged in to create a recipe.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createRecipe(data, token);
      toast.success('Recipe created');
      navigate('/recipes');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        const msg = (err.response.data as { message: string }).message || 'Failed to create recipe.';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Failed to create recipe.');
        toast.error('Failed to create recipe');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>New Recipe</h2>
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '.85rem' }}>{error}</div>}
      <RecipeForm onSubmit={handleSubmit} submitLabel={loading ? 'Creating...' : 'Create Recipe'} />
    </div>
  );
};

export default NewRecipePage;
