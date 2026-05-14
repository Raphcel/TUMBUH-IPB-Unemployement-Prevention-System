import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usersApi } from '../../api/users';
import { resolveUploadUrl } from '../../api/client';
import { useTranslation } from '../../context/LanguageContext';

import { motion } from 'framer-motion';

export function ProfilStudent() {
  const { user, refreshUser } = useAuth();
  const { lang } = useTranslation();
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
  const [saveMsgType, setSaveMsgType] = useState('success');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [openingCV, setOpeningCV] = useState(false);
  const [downloadingCV, setDownloadingCV] = useState(false);
  const isId = lang === 'id';

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nim: user?.nim || '',
      major: user?.major || '',
      gpa: user?.gpa || '',
      bio: user?.bio || '',
    });
  }, [user]);

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
      setSaveMsgType('success');
      setSaveMsg(isId ? 'Profil berhasil disimpan!' : 'Profile saved successfully.');
    } catch (err) {
      setSaveMsgType('error');
      setSaveMsg(isId ? 'Gagal menyimpan profil.' : 'Failed to save profile.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Error', message: isId ? 'Ukuran gambar maksimal 2MB.' : 'Maximum image size is 2MB.' });
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(file);
      await refreshUser();
      addToast({ type: 'success', title: isId ? 'Berhasil' : 'Success', message: isId ? 'Foto profil berhasil diperbarui.' : 'Profile photo updated successfully.' });
    } catch (err) {
      addToast({ type: 'error', title: isId ? 'Gagal' : 'Failed', message: err.message || (isId ? 'Gagal mengunggah foto.' : 'Failed to upload photo.') });
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCVSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Error', message: isId ? 'Ukuran CV maksimal 5MB.' : 'Maximum CV size is 5MB.' });
      return;
    }

    setUploadingCV(true);
    try {
      await usersApi.uploadCV(file);
      await refreshUser();
      addToast({ type: 'success', title: isId ? 'Berhasil' : 'Success', message: isId ? 'CV berhasil diunggah.' : 'CV uploaded successfully.' });
    } catch (err) {
      addToast({ type: 'error', title: isId ? 'Gagal' : 'Failed', message: err.message || (isId ? 'Gagal mengunggah CV.' : 'Failed to upload CV.') });
    } finally {
      setUploadingCV(false);
      e.target.value = '';
    }
  };

  const handleViewCV = async () => {
    setOpeningCV(true);
    try {
      await usersApi.viewMyCV();
    } catch (err) {
      addToast({ type: 'error', title: isId ? 'Gagal' : 'Failed', message: err.message || (isId ? 'Gagal membuka CV.' : 'Failed to open CV.') });
    } finally {
      setOpeningCV(false);
    }
  };

  const handleDownloadCV = async () => {
    setDownloadingCV(true);
    try {
      await usersApi.downloadMyCV();
    } catch (err) {
      addToast({ type: 'error', title: isId ? 'Gagal' : 'Failed', message: err.message || (isId ? 'Gagal mengunduh CV.' : 'Failed to download CV.') });
    } finally {
      setDownloadingCV(false);
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
      <h1 className="text-2xl font-bold text-gray-900">{isId ? 'Profil Saya' : 'My Profile'}</h1>

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
                {uploadingAvatar ? (isId ? 'Mengunggah...' : 'Uploading...') : (isId ? 'Ganti Foto' : 'Change Photo')}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4">CV & Resume</h3>
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  {user?.has_cv ? (isId ? 'CV sudah diunggah' : 'CV uploaded') : (isId ? 'Belum ada CV' : 'No CV uploaded')}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {isId
                    ? 'Butuh versi baru? Gunakan CV Builder untuk menyusun draft, unduh PDF, lalu pilih sendiri kapan menjadi CV akun aktif.'
                    : 'Need a tailored version? Use CV Builder to draft it, download a PDF, and choose when it becomes your active account CV.'}
                </p>
                {user?.has_cv && (
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleViewCV}
                      disabled={openingCV}
                    >
                      {openingCV ? (isId ? 'Membuka...' : 'Opening...') : (isId ? 'Lihat CV' : 'View CV')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDownloadCV}
                      disabled={downloadingCV}
                    >
                      {downloadingCV ? (isId ? 'Mengunduh...' : 'Downloading...') : (isId ? 'Unduh CV' : 'Download CV')}
                    </Button>
                  </div>
                )}
                <Link
                  to="/student/cv-builder"
                  className="mb-3 inline-flex w-full items-center justify-center rounded-lg border border-[#0f2854] px-3 py-2 text-sm font-medium text-[#0f2854] transition-colors hover:bg-[#0f2854] hover:text-white"
                >
                  {isId ? 'Buka CV Builder' : 'Open CV Builder'}
                </Link>
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
                  {uploadingCV ? (isId ? 'Mengunggah...' : 'Uploading...') : (user?.has_cv ? 'Update CV' : (isId ? 'Unggah CV' : 'Upload CV'))}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                {isId ? 'Informasi Pribadi' : 'Personal Information'}
              </h3>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={isId ? 'Nama Depan' : 'First Name'}
                    value={form.first_name}
                    onChange={handleChange('first_name')}
                  />
                  <Input
                    label={isId ? 'Nama Belakang' : 'Last Name'}
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
                    disabled
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={isId ? 'Nomor Telepon' : 'Phone Number'}
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                  <Input label={isId ? 'Jurusan' : 'Major'} value={form.major} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label={isId ? 'IPK Terakhir' : 'Latest GPA'} value={form.gpa} disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isId ? 'Tentang Saya' : 'About Me'}
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-y"
                    value={form.bio}
                    onChange={handleChange('bio')}
                    placeholder={isId ? 'Ceritakan tentang diri Anda...' : 'Tell us about yourself...'}
                  />
                </div>

                {saveMsg && (
                  <p
                    className={`text-sm ${saveMsgType === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {saveMsg}
                  </p>
                )}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (isId ? 'Menyimpan...' : 'Saving...') : (isId ? 'Simpan Perubahan' : 'Save Changes')}
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
