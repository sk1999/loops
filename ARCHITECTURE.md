# System Architecture

## Overview

This is a production-grade HR, attendance, payroll, and productivity system designed to replace Excel-based processes while maintaining full Excel compatibility.

## Core Principles

1. **Excel and UI are input methods, not the source of truth**
2. **Attendance is site-based; payroll is employee-based**
3. **All payroll values must be derived, never manually edited**
4. **System must allow Excel upload at ANY stage**
5. **System must allow UI entry at ANY stage**
6. **Month locking is mandatory for payroll integrity**
7. **Every calculation must be reproducible and auditable**
8. **No silent overwrites — conflicts must be explicit**

## Data Flow

```
Excel/UI Input
    ↓
Attendance Events (Raw Data)
    ↓
Monthly Consolidation (per employee)
    ↓
Payroll Calculation (Derived Data)
    ↓
Month Lock (Finalization)
```

## Entity Relationships

```
Employee (1) ──→ (N) Deployment ──→ (1) Site ──→ (1) Client
    │
    ├──→ (N) AttendanceEvent ──→ (1) Site
    │
    └──→ (1) TradeCategory (defines rules)
```

## Key Components

### 1. Attendance Event Engine

- **Purpose**: Store raw attendance data per site, per day
- **Key Features**:
  - Site-based attendance (employee can work multiple sites)
  - Consolidation for payroll (all sites → one employee)
  - Conflict detection (same employee+site+date from different sources)
  - Month lock enforcement

### 2. Payroll Rule Engine

- **Purpose**: Deterministic payroll calculation
- **Key Features**:
  - Rule-based (stored in TradeCategory)
  - Versioned rules
  - Recalculable (never store as final)
  - Trade-specific logic:
    - CLEANER: Paid for P + OT only
    - MEP/MASON: Paid for P + PH + ML + OD

### 3. Excel Upload System

- **Purpose**: Import Excel files at any stage
- **Key Features**:
  - Auto-detect sheet type
  - Fuzzy column matching
  - Dry-run preview
  - Conflict highlighting
  - Source tracking (file_id, uploader, timestamp)

### 4. Excel-like Attendance UI

- **Purpose**: Fast UI entry (must be faster than Excel)
- **Key Features**:
  - Grid layout (like Excel)
  - Keyboard navigation
  - Bulk fill operations
  - Autosave (no submit buttons)
  - Default "P" for all

### 5. Month Locking

- **Purpose**: Prevent edits after payroll finalization
- **Key Features**:
  - Lock/unlock with audit trail
  - Blocks attendance edits
  - Blocks Excel uploads
  - Requires admin + reason for unlock

### 6. Productivity Engine

- **Purpose**: Calculate productivity per site
- **Key Features**:
  - Trade-specific rules
  - Site-based calculation
  - Derived from attendance events

## Payroll Calculation Logic

### For CLEANER:
```
paid_days = count(P) + count(OT)
salary = paid_days × daily_rate
ot_amount = count(OT) × ot_rate
net_salary = salary + ot_amount
```

### For MEP/MASON/CIVIL:
```
paid_days = count(P) + count(PH) + count(ML) + count(OD)
salary = paid_days × daily_rate
ot_amount = count(OT) × ot_rate
net_salary = salary + ot_amount
```

## Productivity Calculation Logic

### For CLEANER:
```
productivity_days = count(P) + count(OT)
productivity = productivity_days × rate
```

### For MEP/MASON/CIVIL:
```
productivity_days = count(P)
productivity = productivity_days × rate
```

## Conflict Resolution

| Scenario | Action |
|----------|--------|
| Same employee + site + date | Ask admin |
| Same employee + different sites + date | Allow (multi-site) |
| Excel upload on locked month | Block |
| UI edit after Excel import | Recalculate |

## Audit Trail

All critical operations are logged:
- Attendance edits (source, timestamp, user)
- Excel imports (file_id, uploader, timestamp)
- Payroll recalculations (rule_version, timestamp)
- Month locks/unlocks (user, reason, timestamp)

## Technology Stack

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend**: NestJS (Node.js, TypeScript)
- **Database**: MySQL with TypeORM
- **Excel Processing**: xlsx library
- **Date Handling**: date-fns

## Database Schema

### Core Tables
- `employees` - Employee master data
- `clients` - Client companies
- `sites` - Client sites/projects
- `deployments` - Employee-site assignments
- `trade_categories` - Trade rules configuration
- `attendance_events` - Raw attendance data
- `payroll` - Derived payroll data
- `productivity` - Derived productivity data
- `month_locks` - Month locking status
- `excel_uploads` - Excel upload tracking

## API Design

RESTful API with clear separation:
- `/attendance` - Attendance operations
- `/payroll` - Payroll operations
- `/excel` - Excel upload operations
- `/month-locks` - Month locking
- `/employees`, `/sites`, `/clients` - Master data

## Future Enhancements

1. Tally export functionality
2. Client billing module
3. Advanced reporting
4. User authentication & authorization
5. Role-based access control
6. Email notifications
7. Mobile app support

