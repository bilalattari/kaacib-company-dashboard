# Kaacib Company Dashboard - Testing & User Flow Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Testing Flows (Developer Perspective)](#testing-flows-developer-perspective)
4. [User Experience Flows (User Perspective)](#user-experience-flows-user-perspective)
5. [Feature Checklist](#feature-checklist)
6. [Performance Testing](#performance-testing)
7. [Common User Scenarios](#common-user-scenarios)

---

## Project Overview

**Kaacib Company Dashboard** is a facility management system that allows companies to:

- Manage maintenance tickets (corrective and preventive)
- Track service cycles and scheduled maintenance
- Manage company assets and branches
- Manage company users with role-based permissions
- View analytics and insights on a comprehensive dashboard

### Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI Components**: Ant Design 5.x
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS 4.x
- **Date Handling**: date-fns
- **Charts**: Recharts
- **API Client**: Axios

---

## User Roles & Permissions

### Permission Types

1. **can_book_services** - Create and view tickets and service cycles
2. **can_complete_bookings** - Mark tickets as complete
3. **can_view_worker_contacts** - View assigned worker details
4. **can_manage_assets** - Create, edit, delete assets
5. **can_manage_branches** - Create, edit, delete branches
6. **can_manage_users** - Create, edit, delete users

### Common Roles

- **Company Admin**: All permissions enabled
- **Branch Manager**: can_book_services, can_manage_assets
- **Basic User**: can_book_services only

---

## Testing Flows (Developer Perspective)

### 1. Authentication Testing Flow

#### Test Case 1.1: Successful Login

**Steps:**

1. Navigate to `/login`
2. Enter valid credentials:
   - Email: `user@company.com`
   - Password: `ValidPassword123`
3. Click "Login" button
4. Verify redirect to `/dashboard`
5. Check localStorage has `user___token` key
6. Verify user info in Redux state
7. Verify theme color is applied from company info

**Expected Results:**

- ✅ User redirected to dashboard
- ✅ Token stored in localStorage
- ✅ User data in Redux state
- ✅ Company theme color applied to UI
- ✅ Sidebar shows correct menu items based on permissions

#### Test Case 1.2: Failed Login

**Steps:**

1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Login" button

**Expected Results:**

- ❌ Error message displayed
- ❌ No redirect occurs
- ❌ No token stored

#### Test Case 1.3: Session Restoration

**Steps:**

1. Log in successfully
2. Refresh the page
3. Verify user remains logged in

**Expected Results:**

- ✅ User session restored from localStorage
- ✅ Company info fetched again
- ✅ User redirected to current page (not to login)

#### Test Case 1.4: Logout

**Steps:**

1. Click logout button in sidebar
2. Verify redirect to `/login`
3. Check localStorage is cleared

**Expected Results:**

- ✅ User redirected to login page
- ✅ localStorage cleared
- ✅ Redux state reset
- ✅ Cannot access protected routes

---

### 2. Dashboard Testing Flow

#### Test Case 2.1: Dashboard Data Load

**Steps:**

1. Log in and land on dashboard
2. Wait for API calls to complete
3. Verify all sections load:
   - KPI cards (total tickets, completed, pending, in progress)
   - Monthly trend chart
   - Priority distribution chart
   - Recent tickets table
   - Overdue tickets (if any)
   - Asset health overview

**Expected Results:**

- ✅ Loading spinner shows initially
- ✅ All KPI cards display correct numbers
- ✅ Charts render with data
- ✅ Tables show recent/overdue tickets
- ✅ Click-through actions work (view ticket, etc.)

#### Test Case 2.2: Dashboard CTAs

**Steps:**

1. Click on various CTA buttons in KPI cards
2. Verify navigation to correct filtered views

**Expected Results:**

- ✅ "View All Tickets" navigates to tickets page
- ✅ "View Pending" navigates with status filter applied
- ✅ Filters are preserved in URL query params

---

### 3. Corrective Tickets Testing Flow

#### Test Case 3.1: View All Tickets

**Steps:**

1. Navigate to `/tickets`
2. Verify table loads with tickets
3. Test pagination
4. Test status filters (All, Pending, Awaiting Approval, In Progress, Completed)

**Expected Results:**

- ✅ Tickets table displays
- ✅ Pagination works correctly
- ✅ Status filters update data
- ✅ Each ticket shows: number, priority, status, service, branch, asset, date
- ✅ Loading state shows during fetch

#### Test Case 3.2: Create Corrective Ticket

**Steps:**

1. Click "Create Ticket" button
2. Fill in form:
   - Select service from dropdown
   - Select branch from dropdown
   - Select asset from dropdown (filtered by branch)
   - Enter description
   - Select priority (Normal/Medium/High)
   - Select scheduled date
   - Upload images (required)
3. Submit form

**Expected Results:**

- ✅ Drawer opens with form
- ✅ Asset dropdown filters based on selected branch
- ✅ Form validation works (required fields)
- ✅ Image upload works (required)
- ✅ Success message on creation
- ✅ Ticket appears in table
- ✅ Drawer closes
- ✅ Cache cleared for assets

#### Test Case 3.3: View Ticket Details

**Steps:**

1. Click eye icon on any ticket
2. Navigate to `/tickets/:id`
3. Verify ticket details page loads:
   - Ticket information (number, status, priority, etc.)
   - Contract, service, asset, branch details
   - Worker details (if assigned)
   - Tabs: Quotation (for corrective), History, Images

**Expected Results:**

- ✅ All ticket details display correctly
- ✅ Tabs show relevant data
- ✅ History timeline shows all events
- ✅ Images grid displays uploaded images
- ✅ Quotation tab shows materials, costs (if available)

#### Test Case 3.4: Quotation Approval/Rejection

**Steps:**

1. Open corrective ticket with quotation
2. Navigate to "Quotation" tab
3. Review quotation details:
   - Labor cost
   - Materials cost & breakdown
   - Total cost
   - Materials provided by
4. Click "Approve" or "Reject" button

**Expected Results:**

- ✅ Quotation details display correctly
- ✅ Materials table shows all items
- ✅ Approve/Reject buttons visible
- ✅ Console logs action (implementation pending)
- ✅ Download PDF button (if PDF available)

---

### 4. Service Cycles (Scheduled Maintenance) Testing Flow

#### Test Case 4.1: View Service Cycles

**Steps:**

1. Navigate to `/services`
2. Verify table shows parent tickets (service cycles)
3. Check columns: ticket number, service type, contract month, status, stats

**Expected Results:**

- ✅ Service cycles table displays
- ✅ Shows ticket statistics (total, done, pending, corrective)
- ✅ Status tags show correctly
- ✅ Can view details of each service

#### Test Case 4.2: View Service Detail

**Steps:**

1. Click eye icon on service cycle
2. Navigate to `/services/:id`
3. Verify service detail page shows:
   - Service information (parent ticket number, service type, contract)
   - Ticket statistics (total, done, pending)
   - Scheduled service details (frequency, scheduled day, asset info)
   - Tabs with all tickets in this cycle

**Expected Results:**

- ✅ Service info displays correctly
- ✅ Statistics cards show numbers
- ✅ Scheduled service details visible
- ✅ Tabs show scheduled and corrective tickets
- ✅ Tickets table shows all related tickets

---

### 5. Assets Management Testing Flow

#### Test Case 5.1: View Assets

**Steps:**

1. Navigate to `/assets` (requires can_manage_assets permission)
2. Verify assets table loads
3. Test pagination

**Expected Results:**

- ✅ Assets table displays
- ✅ Shows: name, type, brand, model, status, branch, maintenance cost
- ✅ Pagination works
- ✅ Cache hit on subsequent visits (10 min)

#### Test Case 5.2: Create Asset

**Steps:**

1. Click "Create Asset" button
2. Fill form:
   - Name, type, brand, model number
   - Select branch
   - Serial number
   - Status (active/inactive)
   - Description
   - Maintenance interval days
3. Submit

**Expected Results:**

- ✅ Form validation works
- ✅ Success message on creation
- ✅ Asset appears in table
- ✅ Cache cleared

#### Test Case 5.3: Edit Asset

**Steps:**

1. Click edit icon on asset
2. Modify fields
3. Submit

**Expected Results:**

- ✅ Form pre-filled with current data
- ✅ Success message on update
- ✅ Table refreshes with new data
- ✅ Cache cleared

#### Test Case 5.4: View Asset Details

**Steps:**

1. Click eye icon on asset
2. Navigate to `/assets/:id`
3. Verify asset detail page shows:
   - Asset information (name, type, brand, model, branch)
   - Additional details (status, serial, description, costs, service requests)
   - Related tickets table

**Expected Results:**

- ✅ Asset details display correctly
- ✅ Related tickets shown
- ✅ Can navigate to ticket details from here

---

### 6. Branches Management Testing Flow

#### Test Case 6.1: View Branches

**Steps:**

1. Navigate to `/branches` (requires can_manage_branches permission)
2. Verify branches table loads

**Expected Results:**

- ✅ Branches table displays
- ✅ Shows: name, address, phone, status
- ✅ Cache hit on subsequent visits

#### Test Case 6.2: Create Branch

**Steps:**

1. Click "Create Branch" button
2. Fill form:
   - Branch name
   - Address
   - City
   - Phone
   - Status
3. Submit

**Expected Results:**

- ✅ Form validation works
- ✅ Success message
- ✅ Branch appears in table
- ✅ Cache cleared

#### Test Case 6.3: Edit Branch

**Steps:**

1. Click edit icon
2. Modify fields
3. Submit

**Expected Results:**

- ✅ Form pre-filled
- ✅ Success message
- ✅ Table updates
- ✅ Cache cleared

---

### 7. Users Management Testing Flow

#### Test Case 7.1: View Users

**Steps:**

1. Navigate to `/users` (requires can_manage_users permission)
2. Verify users table loads

**Expected Results:**

- ✅ Users table displays
- ✅ Shows: name, email, phone, branch, role, permissions, status

#### Test Case 7.2: Create User

**Steps:**

1. Click "Create User" button
2. Fill form:
   - First/last name
   - Email, phone
   - Password
   - Select branch
   - Select role
   - Set permissions checkboxes
3. Submit

**Expected Results:**

- ✅ Form validation works
- ✅ Email format validated
- ✅ Password requirements checked
- ✅ Success message
- ✅ User appears in table

#### Test Case 7.3: Edit User

**Steps:**

1. Click edit icon
2. Modify user details
3. Submit

**Expected Results:**

- ✅ Form pre-filled
- ✅ Can update without changing password
- ✅ Success message

#### Test Case 7.4: Change User Password

**Steps:**

1. Click key icon on user
2. Enter new password
3. Submit

**Expected Results:**

- ✅ Password modal opens
- ✅ Password validation works
- ✅ Success message

#### Test Case 7.5: Delete User

**Steps:**

1. Click delete icon
2. Confirm deletion

**Expected Results:**

- ✅ Confirmation modal appears
- ✅ User deleted
- ✅ Success message

---

### 8. Profile Testing Flow

#### Test Case 8.1: View Profile

**Steps:**

1. Navigate to `/profile`
2. Verify profile information displays:
   - User details (name, email, phone, role)
   - Branch information
   - Permissions list

**Expected Results:**

- ✅ All user info displays correctly
- ✅ Branch details shown
- ✅ Permissions listed

---

### 9. Caching Testing Flow

#### Test Case 9.1: SessionStorage Cache

**Steps:**

1. Navigate to a page that uses cached data (Tickets, Assets, Branches)
2. Open browser DevTools → Network tab
3. Observe API calls
4. Refresh page
5. Check console for cache logs
6. Verify no redundant API calls

**Expected Results:**

- ✅ First visit: API call made, data cached (see "💾 Cached: {key}")
- ✅ Subsequent visits: Data loaded from cache (see "✅ Cache hit for: {key}")
- ✅ No API call on refresh (within 10 min)
- ✅ After 10 min: Cache expired, new API call made

#### Test Case 9.2: Cache Invalidation

**Steps:**

1. Create/edit/delete an asset/branch
2. Verify cache is cleared
3. Check that fresh data is fetched

**Expected Results:**

- ✅ Console shows "🗑️ Cleared cache: {key}"
- ✅ New API call made after action
- ✅ Fresh data displayed

---

### 10. Responsive Design Testing

#### Test Case 10.1: Mobile View (< 768px)

**Steps:**

1. Resize browser to mobile width
2. Test all pages
3. Verify sidebar collapses
4. Check tables are scrollable

**Expected Results:**

- ✅ Sidebar becomes collapsible hamburger menu
- ✅ Tables horizontally scrollable
- ✅ Forms stack vertically
- ✅ All buttons accessible

#### Test Case 10.2: Tablet View (768px - 1024px)

**Steps:**

1. Resize to tablet width
2. Test all pages

**Expected Results:**

- ✅ Two-column layouts work correctly
- ✅ Charts resize appropriately
- ✅ Tables readable

---

## User Experience Flows (User Perspective)

### Flow 1: Company Admin - First Login to Creating a Ticket

**User Goal:** Log in for the first time and create a maintenance ticket

**Steps:**

1. **Login**

   - Opens company dashboard URL
   - Enters email and password
   - Clicks "Login"
   - Lands on Dashboard

2. **Explore Dashboard**

   - Sees overview of all tickets, assets, and health metrics
   - Notices pending tickets need attention
   - Sees colorful charts showing trends

3. **Create Corrective Ticket**

   - Clicks on "Corrective Tickets" in sidebar
   - Clicks "Create Ticket" button
   - Fills in details:
     - Selects "AC Maintenance" service
     - Selects "Downtown Branch"
     - Selects "AC Unit #1" from filtered assets
     - Describes issue: "AC not cooling properly"
     - Sets priority to "High"
     - Picks tomorrow's date
     - Uploads 2-3 photos of the AC unit
   - Clicks "Submit"
   - Sees success message
   - Ticket appears in table with "Pending" status

4. **Track Ticket**
   - Clicks on ticket to view details
   - Sees ticket is assigned to a worker
   - Checks "History" tab to see all actions
   - Waits for quotation

**User Experience Points:**

- ✅ Clean, intuitive interface
- ✅ Guided form with validation
- ✅ Immediate visual feedback
- ✅ Easy to track progress

---

### Flow 2: Branch Manager - Managing Assets

**User Goal:** Add new equipment and track maintenance

**Steps:**

1. **Navigate to Assets**

   - Opens sidebar
   - Clicks "Assets"
   - Sees list of all branch assets

2. **Create New Asset**

   - Clicks "Create Asset" button
   - Enters details:
     - Name: "Refrigerator #5"
     - Type: Equipment
     - Brand: "Samsung"
     - Model: "RF28R7351SR"
     - Branch: "Westside Branch" (their branch)
     - Serial: "ABC123456"
     - Status: Active
     - Maintenance Interval: 30 days
   - Submits form
   - Asset appears in list

3. **View Asset Details**

   - Clicks on new asset
   - Sees complete information
   - Sees maintenance cost: $0 (new asset)
   - Sees service requests: 0
   - Sees list of related tickets (empty)

4. **Create Maintenance Ticket for Asset**
   - Notices "Create Ticket" button on asset detail page
   - Creates ticket for preventive maintenance
   - Form auto-fills branch and asset
   - Submits ticket

**User Experience Points:**

- ✅ Centralized asset management
- ✅ Easy to track asset history
- ✅ Quick ticket creation from asset page
- ✅ Auto-filled forms save time

---

### Flow 3: Basic User - Viewing Service Cycles

**User Goal:** Check scheduled maintenance cycles

**Steps:**

1. **Navigate to Service Cycles**

   - Opens sidebar
   - Clicks "Service Cycles"
   - Sees list of all scheduled maintenance plans

2. **View Service Details**

   - Clicks on "Monthly AC Maintenance - February"
   - Sees service information:
     - Parent ticket number
     - Service type: Continuous
     - Contract: Annual Maintenance Contract
     - Company: Their company name
   - Sees ticket statistics:
     - Total tickets: 15
     - Done: 10
     - Pending: 5
     - Corrective requests: 2

3. **Check Scheduled Service Details**

   - Sees frequency: Monthly
   - Scheduled day: 15th
   - Asset type: HVAC
   - Asset count: 15 units
   - Workers assigned: 3 technicians

4. **Review Individual Tickets**
   - Switches to "Scheduled Tickets" tab
   - Sees all 15 maintenance tickets
   - Filters by "Completed" status
   - Reviews completed maintenance records

**User Experience Points:**

- ✅ Clear overview of maintenance schedules
- ✅ Easy to track completion rates
- ✅ Transparent worker assignments
- ✅ Historical data available

---

### Flow 4: Company Admin - Reviewing Quotations

**User Goal:** Approve or reject worker quotations

**Steps:**

1. **Check Dashboard for Pending Quotations**

   - Sees "Awaiting Approval: 3" on dashboard
   - Clicks to view tickets

2. **Open Ticket with Quotation**

   - Filters by "Awaiting Approval" status
   - Clicks on ticket
   - Automatically lands on "Quotation" tab

3. **Review Quotation Details**

   - Sees labor cost: ₨ 1,500
   - Sees materials cost: ₨ 3,000
   - Reviews materials breakdown:
     - AC Filter x2: ₨ 1,000
     - Refrigerant Gas x1: ₨ 2,000
   - Sees total cost: ₨ 4,500
   - Sees materials provided by: Company
   - Reads notes: "Quotation pending review"

4. **Make Decision**

   - If reasonable: Clicks "Approve" button
   - If too expensive: Clicks "Reject" button
   - Sees confirmation message

5. **Download Quotation PDF (if available)**
   - Clicks "Download Quotation PDF" button
   - PDF downloads for records

**User Experience Points:**

- ✅ Clear cost breakdown
- ✅ Transparent materials list
- ✅ Easy approval workflow
- ✅ Downloadable records

---

### Flow 5: Company Admin - Managing Team

**User Goal:** Add new employee and set permissions

**Steps:**

1. **Navigate to Users**

   - Clicks "Users" in sidebar
   - Sees list of all company users

2. **Create New User**

   - Clicks "Create User" button
   - Fills in details:
     - First name: "Sarah"
     - Last name: "Ahmed"
     - Email: "sarah@company.com"
     - Phone: "03001234567"
     - Password: "TempPassword123"
     - Branch: "Eastside Branch"
     - Role: Branch Manager
     - Permissions:
       - ✅ Can book services
       - ✅ Can manage assets
       - ❌ Can manage branches
       - ❌ Can manage users
   - Submits form
   - User created successfully

3. **Edit User Permissions Later**

   - Realizes Sarah needs branch management access
   - Clicks edit icon on Sarah's row
   - Checks "Can manage branches"
   - Submits update
   - Permissions updated

4. **Reset User Password**
   - Sarah forgets password
   - Admin clicks key icon on her row
   - Enters new temporary password
   - Submits
   - Informs Sarah of new password

**User Experience Points:**

- ✅ Granular permission control
- ✅ Easy user management
- ✅ Quick password resets
- ✅ Role-based access

---

## Feature Checklist

### Core Features

- [x] User Authentication (Login/Logout)
- [x] Session Management (localStorage + Redux)
- [x] Role-based Access Control
- [x] Dynamic Theme (Company branding)
- [x] Responsive Design

### Dashboard

- [x] KPI Cards (Total, Completed, Pending, In Progress)
- [x] Monthly Trend Chart
- [x] Priority Distribution Chart
- [x] Recent Tickets Table
- [x] Overdue Tickets Table
- [x] Asset Health Overview
- [x] Clickable CTAs

### Corrective Tickets

- [x] View All Tickets (with pagination)
- [x] Create Ticket (with image upload)
- [x] View Ticket Details
- [x] Status Filters (Pending, Awaiting Approval, etc.)
- [x] Ticket History Timeline
- [x] Ticket Images Gallery
- [x] Quotation Review (Approve/Reject)
- [x] Download Quotation PDF

### Service Cycles

- [x] View Service Cycles (Parent Tickets)
- [x] View Service Details
- [x] Ticket Statistics
- [x] Scheduled Service Details
- [x] View Related Tickets (Scheduled & Corrective)

### Assets

- [x] View Assets (with pagination)
- [x] Create Asset
- [x] Edit Asset
- [x] View Asset Details
- [x] Asset-Related Tickets
- [x] Cache Management (10 min TTL)

### Branches

- [x] View Branches (with pagination)
- [x] Create Branch
- [x] Edit Branch
- [x] Cache Management

### Users

- [x] View Users (with pagination)
- [x] Create User (with permissions)
- [x] Edit User
- [x] Delete User
- [x] Change Password
- [x] Permission Management

### Profile

- [x] View Profile Information
- [x] Display Permissions

### Performance

- [x] SessionStorage Caching (10 min TTL)
- [x] Cache Invalidation on CRUD
- [x] useMemo Optimization
- [x] Lazy Loading (where applicable)

---

## Performance Testing

### Metrics to Track

1. **Initial Page Load**: < 2 seconds
2. **API Response Time**: < 500ms (with good network)
3. **Cache Hit Rate**: > 80% for static data
4. **Re-render Count**: Minimal with useMemo
5. **Bundle Size**: < 500KB (gzipped)

### Testing Tools

- Chrome DevTools (Network, Performance)
- React DevTools (Profiler)
- Lighthouse (Performance Score)

---

## Common User Scenarios

### Scenario 1: Emergency Ticket

**Context:** AC breaks down in summer, urgent fix needed

**User Actions:**

1. Login → Navigate to Tickets
2. Click "Create Ticket"
3. Select "AC Repair", branch, asset
4. Set priority to "High"
5. Upload photos
6. Schedule for today
7. Submit

**Expected Outcome:** Ticket created with high priority, worker assigned immediately

---

### Scenario 2: Monthly Review

**Context:** Manager reviewing monthly maintenance performance

**User Actions:**

1. Login → Dashboard
2. View KPI cards for overview
3. Check monthly trend chart
4. Review completed vs pending
5. Navigate to Service Cycles
6. Check completion rates
7. Export reports (if feature available)

**Expected Outcome:** Clear visibility into maintenance performance

---

### Scenario 3: Budget Planning

**Context:** Admin planning maintenance budget for next quarter

**User Actions:**

1. Navigate to Assets
2. Review maintenance costs per asset
3. Navigate to Tickets
4. Filter completed tickets
5. Review quotations and actual costs
6. Calculate trends

**Expected Outcome:** Data-driven budget planning

---

## Testing Sign-off Criteria

### Functional Testing

- [ ] All user roles can login
- [ ] All CRUD operations work
- [ ] All filters and searches work
- [ ] All forms validate correctly
- [ ] All permissions enforced correctly

### UI/UX Testing

- [ ] All pages responsive
- [ ] All buttons clickable
- [ ] All forms usable
- [ ] All tables readable
- [ ] Theme applies correctly

### Performance Testing

- [ ] Cache working (10 min)
- [ ] No memory leaks
- [ ] Fast page loads
- [ ] Smooth interactions

### Security Testing

- [ ] Protected routes work
- [ ] Token validation works
- [ ] Unauthorized access blocked
- [ ] Sensitive data hidden

---

## Bug Reporting Template

When testing, report bugs using this format:

**Bug Title:** [Component] Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**

1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:** What should happen

**Actual Behavior:** What actually happens

**Screenshots:** Attach if relevant

**Environment:**

- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- Screen Size: Desktop/Tablet/Mobile

---

## Conclusion

This document provides comprehensive testing flows from both developer and user perspectives. Use these flows to:

1. **Systematically test all features**
2. **Understand user journeys**
3. **Identify edge cases**
4. **Improve UX based on real scenarios**
5. **Train new users on the system**

Remember: **Good testing = Great user experience!**
