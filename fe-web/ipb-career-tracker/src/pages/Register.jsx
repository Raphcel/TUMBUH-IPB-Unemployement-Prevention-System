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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    // Clear error for this field when user types
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.first_name) newErrors.first_name = 'Nama depan wajib diisi';
    if (!form.last_name) newErrors.last_name = 'Nama belakang wajib diisi';

    if (!form.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    else if (!form.email.endsWith('ipb.ac.id')) newErrors.email = 'Gunakan email institusi IPB';

    if (!form.password) newErrors.password = 'Password wajib diisi';
    else if (form.password.length < 8) newErrors.password = 'Password minimal 8 karakter';

    if (form.password !== form.confirm) {
      newErrors.confirm = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
      setErrors({ global: err.message || 'Pendaftaran gagal. Silakan coba lagi.' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {errors.global && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {errors.global}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nama Depan"
                  placeholder="Budi"
                  value={form.first_name}
                  onChange={set('first_name')}
                  error={errors.first_name}
                />
                <Input
                  label="Nama Belakang"
                  placeholder="Santoso"
                  value={form.last_name}
                  onChange={set('last_name')}
                  error={errors.last_name}
                />
              </div>
              <Input
                label="Email Institusi (IPB)"
                type="text"
                placeholder="budi@apps.ipb.ac.id"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
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
                error={errors.password}
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="********"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
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
            </motion.form>

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
