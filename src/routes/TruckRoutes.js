import React from 'react'
const DataTruck = React.lazy(() => import('../views/trucks/DataTruck'))
const CreateTruck = React.lazy(() => import('../views/trucks/CreateTruck'))
const UpdateTruck = React.lazy(() => import('../views/trucks/UpdateTruck'))

const TruckRoutes = [
  {
    path: '/trucks/data',
    name: 'Data Truk',
    element: DataTruck,
    permissions: ['read-trucks'],
  },
  {
    path: '/trucks/new',
    name: 'Tambah Truk',
    element: CreateTruck,
    permissions: ['read-trucks-brands', 'read-trucks-colors', `create-truck`],
  },

  {
    path: '/trucks/:truckId/edit',
    name: 'Ubah Truk',
    element: UpdateTruck,
    permissions: [`update-truck`, `read-truck`],
  },
]

export default TruckRoutes
