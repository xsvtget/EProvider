const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET all config
router.get('/', (req, res) => {
  const query = 'SELECT * FROM app_config ORDER BY config_key ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Transform to object format
    const config = {};
    results.forEach(item => {
      config[item.config_key] = item.config_value;
    });
    
    res.json(config);
  });
});

// GET single config
router.get('/:key', (req, res) => {
  const query = 'SELECT * FROM app_config WHERE config_key = ?';
  
  db.query(query, [req.params.key], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Config key not found' });
    }
    
    res.json(results[0]);
  });
});

// PUT update config
router.put('/:key', (req, res) => {
  const { config_value, value_type, description } = req.body;
  
  if (!config_value) {
    return res.status(400).json({ error: 'config_value is required' });
  }
  
  const query = `
    UPDATE app_config 
    SET config_value = ?, value_type = ?, description = ?
    WHERE config_key = ?
  `;
  
  db.query(
    query,
    [config_value, value_type || 'STRING', description, req.params.key],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Config key not found' });
      }
      
      res.json({ message: 'Config updated successfully' });
    }
  );
});

module.exports = router;
