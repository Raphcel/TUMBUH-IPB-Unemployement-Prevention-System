export const commonSkills = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'Data Analysis',
  'Machine Learning',
  'UI Design',
  'UX Research',
  'Product Management',
  'Digital Marketing',
  'Content Writing',
  'Public Speaking',
  'Leadership',
  'Agile',
  'Project Management',
  'Communication',
];

export function normalizeSkillLabel(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function normalizeSkillList(values = []) {
  const seen = new Set();
  return values
    .map(normalizeSkillLabel)
    .filter((value) => {
      const key = value.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getSkillSuggestions(selectedSkills = [], query = '', limit = 8) {
  const selected = new Set(normalizeSkillList(selectedSkills).map((skill) => skill.toLowerCase()));
  const term = query.trim().toLowerCase();

  return commonSkills
    .filter((skill) => !selected.has(skill.toLowerCase()))
    .filter((skill) => !term || skill.toLowerCase().includes(term))
    .slice(0, limit);
}
