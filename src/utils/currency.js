export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    // Fallback
    const n = Number(amount || 0).toFixed(2);
    return `₦${n.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};
