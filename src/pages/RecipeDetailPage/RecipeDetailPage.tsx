import React from 'react';
import RecipeDetail from '../../components/RecipeDetail/RecipeDetail';
import { useParams } from 'react-router-dom';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <RecipeDetail id={id}/>;
};

export default RecipeDetailPage;

