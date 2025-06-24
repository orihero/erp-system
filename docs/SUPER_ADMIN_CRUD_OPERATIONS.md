# Super Admin CRUD Operations for Roles and Permissions

This document outlines the complete CRUD (Create, Read, Update, Delete) operations available to super_admin users for managing roles and permissions in the ERP system.

## Overview

Super admin users have full control over the role-based access control system, including:
- **Role Management**: Create, view, edit, and delete user roles
- **Permission Management**: Create, view, edit, and delete system permissions
- **Role-Permission Assignments**: Assign permissions to roles and manage these relationships

## Access Control

All operations require:
1. **Authentication**: Valid JWT token
2. **Authorization**: Super admin role (`super_admin`)
3. **Permissions**: Appropriate permission checks (handled automatically)

## Role Management

### Available Operations

#### 1. Create Role
- **Endpoint**: `POST /api/roles`
- **Access**: Super admin only
- **Payload**:
  ```json
  {
    "name": "Role Name",
    "description": "Role description (optional)"
  }
  ```
- **Response**: Created role object with ID

#### 2. Read Roles
- **Endpoint**: `GET /api/roles`
- **Access**: Super admin only
- **Response**: Array of all roles
- **Features**:
  - Lists all roles in the system
  - Includes system roles (marked as `is_system: true`)
  - Shows role descriptions

#### 3. Update Role
- **Endpoint**: `PUT /api/roles/:id`
- **Access**: Super admin only
- **Payload**:
  ```json
  {
    "name": "Updated Role Name",
    "description": "Updated description"
  }
  ```
- **Restrictions**: Cannot update system roles
- **Response**: Updated role object

#### 4. Delete Role
- **Endpoint**: `DELETE /api/roles/:id`
- **Access**: Super admin only
- **Restrictions**:
  - Cannot delete system roles
  - Cannot delete roles assigned to users
- **Response**: 204 No Content on success

### Frontend Interface

The role management interface is accessible through:
1. **Sidebar Navigation**: "Roles" item (visible only to super_admin users)
2. **Main Page**: `/roles` route
3. **Drawer Interface**: Click "Manage Roles" button to open the role management drawer

## Permission Management

### Available Operations

#### 1. Create Permission
- **Endpoint**: `POST /api/permissions`
- **Access**: Super admin only
- **Payload**:
  ```json
  {
    "name": "permission.name",
    "description": "Permission description",
    "type": "read|write|delete|create",
    "module_id": "uuid (optional)",
    "directory_id": "uuid (optional)"
  }
  ```
- **Response**: Created permission object with ID

#### 2. Read Permissions
- **Endpoint**: `GET /api/permissions`
- **Access**: Super admin only
- **Response**: Array of all permissions with module and directory associations

#### 3. Update Permission
- **Endpoint**: `PUT /api/permissions/:id`
- **Access**: Super admin only
- **Payload**: Same as create, all fields optional
- **Response**: Updated permission object

#### 4. Delete Permission
- **Endpoint**: `DELETE /api/permissions/:id`
- **Access**: Super admin only
- **Restrictions**: Cannot delete permissions assigned to roles
- **Response**: 204 No Content on success

### Frontend Interface

The permission management interface is accessible through:
1. **Sidebar Navigation**: "Permissions" item (visible only to super_admin users)
2. **Main Page**: `/permissions` route
3. **Tabbed Interface**: Two tabs for "Permissions" and "Role Permissions"

## Role-Permission Assignments

### Available Operations

#### 1. Assign Permission to Role
- **Endpoint**: `POST /api/permissions/roles/:roleId/permissions`
- **Access**: Super admin only
- **Payload**:
  ```json
  {
    "permission_id": "uuid",
    "effective_from": "2024-01-01T00:00:00Z (optional)",
    "effective_until": "2024-12-31T23:59:59Z (optional)",
    "constraint_data": {} (optional)
  }
  ```
- **Response**: Created role-permission assignment

#### 2. Get Role Permissions
- **Endpoint**: `GET /api/permissions/roles/:roleId/permissions`
- **Access**: Super admin only
- **Response**: Array of permissions assigned to the role

#### 3. Remove Permission from Role
- **Endpoint**: `DELETE /api/permissions/roles/:roleId/permissions/:permissionId`
- **Access**: Super admin only
- **Response**: 204 No Content on success

## Frontend Features

### Role Management Page (`/roles`)
- **Overview Cards**: Visual representation of roles, permissions, and assignments
- **Manage Roles Button**: Opens role management drawer
- **Responsive Design**: Works on desktop and mobile devices

### Role Management Drawer
- **List View**: Shows all roles with descriptions
- **Add Role**: Form to create new roles
- **Edit Role**: Inline editing for existing roles
- **Delete Role**: Confirmation dialog for role deletion
- **System Role Protection**: Visual indicators for system roles

### Permissions Management Page (`/permissions`)
- **Tabbed Interface**:
  - **Permissions Tab**: CRUD operations for permissions
  - **Role Permissions Tab**: Manage role-permission assignments
- **Role Selector**: Dropdown to select roles for permission management
- **Permission Grid**: Visual grid showing assigned/unassigned permissions
- **Bulk Operations**: Assign/remove multiple permissions at once

## Security Features

### Authentication & Authorization
- **JWT Token Required**: All endpoints require valid authentication
- **Role-Based Access**: Only super_admin users can access these features
- **Permission Checks**: Additional permission-based authorization

### Data Protection
- **System Role Protection**: System roles cannot be modified or deleted
- **Assignment Validation**: Roles assigned to users cannot be deleted
- **Permission Validation**: Permissions assigned to roles cannot be deleted
- **Duplicate Prevention**: Prevents duplicate role names and permission assignments

### Input Validation
- **Required Fields**: Role names and permission names are required
- **Unique Constraints**: Role names must be unique
- **Data Types**: Proper validation for UUIDs, dates, and other data types

## Error Handling

### Common Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., role name already exists)
- **500 Internal Server Error**: Server-side errors

### Error Messages
All error responses include descriptive messages to help identify and resolve issues.

## Usage Examples

### Creating a New Role
```javascript
// Frontend API call
const newRole = await rolesApi.create({
  name: "Manager",
  description: "Department manager role"
});
```

### Assigning Permissions to a Role
```javascript
// Frontend API call
await permissionsApi.assignToRole(roleId, {
  permission_id: permissionId,
  effective_from: new Date().toISOString()
});
```

### Getting All Roles
```javascript
// Frontend API call
const roles = await rolesApi.getAll();
```

## Testing

A test script is provided (`test-permissions.js`) to verify all CRUD operations. To run tests:

1. Ensure you're logged in as super_admin
2. Start the backend server
3. Run the test script (uncomment the `runTests()` call)

## Best Practices

1. **Role Naming**: Use descriptive, hierarchical names (e.g., "admin.users", "manager.sales")
2. **Permission Naming**: Use dot notation for hierarchical permissions (e.g., "users.create", "reports.view")
3. **Documentation**: Always provide descriptions for roles and permissions
4. **Testing**: Test role-permission assignments thoroughly before deployment
5. **Backup**: Regularly backup role and permission configurations

## Troubleshooting

### Common Issues
1. **Cannot delete role**: Check if role is assigned to users or is a system role
2. **Cannot delete permission**: Check if permission is assigned to roles
3. **Access denied**: Ensure you're logged in as super_admin
4. **Duplicate role name**: Choose a different name for the role

### Debug Steps
1. Check authentication status
2. Verify user role is super_admin
3. Check browser console for error messages
4. Verify API endpoint responses
5. Check database constraints and relationships 