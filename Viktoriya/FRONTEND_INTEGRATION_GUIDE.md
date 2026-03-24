# Frontend Integration Checklist

This checklist guides you through integrating the new API backend into the `index.html` frontend.

## Phase 1: Preparation
- [ ] Backup current `index.html`
- [ ] Review `frontend/app/api-client.js` 
- [ ] Understand API structure in `backend/README.md`
- [ ] Start backend with: `docker-compose up -d`
- [ ] Verify API health: `curl http://localhost:3000/api/health`

## Phase 2: API Client Integration

### Add API Client Script
- [ ] Include `api-client.js` in `index.html` head:
```html
<script src="api-client.js"></script>
```

### Update Data Loading Functions
- [ ] Replace localStorage load with API calls
  - OLD: `JSON.parse(localStorage.getItem('eprovider_db'))`
  - NEW: `await API.getEmployees()`

- [ ] Update employee loading:
```javascript
// OLD - Before
let employees = data.db.employees;

// NEW - After
const result = await API.getEmployees();
let employees = result.data;
```

- [ ] Update systems loading:
```javascript
// NEW
const systems = await API.getSystems();
```

- [ ] Update services loading:
```javascript
// NEW (if needed)
const services = await API.getServices();
```

## Phase 3: Data Saving Functions

### Export Functionality
- [ ] Update Export JSON button:
```javascript
// OLD
function exportJSON() {
  // Save to localStorage...
}

// NEW
function exportJSON() {
  // Fetch from API and download
  const data = {
    employees: await API.getEmployees(),
    systems: await API.getSystems(),
    // ... etc
  };
  // Download as JSON file
}
```

### Create Operations
- [ ] Update employee creation:
```javascript
// When adding new employee in form
await API.createEmployee({
  full_name: formData.name,
  department: formData.dept,
  // ... other fields
});
// Refresh list
loadEmployees();
```

- [ ] Update system creation:
```javascript
await API.createSystem({
  name: formData.name,
  environment: formData.env,
  // ... other fields
});
```

### Update Operations
- [ ] Update employee editing:
```javascript
await API.updateEmployee(employeeId, {
  full_name: newName,
  department: newDept,
  // ... other fields
});
```

- [ ] Update qualification scoring:
```javascript
await API.updateQualification(qualId, {
  experience_score: score1,
  certification_points: score2,
  knowledge_score: score3,
  qualification_level: computedLevel
});
```

## Phase 4: Matrix/Grid Operations

### Load Competence Matrix
```javascript
// OLD - Load from local data
function loadMatrix() {
  let data = window.DB;
  // render matrix...
}

// NEW - Load from API
async function loadMatrix() {
  const qualifications = await API.getQualifications();
  const employees = await API.getEmployees();
  const systems = await API.getSystems();
  // Build matrix from these datasets
  // render matrix...
}
```

### Update Matrix Cell
```javascript
// When user edits a cell in the matrix
async function updateMatrixCell(employeeId, systemId, newScore) {
  // Find or create qualification
  const qualifications = await API.getQualifications();
  let qual = qualifications.find(q => 
    q.employee_id === employeeId && q.system_id === systemId
  );
  
  if (qual) {
    await API.updateQualification(qual.id, { total_score: newScore });
  } else {
    await API.createQualification({
      employee_id: employeeId,
      system_id: systemId,
      total_score: newScore
    });
  }
  
  // Refresh matrix
  loadMatrix();
}
```

## Phase 5: Delete Operations

### Soft Delete Employees
```javascript
async function deleteEmployee(id) {
  if (confirm('Delete this employee?')) {
    await API.deleteEmployee(id);
    // Refresh list
    loadEmployees();
  }
}
```

### Delete Qualifications
```javascript
async function deleteQualification(id) {
  await API.deleteQualification(id);
  loadMatrix();
}
```

## Phase 6: Form Operations

### Employee Form
```javascript
function handleEmployeeForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  
  const data = {
    full_name: formData.get('full_name'),
    role_title: formData.get('role'),
    department: formData.get('dept'),
    location: formData.get('location'),
    availability_percent: parseFloat(formData.get('availability') || 100)
  };
  
  API.createEmployee(data).then(() => {
    loadEmployees();
    event.target.reset();
  });
}
```

### System Form
```javascript
function handleSystemForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  
  const data = {
    system_code: formData.get('code'),
    name: formData.get('name'),
    environment: formData.get('environment'),
    sensitivity: formData.get('sensitivity'),
    business_owner: formData.get('business_owner'),
    technical_owner: formData.get('technical_owner')
  };
  
  API.createSystem(data).then(() => {
    loadSystems();
    event.target.reset();
  });
}
```

## Phase 7: Undo/History (Advanced)

