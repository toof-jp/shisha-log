export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format: YYYY-MM-DD HH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format: YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Convert local datetime string to ISO string for API
export const toISOStringLocal = (localDateTimeString: string): string => {
  // localDateTimeString is in format "YYYY-MM-DDTHH:mm"
  const date = new Date(localDateTimeString);
  return date.toISOString();
};

// Convert ISO string to local datetime string for form input
export const toLocalDateTimeString = (isoString: string): string => {
  const date = new Date(isoString);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // Return in format "YYYY-MM-DDTHH:mm" for datetime-local input
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get current local datetime string for form default value
export const getCurrentLocalDateTimeString = (): string => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};