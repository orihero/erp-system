import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Permission, RolePermission } from '@/api/services/permissions';

interface PermissionsState {
  permissions: Permission[];
  rolePermissions: RolePermission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  permissions: [],
  rolePermissions: [],
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    fetchPermissionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPermissionsSuccess: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
      state.loading = false;
    },
    fetchPermissionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createPermissionStart: (state, action: PayloadAction<Partial<Permission>>) => {
      state.loading = true;
      state.error = null;
    },
    createPermissionSuccess: (state, action: PayloadAction<Permission>) => {
      state.permissions.push(action.payload);
      state.loading = false;
    },
    createPermissionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePermissionStart: (state, action: PayloadAction<{ id: string; data: Partial<Permission> }>) => {
      state.loading = true;
      state.error = null;
    },
    updatePermissionSuccess: (state, action: PayloadAction<Permission>) => {
      const idx = state.permissions.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.permissions[idx] = action.payload;
      state.loading = false;
    },
    updatePermissionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePermissionStart: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deletePermissionSuccess: (state, action: PayloadAction<string>) => {
      state.permissions = state.permissions.filter(p => p.id !== action.payload);
      state.loading = false;
    },
    deletePermissionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchRolePermissionsStart: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchRolePermissionsSuccess: (state, action: PayloadAction<RolePermission[]>) => {
      state.rolePermissions = action.payload;
      state.loading = false;
    },
    fetchRolePermissionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    assignPermissionToRoleStart: (state, action: PayloadAction<{ roleId: string; data: { permission_id: string; effective_from?: string; effective_until?: string; constraint_data?: unknown } }>) => {
      state.loading = true;
      state.error = null;
    },
    assignPermissionToRoleSuccess: (state, action: PayloadAction<RolePermission>) => {
      state.rolePermissions.push(action.payload);
      state.loading = false;
    },
    assignPermissionToRoleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    removePermissionFromRoleStart: (state, action: PayloadAction<{ roleId: string; permissionId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    removePermissionFromRoleSuccess: (state, action: PayloadAction<{ roleId: string; permissionId: string }>) => {
      state.rolePermissions = state.rolePermissions.filter(
        rp => !(rp.role_id === action.payload.roleId && rp.permission_id === action.payload.permissionId)
      );
      state.loading = false;
    },
    removePermissionFromRoleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchPermissionsStart,
  fetchPermissionsSuccess,
  fetchPermissionsFailure,
  createPermissionStart,
  createPermissionSuccess,
  createPermissionFailure,
  updatePermissionStart,
  updatePermissionSuccess,
  updatePermissionFailure,
  deletePermissionStart,
  deletePermissionSuccess,
  deletePermissionFailure,
  fetchRolePermissionsStart,
  fetchRolePermissionsSuccess,
  fetchRolePermissionsFailure,
  assignPermissionToRoleStart,
  assignPermissionToRoleSuccess,
  assignPermissionToRoleFailure,
  removePermissionFromRoleStart,
  removePermissionFromRoleSuccess,
  removePermissionFromRoleFailure,
} = permissionsSlice.actions;

export default permissionsSlice.reducer; 