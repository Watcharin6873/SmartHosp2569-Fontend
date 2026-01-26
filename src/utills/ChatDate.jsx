// utils/chatDate.js
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const formatTime = (date) =>
  date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

export const formatDate = (date) =>
  date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
