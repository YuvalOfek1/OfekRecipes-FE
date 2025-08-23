import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { createUser } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await createUser({ name, email, password });
        toast.success('Account created');
        await login(email, password);
        toast.success('Logged in');
      } else {
        await login(email, password);
        toast.success('Logged in');
      }
      navigate('/recipes');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        const msg = (err.response.data as { message: string }).message || 'Authentication failed';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Authentication failed');
        toast.error('Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h2 className={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className={styles.subtitle}>{isRegister ? 'Join and start sharing your favorite recipes.' : 'Log in to continue cooking inspiration.'}</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {isRegister && (
            <label className={styles.label}>
              <span>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={styles.input}
              />
            </label>
          )}
          <label className={styles.label}>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Please wait…' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <button className={styles.toggleBtn} onClick={() => setIsRegister(r => !r)} disabled={loading}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
