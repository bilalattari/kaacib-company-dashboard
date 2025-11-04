# Company Dashboard API Integration Guide

Complete API reference for integrating Company Dashboard with all endpoints, request bodies, headers, and response formats.

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Company Information APIs](#company-information-apis)
3. [Ticket Management APIs](#ticket-management-apis)
4. [Branch Management APIs](#branch-management-apis)
5. [Asset Management APIs](#asset-management-apis)
6. [Company User Management APIs](#company-user-management-apis)
7. [Booking Management APIs](#booking-management-apis)
8. [Common Response Formats](#common-response-formats)
9. [Error Handling](#error-handling)

---

## Base Configuration

### Base URL
```
{{BASE_URL}}/v1/company
```

### Authentication
All endpoints (except login and password reset) require:
```
Authorization: Bearer <jwt_token>
```

The token is received after successful login and should be stored and sent with every request.

---

## Authentication APIs

### 1. Company User Login

**Endpoint:** `POST /v1/auth/company/login`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "Password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "first_name": "Ahmed",
      "last_name": "Ali",
      "email": "user@company.com",
      "phone": "03001234567",
      "role": "company_admin",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "permissions": {
        "can_book_services": true,
        "can_complete_bookings": true,
        "can_view_worker_contacts": true,
        "can_manage_assets": true,
        "can_manage_branches": false,
        "can_manage_users": false
      }
    }
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 2. Request Password Reset

**Endpoint:** `POST /v1/auth/company/forgot-password`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Note:** In development mode, email is skipped but response is still returned.

---

### 3. Reset Password

**Endpoint:** `POST /v1/auth/company/reset-password`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Company Information APIs

### 4. Get Company Information

**Endpoint:** `GET /v1/company/info`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:** None

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Company information retrieved successfully",
  "data": {
    "company": {
      "id": "company_id",
      "name": "Company Name",
      "contact_person": "Contact Person",
      "email": "company@example.com",
      "phone": "03001234567",
      "address": "Complete address",
      "company_type": "corporate",
      "status": "active"
    },
    "user": {
      "id": "user_id",
      "role": "company_admin",
      "permissions": {
        "can_book_services": true,
        "can_complete_bookings": true,
        "can_view_worker_contacts": true,
        "can_manage_assets": true,
        "can_manage_branches": false,
        "can_manage_users": false
      },
      "email": "user@company.com"
    }
  }
}
```

**Note:** Only accessible to `company_admin` role.

---

## Ticket Management APIs

### 5. Create Corrective Ticket

**Endpoint:** `POST /v1/company/tickets`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "contract_id": "contract_id_here",
  "service_id": "service_id_here",
  "description": "Detailed description of the issue (min 10, max 1000 characters)",
  "priority": "normal",
  "branch_id": "branch_id_here",
  "asset_id": "asset_id_here"
}
```

**Field Details:**
- `contract_id` (required): MongoDB ObjectId of the contract
- `service_id` (required): MongoDB ObjectId of the service
- `description` (required): String, 10-1000 characters
- `priority` (optional): One of `"red"`, `"yellow"`, `"normal"` (default: `"normal"`)
- `branch_id` (optional): MongoDB ObjectId, can be `null`
- `asset_id` (optional): MongoDB ObjectId, can be `null`

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Corrective ticket created successfully",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "ticket_number": "TKT-001",
      "type": "corrective",
      "status": "pending",
      "priority": "normal",
      "company": "company_id",
      "contract": "contract_id",
      "service": "service_id",
      "description": "Issue description",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Contract not found or not active"
}
```

---

### 6. Get All Tickets

**Endpoint:** `GET /v1/company/tickets`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page` (optional): Number, default: 1
- `limit` (optional): Number, default: 10
- `status` (optional): Filter by status (`pending`, `assigned`, `in_progress`, `completed`, `closed`, `cancelled`)
- `type` (optional): Filter by type (`corrective`, `continuous`)
- `priority` (optional): Filter by priority (`red`, `yellow`, `normal`)
- `contract_id` (optional): Filter by contract
- `search` (optional): Search in ticket number, description

**Example Request:**
```
GET /v1/company/tickets?page=1&limit=10&status=pending&type=corrective
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": {
    "tickets": [
      {
        "id": "ticket_id",
        "ticket_number": "TKT-001",
        "type": "corrective",
        "status": "pending",
        "priority": "normal",
        "company": {
          "id": "company_id",
          "name": "Company Name"
        },
        "contract": {
          "id": "contract_id",
          "title": "Contract Title"
        },
        "service": {
          "id": "service_id",
          "name": "Service Name"
        },
        "worker": null,
        "description": "Issue description",
        "created_at": "2025-10-29T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

**Note:** 
- `company_admin` sees all company tickets
- `branch_admin` sees only tickets for their branch

---

### 7. Get Ticket by ID

**Endpoint:** `GET /v1/company/tickets/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**URL Parameters:**
- `id`: Ticket ID

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "ticket_number": "TKT-001",
      "type": "corrective",
      "status": "quotation_pending",
      "priority": "normal",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "contract": {
        "id": "contract_id",
        "title": "Contract Title"
      },
      "branch": {
        "id": "branch_id",
        "name": "Branch Name"
      },
      "asset": {
        "id": "asset_id",
        "name": "Asset Name"
      },
      "service": {
        "id": "service_id",
        "name": "Service Name"
      },
      "worker": {
        "id": "worker_id",
        "first_name": "Worker",
        "last_name": "Name",
        "phone": "03001234567"
      },
      "description": "Issue description",
      "quotation": {
        "materials_provided_by": "company",
        "materials_needed": [
          {
            "name": "AC Filter",
            "quantity": 2,
            "unit_cost": 500,
            "total": 1000
          }
        ],
        "materials_cost": 1000,
        "labor_cost": 2000,
        "total_cost": 3000,
        "notes": "Quotation notes",
        "kaacib_reviewed": true,
        "kaacib_reviewed_by": "admin_id",
        "approved": false,
        "approved_by": null,
        "rejected": false
      },
      "notes": [
        {
          "text": "Note text",
          "created_by": "user_id",
          "created_at": "2025-10-29T00:00:00.000Z"
        }
      ],
      "created_at": "2025-10-29T00:00:00.000Z",
      "completed_at": null
    }
  }
}
```

---

### 8. Approve/Reject Quotation

**Endpoint:** `PUT /v1/company/tickets/:id/quotation/approve`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Ticket ID

**Request Body:**
```json
{
  "action": "approve",
  "rejection_reason": ""
}
```

**OR for rejection:**
```json
{
  "action": "reject",
  "rejection_reason": "Reason for rejection (required if action is reject, min 10, max 500 characters)"
}
```

**Field Details:**
- `action` (required): `"approve"` or `"reject"`
- `rejection_reason` (required if reject): String, 10-500 characters (can be empty string if approve)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Quotation approved successfully",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "status": "quotation_approved",
      "quotation": {
        "approved": true,
        "approved_by": "user_id",
        "approved_at": "2025-10-29T00:00:00.000Z"
      }
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Quotation not found or already processed"
}
```

---

### 9. Complete Ticket (Company Marks Work as Done)

**Endpoint:** `POST /v1/company/tickets/:id/complete`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Ticket ID

**Request Body:**
```json
{
  "notes": "Optional completion notes (max 500 characters)"
}
```

**Field Details:**
- `notes` (optional): String, max 500 characters, can be empty

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Ticket completed successfully",
  "data": {
    "ticket": {
      "id": "ticket_id",
      "status": "closed",
      "completed_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

### 10. Add Note to Ticket

**Endpoint:** `POST /v1/company/tickets/:id/notes`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Ticket ID

**Request Body:**
```json
{
  "text": "Note text (required, min 1, max 500 characters)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "note": {
      "text": "Note text",
      "created_by": "user_id",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

## Branch Management APIs

### 11. Create Branch

**Endpoint:** `POST /v1/company/branches`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Branch Name",
  "address": "Complete branch address (min 10, max 200 characters)",
  "city": "City Name",
  "area": "Area Name",
  "coordinates": {
    "lat": 24.8607,
    "lng": 67.0011
  },
  "status": "active",
  "phone": "03001234567",
  "email": "branch@company.com",
  "is_main_branch": false
}
```

**Field Details:**
- `name` (required): String, 2-100 characters
- `address` (required): String, 10-200 characters
- `city` (required): String, 2-50 characters
- `area` (optional): String, can be empty
- `coordinates` (optional): Object with `lat` and `lng` numbers
- `status` (optional): `"active"` or `"inactive"` (default: `"active"`)
- `phone` (optional): String, can be empty
- `email` (optional): String, can be empty
- `is_main_branch` (optional): Boolean (default: `false`)

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "id": "branch_id",
      "name": "Branch Name",
      "address": "Complete branch address",
      "city": "City Name",
      "company": "company_id",
      "status": "active",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

**Note:** Requires `can_manage_branches` permission or `company_admin` role.

---

### 12. Get All Branches

**Endpoint:** `GET /v1/company/branches`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page` (optional): Number
- `limit` (optional): Number
- `status` (optional): Filter by status
- `search` (optional): Search in name, address, city

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branches retrieved successfully",
  "data": {
    "branches": [
      {
        "id": "branch_id",
        "name": "Branch Name",
        "address": "Complete branch address",
        "city": "City Name",
        "phone": "03001234567",
        "email": "branch@company.com",
        "status": "active",
        "is_main_branch": false,
        "company": "company_id"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

**Note:** 
- `company_admin` sees all branches
- `branch_admin` sees only their assigned branch

---

### 13. Get Branch by ID

**Endpoint:** `GET /v1/company/branches/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch retrieved successfully",
  "data": {
    "branch": {
      "id": "branch_id",
      "name": "Branch Name",
      "address": "Complete branch address",
      "city": "City Name",
      "area": "Area Name",
      "coordinates": {
        "lat": 24.8607,
        "lng": 67.0011
      },
      "phone": "03001234567",
      "email": "branch@company.com",
      "status": "active",
      "is_main_branch": false,
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "manager": null,
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

### 14. Update Branch

**Endpoint:** `PUT /v1/company/branches/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Branch ID

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Branch Name",
  "address": "Updated address",
  "city": "Updated City",
  "area": "Updated Area",
  "coordinates": {
    "lat": 24.8607,
    "lng": 67.0011
  },
  "status": "active",
  "phone": "03001234567",
  "email": "updated@company.com",
  "is_main_branch": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch updated successfully",
  "data": {
    "branch": {
      "id": "branch_id",
      "name": "Updated Branch Name",
      ...
    }
  }
}
```

---

### 15. Delete Branch

**Endpoint:** `DELETE /v1/company/branches/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

---

### 16. Get Branch Assets

**Endpoint:** `GET /v1/company/branches/:id/assets`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch assets retrieved successfully",
  "data": {
    "assets": [
      {
        "id": "asset_id",
        "name": "Asset Name",
        "asset_type": "equipment",
        "status": "active",
        "branch": "branch_id"
      }
    ]
  }
}
```

---

### 17. Get Branch Users

**Endpoint:** `GET /v1/company/branches/:id/users`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "first_name": "Ahmed",
        "last_name": "Ali",
        "email": "user@company.com",
        "role": "branch_admin",
        "branch": "branch_id"
      }
    ]
  }
}
```

---

## Asset Management APIs

### 18. Create Asset

**Endpoint:** `POST /v1/company/assets`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "branch_id": "branch_id_here",
  "name": "Asset Name (required, 2-100 characters)",
  "asset_type": "equipment",
  "description": "Asset description",
  "serial_number": "SN123456",
  "model_number": "MODEL-001",
  "brand": "Brand Name",
  "status": "active",
  "location": {
    "address": "Asset location address",
    "coordinates": {
      "lat": 24.8607,
      "lng": 67.0011
    }
  },
  "maintenance_interval_days": 90,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Field Details:**
- `branch_id` (optional): MongoDB ObjectId
- `name` (required): String, 2-100 characters
- `asset_type` (required): One of `"equipment"`, `"vehicle"`, `"property"`, `"furniture"`, `"technology"`, `"other"`
- `description` (optional): String, can be empty
- `serial_number` (optional): String, can be empty
- `model_number` (optional): String, can be empty
- `brand` (optional): String, can be empty
- `status` (optional): One of `"active"`, `"inactive"`, `"maintenance"`, `"retired"` (default: `"active"`)
- `location` (optional): Object with `address` and `coordinates`
- `maintenance_interval_days` (optional): Number, 1-365 (default: 90)
- `images` (optional): Array of image URLs (strings)

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "asset": {
      "id": "asset_id",
      "name": "Asset Name",
      "asset_type": "equipment",
      "serial_number": "SN123456",
      "status": "active",
      "company": "company_id",
      "branch": "branch_id",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

**Note:** Requires `can_manage_assets` permission.

---

### 19. Get All Assets

**Endpoint:** `GET /v1/company/assets`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page` (optional): Number
- `limit` (optional): Number
- `branch_id` (optional): Filter by branch
- `asset_type` (optional): Filter by type
- `status` (optional): Filter by status
- `search` (optional): Search in name, serial number

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "assets": [
      {
        "id": "asset_id",
        "name": "Asset Name",
        "asset_type": "equipment",
        "serial_number": "SN123456",
        "model_number": "MODEL-001",
        "brand": "Brand Name",
        "status": "active",
        "branch": {
          "id": "branch_id",
          "name": "Branch Name"
        },
        "location": {
          "address": "Asset location",
          "coordinates": {
            "lat": 24.8607,
            "lng": 67.0011
          }
        },
        "maintenance_interval_days": 90,
        "images": ["https://example.com/image1.jpg"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 20. Get Asset by ID

**Endpoint:** `GET /v1/company/assets/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Asset retrieved successfully",
  "data": {
    "asset": {
      "id": "asset_id",
      "name": "Asset Name",
      "asset_type": "equipment",
      "description": "Asset description",
      "serial_number": "SN123456",
      "model_number": "MODEL-001",
      "brand": "Brand Name",
      "status": "active",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "branch": {
        "id": "branch_id",
        "name": "Branch Name"
      },
      "location": {
        "address": "Asset location",
        "coordinates": {
          "lat": 24.8607,
          "lng": 67.0011
        }
      },
      "maintenance_interval_days": 90,
      "images": ["https://example.com/image1.jpg"],
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

### 21. Update Asset

**Endpoint:** `PUT /v1/company/assets/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Asset ID

**Request Body:** (All fields optional, same structure as create)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "asset": {
      "id": "asset_id",
      "name": "Updated Asset Name",
      ...
    }
  }
}
```

---

### 22. Delete Asset

**Endpoint:** `DELETE /v1/company/assets/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

### 23. Get Asset Service History

**Endpoint:** `GET /v1/company/assets/:id/service-history`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Asset service history retrieved successfully",
  "data": {
    "serviceHistory": [
      {
        "ticket_id": "ticket_id",
        "ticket_number": "TKT-001",
        "service": "Service Name",
        "completed_at": "2025-10-29T00:00:00.000Z",
        "worker": {
          "id": "worker_id",
          "name": "Worker Name"
        }
      }
    ]
  }
}
```

---

### 24. Create Asset Service Request

**Endpoint:** `POST /v1/company/assets/:id/service-request`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Asset ID

**Request Body:**
```json
{
  "service_id": "service_id_here",
  "sub_services": ["sub_service_id_1", "sub_service_id_2"],
  "description": "Service request description (required, min 10, max 500 characters)",
  "scheduled_start": "2025-11-05T10:00:00.000Z",
  "isUrgent": true,
  "auto_assign": true,
  "currency": "PKR",
  "location": {
    "address_line1": "Address line 1 (required)",
    "address_line2": "Address line 2",
    "city": "City Name (required)",
    "area": "Area Name",
    "house_no": "House Number",
    "coordinates": {
      "lat": 24.8607,
      "lng": 67.0011
    }
  }
}
```

**Field Details:**
- `service_id` (required): MongoDB ObjectId
- `sub_services` (optional): Array of MongoDB ObjectIds
- `description` (required): String, 10-500 characters
- `scheduled_start` (optional): ISO date string
- `isUrgent` (optional): Boolean (default: `true`)
- `auto_assign` (optional): Boolean (default: `true`)
- `currency` (optional): String (default: `"PKR"`)
- `location` (required): Object with address details

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "booking_number": "BK-001",
      "service": "service_id",
      "asset": "asset_id",
      "status": "requested"
    }
  }
}
```

---

## Company User Management APIs

### 25. Create Company User

**Endpoint:** `POST /v1/company/users`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "first_name": "Ahmed",
  "last_name": "Ali",
  "email": "ahmed@company.com",
  "phone": "03001234567",
  "password": "Password123",
  "branch_id": "branch_id_here",
  "role": "branch_admin",
  "permissions": {
    "can_book_services": true,
    "can_complete_bookings": true,
    "can_view_worker_contacts": true,
    "can_manage_assets": true,
    "can_manage_branches": false,
    "can_manage_users": false
  },
  "status": "active"
}
```

**Field Details:**
- `first_name` (required): String, 2-50 characters
- `last_name` (required): String, 2-50 characters
- `email` (required): Valid email address
- `phone` (required): String, 10-15 characters
- `password` (required): String, 6-100 characters
- `branch_id` (optional): MongoDB ObjectId
- `role` (required): `"company_admin"` or `"branch_admin"`
- `permissions` (optional): Object with boolean permissions
- `status` (optional): `"active"` or `"suspended"` (default: `"active"`)

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Company user created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "first_name": "Ahmed",
      "last_name": "Ali",
      "email": "ahmed@company.com",
      "phone": "03001234567",
      "role": "branch_admin",
      "status": "active"
    }
  }
}
```

**Note:** Requires `can_manage_users` permission or `company_admin` role.

---

### 26. Get All Company Users

**Endpoint:** `GET /v1/company/users`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page` (optional): Number
- `limit` (optional): Number
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `branch_id` (optional): Filter by branch
- `search` (optional): Search in name, email

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Company users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "first_name": "Ahmed",
        "last_name": "Ali",
        "email": "ahmed@company.com",
        "phone": "03001234567",
        "role": "branch_admin",
        "status": "active",
        "branch": {
          "id": "branch_id",
          "name": "Branch Name"
        },
        "permissions": {
          "can_book_services": true,
          "can_complete_bookings": true,
          "can_view_worker_contacts": true,
          "can_manage_assets": true,
          "can_manage_branches": false,
          "can_manage_users": false
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### 27. Get Company User by ID

**Endpoint:** `GET /v1/company/users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Company user retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "first_name": "Ahmed",
      "last_name": "Ali",
      "email": "ahmed@company.com",
      "phone": "03001234567",
      "role": "branch_admin",
      "status": "active",
      "company": {
        "id": "company_id",
        "name": "Company Name"
      },
      "branch": {
        "id": "branch_id",
        "name": "Branch Name"
      },
      "permissions": {
        "can_book_services": true,
        "can_complete_bookings": true,
        "can_view_worker_contacts": true,
        "can_manage_assets": true,
        "can_manage_branches": false,
        "can_manage_users": false
      },
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

### 28. Update Company User

**Endpoint:** `PUT /v1/company/users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: User ID

**Request Body:** (All fields optional)
```json
{
  "branch_id": "new_branch_id",
  "role": "company_admin",
  "permissions": {
    "can_book_services": true,
    "can_complete_bookings": true,
    "can_view_worker_contacts": true,
    "can_manage_assets": true,
    "can_manage_branches": true,
    "can_manage_users": true
  },
  "status": "suspended"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Company user updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      ...
    }
  }
}
```

---

### 29. Delete Company User

**Endpoint:** `DELETE /v1/company/users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Company user deleted successfully"
}
```

---

### 30. Get Company User Branches

**Endpoint:** `GET /v1/company/users/:id/branches`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User branches retrieved successfully",
  "data": {
    "branches": [
      {
        "id": "branch_id",
        "name": "Branch Name",
        "address": "Branch Address"
      }
    ]
  }
}
```

