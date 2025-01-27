import React from 'react'
const DataRole = React.lazy(() => import('../views/roles/DataRole'))

const CreateRole = React.lazy(() => import('../views/roles/CreateRole'))
const UpdateRole = React.lazy(() => import('../views/roles/UpdateRole'))
const DetailRole = React.lazy(() => import('../views/roles/DetailRole'))

const RoleRoutes = [
  {
    path: '/roles/data',
    name: 'Data Peran',
    element: DataRole,
    permissions: ['read-roles'],
  },
  {
    path: '/roles/new',
    name: 'Tambah Peran',
    element: CreateRole,
    permissions: ['create-role'],
  },
  {
    path: '/roles/:roleId/edit',
    name: 'Ubah Peran',
    element: UpdateRole,
    permissions: ['read-role', 'update-role'],
  },
  {
    path: '/roles/:roleId/detail',
    name: 'Detil Peran',
    element: DetailRole,
    permissions: ['read-permissions-with-related'],
  },
]

export default RoleRoutes
