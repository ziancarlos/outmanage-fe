import React from 'react'
const DataFleet = React.lazy(() => import('../views/fleets/DataFleet'))
const CreateFleet = React.lazy(() => import('../views/fleets/CreateFleet'))
const UpdateFleet = React.lazy(() => import('../views/fleets/UpdateFleet'))
const DetailFleet = React.lazy(() => import('../views/fleets/DetailFleet'))
const DataLogFleet = React.lazy(() => import('../views/fleets/DataLogFleet'))

const FleetRoutes = [
  {
    path: '/fleets/data',
    name: 'Data Armada',
    element: DataFleet,
    permissions: ['read-fleets'],
  },
  {
    path: '/fleets/logs',
    name: 'Data Log Armada',
    element: DataLogFleet,
    permissions: ['read-fleets-logs'],
  },
  {
    path: '/fleets/new',
    name: 'Tambah Armada',
    element: CreateFleet,
    permissions: ['create-fleet'],
  },
  {
    path: '/fleets/:fleetId/edit',
    name: 'Ubah Armada',
    element: UpdateFleet,
    permissions: ['update-fleet'],
  },
  {
    path: '/fleets/:fleetId/detail',
    name: 'Detil Armada',
    element: DetailFleet,
    permissions: ['read-fleet'],
  },
]

export default FleetRoutes
