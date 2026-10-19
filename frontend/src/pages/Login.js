import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      if (!user.weight || !user.height) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <img
        className="login-backdrop-art"
        src="/images/login-background.jpeg"
        alt=""
        aria-hidden="true"
      />
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-brand">
          <h1 id="login-title">
            Nutri<span>Mate</span>
          </h1>
          <p>Your Fitness Companion</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-field login-email-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="eg. abc@outlook.com"
              required
            />
          </div>

          <div className="login-field login-password-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-password-input">
              <img src="/images/login-lock.svg" alt="" aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="•••••••••••"
                required
              />
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-signup">
          <Link to="/register">Click Here to Sign-Up</Link>
        </p>
      </section>
    </main>
  );
}
