# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE hr_payroll;
```

2. Update database credentials in `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hr_payroll
```

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

From the root directory:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### Individual Services

Backend only:
```bash
cd backend
npm run start:dev
```

Frontend only:
```bash
cd frontend
npm run dev
```

## Initial Setup

1. **Initialize Trade Categories**:
   - Visit http://localhost:3001/trade-categories/initialize (POST request)
   - Or use the API to create trade categories with payroll rules

2. **Create Master Data**:
   - Create Clients
   - Create Sites (linked to Clients)
   - Create Employees (with Trade Categories)
   - Create Deployments (Employee → Site assignments)

3. **Start Using**:
   - Upload Excel attendance files
   - Or use the Excel-like attendance UI
   - Calculate payroll
   - Lock months after finalization

## API Endpoints

### Attendance
- `POST /attendance` - Create/update attendance
- `GET /attendance/employee/:id` - Get employee attendance
- `GET /attendance/site/:id` - Get site attendance
- `POST /attendance/bulk` - Bulk create attendance

### Payroll
- `POST /payroll/calculate` - Calculate payroll for employee
- `POST /payroll/recalculate-month` - Recalculate all payroll for month
- `GET /payroll/month` - Get all payroll for month

### Excel
- `POST /excel/upload` - Upload Excel file
- `POST /excel/preview` - Preview Excel file without processing

### Month Locks
- `GET /month-locks` - Get all month locks
- `POST /month-locks/lock` - Lock a month
- `POST /month-locks/unlock` - Unlock a month

## Trade Category Rules

Trade categories define payroll and productivity rules:

### CLEANER
- **Paid Statuses**: P, OT
- **Productivity Statuses**: P, OT

### MEP / MASON / CIVIL
- **Paid Statuses**: P, PH, ML, OD
- **Productivity Statuses**: P

Rules are stored as JSON in the `trade_categories` table and can be customized per trade.

## Excel Upload Format

### Attendance Sheet
- First column: Employee name/ID
- Second column: Site name/code
- Columns E-AH (or 1-31): Day of month with attendance status (P, A, OT, PH, ML, OD, 8, 8.5)

The system auto-detects the sheet type and maps columns using fuzzy matching.

## Important Notes

1. **Month Locking**: Once a month is locked, attendance cannot be modified. Unlock requires admin role and reason.

2. **Payroll Calculation**: Payroll is always recalculated from attendance events. Never manually edit payroll values.

3. **Multi-Site Support**: Employees can work on multiple sites in the same month. Attendance is consolidated for payroll.

4. **Conflict Resolution**: If the same employee+site+date exists from different sources (Excel vs UI), the system will raise a conflict that must be resolved manually.

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify credentials in `backend/.env`
- Ensure database exists

### Port Already in Use
- Change ports in `backend/.env` (PORT) and `frontend/next.config.js` (dev server)

### TypeORM Synchronize
- In production, set `synchronize: false` and use migrations
- In development, `synchronize: true` auto-creates tables

## Production Deployment

1. Set `NODE_ENV=production`
2. Disable TypeORM synchronize
3. Use proper database migrations
4. Set up environment variables securely
5. Configure CORS properly
6. Use reverse proxy (nginx) for frontend
7. Set up SSL/TLS

