import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      alert('Logged in!');
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 p-4 max-w-sm mx-auto mt-20 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Admin Email" className="border rounded px-3 py-2" required />
      <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Password" className="border rounded px-3 py-2" required />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login; 