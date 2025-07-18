import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">
      <img src="/logo1.png" className="h-50 w-50" alt="Logo" />
      <p className="text-gray-400 mb-10 text-sm text-center">
        Your fast lane around campus 🚕
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-md text-white border border-white bg-transparent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-md text-white border border-white bg-transparent"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className={`flex justify-center items-center bg-white text-black px-5 py-3 rounded-full shadow-md transition-all duration-200 ${
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          {loading
            ? mode === 'login'
              ? 'Signing In...'
              : 'Signing Up...'
            : mode === 'login'
            ? 'Sign In'
            : 'Sign Up'}
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <span
                onClick={() => setMode('signup')}
                className="text-blue-400 cursor-pointer"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setMode('login')}
                className="text-blue-400 cursor-pointer"
              >
                Sign In
              </span>
            </>
          )}
        </p>
      </div>

      <footer className="absolute bottom-4 text-xs text-gray-600">
        Made with ❤️ for TC Inductions
      </footer>
    </div>
  );
};

export default Login;
