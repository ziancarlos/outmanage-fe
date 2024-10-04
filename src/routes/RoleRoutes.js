import React from 'react'

const DataRoles = React.lazy(() => import('../views/roles/DataRoles'))
const DetailRolePermissions = React.lazy(() => import('../views/roles/DetailRolePermissions'))

const RoleRoutes = [
  {
    path: '/roles',
    name: 'Data Peran',
    element: DataRoles,
    permissions: ['read-roles'],
  },
  {
    path: '/roles/:roleId/permissions',
    name: 'Detil Peran Dan Izin',
    element: DetailRolePermissions,
    permissions: ['read-permissions-with-related-by-role-id'],
  },
]

export default RoleRoutes
