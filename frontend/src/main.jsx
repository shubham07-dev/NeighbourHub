import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Set the base URL for all axios requests.
// In production, this uses VITE_API_URL from environment variables.
// In local development, if VITE_API_URL is empty, it falls back to the Vite proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Replace with your real Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
