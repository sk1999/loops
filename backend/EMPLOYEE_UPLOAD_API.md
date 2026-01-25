# Employee Document Upload API

## Overview
This API allows you to create and update employees with document uploads (PDFs and images). Documents are stored in `backend/uploads/employees/{employee_id}/` and URLs are saved in the database.

## Endpoints

### 1. Create Employee with Documents
**POST** `/employees`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `employee_id` (string, required) - Unique employee ID
- `full_name` (string, required) - Employee full name
- `father_name` (string, optional)
- `mother_name` (string, optional)
- `dob` (date, optional) - Date of birth (YYYY-MM-DD)
- `indian_address` (text, optional)
- `indian_phone` (string, optional)
- `emergency_contact` (text, optional)
- `passport_number` (string, optional)
- `passport_expiry` (date, optional)
- `visa_type` (string, optional)
- `visa_expiry` (date, optional)
- `trade_category_id` (number, optional)
- `joining_date` (date, optional)
- `recruitment_agency` (string, optional)
- `passport_document` (file, optional) - PDF or image
- `visa_document` (file, optional) - PDF or image
- `photo` (file, optional) - Employee photo (image)
- `other_documents` (files[], optional) - Multiple PDFs or images

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/employees \
  -F "employee_id=EMP001" \
  -F "full_name=John Doe" \
  -F "passport_number=P123456" \
  -F "passport_document=@/path/to/passport.pdf" \
  -F "visa_document=@/path/to/visa.pdf" \
  -F "photo=@/path/to/photo.jpg"
```

**Example using JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('employee_id', 'EMP001');
formData.append('full_name', 'John Doe');
formData.append('passport_number', 'P123456');
formData.append('passport_document', passportFile); // File object
formData.append('visa_document', visaFile);
formData.append('photo', photoFile);

fetch('http://localhost:3001/employees', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "passport_document_url": "/uploads/employees/EMP001/passport_1234567890_abc123.pdf",
  "visa_document_url": "/uploads/employees/EMP001/visa_1234567890_def456.pdf",
  "photo_url": "/uploads/employees/EMP001/photo_1234567890_ghi789.jpg",
  ...
}
```

### 2. Update Employee with Documents
**PUT** `/employees/:id`

Same as create, but updates existing employee. Only upload files you want to update.

### 3. Upload Documents for Existing Employee
**POST** `/employees/:id/documents`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `files` (files[], required) - One or more files
- `documentType` (string, required) - One of: `passport`, `visa`, `photo`, `other`

**Example:**
```bash
curl -X POST http://localhost:3001/employees/EMP001/documents \
  -F "documentType=passport" \
  -F "files=@/path/to/new-passport.pdf"
```

### 4. Get Employee
**GET** `/employees/:id`

Returns employee data including document URLs.

**Response:**
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "passport_document_url": "/uploads/employees/EMP001/passport_1234567890_abc123.pdf",
  "visa_document_url": "/uploads/employees/EMP001/visa_1234567890_def456.pdf",
  "photo_url": "/uploads/employees/EMP001/photo_1234567890_ghi789.jpg",
  "other_documents": [
    {
      "name": "contract.pdf",
      "url": "/uploads/employees/EMP001/other_1234567890_jkl012.pdf",
      "type": "application/pdf",
      "uploaded_at": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

## Accessing Documents

Documents are served as static files. Use the URL from the database response:

**Full URL:** `http://localhost:3001/uploads/employees/EMP001/passport_1234567890_abc123.pdf`

The frontend can directly use these URLs in `<img>` tags or `<a>` tags:

```html
<!-- For images -->
<img src="http://localhost:3001/uploads/employees/EMP001/photo_1234567890_ghi789.jpg" />

<!-- For PDFs -->
<a href="http://localhost:3001/uploads/employees/EMP001/passport_1234567890_abc123.pdf" target="_blank">
  View Passport
</a>
```

## File Restrictions

- **Allowed file types:** JPEG, JPG, PNG, GIF, PDF
- **Max file size:** 10MB per file
- **Max files per upload:** 10 files for `other_documents`

## File Storage Structure

```
backend/
  uploads/
    employees/
      EMP001/
        passport_1234567890_abc123.pdf
        visa_1234567890_def456.pdf
        photo_1234567890_ghi789.jpg
        other_1234567890_jkl012.pdf
      EMP002/
        ...
```

## Error Handling

- **400 Bad Request:** Invalid file type or file size exceeds limit
- **404 Not Found:** Employee not found
- **500 Internal Server Error:** File upload or database error
