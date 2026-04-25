import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    onLogin({ role, name: form.name.trim() || (role === 'admin' ? 'Admin' : 'User') });
  };

  return (
    <div className="login-container">
      {/* Background Image */}
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>

      {/* Login Card with Curved Shape */}
      <div className="login-curved-card">
        {/* Header Section */}
        <div className="login-header-section">
          <div className="login-logo-group">
            <div className="login-logo-mark">SR</div>
            <div className="login-logo-text">
              <h1>Smart Resolve</h1>
              <p>Campus Complaint System</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="login-form-wrapper">
          <h2 className="login-title">Login</h2>

          {/* Role Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              Student
            </button>
            <button
              type="button"
              className={`login-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-row">
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder={role === 'admin' ? 'Admin Code' : 'Roll / Enrollment No'}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-row">
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit-btn">
              LOGIN
            </button>

            <p className="login-forgot">
              Forgot Password?
            </p>
          </form>

          {/* Footer */}
          <p className="login-footer">
            Powered By - <strong>Smart Resolve</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
