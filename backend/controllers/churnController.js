const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? 'SELECT c.*, u.name as user_name FROM customer_churn c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC'
      : 'SELECT * FROM customer_churn WHERE user_id = ? ORDER BY created_at DESC';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { total_customers, lost_customers } = req.body;
    if (!total_customers || lost_customers === undefined) {
      return res.status(400).json({ message: 'total_customers and lost_customers are required' });
    }
    if (lost_customers > total_customers) {
      return res.status(400).json({ message: 'Lost customers cannot exceed total customers' });
    }
    const churn_rate = ((lost_customers / total_customers) * 100).toFixed(2);
    const [result] = await db.query(
      'INSERT INTO customer_churn (user_id, total_customers, lost_customers, churn_rate) VALUES (?, ?, ?, ?)',
      [req.user.id, total_customers, lost_customers, churn_rate]
    );
    res.status(201).json({ id: result.insertId, churn_rate, retention_rate: (100 - churn_rate).toFixed(2), message: 'Churn data saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, create };
