const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all actions
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  
  let query = 'SELECT * FROM actions WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  query += ' ORDER BY due_date ASC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET single action
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM actions WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create action
router.post('/', (req, res) => {
  const { service_id, employee_id, system_id, title, description, owner_name, status, priority, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  
  const query = `
    INSERT INTO actions 
    (service_id, employee_id, system_id, title, description, owner_name, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [service_id || null, employee_id || null, system_id || null, title, description, owner_name, status || 'OPEN', priority || 'MEDIUM', due_date || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        title,
        status: status || 'OPEN',
        priority: priority || 'MEDIUM'
      });
    }
  );
});

// PUT update action
router.put('/:id', (req, res) => {
  const { title, description, owner_name, status, priority, due_date } = req.body;
  
  const query = `
    UPDATE actions 
    SET title = ?, description = ?, owner_name = ?, status = ?, priority = ?, due_date = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [title, description, owner_name, status, priority, due_date, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Action not found' });
      }
      
      res.json({ message: 'Action updated successfully' });
    }
  );
});

// DELETE action
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM actions WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }
    
    res.json({ message: 'Action deleted successfully' });
  });
});

module.exports = router;
