/**
 * Formats an ISO date string to a standard local date format (DD/MM/YYYY).
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  return date.toLocaleDateString('fr-FR');
};

/**
 * Formats an ISO date string into a long friendly format (e.g., "lundi 1 janvier 2026").
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatLongDate = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats an ISO date string into a short weekday and date format (e.g., "lun. 1 janv. 2026").
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatShortDate = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats an ISO timestamp or date into HH:MM.
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatTime = (dateVal) => {
  if (!dateVal) return '--:--';
  const date = new Date(dateVal);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats an ISO timestamp or date into HH:MM:SS.
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatFullTime = (dateVal) => {
  if (!dateVal) return '--:--:--';
  const date = new Date(dateVal);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Formats decimal hours worked into a readable string (e.g., 7.5 -> "7.5h" or "7h 30m").
 * @param {number|string} hours 
 * @returns {string}
 */
export const formatHours = (hours) => {
  if (hours === undefined || hours === null) return 'En cours...';
  const numHours = parseFloat(hours);
  if (isNaN(numHours)) return 'En cours...';
  
  const h = Math.floor(numHours);
  const m = Math.round((numHours - h) * 60);
  
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
