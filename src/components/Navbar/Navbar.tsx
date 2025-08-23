import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/recipes" className={styles.logo}>Ofek Recipes</Link>
      {token ? (
        <div className={styles.userSection}>
          <span className={styles.userName}>Hi, {user?.name}</span>
          <Link to="/recipes/new" className={styles.link}>Add Recipe</Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      ) : (
        <Link to="/login" className={styles.link}>Login</Link>
      )}
    </nav>
  );
};

export default Navbar;

