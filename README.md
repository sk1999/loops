# HR, Attendance, Payroll & Productivity System

Production-grade system for UAE-based manpower/labour contracting company.

## Core Principles

1. **Excel and UI are input methods, not the source of truth**
2. **Attendance is site-based; payroll is employee-based**
3. **All payroll values must be derived, never manually edited**
4. **System must allow Excel upload at ANY stage**
5. **System must allow UI entry at ANY stage**
6. **Month locking is mandatory for payroll integrity**
7. **Every calculation must be reproducible and auditable**
8. **No silent overwrites — conflicts must be explicit**

## Architecture

- **Frontend**: Next.js (React)
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Excel Processing**: xlsx library

## Development Priority

1. ✅ Attendance event engine
2. ✅ Excel upload & mapping
3. ✅ Excel-like attendance UI
4. ✅ Payroll rule engine
5. ✅ Month locking
6. ✅ Productivity & billing
7. ✅ Tally export

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Run development servers
npm run dev
```

## Key Features

- **Hybrid Input**: Excel upload and UI entry coexist at every stage
- **Rule-Based Payroll**: Configurable, versioned, auditable calculations
- **Site-Based Attendance**: Employees can work on multiple sites per month
- **Month Locking**: Prevents edits after payroll finalization
- **Conflict Resolution**: Explicit handling of data conflicts
- **Audit Trail**: Complete logging of all changes

