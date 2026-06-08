const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const { id } = req.params;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET name=?, email=?, role=?, password=? WHERE id=?', [name, email, role, hashed, id]);
    } else {
      await db.query('UPDATE users SET name=?, email=?, role=? WHERE id=?', [name, email, role, id]);
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
