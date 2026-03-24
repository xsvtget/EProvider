const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all access reviews
router.get('/', (req, res) => {
  const { employee_id, system_id } = req.query;
  
  let query = 'SELECT * FROM access_reviews WHERE 1=1';
  const params = [];
  
  if (employee_id) {
    query += ' AND employee_id = ?';
    params.push(employee_id);
  }
  
  if (system_id) {
    query += ' AND system_id = ?';
    params.push(system_id);
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET single access review
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM access_reviews WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Access review not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create access review
router.post('/', (req, res) => {
  const { employee_id, system_id, access_type, requested, approved } = req.body;
  
  if (!employee_id || !system_id) {
    return res.status(400).json({ error: 'employee_id and system_id are required' });
  }
  
  const query = `
    INSERT INTO access_reviews 
    (employee_id, system_id, access_type, requested, approved)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    access_type = ?,
    requested = ?,
    approved = ?
  `;
  
  db.query(
    query,
    [
      employee_id, system_id, access_type || 'NONE', requested || false, approved || false,
      access_type || 'NONE', requested || false, approved || false
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        employee_id,
        system_id,
        access_type: access_type || 'NONE',
        requested: requested || false,
        approved: approved || false
      });
    }
  );
});

module.exports = router;
