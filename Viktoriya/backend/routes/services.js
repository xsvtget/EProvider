const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all services
router.get('/', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 100;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM services 
    WHERE active = TRUE
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [parseInt(limit), offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.query('SELECT COUNT(*) as total FROM services WHERE active = TRUE', (err, countResult) => {
      res.json({
        data: results,
        total: countResult[0].total,
        page,
        limit
      });
    });
  });
});

// GET single service by ID  
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM services WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create service
router.post('/', (req, res) => {
  const { service_code, name, owner_name, criticality, min_qualified, preferred_qualified } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  
  const query = `
    INSERT INTO services 
    (service_code, name, owner_name, criticality, min_qualified, preferred_qualified)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [service_code, name, owner_name, criticality || 'MEDIUM', min_qualified || 1, preferred_qualified || 2],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        service_code,
        name,
        owner_name,
        criticality: criticality || 'MEDIUM',
        min_qualified: min_qualified || 1,
        preferred_qualified: preferred_qualified || 2
      });
    }
  );
});

// PUT update service
router.put('/:id', (req, res) => {
  const { name, owner_name, criticality, min_qualified, preferred_qualified } = req.body;
  
  const query = `
    UPDATE services 
    SET name = ?, owner_name = ?, criticality = ?, min_qualified = ?, preferred_qualified = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [name, owner_name, criticality, min_qualified, preferred_qualified, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json({ message: 'Service updated successfully' });
    }
  );
});

// DELETE service (soft delete)
router.delete('/:id', (req, res) => {
  const query = 'UPDATE services SET active = FALSE WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  });
});

module.exports = router;
