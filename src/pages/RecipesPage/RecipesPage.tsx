import React, { useState } from 'react';
import RecipeList from '../../components/RecipeList/RecipeList';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const RecipesPage: React.FC = () => {
  const { token } = useAuth();
  const [hideCta, setHideCta] = useState(false);
  const [search, setSearch] = useState('');
  return (
    <div className="container">
      {!token && !hideCta && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.6rem',
          fontSize: '.7rem',
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
          padding: '.4rem .65rem',
          borderRadius: '999px',
          margin: '1rem 0 1.2rem',
          width: 'fit-content',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontWeight: 600 }}>Share your own recipes:</span>
          <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Login / Register</Link>
          <button aria-label="Dismiss" onClick={() => setHideCta(true)} style={{
            background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: '.9rem', lineHeight: 1, padding: '.1rem .25rem', borderRadius: '4px'
          }}>×</button>
        </div>
      )}
      <div style={{display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom: token ? '1.5rem' : '.5rem'}}>
        <input
          type="text"
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search recipes, tags, authors..."
          style={{
            flex:'1 1 260px',
            padding:'.65rem .85rem',
            border:'1px solid var(--color-border)',
            borderRadius:'var(--radius-sm)',
            background:'var(--color-surface)',
            fontSize:'.85rem'
          }}
          aria-label="Search recipes"
        />
      </div>
      <RecipeList searchTerm={search} />
    </div>
  );
};

export default RecipesPage;
