import React from 'react'
const CreateRent = React.lazy(() => import('../../views/transactions/rents/CreateRent'))
const CreateRentShipment = React.lazy(
  () => import('../../views/transactions/rents/CreateRentShipment'),
)
const CreateRentReturn = React.lazy(() => import('../../views/transactions/rents/CreateRentReturn'))
const DetailRentReturn = React.lazy(() => import('../../views/transactions/rents/DetailRentReturn'))
const CreateRentBill = React.lazy(() => import('../../views/transactions/rents/CreateRentBill'))
const DataRent = React.lazy(() => import('../../views/transactions/rents/DataRent'))
const DataRentCancel = React.lazy(() => import('../../views/transactions/rents/DataRentCancel'))
const DetailRent = React.lazy(() => import('../../views/transactions/rents/DetailRent'))
const DetailRentShipment = React.lazy(
  () => import('../../views/transactions/rents/DetailRentShipment'),
)
const DetailRentBill = React.lazy(() => import('../../views/transactions/rents/DetailRentBill'))
const DataRentLog = React.lazy(() => import('../../views/transactions/rents/DataRentLog'))

const TransactionRentRoutes = [
  {
    path: '/transactions/rents/new',
    name: 'Tambah Transaski Penyewaan',
    element: CreateRent,
    permissions: ['create-transaction-rent', 'read-clients', `read-inventories`],
  },
  {
    path: '/transactions/rents/data',
    name: 'Data Transaski Penyewaan',
    element: DataRent,
    permissions: ['read-transaction-rents'],
  },
  {
    path: '/transactions/rents/cancel',
    name: 'Data Transaski Penyewaan',
    element: DataRentCancel,
    permissions: ['read-transaction-rents'],
  },
  {
    path: '/transactions/rents/:transactionRentId/detail',
    name: 'Data Transaski Penyewaan',
    element: DetailRent,
    permissions: ['read-transaction-rent'],
  },
  {
    path: '/transactions/rents/log',
    name: 'Data Log Transaski Penyewaan',
    element: DataRentLog,
    permissions: ['read-transaction-rents-logs'],
  },
  {
    path: '/transactions/rents/:transactionRentId/shipment',
    name: 'Tambah Pengiriman Transaski Penyewaan',
    element: CreateRentShipment,
    permissions: [
      'read-transaction-rent',
      'create-transaction-rent-shipment',
      'read-trucks',
      'read-transaction-rent-inventories',
    ],
  },
  {
    path: '/transactions/rents/:transactionRentId/shipment/:transactionRentShipmentId/detail',
    name: 'Detil Pengiriman Transaksi Penyewaan',
    element: DetailRentShipment,
    permissions: ['read-transaction-rent-shipment', 'read-transaction-rent'],
  },
  {
    path: '/transactions/rents/:transactionRentId/bill/:transactionRentBillId/detail',
    name: 'Detil Tagihan Transaksi Penyewaan',
    element: DetailRentBill,
    permissions: [
      'read-transaction-rent-bill',
      'read-transaction-rent-bill-inventories',
      'read-transaction-rent',
    ],
  },
  {
    path: '/transactions/rents/:transactionRentId/bill',
    name: 'Tambah Tagihan Transaksi Penyewaan',
    element: CreateRentBill,
    permissions: [
      'create-transaction-rent-bill',
      'read-transaction-rent-inventories',
      'read-transaction-rent',
    ],
  },

  {
    path: '/transactions/rents/:transactionRentId/return',
    name: 'Tambah Pengembalian Transaski Penyewaan',
    element: CreateRentReturn,
    permissions: [
      'create-transaction-rent-return',
      'read-transaction-rent-inventories',
      'read-transaction-rent',
    ],
  },

  {
    path: '/transactions/rents/:transactionRentId/return/:transactionRentReturnId/detail',
    name: 'Detil Pengembalian Transaski Penyewaan',
    element: DetailRentReturn,
    permissions: ['read-transaction-rent-return', 'read-transaction-rent'],
  },
]

export default TransactionRentRoutes
