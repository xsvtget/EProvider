# EProvider Project - Complete Migration & Setup Guide

## 📋 Overview

This is a **competence & risk assessment** application that tracks employee qualifications across systems and services. The project has been migrated from a client-side only application to a full-stack application:

- **Frontend**: Static HTML + JavaScript with API integration
- **Backend**: Node.js/Express API server  
- **Database**: MariaDB with relational schema
- **Orchestration**: Docker Compose for seamless deployment

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (nginx)                │
│  - HTML/CSS/JavaScript (SPA)            │
│  - API calls via api-client.js          │
│  Port: 80                               │
└────────────────────┬────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────┐
│       Backend (Node.js/Express)         │
│  - RESTful API endpoints                │
│  - Data validation                      │
│  - Port: 3000                           │
└────────────────────┬────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────┐
│          MariaDB Database               │
│  - 8 Tables (employees, systems, etc.)  │
│  - Relationships & constraints          │
│  - Port: 3307 (host) / 3306 (container) │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
Viktoriya/
├── .env                              # Environment variables (CHANGE PASSWORDS!)
├── .env.example                      # Template for .env
├── docker-compose.yml                # Container orchestration
├── MIGRATION_PLAN.md                 # Migration strategy
├── SETUP.md                          # This file
│
├── db/
│   ├── init/
│   │   └── 001_init.sql             # Database schema & initial config
│   └── migration/
│       └── jsonToDB.js              # Legacy: JSON import
│
├── frontend/
│   ├── Dockerfile                    # Frontend container config
│   ├── nginx.conf                    # Web server configuration
│   └── app/
│       ├── index.html                # Main application
│       ├── api-client.js             # API helper functions
│       ├── competence_risk_bundle.json  # Legacy data (for migration)
│       └── qualification_form.csv    # Export format
│
└── backend/
    ├── app.js                        # Express server entry point
    ├── package.json                  # Node.js dependencies
    ├── Dockerfile                    # Backend container config
    ├── .gitignore                    # Git rules
    ├── README.md                     # API documentation
    ├── db/
    │   └── connection.js             # Database connection pool
    ├── routes/
    │   ├── employees.js              # Employee endpoints
    │   ├── systems.js                # System endpoints
    │   ├── services.js               # Service endpoints
    │   ├── qualifications.js         # Qualification endpoints
    │   ├── access.js                 # Access review endpoints
    │   ├── actions.js                # Action/task endpoints
    │   └── config.js                 # Configuration endpoints
    └── scripts/
        └── migrateJSON.js            # Data migration script
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Port 80 (frontend), 3000 (backend), 3307 (database) available
- 500MB free disk space

### Option 1: Docker Compose (Recommended)

```bash
# 1. Navigate to project root
cd Viktoriya

# 2. Copy and configure environment
cp .env.example .env
# Edit .env and set your passwords

# 3. Start all services
docker-compose up -d

# 4. Wait for database to be ready (30-60 seconds)
docker-compose logs db

# 5. Run data migration (if migrating from JSON)
docker exec eprovider_api npm run migrate

# 6. Access application
# Frontend: http://localhost
# API Health: http://localhost:3000/api/health
```

### Option 2: Local Development

```bash
# Terminal 1: Start MariaDB (or use existing container)
docker run -d \
  --name mariadb_local \
  -e MARIADB_ROOT_PASSWORD=root \
  -e MARIADB_DATABASE=eprovider \
  -e MARIADB_USER=eprovider_user \
  -e MARIADB_PASSWORD=eprovider \
  -e MARIADB_PORT=3306 \
  -p 3307:3306 \
  -v ./db/init:/docker-entrypoint-initdb.d \
  mariadb:11

# Terminal 2: Start Backend
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload

# Terminal 3: Serve Frontend
cd frontend/app
# Use any simple HTTP server:
# python: python -m http.server 8000
# node: npx http-server
# vs code: Live Server extension
```

## 📊 Data Migration

### From JSON File to Database

If you have existing data in `competence_risk_bundle (6).json`:

```bash
# Using Docker
docker exec eprovider_api npm run migrate

# Or locally
cd backend
node scripts/migrateJSON.js
```

The migration script:
1. ✅ Reads JSON structure
2. ✅ Inserts employees
3. ✅ Inserts systems  
4. ✅ Creates qualifications (from matrix)
5. ✅ Maps all relationships

### Manual Database Population

Connect directly to database:

```bash
# Access database container
docker exec -it eprovider_db mariadb -u eprovider_user -p eprovider

# Or use any database tool (DBeaver, MySQL Workbench, etc.)
# Host: localhost:3307
# User: eprovider_user
# Password: EproviderKompVika2026!
```

Then run SQL INSERT statements or use the API.

## 🔌 API Usage

All API endpoints are prefixed with `/api`:

### Employees
```javascript
// Get all employees
fetch('http://localhost:3000/api/employees')
  .then(r => r.json())
  .then(data => console.log(data.data));

// Create employee
fetch('http://localhost:3000/api/employees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'John Doe',
    department: 'IT',
    availability_percent: 100
  })
}).then(r => r.json());

// Update employee
fetch('http://localhost:3000/api/employees/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'Jane Doe',
    department: 'Finance'
  })
}).then(r => r.json());
```

### Qualifications
```javascript
// Get all qualifications for an employee
fetch('http://localhost:3000/api/qualifications?employee_id=1')
  .then(r => r.json());

// Update qualification score
fetch('http://localhost:3000/api/qualifications/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experience_score: 5,
    certification_points: 3,
    knowledge_score: 2,
    qualification_level: 'QUALIFIED'
  })
}).then(r => r.json());
```

See `backend/README.md` for complete API documentation.

