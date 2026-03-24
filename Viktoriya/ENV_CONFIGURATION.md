# Environment Variables Configuration

## Overview

The project uses environment variables to manage configuration across Docker containers. This ensures:
- ✅ Sensitive data is not hardcoded
- ✅ Easy configuration per environment (dev, test, production)
- ✅ Container orchestration compatibility

## File Location

`.env` file in project root directory (Viktoriya/)

```
Viktoriya/
└── .env  ← Environment variables go here
```

## Current Configuration

```env
# === DATABASE CONFIGURATION ===
MARIADB_ROOT_PASSWORD=EproviderKompVika2026!
MARIADB_DATABASE=eprovider
MARIADB_USER=eprovider_user
MARIADB_PASSWORD=EproviderKompVika2026!
MARIADB_HOST=db
MARIADB_PORT=3306

# === BACKEND CONFIGURATION ===
BACKEND_PORT=3000
CORS_ORIGIN=*
NODE_ENV=production
```

## Variable Reference

### Database Variables

| Variable | Value | Purpose | Notes |
|----------|-------|---------|-------|
| `MARIADB_ROOT_PASSWORD` | `EproviderKompVika2026!` | Root password for MariaDB | ⚠️ Change for production |
| `MARIADB_DATABASE` | `eprovider` | Database name | Auto-created on container start |
| `MARIADB_USER` | `eprovider_user` | Non-root database user | Used by backend API |
| `MARIADB_PASSWORD` | `EproviderKompVika2026!` | Password for MARIADB_USER | ⚠️ Change for production |
| `MARIADB_HOST` | `db` | Database hostname | `db` is Docker container name |
| `MARIADB_PORT` | `3306` | Database port (internal) | `3307` on host (see docker-compose.yml) |

### Backend Variables

| Variable | Value | Purpose | Options |
|----------|-------|---------|---------|
| `BACKEND_PORT` | `3000` | API server port | Any available port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins | `*` (all), or comma-separated list |
| `NODE_ENV` | `production` | Environment mode | `production`, `development`, `test` |

## Environment-Specific Configurations

### Development

```env
MARIADB_ROOT_PASSWORD=root
MARIADB_USER=devuser
MARIADB_PASSWORD=devpass
BACKEND_PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
NODE_ENV=development
```

### Testing

```env
MARIADB_ROOT_PASSWORD=testpass
MARIADB_USER=testuser
MARIADB_PASSWORD=testpass
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3001
NODE_ENV=test
```

### Production

```env
MARIADB_ROOT_PASSWORD=SomeComplexPassword123!@#$%
MARIADB_USER=prod_user
MARIADB_PASSWORD=AnotherComplexPassword456!@#$%
BACKEND_PORT=3000
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

## Security Recommendations

### ⚠️ Before Deploying to Production

1. **Change All Passwords**
   ```env
   # DON'T USE DEFAULT PASSWORDS!
   MARIADB_ROOT_PASSWORD=Generate_A_Strong_Password_Here!
   MARIADB_PASSWORD=Generate_Another_Strong_Password!
   ```

2. **Restrict CORS**
   ```env
   # Instead of "*", specify your domain
   CORS_ORIGIN=https://yourdomain.com,https://api.yourdomain.com
   ```

3. **Add These Variables** (for production)
   ```env
   NODE_ENV=production
   LOG_LEVEL=error
   ENABLE_AUTH=true
   JWT_SECRET=SomeVerySecretKeyThatIsLong
   ```

### Password Requirements

- **Minimum 12 characters**
- **Include uppercase letters** (A-Z)
- **Include lowercase letters** (a-z)
- **Include numbers** (0-9)
- **Include special characters** (!@#$%^&*)
- **No dictionary words**

Example: `P@ssw0rd_Secure_2024!`

## How Docker Uses .env

### During `docker-compose up`

1. Docker Compose reads `.env` file
2. Variables are passed to containers as environment variables
3. Services can access via `process.env` (Node.js) or similar

### In Backend Code

```javascript
// Access environment variables
const dbHost = process.env.MARIADB_HOST;      // "db"
const dbUser = process.env.MARIADB_USER;      // "eprovider_user"
const dbPass = process.env.MARIADB_PASSWORD;  // "EproviderKompVika2026!"
const port = process.env.BACKEND_PORT;        // "3000"
```

### In Docker Compose

```yaml
services:
  backend:
    env_file:
      - .env  # Load all variables from .env
    environment:
      MARIADB_HOST: db  # Can also override here
