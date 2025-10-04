# Service Request System Documentation

## Overview

The Service Request system allows companies to create service requests for their assets. This system integrates with the backend services and sub-services to provide a comprehensive service management solution.

## Backend Service Structure

### Services Model
```javascript
{
  _id: ObjectId,
  title: {
    en: String,  // English title
    ur: String   // Urdu title
  },
  description: {
    en: String,  // English description
    ur: String   // Urdu description
  },
  icon: String,
  metadata: Object,
  banner_images: [String],
  created_by: ObjectId,
  updated_by: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Sub-Services Model
```javascript
{
  _id: ObjectId,
  service: ObjectId,  // Reference to Service
  title: {
    en: String,  // English title
    ur: String   // Urdu title
  },
  description: {
    en: String,  // English description
    ur: String   // Urdu description
  },
  icon: String,
  metadata: Object,
  banner_images: [String],
  created_by: ObjectId,
  updated_by: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Get All Services
```
GET /global/services
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": {
        "en": "Plumbing Services",
        "ur": "پلمبر سروسز"
      },
      "description": {
        "en": "Professional plumbing services",
        "ur": "پروفیشنل پلمبر سروسز"
      },
      "icon": "https://example.com/plumbing-icon.png",
      "metadata": {},
      "banner_images": [],
      "created_by": "60f7b3b3b3b3b3b3b3b3b3b3",
      "updated_by": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2023-07-20T10:00:00.000Z",
      "updatedAt": "2023-07-20T10:00:00.000Z"
    }
  ],
  "message": "Services retrieved successfully"
}
```

### Get Sub-Services by Service ID
```
GET /global/subservices/by-service/:serviceId
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "service": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": {
        "en": "Pipe Repair",
        "ur": "پائپ ریپیئر"
      },
      "description": {
        "en": "Professional pipe repair services",
        "ur": "پروفیشنل پائپ ریپیئر سروسز"
      },
      "icon": "https://example.com/pipe-repair-icon.png",
      "metadata": {},
      "banner_images": [],
      "created_by": "60f7b3b3b3b3b3b3b3b3b3b3",
      "updated_by": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2023-07-20T10:00:00.000Z",
      "updatedAt": "2023-07-20T10:00:00.000Z"
    }
  ],
  "message": "Sub-services retrieved successfully"
}
```

### Create Asset Service Request
```
POST /company/assets/:assetId/service-request
```
**Request Body:**
```json
{
  "service_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sub_services": ["60f7b3b3b3b3b3b3b3b3b3b4"],
  "description": "Detailed description of the service request",
  "scheduled_start": "2023-07-25T10:00:00.000Z",
  "location": {
    "address": "123 Main Street, Karachi",
    "coordinates": {
      "lat": 24.8607,
      "lng": 67.0011
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "booking_type": "company",
      "company": "60f7b3b3b3b3b3b3b3b3b3b6",
      "branch": "60f7b3b3b3b3b3b3b3b3b3b7",
      "asset": "60f7b3b3b3b3b3b3b3b3b3b8",
      "customer": "60f7b3b3b3b3b3b3b3b3b3b9",
      "service": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title_en": "Plumbing Services",
        "title_ur": "پلمبر سروسز"
      },
      "sub_services": ["60f7b3b3b3b3b3b3b3b3b3b4"],
      "description": "Detailed description of the service request",
      "scheduled_start": "2023-07-25T10:00:00.000Z",
      "location": {
        "address": "123 Main Street, Karachi",
        "coordinates": {
          "lat": 24.8607,
          "lng": 67.0011
        }
      },
      "status": "requested",
      "createdAt": "2023-07-20T10:00:00.000Z",
      "updatedAt": "2023-07-20T10:00:00.000Z"
    }
  },
  "message": "Asset service request created successfully"
}
```

## Frontend Implementation

### ServiceRequestModal Component

The `ServiceRequestModal` component provides a user-friendly interface for creating service requests:

#### Features:
- **Service Selection**: Dropdown with all available services
- **Sub-Service Selection**: Dynamic sub-services based on selected service
- **Location Input**: Address field with hardcoded coordinates
- **Scheduling**: Optional scheduled start time
- **Description**: Detailed description field

#### Usage:
```jsx
import ServiceRequestModal from '../components/modals/ServiceRequestModal';

<ServiceRequestModal
  open={serviceOpen}
  onClose={() => setServiceOpen(false)}
  onSubmit={handleServiceRequest}
  asset={selectedAsset}
  loading={loading}
/>
```

#### Form Fields:
1. **Service**: Required dropdown selection
2. **Sub Services**: Multiple selection (disabled until service is selected)
3. **Description**: Required text area (10-500 characters)
4. **Scheduled Start**: Optional datetime picker
5. **Location Address**: Required text input

### Location Handling

The system uses hardcoded coordinates for Karachi:
- **Latitude**: 24.8607
- **Longitude**: 67.0011

This simplifies the user experience by removing the need for manual coordinate input.

## Common Service Types

Based on the backend structure, common services include:

### 1. Plumbing Services
- **Sub-services**: Pipe Repair, Leak Detection, Drain Cleaning, Faucet Installation
- **Service ID**: Retrieved from `/global/services` endpoint

### 2. Electrical Services
- **Sub-services**: Wiring, Outlet Installation, Circuit Breaker Repair, Lighting Installation
- **Service ID**: Retrieved from `/global/services` endpoint

### 3. HVAC Services
- **Sub-services**: AC Repair, Heating Installation, Duct Cleaning, Thermostat Installation
- **Service ID**: Retrieved from `/global/services` endpoint

### 4. Maintenance Services
- **Sub-services**: Preventive Maintenance, Equipment Inspection, Calibration, Testing
- **Service ID**: Retrieved from `/global/services` endpoint

## Error Handling

The system handles various error scenarios:

### 1. Service Loading Errors
```javascript
try {
  const res = await api.get(ENDPOINTS.GET_ALL_SERVICES());
  const data = res.data?.data || res.data || [];
  setServices(data);
} catch (e) {
  console.error('Failed to load services:', e);
  message.error('Failed to load services');
}
```

### 2. Sub-Service Loading Errors
```javascript
try {
  const res = await api.get(ENDPOINTS.GET_SUBSERVICES_BY_SERVICE(serviceId));
  const data = res.data?.data || res.data || [];
  setSubServices(data);
} catch (e) {
  console.error('Failed to load sub-services:', e);
  setSubServices([]);
}
```

### 3. Service Request Creation Errors
```javascript
try {
  await onSubmit(payload);
  form.resetFields();
} catch (error) {
  message.error('Please fill in all required fields');
}
```

## Best Practices

### 1. Service Selection
- Always validate that a service is selected before enabling sub-services
- Provide clear error messages for missing selections
- Use search functionality for large service lists

### 2. Location Handling
- Use hardcoded coordinates for simplicity
- Validate address format
- Provide clear location instructions

### 3. Form Validation
- Require service selection
- Validate description length (10-500 characters)
- Optional scheduling with proper date validation

### 4. User Experience
- Show loading states during API calls
- Provide clear success/error messages
- Reset form after successful submission
- Disable sub-services until service is selected

## Testing

### Manual Testing Steps:
1. **Load Services**: Verify services load correctly from API
2. **Select Service**: Test service selection and sub-service loading
3. **Form Validation**: Test required field validation
4. **Submit Request**: Test successful service request creation
5. **Error Handling**: Test error scenarios and user feedback

### API Testing:
```bash
# Get all services
curl -X GET "http://localhost:3000/api/global/services"

# Get sub-services for a specific service
curl -X GET "http://localhost:3000/api/global/subservices/by-service/60f7b3b3b3b3b3b3b3b3b3b3"

# Create service request
curl -X POST "http://localhost:3000/api/company/assets/60f7b3b3b3b3b3b3b3b3b3b8/service-request" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "service_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "sub_services": ["60f7b3b3b3b3b3b3b3b3b3b4"],
    "description": "Test service request",
    "location": {
      "address": "123 Test Street",
      "coordinates": {
        "lat": 24.8607,
        "lng": 67.0011
      }
    }
  }'
```

## Troubleshooting

### Common Issues:

1. **Services Not Loading**
   - Check API endpoint configuration
   - Verify authentication token
   - Check network connectivity

2. **Sub-Services Not Loading**
   - Verify service ID format
   - Check API endpoint for sub-services
   - Ensure service has associated sub-services

3. **Form Validation Errors**
   - Check required field validation rules
   - Verify description length requirements
   - Ensure proper form field names

4. **Service Request Creation Fails**
   - Verify asset ID exists
   - Check user permissions
   - Validate request payload format

This documentation provides a comprehensive guide for implementing and using the Service Request system in the KAACIB Company Dashboard.
