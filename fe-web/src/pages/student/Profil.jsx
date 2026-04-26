import React, { useState, useRef } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usersApi } from '../../api/users';
import { resolveUploadUrl } from '../../api/client';

import { motion } from 'framer-motion';

export function ProfilStudent() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const avatarInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nim: user?.nim || '',
    major: user?.major || '',
    gpa: user?.gpa || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await usersApi.update(form);
      await refreshUser();
      setSaveMsg('Profil berhasil disimpan!');
    } catch (err) {
      setSaveMsg('Gagal menyimpan profil.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Error', message: 'Ukuran gambar maksimal 2MB.' });
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(file);
      await refreshUser();
      addToast({ type: 'success', title: 'Berhasil', message: 'Foto profil berhasil diperbarui.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal mengunggah foto.' });
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCVSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Error', message: 'Ukuran CV maksimal 5MB.' });
      return;
    }

    setUploadingCV(true);
    try {
      await usersApi.uploadCV(file);
      await refreshUser();
      addToast({ type: 'success', title: 'Berhasil', message: 'CV berhasil diunggah.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal mengunggah CV.' });
    } finally {
      setUploadingCV(false);
    }
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const avatarUrl =
    avatarPreview ||
    resolveUploadUrl(user?.avatar) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f2854&color=fff`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-md object-cover"
              />
              <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
              <p className="text-gray-500">{user?.major || '-'}</p>
              <p className="text-sm text-gray-400 mt-1">
                {user?.university || 'IPB University'}
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Mengunggah...' : 'Ganti Foto'}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4">CV & Resume</h3>
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  {user?.cv_url ? 'CV sudah diunggah' : 'Belum ada CV'}
                </p>
                {user?.cv_url && (
                  <a
                    href={resolveUploadUrl(user.cv_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:text-accent font-medium inline-block mb-2"
                  >
                    Lihat CV
                  </a>
                )}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleCVSelect}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCV}
                >
                  {uploadingCV ? 'Mengunggah...' : 'Update CV'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Informasi Pribadi
              </h3>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Depan"
                    value={form.first_name}
                    onChange={handleChange('first_name')}
                  />
                  <Input
                    label="Nama Belakang"
                    value={form.last_name}
                    onChange={handleChange('last_name')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="NIM"
                    value={form.nim}
                    onChange={handleChange('nim')}
                    disabled
                  />
                  <Input
                    label="Email"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nomor Telepon"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                  <Input label="Jurusan" value={form.major} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="IPK Terakhir" value={form.gpa} disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tentang Saya
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-y"
                    value={form.bio}
                    onChange={handleChange('bio')}
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>

                {saveMsg && (
                  <p
                    className={`text-sm ${saveMsg.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {saveMsg}
                  </p>
                )}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
