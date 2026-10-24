export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Active', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    case 'planning':
      return { label: 'Planning', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    case 'on_hold':
      return { label: 'On Hold', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
    case 'archived':
      return { label: 'Archived', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  }
};

export const getRoleBadgeVariant = (role) => {
  switch (role) {
    case 'owner':
      return { label: 'Owner', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
    case 'admin':
      return { label: 'Admin', bg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
    case 'member':
      return { label: 'Member', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    default:
      return { label: role, bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
