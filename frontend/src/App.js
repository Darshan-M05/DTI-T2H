import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Translator from './components/Translator';
import Login from './components/Login';
import Register from './components/Register';
import HandwritingUpload from './components/HandwritingUpload';
import { Button } from '@mui/material';

function App() {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Language Translator</h1>
          {token && (
            <nav>
              <Link to="/">Home</Link>
              <Link to="/custom-handwriting">Customized Handwriting</Link>
              <Button onClick={handleLogout} color="secondary">
                Logout
              </Button>
            </nav>
          )}
        </header>
        <main>
          <Routes>
            <Route path="/" element={token ? <Translator /> : isRegistering ? <Register onRegister={toggleRegister} /> : <Login onLogin={handleLogin} />} />
            <Route path="/custom-handwriting" element={<HandwritingUpload />} />
          </Routes>
          {!token && (
            <Button onClick={toggleRegister} color="secondary">
              {isRegistering ? 'Back to Login' : 'Register'}
            </Button>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App; 