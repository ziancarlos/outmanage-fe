import React from 'react'
const DataDeliveryOrder = React.lazy(() => import('../views/delivery-orders/DataDeliveryOrder'))
const CreateDeliveryOrder = React.lazy(() => import('../views/delivery-orders/CreateDeliveryOrder'))
const UpdateDeliveryOrder = React.lazy(() => import('../views/delivery-orders/UpdateDeliveryOrder'))
const DetailDeliveryOrder = React.lazy(() => import('../views/delivery-orders/DetailDeliveryOrder'))
const DataLogDeliveryOrder = React.lazy(
  () => import('../views/delivery-orders/DataLogDeliveryOrder'),
)

const DeliveryOrderRoutes = [
  {
    path: '/delivery-orders/data',
    name: 'Data DO',
    element: DataDeliveryOrder,
    permissions: ['read-delivery-orders'],
  },
  {
    path: '/delivery-orders/logs',
    name: 'Data Log DO',
    element: DataLogDeliveryOrder,
    permissions: ['read-delivery-orders-logs'],
  },
  {
    path: '/delivery-orders/new',
    name: 'Tambah DO',
    element: CreateDeliveryOrder,
    permissions: ['create-delivery-order', 'read-customers', 'read-items'],
  },
  {
    path: '/delivery-orders/:deliveryOrderId/edit',
    name: 'Ubah DO',
    element: UpdateDeliveryOrder,
    permissions: ['update-delivery-order', 'read-customers', 'read-items'],
  },
  {
    path: '/delivery-orders/:deliveryOrderId/detail',
    name: 'Detil DO',
    element: DetailDeliveryOrder,
    permissions: ['read-delivery-order'],
  },
]

export default DeliveryOrderRoutes
