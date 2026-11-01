import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import Login from './components/Login';

const App = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('ainative_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ainative_token');
    if (token) {
      setAccessToken(token);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Failed to log in');
      }

      const data = await response.json();
      localStorage.setItem('ainative_token', data.access_token);
      setAccessToken(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setAccessToken('');
  };

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <header className="bg-dark-navy text-white p-4 flex justify-between items-center">
          <h1>Event Countdown</h1>
          <nav>
            {accessToken ? (
              <>
                <Link to="/" className="mr-4">Events</Link>
                <Link to="/create" className="mr-4">Create Event</Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </header>
        <main className="p-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <Routes>
            <Route path="/" element={accessToken ? <EventList /> : <Navigate to="/login" />} />
            <Route path="/create" element={accessToken ? <EventForm /> : <Navigate to="/login" />} />
            <Route path="/edit/:id" element={accessToken ? <EventForm /> : <Navigate to="/login" />} />
            <Route path="/delete/:id" element={accessToken ? <EventList /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </main>
      </Router>
    </AINativeProvider>
  );
};

export default App;