## 🎨 Frontend Integration

The frontend (`index.html`) needs to be updated to call the backend API instead of using localStorage.

### Before (Client-side storage)
```javascript
// Old approach - stored in browser
let db = JSON.parse(localStorage.getItem('eprovider_db')) || {};
```

### After (API calls)
```javascript
// New approach - load from server
const API_URL = 'http://localhost:3000/api';

async function loadEmployees() {
  const response = await fetch(`${API_URL}/employees`);
  const employees = await response.json();
  populateUI(employees.data);
}
```

Use the helper functions in `frontend/app/api-client.js`:

```html
<script src="api-client.js"></script>
<script>
  // Load and display employees
  API.getEmployees().then(result => {
    document.getElementById('employees-list').innerHTML = 
      result.data.map(e => `<div>${e.full_name} (${e.department})</div>`).join('');
  });
</script>
```

## 📝 Database Schema

### Tables

1. **employees** - Personnel records
   - id, employee_code, full_name, email, role_title, department, location, availability_percent, active

2. **systems** - IT systems to track
   - id, system_code, name, owner_name, business_owner, technical_owner, environment, sensitivity, active

3. **services** - Services requiring specific skills
   - id, service_code, name, owner_name, criticality, min_qualified, preferred_qualified, active

4. **qualifications** - Employee competency levels per system
   - id, employee_id, system_id, experience_score, certification_points, knowledge_score, total_score, qualification_level, entry_date, review_due_date, is_reviewed

5. **access_reviews** - Access status per employee/system
   - id, employee_id, system_id, access_type, requested, approved, reviewed_at, review_due_date

6. **service_required_systems** - Mapping which systems are required for each service
   - id, service_id, system_id, order_index, required_level

7. **actions** - Mitigation/follow-up tasks
   - id, service_id, employee_id, system_id, title, description, owner_name, status, priority, due_date, completed_at

8. **app_config** - Application settings
   - id, config_key, config_value, value_type, description

All tables include `created_at` and `updated_at` timestamps.

## 🔒 Security & Best Practices

### Current Implementation
- ✅ Environment variables for secrets
- ✅ Parameterized SQL (prevents SQL injection)
- ✅ CORS enabled (customize as needed)
- ✅ Soft deletes (data preservation)
- ✅ Foreign key constraints
- ✅ Indexes on commonly queried fields

### Recommendations
- 🔐 **Add Authentication**: JWT tokens or session-based auth
- 🛡️ **Enable HTTPS**: Use cert in production
- 🚨 **Add Rate Limiting**: Prevent API abuse
- 📊 **Add Logging**: Track all operations
- 🔍 **Add Input Validation**: Server-side validation for all inputs
- 🎯 **Add Role-Based Access Control**: Who can do what

## 🐛 Troubleshooting

### Docker Issues

**"Cannot connect to Docker"**
```bash
# Ensure Docker daemon is running
docker ps

# Restart Docker
systemctl restart docker  # Linux
# Or restart Docker Desktop app (Windows/Mac)
```

**"Port already in use"**
```bash
# Find what's running on the port
lsof -i :80    # Frontend
lsof -i :3000  # Backend
lsof -i :3307  # Database

# Kill process or use different port in .env
```

### Database Issues

**"Connection refused"**
- Wait 30 seconds for database to initialize
- Check `.env` credentials match
- Verify MariaDB container is running: `docker ps | grep mariadb`

**"No data appears"**
- Run migration: `docker exec eprovider_api npm run migrate`
- Check database has data: `docker exec eprovider_db mariadb -u eprovider_user -p eprovider -e "SELECT COUNT(*) FROM employees;"`

### API Issues

**"CORS error in browser"**
- Update `CORS_ORIGIN` in `.env`
- Restart backend container

**"API returns 500 error"**
- Check logs: `docker-compose logs backend`
- Verify database connection
- Check request format matches schema

## 📈 Performance Optimization

### Database
- Indexes on: employee names, system names, criticality, sensitivity, status
- Connection pooling configured (10 connections)
- Query optimization via relational design

### Frontend
- Implement pagination for large datasets
- Cache API responses with reasonable TTL
- Use request deduplication
- Load on-demand instead of loading all data

### Deployment
- Use production Node.js builds
- Enable gzip compression
- Minify frontend assets
- Use CDN for static files

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Migration Plan](./MIGRATION_PLAN.md)
- [Express.js Documentation](https://expressjs.com)
- [MariaDB Documentation](https://mariadb.com/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file)

## 🤝 Support & Maintenance

### Common Maintenance Tasks

```bash
# View logs
docker-compose logs             # All services
docker-compose logs backend     # Backend only
docker-compose logs -f backend  # Follow backend logs

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# Remove all data (caution!)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d

# Backup database
docker exec eprovider_db mysqldump -u eprovider_user -p eprovider > backup.sql

# Restore database
docker exec -i eprovider_db mysql -u eprovider_user -p eprovider < backup.sql
```

### Update Checklist
- [ ] Update dependencies: `npm update` in backend
- [ ] Test API endpoints: `npm test` (when tests added)
- [ ] Run data migration if needed
- [ ] Verify database integrity
- [ ] Test frontend functionality
- [ ] Check browser console for errors

## 📞 Next Steps

1. **Review the files**: Understand the structure
2. **Configure .env**: Set your passwords
3. **Start services**: `docker-compose up -d`
4. **Migrate data**: `docker exec eprovider_api npm run migrate`
5. **Update frontend**: Integrate API calls into `index.html`
6. **Test thoroughly**: Check all endpoints
7. **Monitor logs**: `docker-compose logs -f`

---

**Created**: January 2025  
**Version**: 1.0  
**Last Updated**: 2026-03-24
