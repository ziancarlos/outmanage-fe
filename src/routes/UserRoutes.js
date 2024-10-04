import React from 'react'
const ManageUser = React.lazy(() => import('../views/users/ManageUser'))
const UpdateUser = React.lazy(() => import('../views/users/UpdateUser'))
const DetailUser = React.lazy(() => import('../views/users/DetailUser'))

const UserRoutes = [
  {
    path: '/users',
    name: 'Data Users',
    element: ManageUser,
    permissions: ['read-users'],
  },
  {
    path: '/users/:userId/edit',
    name: 'Ubah Users',
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
