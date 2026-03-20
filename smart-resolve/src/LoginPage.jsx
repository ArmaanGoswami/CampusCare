import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('user');
  const [form, setForm] = useState({
    name: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'admin') {
      if (form.name.trim().toLowerCase() === 'admin' && form.password === 'admin123') {
        onLogin({ role: 'admin', name: 'Admin' });
        return;
      }
      setError('Invalid admin credentials. Demo: admin / admin123');
      return;
    }

    if (!form.name.trim() || !form.password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    onLogin({ role: 'user', name: form.name.trim() });
  };

  return (
    <div className="login-shell fade-slide-in">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to Smart Resolve</h2>
          <p>Login as User or Admin to continue.</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <label htmlFor="name">{activeTab === 'admin' ? 'Admin Username' : 'Username'}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder={activeTab === 'admin' ? 'admin' : 'Enter your name'}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={activeTab === 'admin' ? 'admin123' : 'Enter password'}
              required
            />
          </div>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="primary-btn login-btn">
            {activeTab === 'admin' ? 'Login as Admin' : 'Login as User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