---

### 31. Change Password (Company User)

**Endpoint:** `PATCH /v1/company/users/password`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## Booking Management APIs

### 32. Create Company Booking

**Endpoint:** `POST /v1/company/bookings`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "branch_id": "branch_id_here",
  "asset_id": "asset_id_here",
  "service_id": "service_id_here",
  "sub_services": ["sub_service_id_1", "sub_service_id_2"],
  "description": "Booking description (required, min 10, max 500 characters)",
  "scheduled_start": "2025-11-05T10:00:00.000Z",
  "location": {
    "address": "Complete address (required)",
    "coordinates": {
      "lat": 24.8607,
      "lng": 67.0011
    }
  }
}
```

**Field Details:**
- `branch_id` (optional): MongoDB ObjectId
- `asset_id` (optional): MongoDB ObjectId
- `service_id` (required): MongoDB ObjectId
- `sub_services` (optional): Array of MongoDB ObjectIds
- `description` (required): String, 10-500 characters
- `scheduled_start` (optional): ISO date string
- `location` (required): Object with `address` (required) and `coordinates` (optional)

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "booking_number": "BK-001",
      "service": "service_id",
      "customer": "company_id",
      "status": "requested",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  }
}
```

---

### 33. Get All Company Bookings

**Endpoint:** `GET /v1/company/bookings`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page` (optional): Number
- `limit` (optional): Number
- `status` (optional): Filter by booking status
- `search` (optional): Search in booking number

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "booking_number": "BK-001",
        "service": {
          "id": "service_id",
          "name": "Service Name"
        },
        "worker": {
          "id": "worker_id",
          "first_name": "Worker",
          "last_name": "Name"
        },
        "status": "in_progress",
        "scheduled_start": "2025-11-05T10:00:00.000Z",
        "created_at": "2025-10-29T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 34. Get Company Booking by ID

**Endpoint:** `GET /v1/company/bookings/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "booking_number": "BK-001",
      "service": {
        "id": "service_id",
        "name": "Service Name"
      },
      "worker": {
        "id": "worker_id",
        "first_name": "Worker",
        "last_name": "Name",
        "phone": "03001234567"
      },
      "status": "in_progress",
      "location": {
        "address_line1": "Address",
        "city": "City",
        "coordinates": {
          "lat": 24.8607,
          "lng": 67.0011
        }
      },
      "scheduled_start": "2025-11-05T10:00:00.000Z",
      "description": "Booking description"
    }
  }
}
```

---

### 35. Complete Company Booking

**Endpoint:** `POST /v1/company/bookings/:id/complete`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "payment_method": "cash",
  "rating": 5,
  "review": "Great service!",
  "completion_notes": "Work completed successfully"
}
```

