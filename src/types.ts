// Shared types for the app

export interface Recipe {
  id: number;
  title: string;
  authorName: string;
  authorEmail?: string;
  description?: string; // added
  ingredientMd?: string;
  processMd?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  tags?: string[];
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredientMd: string;
  processMd: string;
  photo?: File | null;
  photoUrl?: string;
  prepTimeMinutes?: number;
  tags?: string[]; // UI convenience
}

export type BackendRecipe = {
  id: number;
  title: string;
  authorName?: string;
  author?: string;
  authorEmail?: string;
  photoUrl?: string;
  photo?: string;
  description?: string;
  ingredientMd?: string;
  processMd?: string;
  prepTimeMinutes?: number;
  preparationTime?: number;
  prepTime?: number;
  tags?: string[] | string; // may come as array or comma string
};

export interface User {
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
