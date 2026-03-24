/**
 * API Configuration & Utilities for Frontend
 * 
 * This file contains helper functions to interact with the EProvider API
 * Add this to your frontend JavaScript bundle
 */

// Determine API base URL
const API_BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.hostname}:3000/api`;

// API Client
const API = {
  // Employees
  getEmployees: (page = 1, limit = 100) => 
    fetch(`${API_BASE_URL}/employees?page=${page}&limit=${limit}`).then(r => r.json()),
  
  getEmployee: (id) => 
    fetch(`${API_BASE_URL}/employees/${id}`).then(r => r.json()),
  
  createEmployee: (data) =>
    fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  
  updateEmployee: (id, data) =>
    fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Systems
  getSystems: (page = 1, limit = 100) =>
    fetch(`${API_BASE_URL}/systems?page=${page}&limit=${limit}`).then(r => r.json()),
  
  getSystem: (id) =>
    fetch(`${API_BASE_URL}/systems/${id}`).then(r => r.json()),
  
  createSystem: (data) =>
    fetch(`${API_BASE_URL}/systems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Services
  getServices: (page = 1, limit = 100) =>
    fetch(`${API_BASE_URL}/services?page=${page}&limit=${limit}`).then(r => r.json()),
  
  createService: (data) =>
    fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Qualifications
  getQualifications: (employeeId = null, systemId = null) => {
    let url = `${API_BASE_URL}/qualifications`;
    const params = [];
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (systemId) params.push(`system_id=${systemId}`);
    if (params.length > 0) url += '?' + params.join('&');
    return fetch(url).then(r => r.json());
  },
  
  updateQualification: (id, data) =>
    fetch(`${API_BASE_URL}/qualifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Access Reviews
  getAccessReviews: (employeeId = null, systemId = null) => {
    let url = `${API_BASE_URL}/access`;
    const params = [];
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (systemId) params.push(`system_id=${systemId}`);
    if (params.length > 0) url += '?' + params.join('&');
    return fetch(url).then(r => r.json());
  },

  // Actions
  getActions: (status = null) =>
    fetch(`${API_BASE_URL}/actions${status ? '?status=' + status : ''}`).then(r => r.json()),
  
  createAction: (data) =>
    fetch(`${API_BASE_URL}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Config
  getConfig: () =>
    fetch(`${API_BASE_URL}/config`).then(r => r.json())
};

// Example Usage:
/*
// Load all employees
API.getEmployees()
  .then(result => {
    console.log('Employees:', result.data);
  })
  .catch(err => console.error('Error:', err));

// Create new employee
API.createEmployee({
  full_name: 'John Doe',
  department: 'IT',
  role_title: 'Developer',
  availability_percent: 100
})
  .then(emp => console.log('Created:', emp))
  .catch(err => console.error('Error:', err));

// Get qualifications for an employee
API.getQualifications(employeeId)
  .then(quals => console.log('Qualifications:', quals))
  .catch(err => console.error('Error:', err));
*/