**Field Details:**
- `payment_method` (required): One of `"cash"`, `"card"`, `"wallet"`, `"company_account"`
- `rating` (optional): Number, 1-5
- `review` (optional): String, can be empty
- `completion_notes` (optional): String, can be empty

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Booking completed successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "status": "work_completed"
    }
  }
}
```

---

### 36. Get Company Workers List

**Endpoint:** `GET /v1/company/bookings/workers/list`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Workers retrieved successfully",
  "data": {
    "workers": [
      {
        "id": "worker_id",
        "first_name": "Worker",
        "last_name": "Name",
        "phone": "03001234567",
        "rating": 4.5,
        "services": [
          {
            "id": "service_id",
            "name": "Service Name"
          }
        ]
      }
    ]
  }
}
```

---

### 37. Get Booking Worker

**Endpoint:** `GET /v1/company/bookings/:id/worker`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Booking worker retrieved successfully",
  "data": {
    "worker": {
      "id": "worker_id",
      "first_name": "Worker",
      "last_name": "Name",
      "phone": "03001234567",
      "email": "worker@example.com",
      "rating": 4.5,
      "location": {
        "coordinates": [67.0011, 24.8607]
      }
    }
  }
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Common Error Messages

1. **Authentication Errors:**
   - `"Invalid email or password"` - Login failed
   - `"Unauthorized: Invalid token"` - Token expired or invalid
   - `"Unauthorized: Invalid company user"` - User not found

