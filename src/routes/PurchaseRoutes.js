import React from 'react'

const CreatePurchase = React.lazy(() => import('../views/purchases/CreatePurchase'))
const DataPurchase = React.lazy(() => import('../views/purchases/DataPurchase'))
const DataPurchaseLog = React.lazy(() => import('../views/purchases/DataPurchaseLog'))
const DetailPurchase = React.lazy(() => import('../views/purchases/DetailPurchase'))

const PurchaseRoutes = [
  {
    path: '/purchases/data',
    name: 'Data Pembelian',
    element: DataPurchase,
    permissions: ['read-purchases', 'read-suppliers'],
  },
  {
    path: '/purchases/new',
    name: 'Tambah Pembelian',
    element: CreatePurchase,
    permissions: ['create-purchase', 'read-suppliers', 'read-inventories'],
  },
  {
    path: '/purchases/log',
    name: 'Data Log Pembelian',
    element: DataPurchaseLog,
    permissions: ['read-purchases-logs'],
  },
  {
    path: '/purchases/:purchaseId/detail',
    name: 'Detil Pembelian',
    element: DetailPurchase,
    permissions: ['read-purchase'],
  },
]

export default PurchaseRoutes
