import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const testService = {
  getAll: async () => {
    const response = await api.get('/tests');
    return response.data;
  },

  getAssigned: async () => {
    const response = await api.get('/tests/assigned');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  create: async (testData) => {
    const response = await api.post('/tests', testData);
    return response.data;
  },

  update: async (id, testData) => {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  assignToStudent: async (testId, studentId, dueDate) => {
    const response = await api.post('/users/assign-test', {
      test_id: testId,
      student_id: studentId,
      due_date: dueDate
    });
    return response.data;
  }
};

export const questionService = {
  getByTestId: async (testId) => {
    const response = await api.get(`/questions/test/${testId}`);
    return response.data;
  },

  create: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  update: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  }
};

export const attemptService = {
  submit: async (testId, answers) => {
    const response = await api.post('/attempts/submit', {
      test_id: testId,
      answers
    });
    return response.data;
  },

  getMyAttempts: async (testId) => {
    const response = await api.get(`/attempts/my-attempts/${testId}`);
    return response.data;
  },

  getTestAttempts: async (testId) => {
    const response = await api.get(`/attempts/test/${testId}`);
    return response.data;
  },

  getAttemptDetails: async (attemptId) => {
    const response = await api.get(`/attempts/attempt/${attemptId}`);
    return response.data;
  }
};

export const userService = {
  getStudents: async () => {
    const response = await api.get('/users/students');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};
