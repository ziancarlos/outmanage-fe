import React from 'react'
const DataShipment = React.lazy(() => import('../views/shipments/DataShipment'))
const CreateShipment = React.lazy(() => import('../views/shipments/CreateShipment'))
const UpdateShipment = React.lazy(() => import('../views/shipments/UpdateShipment'))
const DetailShipment = React.lazy(() => import('../views/shipments/DetailShipment'))
const DataLogShipment = React.lazy(() => import('../views/shipments/DataLogShipment'))

const ShipmentRoutes = [
  {
    path: '/shipments/data',
    name: 'Data Pengiriman',
    element: DataShipment,
    permissions: ['read-shipments'],
  },
  {
    path: '/shipments/logs',
    name: 'Data Log Pengiriman',
    element: DataLogShipment,
    permissions: ['read-shipments-logs'],
  },
  {
    path: '/shipments/new',
    name: 'Tambah Pengiriman',
    element: CreateShipment,
    permissions: ['create-shipment'],
  },
  {
    path: '/shipments/:shipmentId/edit',
    name: 'Ubah Pengiriman',
    element: UpdateShipment,
    permissions: ['update-shipment'],
  },
  {
    path: '/shipments/:shipmentId/detail',
    name: 'Detil Pengiriman',
    element: DetailShipment,
    permissions: ['read-shipment'],
  },
]

export default ShipmentRoutes