2. **Validation Errors:**
   - `"contract_id is required"` - Missing required field
   - `"description must be at least 10 characters"` - Field validation failed
   - `"Invalid ObjectId"` - Invalid MongoDB ID format

3. **Permission Errors:**
   - `"Insufficient permissions"` - User doesn't have required permission
   - `"Only company_admin can access this resource"` - Role restriction

4. **Resource Errors:**
   - `"Contract not found or not active"` - Resource doesn't exist
   - `"Branch not found or doesn't belong to company"` - Resource ownership issue
   - `"Ticket not found"` - Resource doesn't exist

---

## Integration Checklist

### Authentication Setup
- [ ] Implement login endpoint
- [ ] Store JWT token securely (localStorage/sessionStorage)
- [ ] Add token to all API requests in Authorization header
- [ ] Handle token expiration (redirect to login)
- [ ] Implement password reset flow

### Ticket Management
- [ ] Create corrective ticket
- [ ] List all tickets with filters
- [ ] View ticket details
- [ ] Approve/reject quotations
- [ ] Complete tickets
- [ ] Add notes to tickets

### Branch Management
- [ ] Create, read, update, delete branches
- [ ] List branches with filters
- [ ] View branch assets and users
- [ ] Handle permissions (company_admin vs branch_admin)

