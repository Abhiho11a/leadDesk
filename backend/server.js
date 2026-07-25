const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

// Required to trust load balancers/reverse proxies (Render, Vercel, Heroku, Railway, etc.)
// Without this, secure cookies won't be set when SSL is terminated at the proxy!
app.set('trust proxy', 1);

app.use(cors({
  origin: function (origin, callback) {
    callback(null, origin || true);
  },
  credentials: true,
}));
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leaddesk-mini';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const isSecure = process.env.NODE_ENV === 'production' || 
                 process.env.RENDER || 
                 process.env.SECURE_COOKIES === 'true' ||
                 (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    httpOnly: true,
    secure: isSecure ? true : false,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use('/api', apiRoutes);

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
