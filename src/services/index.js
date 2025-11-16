import api from './api';

export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  addReview: async (productId, payload) => {
    const response = await api.post(`/products/${productId}/reviews`, payload);
    return response.data;
  },
  adjustInventory: async (productId, payload) => {
    const response = await api.post(`/products/${productId}/inventory/adjust`, payload);
    return response.data;
  },
  getInventoryHistory: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/inventory/history`, { params });
    return response.data;
  }
};

export const uploadService = {
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const response = await api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const categoryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/categories', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/categories/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  pay: async (id, paymentData) => {
    const response = await api.put(`/orders/${id}/pay`, paymentData);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
  deliver: async (id) => {
    const response = await api.put(`/orders/${id}/deliver`);
    return response.data;
  },
  updateStatus: async (id, status, note) => {
    const response = await api.put(`/orders/${id}/status`, { status, note });
    return response.data;
  },
  ship: async (id, payload) => {
    const response = await api.put(`/orders/${id}/ship`, payload);
    return response.data;
  }
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  bulkAction: async (action, userIds) => {
    const response = await api.post(`/admin/users/bulk`, { action, userIds });
    return response.data;
  },

  exportUsers: async () => {
    const response = await api.get('/admin/users/export', { responseType: 'blob' });
    return response.data;
  }
};

const getAddressPath = (type) => {
  return type === 'billing' ? '/users/profile/billing-address' : '/users/profile/shipping-address';
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (payload) => {
    const response = await api.put('/users/profile', payload);
    return response.data;
  },
  addAddress: async (type, payload) => {
    const response = await api.post(getAddressPath(type), payload);
    return response.data;
  },
  updateAddress: async (type, addressId, payload) => {
    const response = await api.put(`${getAddressPath(type)}/${addressId}`, payload);
    return response.data;
  },
  deleteAddress: async (type, addressId) => {
    const response = await api.delete(`${getAddressPath(type)}/${addressId}`);
    return response.data;
  }
};

export const authService = {
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (payload) => {
    // Accept both frontend shape and backend shape; normalize to backend
    const body = {
      email: payload.email,
      token: payload.token || payload.verificationCode,
      newPassword: payload.newPassword || payload.password,
    };
    const response = await api.post('/auth/reset-password', body);
    return response.data;
  },
  resendVerification: async (email) => {
    const response = await api.post('/auth/reset-verification', { email });
    return response.data;
  }
};

export const chatbotService = {
  startSession: async (payload = {}) => {
    const response = await api.post('/chatbot/sessions', payload);
    return response.data;
  },
  listSessions: async () => {
    const response = await api.get('/chatbot/sessions');
    return response.data;
  },
  getSession: async (sessionId) => {
    const response = await api.get(`/chatbot/sessions/${sessionId}`);
    return response.data;
  },
  sendMessage: async (sessionId, message) => {
    const response = await api.post(`/chatbot/sessions/${sessionId}/messages`, { message });
    return response.data;
  },
  resolveSession: async (sessionId) => {
    const response = await api.post(`/chatbot/sessions/${sessionId}/resolve`);
    return response.data;
  }
};