```

## Accessing Variables Outside Docker

### If Running Locally (Without Docker)

You can either:

1. **Load from .env** (using dotenv package - already configured)
   ```bash
   npm install dotenv
   # Then in your code: require('dotenv').config();
   ```

2. **Set manually** in terminal before running
   ```bash
   export MARIADB_HOST=localhost
   export MARIADB_USER=eprovider_user
   export MARIADB_PASSWORD=EproviderKompVika2026!
   npm start
   ```

3. **Use command line** to run with variables
   ```bash
   MARIADB_HOST=localhost npm start
   ```

## Common Issues

### "Connection refused to database"
- Check `MARIADB_HOST` is correct (should be `db` in Docker)
- Check `MARIADB_PORT` matches database port
- Verify credentials match actual database user

### "API not starting"
- Verify `BACKEND_PORT` is not already in use
- Check `NODE_ENV` is valid (production/development/test)
- Look for typos in variable names

### "CORS errors in frontend"
- Ensure `CORS_ORIGIN` includes your frontend domain
- Use `*` only for development
- Check exact domain name (http vs https)

### "Secrets exposed in logs"
- Don't use `console.log(process.env.MARIADB_PASSWORD)`
- Use environment-specific logging levels
- Set `LOG_LEVEL=error` in production

## Viewing Current Configuration

### In Docker Container
```bash
# See all environment variables
docker exec eprovider_api env

# See specific variable
docker exec eprovider_api printenv BACKEND_PORT
```

### Locally
```bash
# On Windows
echo %BACKEND_PORT%

# On Mac/Linux
echo $BACKEND_PORT
```

## Updating Configuration

### Step 1: Edit .env file
```bash
# Update the values you need
nano .env
```

### Step 2: Restart affected services
```bash
# For backend changes
docker-compose restart backend

# For database changes (requires restart)
docker-compose restart db
docker-compose restart backend

# Restart everything
docker-compose down
docker-compose up -d
```

### Step 3: Verify changes took effect
```bash
# Check backend logs
docker-compose logs -f backend

# Check database connection
docker exec eprovider_api curl http://localhost:3000/api/health
```

## Secret Management (Advanced)

### Using Docker Secrets (For Swarm Mode)
```bash
# Create secrets
echo "SuperSecurePassword123!" | docker secret create db_password -
echo "SuperSecureJWT456!" | docker secret create jwt_secret -

# Reference in compose file (swarm mode only)
services:
  backend:
    secrets:
      - db_password
      - jwt_secret
```

### Using HashiCorp Vault
```javascript
// Advanced: Fetch secrets from Vault at runtime
const vault = require('node-vault')({endpoint: 'https://vault.example.com'});
const dbPassword = await vault.read('secret/data/db_password');
```

## Checklist for Different Scenarios

### ✅ Local Development
- [ ] `.env` exists with local values
- [ ] Database passwords are simple (e.g., `root`)
- [ ] `NODE_ENV=development`
- [ ] `CORS_ORIGIN` allows localhost ports

### ✅ Testing
- [ ] `.env` has test-specific values
- [ ] Database is separate from production
- [ ] `NODE_ENV=test`
- [ ] Can reset database between tests

### ✅ Production Deployment
- [ ] `.env` has strong passwords (each 20+ chars)
- [ ] `.env` is in `.gitignore` (never commit!)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` restricted to your domain
- [ ] Enable HTTPS (`https://` in CORS_ORIGIN)
- [ ] Setup backup for database
- [ ] Monitor logs and errors
- [ ] Have rollback plan

## Passing Secrets Securely

### ❌ DON'T DO THIS
```javascript
// Never hardcode secrets
const password = "MyPassword123!";

// Never log secrets
console.log(`Connecting with: ${process.env.MARIADB_PASSWORD}`);

// Never commit .env file
git add .env  // ❌ WRONG

// Never expose in comments
// PASSWORD: MyPassword123!  // ❌ WRONG
```

### ✅ DO THIS
```javascript
// Use environment variables
const password = process.env.MARIADB_PASSWORD;

// Don't log sensitive data
console.log('Connecting to database...');

// Add .env to .gitignore
// .gitignore:
// .env
// .env.local
// *.secret

// Use .env.example as template
cp .env.example .env
# Then edit .env with real values
```

## Reference Links

- [Docker Compose env_file](https://docs.docker.com/compose/env-file/)
- [Node.js dotenv Package](https://npmjs.com/package/dotenv)
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated**: 2026-03-24  
**Version**: 1.0
