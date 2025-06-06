// Common helper functions
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};
export const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('sr-RS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