### Implement Undo Functionality
- [ ] Store operation history in session memory
- [ ] Implement rollback for last operation
```javascript
const operationHistory = [];

async function performAction(action) {
  operationHistory.push({
    type: action.type,
    data: action.data,
    timestamp: new Date()
  });
  
  // Perform action...
}

function undo() {
  if (operationHistory.length === 0) return;
  const lastOp = operationHistory.pop();
  // Reverse the operation...
}
```

## Phase 8: Error Handling

### Add Error Handlers
- [ ] Wrap API calls in try-catch:
```javascript
async function loadEmployees() {
  try {
    const result = await API.getEmployees();
    renderEmployees(result.data);
  } catch (error) {
    console.error('Failed to load employees:', error);
    showNotification('Error loading employees', 'error');
  }
}
```

### Network Error Handling
- [ ] Add retry logic:
```javascript
async function apiCallWithRetry(apiFunc, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunc();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

## Phase 9: Performance Optimization

### Add Caching
- [ ] Cache employees list (5 minute TTL):
```javascript
const cache = {
  employees: null,
  employeesTime: 0,
  CACHE_DURATION: 5 * 60 * 1000
};

async function getCachedEmployees() {
  const now = Date.now();
  if (cache.employees && (now - cache.employeesTime) < cache.CACHE_DURATION) {
    return cache.employees;
  }
  const data = await API.getEmployees();
  cache.employees = data;
  cache.employeesTime = now;
  return data;
}
```

### Pagination
- [ ] Implement for large datasets:
```javascript
async function loadEmployeesPaginated(page = 1, pageSize = 50) {
  const result = await API.getEmployees(page, pageSize);
  renderPagination(result.page, Math.ceil(result.total / pageSize));
  renderEmployees(result.data);
}
```

## Phase 10: Testing

### Test Each Endpoint
- [ ] Test GET employees
- [ ] Test POST new employee
- [ ] Test PUT update employee
- [ ] Test DELETE employee
- [ ] Test qualification updates
- [ ] Test action creation
- [ ] Test filters and searches

### Browser Testing
- [ ] Check browser console for errors
- [ ] Verify Network tab (check API calls)
- [ ] Test on mobile responsiveness
- [ ] Test all UI interactions

### Database Verification
```bash
# Verify data in database
docker exec eprovider_db mariadb -u eprovider_user -p eprovider -e "
  SELECT COUNT(*) as employee_count FROM employees;
  SELECT COUNT(*) as qualification_count FROM qualifications;
  SELECT * FROM employees LIMIT 5;
"
```

## Phase 11: Deployment Preparation

- [ ] Update `.env` with production values
- [ ] Hide sensitive data from logs
- [ ] Enable HTTPS in production
- [ ] Add authentication (if needed)
- [ ] Set up backups
- [ ] Create monitoring/alerts
- [ ] Document API in OpenAPI/Swagger (optional)

## Phase 12: Go Live

- [ ] Final testing on production environment
- [ ] Backup existing data
- [ ] Disable old localStorage code
- [ ] Monitor for errors first 24h
- [ ] Have rollback plan ready

## Integration Examples

### Complete Page Load Example
```javascript
async function initializePage() {
  try {
    // Load all data in parallel
    const [employees, systems, services, qualifications, config] = await Promise.all([
      API.getEmployees().then(r => r.data),
      API.getSystems().then(r => r.data),
      API.getServices().then(r => r.data),
      API.getQualifications(),
      API.getConfig()
    ]);

    // Store in window for use throughout app
    window.APP_DATA = {
      employees,
      systems,
      services,
      qualifications,
      config
    };

    // Render UI
    renderDashboard();
    renderMatrix();
    renderTables();

    // Start auto-refresh every 30 seconds
    setInterval(refreshAllData, 30000);
  } catch (error) {
    console.error('Initialization failed:', error);
    showNotification('Failed to load application', 'error');
  }
}
```

### Real-time Updates Example
```javascript
async function enableRealTimeUpdates() {
  // Poll server every 5 seconds for changes
  setInterval(async () => {
    const latestData = await API.getConfig();
    
    // Check if scoring weights changed
    if (latestData.weight_competence !== window.APP_DATA.config.weight_competence) {
      // Recalculate matrix
      loadMatrix();
      showNotification('Scoring weights updated', 'info');
    }
  }, 5000);
}
```

## Rollback Plan

If API integration causes issues:

1. **Revert to localStorage**:
   - Restore backed-up `index.html`
   - Comment out API calls
   - Keep backend running for future use

2. **Keep both working**:
   - Comment out API calls temporarily
   - Data remains synced in database
   - Resume API integration once fixed

3. **Database Recovery**:
   ```bash
   docker exec eprovider_db mysql -u eprovider_user -p eprovider < backup.sql
   ```

---

**Estimated Time**: 4-8 hours depending on code complexity  
**Difficulty**: Medium - Requires understanding of async/await and API patterns
