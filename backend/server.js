const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this before the translation endpoint
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

// Handwriting font styles mapping with multi-script support
const handwritingStyles = {
  'none': {
    fontFamily: 'inherit',
    name: 'Regular Text'
  },
  'caveat': {
    fontFamily: '"Caveat", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", "Noto Sans", cursive',
    name: 'Casual Handwriting'
  },
  'dancing-script': {
    fontFamily: '"Dancing Script", "Ma Shan Zheng", "Yuji Mai", cursive',
    name: 'Elegant Script'
  },
  'indie-flower': {
    fontFamily: '"Indie Flower", "Kaisei Decol", "ZCOOL KuaiLe", cursive',
    name: 'Fun Handwriting'
  },
  'homemade-apple': {
    fontFamily: '"Homemade Apple", "Zen Maru Gothic", "Liu Jian Mao Cao", cursive',
    name: 'Natural Handwriting'
  },
  'patrick-hand': {
    fontFamily: '"Patrick Hand", "Zen Kurenaido", "Zhi Mang Xing", cursive',
    name: 'Neat Handwriting'
  },
  'shadows-into-light': {
    fontFamily: '"Shadows Into Light", "Yomogi", "Zhi Mang Xing", cursive',
    name: 'Quick Notes'
  },
  'covered-by-your-grace': {
    fontFamily: '"Covered By Your Grace", "Stick", "Long Cang", cursive',
    name: 'Casual Notes'
  },
  'rock-salt': {
    fontFamily: '"Rock Salt", "Hachi Maru Pop", "Deng Xian", cursive',
    name: 'Chalk Style'
  }
};

async function translateWithRetry(text, sourceLang, targetLang, retries = 0) {
  try {
    console.log(`Attempting translation (retry ${retries})`);
    
    const response = await axios.get(MYMEMORY_URL, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
      },
      timeout: 10000,
    });

    if (response.data.responseStatus === 200) {
      return response.data.responseData.translatedText;
    } else {
      throw new Error(response.data.responseDetails || 'Translation failed');
    }
  } catch (error) {
    console.error('Translation attempt failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (retries < 3 && (error.code === 'ECONNABORTED' || error.response?.status === 429)) {
      console.log(`Retrying translation (${retries + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      return translateWithRetry(text, sourceLang, targetLang, retries + 1);
    }
    throw error;
  }
}

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang, handwritingStyle } = req.body;
    console.log('Translation request:', { text, sourceLang, targetLang, handwritingStyle });

    if (!text || !targetLang || !sourceLang) {
      console.log('Missing parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const translatedText = await translateWithRetry(text, sourceLang, targetLang);
    console.log('Translation successful:', translatedText);

    res.json({ 
      translatedText,
      fontFamily: handwritingStyles[handwritingStyle]?.fontFamily || handwritingStyles.none.fontFamily
    });
  } catch (error) {
    console.error('Translation error details:', error);
    
    const errorMessage = error.response?.status === 429 
      ? 'Too many requests. Please try again later.'
      : 'Translation failed. Please try again.';
    
    res.status(error.response?.status || 500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const SECRET_KEY = '7777d2510d4416ee7aa59610f41a4c8c'; // Use a secure key in production

// Login a user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 