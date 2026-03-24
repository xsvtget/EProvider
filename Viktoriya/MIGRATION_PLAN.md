# Database Migration Plan - EProvider Competence & Risk

## Current State
- **Frontend**: Static HTML + JavaScript (index.html with embedded code)
- **Data Storage**: Browser localStorage + static JSON files (competence_risk_bundle.json)
- **Database**: MariaDB configured but unused
- **Backend**: None - fully client-side application

## Target State
- **Frontend**: React/Vue/Static HTML with API calls
- **Backend**: Node.js/Express API server
- **Database**: MariaDB with full schema (already defined in 001_init.sql)
- **Data Flow**: Frontend → API → MariaDB

## Migration Steps

### Phase 1: Backend Setup
- [ ] Create Node.js/Express API server
- [ ] Setup database connection & query helpers
- [ ] Create API endpoints for CRUD operations
- [ ] Add CORS middleware for frontend communication
- [ ] Update docker-compose.yml to include backend service

### Phase 2: Data Migration
- [ ] Create migration script to parse JSON data
- [ ] Insert employees data into `employees` table
- [ ] Insert systems data into `systems` table
- [ ] Insert services data into `services` table
- [ ] Map relationships (service_required_systems, qualifications, access_reviews)

### Phase 3: Frontend Integration
- [ ] Add API calls to fetch employees
- [ ] Add API calls to fetch systems
- [ ] Add API calls to fetch services
- [ ] Add CRUD operations via API
- [ ] Remove localStorage usage (or keep as fallback)
- [ ] Add loading states and error handling

### Phase 4: Testing & Deployment
- [ ] Test all CRUD operations
- [ ] Test data consistency
- [ ] Test docker-compose orchestration
- [ ] Performance testing

## Data Structure Mapping

### Employees
- JSON: `{id, name, role, dept, loc, avl}`
- DB: `{id, employee_code, full_name, email, role_title, department, location, availability_percent}`

### Systems
- JSON: `{id, name, env, owner, type, sensitivity, bizOwner, techOwner}`
- DB: `{id, system_code, name, owner_name, business_owner, technical_owner, environment, sensitivity}`

### Qualifications (Matrix)
- Currently stored as nested structure in JSON
- DB: Normalized in `qualifications` table with employee_id, system_id, scores

## Files Involved
- `backend/app.js` - Express server
- `backend/package.json` - Dependencies
- `frontend/app/index.html` - Updated with API calls
- `docker-compose.yml` - Add backend service
- `db/migration/jsonToDB.js` - Data migration script
- `.env` - Add backend port & database URL
