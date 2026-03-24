const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all qualifications
router.get('/', (req, res) => {
  const { employee_id, system_id } = req.query;
  
  let query = 'SELECT * FROM qualifications WHERE 1=1';
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

// GET single qualification
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM qualifications WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Qualification not found' });
    }
    
    res.json(results[0]);
  });
});

// POST create/update qualification
router.post('/', (req, res) => {
  const { employee_id, system_id, experience_score, certification_points, knowledge_score, qualification_level } = req.body;
  
  if (!employee_id || !system_id) {
    return res.status(400).json({ error: 'employee_id and system_id are required' });
  }
  
  const total_score = (experience_score || 0) + (certification_points || 0) + (knowledge_score || 0);
  
  const query = `
    INSERT INTO qualifications 
    (employee_id, system_id, experience_score, certification_points, knowledge_score, total_score, qualification_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    experience_score = ?,
    certification_points = ?,
    knowledge_score = ?,
    total_score = ?,
    qualification_level = ?
  `;
  
  db.query(
    query,
    [
      employee_id, system_id, experience_score || 0, certification_points || 0, knowledge_score || 0, total_score, qualification_level || 'NONE',
      experience_score || 0, certification_points || 0, knowledge_score || 0, total_score, qualification_level || 'NONE'
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: result.insertId,
        employee_id,
        system_id,
        experience_score: experience_score || 0,
        certification_points: certification_points || 0,
        knowledge_score: knowledge_score || 0,
        total_score,
        qualification_level: qualification_level || 'NONE'
      });
    }
  );
});

// PUT update qualification
router.put('/:id', (req, res) => {
  const { experience_score, certification_points, knowledge_score, qualification_level } = req.body;
  const total_score = (experience_score || 0) + (certification_points || 0) + (knowledge_score || 0);
  
  const query = `
    UPDATE qualifications 
    SET experience_score = ?, certification_points = ?, knowledge_score = ?, total_score = ?, qualification_level = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [experience_score || 0, certification_points || 0, knowledge_score || 0, total_score, qualification_level || 'NONE', req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Qualification not found' });
      }
      
      res.json({ message: 'Qualification updated successfully' });
    }
  );
});

// DELETE qualification
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM qualifications WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Qualification not found' });
    }
    
    res.json({ message: 'Qualification deleted successfully' });
  });
});

module.exports = router;
