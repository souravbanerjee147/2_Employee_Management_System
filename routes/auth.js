// auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// GET: Login page
router.get('/login', (req, res) => {
  const error = req.flash('error')[0];  // get the first error message from flash
  const success = req.flash('success')[0];
  const showRegister = req.flash('showRegister')[0] === 'true' || false;
  res.render('login', { error, success, showRegister });
});

// POST: Login
router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'All fields are required');
    return res.redirect('/login');
  }

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    req.session.userId = rows[0].id;
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// POST: Register
router.post('/register', [
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('confirmPassword').notEmpty()
], async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('error', 'All fields are required');
    req.flash('showRegister', true);
    return res.redirect('/login');
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    req.flash('showRegister', true);
    return res.redirect('/login');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Username already exists');
      req.flash('showRegister', true);
      return res.redirect('/login');
    }
    console.error("❌ Registration error:", err);
    res.status(500).send('Registration error');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});


module.exports = router;