### Asset Management
- [ ] Create, read, update, delete assets
- [ ] List assets with filters
- [ ] View asset service history
- [ ] Create service requests from assets

### User Management
- [ ] Create, read, update, delete company users
- [ ] Manage user permissions
- [ ] Change password
- [ ] Handle role-based access

### Booking Management
- [ ] Create bookings
- [ ] List bookings
- [ ] View booking details
- [ ] Complete bookings
- [ ] View workers list

### Error Handling
- [ ] Handle network errors
- [ ] Handle authentication errors (401)
- [ ] Handle validation errors (400)
- [ ] Handle permission errors (403)
- [ ] Handle not found errors (404)
- [ ] Display user-friendly error messages

---

## Quick Reference

### Base URLs
- **Authentication:** `/v1/auth/company`
- **Company APIs:** `/v1/company`

### Required Headers
```javascript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Common Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status
- `search` - Search term
- `sort_by` - Sort field
- `sort_order` - `asc` or `desc`

### Date Format
Use ISO 8601 format: `"2025-10-29T10:00:00.000Z"`

### MongoDB ObjectId Format
24-character hexadecimal string: `"507f1f77bcf86cd799439011"`

---

## Notes

1. **Role-Based Access:**
   - `company_admin` has access to all company resources
   - `branch_admin` has limited access to their branch only

2. **Permissions:**
   - Check user permissions before showing UI elements
   - Some endpoints require specific permissions (e.g., `can_manage_branches`)

3. **Token Expiration:**
   - Tokens expire after a set time
   - Implement automatic token refresh or redirect to login

4. **Pagination:**
   - Most list endpoints support pagination
   - Always include `page` and `limit` for better performance

5. **Validation:**
   - All request bodies are validated on the server
   - Validate on client side before sending for better UX

---

**Last Updated:** October 2025  
**Version:** 1.0.0

