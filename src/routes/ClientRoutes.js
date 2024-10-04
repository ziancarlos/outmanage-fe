import React from 'react'
const DataClient = React.lazy(() => import('../views/clients/DataClient'))
const DataClientLog = React.lazy(() => import('../views/clients/DataClientLog'))
const DetailClient = React.lazy(() => import('../views/clients/DetailClient'))
const CreateClient = React.lazy(() => import('../views/clients/CreateClient'))
const UpdateClient = React.lazy(() => import('../views/clients/UpdateClient'))

const ClientRoutes = [
  {
    path: '/clients/data',
    name: 'Data Klien',
    element: DataClient,
    permissions: ['read-clients'],
  },

  {
    path: '/clients/new',
    name: 'Tambah Client',
    element: CreateClient,
    permissions: ['create-client'],
  },

  {
    path: '/clients/log',
    name: 'Data Log Klien',
    element: DataClientLog,
    permissions: ['read-clients-logs'],
  },

  {
    path: '/clients/:clientId/detail',
    name: 'Detil Client',
    element: DetailClient,
    permissions: ['read-client'],
  },

  {
    path: '/clients/:clientId/edit',
    name: 'Ubah Client',
    element: UpdateClient,
    permissions: ['update-client'],
  },
]

export default ClientRoutes
