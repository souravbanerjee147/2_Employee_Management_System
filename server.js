const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

// Disable browser cache for all routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes); // Handles /login, /register, etc.
app.use('/employees', employeeRoutes); // Handles employee dashboard

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
