const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.use(ensureAuth);

// Show all employees
router.get('/', async (req, res) => {
  const [employees] = await db.execute('SELECT * FROM employee');
  res.render('employees', { employees });
});

// Add employee
router.post('/add', [
  body('name').notEmpty(),
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.redirect('/employees');

  const { name, email, position, department } = req.body;
  await db.execute(
    'INSERT INTO employee (name, email, position, department) VALUES (?, ?, ?, ?)',
    [name, email, position || null, department || null]
  );
  res.redirect('/employees');
});

// Edit employee (update)
router.post('/edit/:id', [
  body('name').notEmpty(),
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;

  if (!errors.isEmpty()) {
    return res.redirect('/employees');
  }

  const { name, email, position, department } = req.body;

  await db.execute(
    'UPDATE employee SET name = ?, email = ?, position = ?, department = ? WHERE id = ?',
    [name, email, position || null, department || null, id]
  );

  res.redirect('/employees');
});

// Delete employee
router.post('/delete/:id', async (req, res) => {
  const id = req.params.id;
  await db.execute('DELETE FROM employee WHERE id = ?', [id]);
  res.sendStatus(200);
});

module.exports = router;
