const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all employees
router.get('/', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 100;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM employees 
    WHERE active = TRUE
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [parseInt(limit), offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get total count
    db.query('SELECT COUNT(*) as total FROM employees WHERE active = TRUE', (err, countResult) => {
      res.json({
        data: results,
        total: countResult[0].total,
        page,
        limit
      });
    });
  });
});

// GET single employee by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM employees WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create employee
router.post('/', (req, res) => {
  const { employee_code, full_name, email, role_title, department, location, availability_percent } = req.body;
  
  if (!full_name) {
    return res.status(400).json({ error: 'full_name is required' });
  }
  
  const query = `
    INSERT INTO employees 
    (employee_code, full_name, email, role_title, department, location, availability_percent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    query,
    [employee_code, full_name, email, role_title, department, location, availability_percent || 100],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        employee_code,
        full_name,
        email,
        role_title,
        department,
        location,
        availability_percent: availability_percent || 100
      });
    }
  );
});

// PUT update employee
router.put('/:id', (req, res) => {
  const { full_name, email, role_title, department, location, availability_percent } = req.body;
  
  const query = `
    UPDATE employees 
    SET full_name = ?, email = ?, role_title = ?, department = ?, location = ?, availability_percent = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [full_name, email, role_title, department, location, availability_percent, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      res.json({ message: 'Employee updated successfully' });
    }
  );
});

// DELETE employee (soft delete)
router.delete('/:id', (req, res) => {
  const query = 'UPDATE employees SET active = FALSE WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  });
});

module.exports = router;
