const db = require('../config/db');

const getRiskLevel = (loss) => {
  if (loss <= 1000) return 'Low';
  if (loss <= 5000) return 'Medium';
  return 'High';
};

const getAll = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? 'SELECT r.*, u.name as user_name FROM revenue_analysis r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC'
      : 'SELECT * FROM revenue_analysis WHERE user_id = ? ORDER BY created_at DESC';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { downtime_hours, revenue_per_hour } = req.body;
    if (!downtime_hours || !revenue_per_hour) {
      return res.status(400).json({ message: 'downtime_hours and revenue_per_hour are required' });
    }
    const revenue_loss = downtime_hours * revenue_per_hour;
    const risk_level = getRiskLevel(revenue_loss);
    const [result] = await db.query(
      'INSERT INTO revenue_analysis (user_id, downtime_hours, revenue_per_hour, revenue_loss, risk_level) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, downtime_hours, revenue_per_hour, revenue_loss, risk_level]
    );
    res.status(201).json({ id: result.insertId, revenue_loss, risk_level, message: 'Revenue analysis saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, create };
