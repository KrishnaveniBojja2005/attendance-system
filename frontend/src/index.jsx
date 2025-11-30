import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setToken } from './api';
import useAuthStore from './store/authStore';

const token = localStorage.getItem('token');
if (token) setToken(token);

createRoot(document.getElementById('root')).render(<App />);
