import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import { getRecipeById, updateRecipe } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { RecipeFormData } from '../../types';
import toast from 'react-hot-toast';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<RecipeFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ownerOk, setOwnerOk] = useState(true);

  useEffect(() => {
    if (!token || !id) {
      setError('You must be logged in to edit a recipe.');
      setLoading(false);
      return;
    }
    getRecipeById(id, token)
      .then((data) => {
        if (user && ((data.authorEmail && data.authorEmail !== user.email) || (!data.authorEmail && data.authorName && data.authorName !== user.name))) {
          setOwnerOk(false);
          setLoading(false);
          return;
        }
        const prep = data.prepTimeMinutes ?? data.preparationTime ?? data.prepTime;
        let tags: string[] | undefined;
        if (Array.isArray(data.tags)) tags = data.tags.map((t: unknown) => String(t)).filter(Boolean);
        else if (typeof data.tags === 'string') tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        setInitialData({
          title: data.title || '',
          description: data.description || '',
          ingredientMd: data.ingredientMd || data.ingredients || '',
          processMd: data.processMd || data.instructions || '',
          photo: null,
          photoUrl: data.photoUrl || data.photo || '',
          prepTimeMinutes: prep ? Number(prep) : undefined,
          tags,
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load recipe.');
        setLoading(false);
      });
  }, [id, token]);

  const handleSubmit = async (data: RecipeFormData) => {
    if (!token || !id) {
      setError('You must be logged in to edit a recipe.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateRecipe(id, data, token);
      toast.success('Recipe updated');
      navigate(`/recipes/${id}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        const msg = (err.response.data as { message: string }).message || 'Failed to update recipe.';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Failed to update recipe.');
        toast.error('Failed to update recipe');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!ownerOk) return <div style={{ color: 'var(--color-danger)' }}>Not authorized to edit this recipe.</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!initialData) return null;

  return (
    <div className="container">
      <h2>Edit Recipe</h2>
      <RecipeForm
        onSubmit={handleSubmit}
        initialData={initialData}
        submitLabel={submitting ? 'Saving...' : 'Save Changes'}
      />
    </div>
  );
};

export default EditRecipePage;
