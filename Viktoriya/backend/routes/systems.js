const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all systems
router.get('/', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 100;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM systems 
    WHERE active = TRUE
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [parseInt(limit), offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.query('SELECT COUNT(*) as total FROM systems WHERE active = TRUE', (err, countResult) => {
      res.json({
        data: results,
        total: countResult[0].total,
        page,
        limit
      });
    });
  });
});

// GET single system by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM systems WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create system
router.post('/', (req, res) => {
  const { system_code, name, owner_name, business_owner, technical_owner, environment, sensitivity } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  
  const query = `
    INSERT INTO systems 
    (system_code, name, owner_name, business_owner, technical_owner, environment, sensitivity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [system_code, name, owner_name, business_owner, technical_owner, environment || 'PROD', sensitivity || 'MEDIUM'],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        system_code,
        name,
        owner_name,
        business_owner,
        technical_owner,
        environment: environment || 'PROD',
        sensitivity: sensitivity || 'MEDIUM'
      });
    }
  );
});

// PUT update system
router.put('/:id', (req, res) => {
  const { name, owner_name, business_owner, technical_owner, environment, sensitivity } = req.body;
  
  const query = `
    UPDATE systems 
    SET name = ?, owner_name = ?, business_owner = ?, technical_owner = ?, environment = ?, sensitivity = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [name, owner_name, business_owner, technical_owner, environment, sensitivity, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'System not found' });
      }
      
      res.json({ message: 'System updated successfully' });
    }
  );
});

// DELETE system (soft delete)
router.delete('/:id', (req, res) => {
  const query = 'UPDATE systems SET active = FALSE WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    res.json({ message: 'System deleted successfully' });
  });
});

module.exports = router;
