import { useState } from 'react';
import { apiClient } from '../services/apiClient';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    try {
      const response = await apiClient.post(endpoint, { email, password });
      if (isLogin) {
        onLoginSuccess();
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex border-b mb-4">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-center font-semibold ${isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-center font-semibold ${!isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Register</button>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">{isLogin ? 'Login' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}
