import React from 'react'
const DataShipmentType = React.lazy(() => import('../views/shipment-types/DataShipmentType'))
const CreateShipmentType = React.lazy(() => import('../views/shipment-types/CreateShipmentType.js'))
const UpdateShipmentType = React.lazy(() => import('../views/shipment-types/UpdateShipmentType'))
const DetailShipmentType = React.lazy(() => import('../views/shipment-types/DetailShipmentType'))
const DataLogShipmentType = React.lazy(() => import('../views/shipment-types/DataLogShipmentType'))

const ShipmentTypeRoutes = [
  {
    path: '/shipment-types/data',
    name: 'Data Tipe Pengiriman',
    element: DataShipmentType,
    permissions: ['read-shipment-types'],
  },
  {
    path: '/shipment-types/logs',
    name: 'Data Log Tipe Pengiriman',
    element: DataLogShipmentType,
    permissions: ['read-shipment-types-logs'],
  },
  {
    path: '/shipment-types/new',
    name: 'Tambah Tipe Pengiriman',
    element: CreateShipmentType,
    permissions: ['create-shipment-type'],
  },
  {
    path: '/shipment-types/:shipmentTypeId/edit',
    name: 'Ubah Tipe Pengiriman',
    element: UpdateShipmentType,
    permissions: ['update-shipment-type'],
  },
  {
    path: '/shipment-types/:shipmentTypeId/detail',
    name: 'Detil Tipe Pengiriman',
    element: DetailShipmentType,
    permissions: ['read-shipment-type'],
  },
]

export default ShipmentTypeRoutes
