import axios from 'axios';
import {BackendRecipe, RecipeFormData} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const createRecipe = async (data: RecipeFormData, token: string) => {
  const formData = buildBackendRecipeFormData(data);
  const response = await axios.post(
    `${API_BASE_URL}/recipes`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`
        // 'Content-Type' is set automatically by axios for FormData
      }
    }
  );
  return response.data;
};

export const getRecipeById = async (id: string, token?: string) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const response = await axios.get(`${API_BASE_URL}/recipes/${id}`, config);
  return response.data;
};

export const updateRecipe = async (id: string, data: RecipeFormData, token: string) => {
  const formData = buildBackendRecipeFormData(data);
  const response = await axios.put(
    `${API_BASE_URL}/recipes/${id}`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const createUser = async (data: { name: string; email: string; password: string }) => {
  const response = await axios.post(`${API_BASE_URL}/users/register`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${API_BASE_URL}/users/login`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const getRecipes = async (): Promise<BackendRecipe[]> => {
  const response = await axios.get(`${API_BASE_URL}/recipes`);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
};

export const deleteRecipe = async (id: string, token: string) => {
  const response = await axios.delete(`${API_BASE_URL}/recipes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getRecipePhotoUrl = async (photo: string): Promise<string> => {
  if (!photo) return '';
  if (/^blob:/i.test(photo)) return photo; // already object URL
  if (/^https?:\/\//i.test(photo)) return photo; // external URL
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/photo/${encodeURIComponent(photo)}`, {
      responseType: 'arraybuffer'
    });
    const contentType = (response.headers['content-type'] as string) || 'image/jpeg';
    const blob = new Blob([response.data], { type: contentType });
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
};

const buildBackendRecipeFormData = (data: RecipeFormData): FormData => {
  const fd = new FormData();
  if (data.title) fd.append('title', data.title);
  if (data.description) fd.append('description', data.description);
  if (data.ingredientMd) fd.append('ingredientMd', data.ingredientMd);
  if (data.processMd) fd.append('processMd', data.processMd);
  if (data.prepTimeMinutes !== undefined && data.prepTimeMinutes !== null) {
    fd.append('prepTimeMinutes', String(data.prepTimeMinutes));
  }
  if (Array.isArray(data.tags) && data.tags.length) {
    fd.append('tags', JSON.stringify(data.tags.map(t=>t.trim()).filter(Boolean)));
  }
  const hasNewFile = data.photo instanceof File;
  // Append photoUrl even if empty string (user clearing image)
  if (data.photoUrl !== undefined && !hasNewFile) {
    fd.append('photoUrl', data.photoUrl);
  }
  if (hasNewFile) {
    fd.append('photo', data.photo as File);
  }
  return fd;
};
