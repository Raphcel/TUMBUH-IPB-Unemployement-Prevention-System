import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { companiesApi } from '../../api/companies';

import { motion } from 'framer-motion';

export function ProfilPerusahaanHR() {
  const { user } = useAuth();
  // ... (keep state)
  const companyId = user?.company_id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    async function fetchCompany() {
      try {
        const data = await companiesApi.get(companyId);
        setCompany(data);
        setForm({
          name: data.name || '',
          industry: data.industry || '',
          location: data.location || '',
          website: data.website || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Failed to load company', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [companyId]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await companiesApi.update(companyId, form);
      setSaveMsg('Profil perusahaan berhasil disimpan!');
    } catch (err) {
      setSaveMsg('Gagal menyimpan profil.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const logoUrl =
    company?.logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name || 'C')}&background=0f2854&color=fff&size=128`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">Profil Perusahaan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={logoUrl}
                alt={company?.name}
                className="w-32 h-32 rounded-lg mb-4 bg-gray-100 object-contain p-2"
              />
              <Button variant="outline" size="sm" className="w-full">
                Upload Logo Baru
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardBody>
              <form className="space-y-4" onSubmit={handleSave}>
                <Input
                  label="Nama Perusahaan"
                  value={form.name}
                  onChange={handleChange('name')}
                />
                <Input
                  label="Industri"
                  value={form.industry}
                  onChange={handleChange('industry')}
                />
                <Input
                  label="Lokasi Kantor Pusat"
                  value={form.location}
                  onChange={handleChange('location')}
                />
                <Input
                  label="Website"
                  value={form.website}
                  onChange={handleChange('website')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Perusahaan
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                    rows={6}
                    value={form.description}
                    onChange={handleChange('description')}
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
