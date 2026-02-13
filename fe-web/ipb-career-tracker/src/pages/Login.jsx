import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'hr' ? '/hr/dashboard' : '/student/dashboard');
      addToast({
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${user.first_name}!`,
        type: 'success',
      });
    } catch (err) {
      const msg = err.message || 'Login gagal. Periksa email dan password Anda.';
      setError(msg);
      addToast({
        title: 'Login Gagal',
        message: msg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /** Quick-access demo buttons — logs in with seeded accounts */
  const quickLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'password123');
      navigate(user.role === 'hr' ? '/hr/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-[#0f2854] flex items-center justify-center text-white font-bold text-2xl">
              T
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Tumbuh
            </span>
          </Link>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900"
          >
            Masuk ke Akun Anda
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-gray-600"
          >
            Selamat datang kembali! Silakan masukkan detail Anda
          </motion.p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleLogin} className="space-y-6">

              <Input
                label="Email"
                type="email"
                placeholder="nama@apps.ipb.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#0f2854] focus:ring-[#0f2854]"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Ingat saya
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-[#0f2854] hover:text-[#183a6d]"
                  >
                    Lupa password?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#0f2854] hover:text-[#183a6d]"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
