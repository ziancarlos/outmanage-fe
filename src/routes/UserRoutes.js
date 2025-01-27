import React from 'react'
const DataUser = React.lazy(() => import('../views/users/DataUser'))

const CreateUser = React.lazy(() => import('../views/users/CreateUser'))
const UpdateUser = React.lazy(() => import('../views/users/UpdateUser'))
const DetailUser = React.lazy(() => import('../views/users/DetailUser'))
const DataAcitivityLogUser = React.lazy(() => import('../views/users/DataAcitivityLogUser'))
const DataLogUser = React.lazy(() => import('../views/users/DataLogUser'))
const DataArchivedUser = React.lazy(() => import('../views/users/DataArchivedUser'))
const UserRoutes = [
  {
    path: '/users/data',
    name: 'Data Pengguna',
    element: DataUser,
    permissions: ['read-users'],
  },
  {
    path: '/users/activities/logs',
    name: 'Data Aktifitas Pengguna',
    element: DataAcitivityLogUser,
    permissions: ['read-users-activities'],
  },
  {
    path: '/users/data/removed',
    name: 'Data Pengguna Nonaktif',
    element: DataArchivedUser,
    permissions: ['read-removed-users'],
  },
  {
    path: '/users/logs',
    name: 'Data Log Pengguna',
    element: DataLogUser,
    permissions: ['read-users-logs'],
  },
  {
    path: '/users/new',
    name: 'Tambah Pengguna',
    element: CreateUser,
    permissions: ['create-user', 'read-roles'],
  },
  {
    path: '/users/:userId/edit',
    name: 'Ubah Pengguna',
    element: UpdateUser,
    permissions: ['update-user', 'read-roles'],
  },
  {
    path: '/users/:userId/detail',
    name: 'Detil User',
    element: DetailUser,
    permissions: ['read-user'],
  },
]

export default UserRoutes
