# Backend Setup & API Documentation

## Project Structure

```
backend/
├── app.js                      # Main Express application
├── package.json                # Node dependencies
├── Dockerfile                  # Container configuration
├── db/
│   └── connection.js          # Database connection
├── routes/
│   ├── employees.js           # Employee CRUD operations
│   ├── systems.js             # System CRUD operations
│   ├── services.js            # Service CRUD operations
│   ├── qualifications.js       # Qualification management
│   ├── access.js              # Access review management
│   ├── actions.js             # Actions/tasks management
│   └── config.js              # Configuration management
└── scripts/
    └── migrateJSON.js         # Data migration script
```

## Environment Setup

The backend requires these environment variables (set in `.env`):

```
MARIADB_HOST=db
MARIADB_USER=eprovider_user
MARIADB_PASSWORD=EproviderKompVika2026!
MARIADB_DATABASE=eprovider
MARIADB_PORT=3306
BACKEND_PORT=3000
CORS_ORIGIN=*
NODE_ENV=production
```

## Running Locally

### Without Docker

```bash
cd backend
npm install
npx nodemon app.js
```

### With Docker Compose

```bash
docker-compose up -d
```

## API Endpoints

### Employees
- `GET /api/employees` - List all employees (paginated)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft)

### Systems
- `GET /api/systems` - List all systems
- `GET /api/systems/:id` - Get single system
- `POST /api/systems` - Create system
- `PUT /api/systems/:id` - Update system
- `DELETE /api/systems/:id` - Delete system

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Qualifications
- `GET /api/qualifications` - List qualifications (filter by employee_id, system_id)
- `GET /api/qualifications/:id` - Get single qualification
- `POST /api/qualifications` - Create/upsert qualification
- `PUT /api/qualifications/:id` - Update qualification
- `DELETE /api/qualifications/:id` - Delete qualification

### Access Reviews
- `GET /api/access` - List access reviews
- `GET /api/access/:id` - Get single access review
- `POST /api/access` - Create access review

### Actions
- `GET /api/actions` - List actions (filter by status)
- `GET /api/actions/:id` - Get single action
- `POST /api/actions` - Create action
- `PUT /api/actions/:id` - Update action
- `DELETE /api/actions/:id` - Delete action

### Config
- `GET /api/config` - Get all config as object
- `GET /api/config/:key` - Get single config value
- `PUT /api/config/:key` - Update config value

## Data Migration

### From JSON to Database

```bash
cd backend
npm run migrate
```

This script:
1. Reads `frontend/app/competence_risk_bundle (6).json`
2. Imports employees, systems, services
3. Migrates qualification matrix data
4. Maps relationships automatically

### JSON Structure Expected

```json
{
  "db": {
    "employees": [
      { "id": "1", "name": "John Doe", "role": "", "dept": "IT", "loc": "", "avl": 100 }
    ],
    "systems": [
      { "id": "SYS001", "name": "System Name", "env": "Prod", "owner": "", "type": "System", "sensitivity": "Internal" }
    ],
    "matrix": {
      "SYS001": {
        "1": 8,
        "2": 5
      }
    }
  }
}
```

## Frontend Integration

Include `frontend/app/api-client.js` in your HTML:

```html
<script src="api-client.js"></script>
<script>
  // Use the API object to make requests
  API.getEmployees().then(result => {
    console.log('Employees:', result.data);
  });
</script>
```

## CORS Configuration

The backend has CORS enabled by default. To restrict to specific origins:

```env
CORS_ORIGIN=http://localhost:3000,http://yourdomain.com
```

Then update `backend/app.js` CORS options:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
```

## Troubleshooting

### Database connection fails
- Ensure MariaDB container is running: `docker-compose logs db`
- Check credentials in `.env` match database setup
- Verify port 3307 is not blocked

### API not responding
- Check backend container logs: `docker-compose logs backend`
- Ensure `npm install` was run in backend directory
- Verify BACKEND_PORT is set correctly

### CORS errors in frontend
- Update `CORS_ORIGIN` in `.env`
- Ensure frontend is calling correct API URL

## Performance Tips

- Database queries use indexes on commonly filtered fields
- Pagination implemented for large datasets
- Connection pooling configured (10 connections default)
- Soft deletes preserve data integrity

## Security Considerations

- Environment variables store sensitive data
- SQL injection prevention via parameterized queries
- CORS limits cross-origin requests
- Use HTTPS in production
- Add authentication middleware (currently not implemented)
