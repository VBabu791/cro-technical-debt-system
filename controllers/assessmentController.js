const db = require('../config/db');

const calcFinalScore = (d) =>
  d.crm_score * 0.25 + d.website_score * 0.20 + d.customer_score * 0.20 +
  d.integration_score * 0.15 + d.data_score * 0.10 + d.reporting_score * 0.10;

const getAll = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? 'SELECT a.*, u.name as user_name FROM assessments a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
      : 'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(query, req.user.role === 'admin' ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  try {
    const { crm_score, website_score, customer_score, integration_score, data_score, reporting_score } = req.body;
    const final_score = calcFinalScore({ crm_score, website_score, customer_score, integration_score, data_score, reporting_score });
    const [result] = await db.query(
      'INSERT INTO assessments (user_id, crm_score, website_score, customer_score, integration_score, data_score, reporting_score, final_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, crm_score, website_score, customer_score, integration_score, data_score, reporting_score, final_score.toFixed(2)]
    );
    const payload = { id: result.insertId, final_score: +final_score.toFixed(2), crm_score, website_score, user_name: req.user.name, created_at: new Date() };
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.to('dashboard:all').emit('assessment:new', payload);
    res.status(201).json({ ...payload, message: 'Assessment saved' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  try {
    const { crm_score, website_score, customer_score, integration_score, data_score, reporting_score } = req.body;
    const final_score = calcFinalScore({ crm_score, website_score, customer_score, integration_score, data_score, reporting_score });
    await db.query(
      'UPDATE assessments SET crm_score=?, website_score=?, customer_score=?, integration_score=?, data_score=?, reporting_score=?, final_score=? WHERE id=? AND user_id=?',
      [crm_score, website_score, customer_score, integration_score, data_score, reporting_score, final_score.toFixed(2), req.params.id, req.user.id]
    );
    res.json({ message: 'Assessment updated', final_score: final_score.toFixed(2) });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await db.query('DELETE FROM assessments WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, create, update, remove };
