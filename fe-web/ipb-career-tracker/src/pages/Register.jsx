import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'student',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate(user.role === 'hr' ? '/hr/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
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
          <h2 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
          <p className="mt-2 text-gray-600">
            Bergabunglah dengan komunitas karir IPB.
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nama Depan"
                  placeholder="Budi"
                  value={form.first_name}
                  onChange={set('first_name')}
                  required
                />
                <Input
                  label="Nama Belakang"
                  placeholder="Santoso"
                  value={form.last_name}
                  onChange={set('last_name')}
                  required
                />
              </div>
              <Input
                label="Email Institusi (IPB)"
                type="email"
                placeholder="budi@apps.ipb.ac.id"
                value={form.email}
                onChange={set('email')}
                required
              />
              <Select
                label="Peran"
                value={form.role}
                onChange={set('role')}
                options={[
                  { label: 'Mahasiswa', value: 'student' },
                  { label: 'Perusahaan (HR)', value: 'hr' },
                ]}
              />
              <Input
                label="Password"
                type="password"
                placeholder="********"
                value={form.password}
                onChange={set('password')}
                required
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="********"
                value={form.confirm}
                onChange={set('confirm')}
                required
              />

              <div className="block text-sm text-gray-900 pt-2">
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="#" className="text-[#0f2854]">
                  Syarat & Ketentuan
                </a>{' '}
                kami.
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#0f2854] hover:text-[#183a6d]"
                >
                  Masuk disini
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
