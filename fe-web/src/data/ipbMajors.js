// Source: https://www.ipb.ac.id/page/program-studi-sarjana/
export const ipbMajors = [
  'Manajemen Sumberdaya Lahan',
  'Agronomi dan Hortikultura',
  'Proteksi Tanaman',
  'Arsitektur Lanskap',
  'Smart Agriculture',
  'Teknologi dan Manajemen Perikanan Budidaya',
  'Manajemen Sumberdaya Perairan',
  'Teknologi Hasil Perairan',
  'Teknologi dan Manajemen Perikanan Tangkap',
  'Ilmu dan Teknologi Kelautan',
  'Teknologi Produksi Ternak',
  'Nutrisi dan Teknologi Pakan',
  'Teknologi Hasil Ternak',
  'Manajemen Hutan',
  'Teknologi Hasil Hutan',
  'Konservasi Sumberdaya Hutan & Ekowisata',
  'Silvikultur',
  'Teknik Pertanian dan Biosistem',
  'Teknologi Pangan',
  'Teknik Industri Pertanian',
  'Teknik Sipil dan Lingkungan',
  'Teknik Mesin',
  'Teknik Kimia',
  'Meteorologi Terapan',
  'Biologi',
  'Kimia',
  'Fisika',
  'Biokimia',
  'Bioinformatika Bioinformatics',
  'Ekonomi Pembangunan',
  'Manajemen',
  'Agribisnis',
  'Ekonomi Sumberdaya dan Lingkungan',
  'Ilmu Ekonomi Syariah',
  'Ilmu Keluarga dan Konsumen',
  'Komunikasi dan Pengembangan Masyarakat',
  'Kedokteran',
  'Ilmu Gizi',
  'Bisnis',
  'Kedokteran Hewan',
  'Sains Biomedis',
  'Statistika dan Sains Data',
  'Matematika',
  'Ilmu Komputer',
  'Aktuaria',
  'Kecerdasan Buatan',
];

export function buildMajorOptions(extraValues = []) {
  const seen = new Set();
  return [...extraValues, ...ipbMajors]
    .map((value) => (value || '').trim())
    .filter((value) => {
      const key = value.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((value) => ({ value, label: value }));
}
