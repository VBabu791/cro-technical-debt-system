const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? 'SELECT l.*, u.name as user_name FROM lead_conversion l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC'
      : 'SELECT * FROM lead_conversion WHERE user_id = ? ORDER BY created_at DESC';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { total_leads, converted_leads } = req.body;
    if (!total_leads || converted_leads === undefined) {
      return res.status(400).json({ message: 'total_leads and converted_leads are required' });
    }
    if (converted_leads > total_leads) {
      return res.status(400).json({ message: 'Converted leads cannot exceed total leads' });
    }
    const conversion_rate = ((converted_leads / total_leads) * 100).toFixed(2);
    const [result] = await db.query(
      'INSERT INTO lead_conversion (user_id, total_leads, converted_leads, conversion_rate) VALUES (?, ?, ?, ?)',
      [req.user.id, total_leads, converted_leads, conversion_rate]
    );
    res.status(201).json({ id: result.insertId, conversion_rate, message: 'Lead conversion data saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, create };
