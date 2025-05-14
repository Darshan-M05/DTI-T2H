import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Translator from './components/Translator';
import Login from './components/Login';
import Register from './components/Register';
import HandwritingUpload from './components/HandwritingUpload';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

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
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'left' }}>
              Language Translator
            </Typography>
            {token && (
              <>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/custom-handwriting">Customized Handwriting</Button>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container>
          <main style={{ marginTop: '20px' }}>
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
        </Container>
      </div>
    </Router>
  );
}

export default App;