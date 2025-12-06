export const TAG_COLORS = [
  'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'
];

export const getTagColor = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date';
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Unknown Date' : date.toLocaleString();
  } catch {
    return 'Unknown Date';
  }
};

export const emptyForm = { 
  title: '', 
  notes: '', 
  link: '', 
  tags: [], 
  codes: [{ language: 'cpp', content: '', id: Date.now() }] 
};
