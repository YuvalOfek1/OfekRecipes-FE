import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import LoginPage from './pages/LoginPage/LoginPage';
import RecipesPage from './pages/RecipesPage/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage/RecipeDetailPage';
import NewRecipePage from './pages/NewRecipePage/NewRecipePage';
import EditRecipePage from './pages/EditRecipePage/EditRecipePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/new" element={<ProtectedRoute><NewRecipePage /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/edit" element={<ProtectedRoute><EditRecipePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/recipes" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
