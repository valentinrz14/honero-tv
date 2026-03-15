import { useState, type FormEvent } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      onLogin();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Hornero TV</h1>
        <p style={styles.subtitle}>Panel de Administración</p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Contraseña de admin"
          style={styles.input}
          autoFocus
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Ingresar</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1210',
    fontFamily: 'system-ui, sans-serif',
  },
  form: {
    background: '#2a2018',
    padding: '40px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '320px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    color: '#D4A574',
    fontSize: '28px',
    margin: '0 0 4px 0',
  },
  subtitle: {
    color: '#999',
    fontSize: '14px',
    margin: '0 0 24px 0',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#1a1210',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    color: '#e74c3c',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  button: {
    marginTop: '16px',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#8B5E3C',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
