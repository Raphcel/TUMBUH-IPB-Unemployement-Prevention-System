import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { opportunitiesApi } from '../../api/opportunities';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';

export function FormLowongan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { lang } = useTranslation();
  const isEdit = Boolean(id);
  const isId = lang === 'id';

  const [form, setForm] = useState({
    title: '',
    type: 'Internship',
    location: '',
    salary: '',
    description: '',
    requirements: [''],
    deadline: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    opportunitiesApi
      .get(id)
      .then((data) => {
        setForm({
          title: data.title || '',
          type: data.type || 'Internship',
          location: data.location || '',
          salary: data.salary || '',
          description: data.description || '',
          requirements:
            Array.isArray(data.requirements) && data.requirements.length > 0
              ? data.requirements
              : [''],
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
          is_active: data.is_active !== false,
        });
      })
      .catch(() => {
        addToast({ type: 'error', title: 'Error', message: isId ? 'Gagal memuat data lowongan.' : 'Failed to load opportunity data.' });
        navigate('/hr/opportunities');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleReqChange = (index) => (e) => {
    const reqs = [...form.requirements];
    reqs[index] = e.target.value;
    setForm({ ...form, requirements: reqs });
  };

  const addRequirement = () => {
    setForm({ ...form, requirements: [...form.requirements, ''] });
  };

  const removeRequirement = (index) => {
    const reqs = form.requirements.filter((_, i) => i !== index);
    setForm({ ...form, requirements: reqs.length > 0 ? reqs : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.location) {
      addToast({ type: 'error', title: isId ? 'Validasi' : 'Validation', message: isId ? 'Judul, tipe, dan lokasi wajib diisi.' : 'Title, type, and location are required.' });
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      requirements: form.requirements.filter((r) => r.trim() !== ''),
      deadline: form.deadline || null,
      salary: form.salary || null,
      description: form.description || null,
    };

    try {
      if (isEdit) {
        await opportunitiesApi.update(id, payload);
        addToast({ type: 'success', title: isId ? 'Berhasil' : 'Success', message: isId ? 'Lowongan berhasil diperbarui.' : 'Opportunity updated successfully.' });
      } else {
        await opportunitiesApi.create(payload);
        addToast({ type: 'success', title: isId ? 'Berhasil' : 'Success', message: isId ? 'Lowongan baru berhasil dibuat.' : 'New opportunity created successfully.' });
      }
      navigate('/hr/opportunities');
    } catch (err) {
      addToast({ type: 'error', title: isId ? 'Gagal' : 'Failed', message: err.message || (isId ? 'Terjadi kesalahan.' : 'Something went wrong.') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/hr/opportunities')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? (isId ? 'Edit Lowongan' : 'Edit Opportunity') : (isId ? 'Buat Lowongan Baru' : 'Create New Opportunity')}
        </h1>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label={isId ? 'Judul Posisi' : 'Position Title'}
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Contoh: Frontend Developer Intern"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isId ? 'Tipe' : 'Type'}</label>
                <Select
                  value={form.type}
                  onChange={handleChange('type')}
                  options={[
                    { value: 'Internship', label: 'Internship' },
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Scholarship', label: 'Scholarship' },
                  ]}
                />
              </div>
              <Input
                label={isId ? 'Lokasi' : 'Location'}
                value={form.location}
                onChange={handleChange('location')}
                placeholder="Contoh: Jakarta, Indonesia"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={isId ? 'Gaji (opsional)' : 'Salary (optional)'}
                value={form.salary}
                onChange={handleChange('salary')}
                placeholder="Contoh: Rp 3.000.000 - Rp 5.000.000"
              />
              <Input
                label={isId ? 'Deadline (opsional)' : 'Deadline (optional)'}
                type="date"
                value={form.deadline}
                onChange={handleChange('deadline')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isId ? 'Deskripsi' : 'Description'}</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-y"
                value={form.description}
                onChange={handleChange('description')}
                placeholder={isId ? 'Deskripsikan lowongan ini...' : 'Describe this opportunity...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isId ? 'Persyaratan' : 'Requirements'}</label>
              <div className="space-y-2">
                {form.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={req}
                      onChange={handleReqChange(index)}
                      placeholder={`Persyaratan ${index + 1}`}
                      className="flex-1"
                    />
                    {form.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="mt-2 text-sm text-primary hover:text-accent flex items-center gap-1 font-medium"
              >
                <Plus size={14} /> {isId ? 'Tambah Persyaratan' : 'Add Requirement'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={handleChange('is_active')}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                {isId ? 'Lowongan aktif' : 'Active opportunity'}
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/hr/opportunities')}
              >
                {isId ? 'Batal' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (isId ? 'Menyimpan...' : 'Saving...') : isEdit ? (isId ? 'Simpan Perubahan' : 'Save Changes') : (isId ? 'Buat Lowongan' : 'Create Opportunity')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
