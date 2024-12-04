import React from 'react'
const CreateSale = React.lazy(() => import('../../views/transactions/sales/CreateSale'))
const CreateSaleShipment = React.lazy(
  () => import('../../views/transactions/sales/CreateSaleShipment'),
)
const DataSale = React.lazy(() => import('../../views/transactions/sales/DataSale'))
const DetailSale = React.lazy(() => import('../../views/transactions/sales/DetailSale'))
const DataSaleLog = React.lazy(() => import('../../views/transactions/sales/DataSaleLog'))
const DetailSaleShipment = React.lazy(
  () => import('../../views/transactions/sales/DetailSaleShipment'),
)

const TransactionSaleRoutes = [
  {
    path: '/transactions/sales/new',
    name: 'Tambah Transaski Penjualan',
    element: CreateSale,
    permissions: ['create-transaction-sale', 'read-clients', `read-inventories`],
  },

  {
    path: '/transactions/sales/data',
    name: 'Data Transaski Penjualan',
    element: DataSale,
    permissions: ['read-transaction-sales'],
  },

  {
    path: '/transactions/sales/:transactionSaleId/detail',
    name: 'Detil Transaski Penjualan',
    element: DetailSale,
    permissions: ['read-transaction-sale'],
  },

  {
    path: '/transactions/sales/:transactionSaleId/shipment',
    name: 'Proses Pengiriman Transaski Penjualan',
    element: CreateSaleShipment,
    permissions: [
      'read-trucks',
      'read-transaction-sale-inventories',
      'create-transaction-sale-shipment',
    ],
  },

  {
    path: '/transactions/sales/log',
    name: 'Data Log Transaski Penjualan',
    element: DataSaleLog,
    permissions: ['read-transaction-sales-logs'],
  },

  {
    path: '/transactions/sales/:transactionSaleId/shipment/:transactionSaleShipmentId/detail',
    name: 'Detil Pengiriman Transaski Penjualan',
    element: DetailSaleShipment,
    permissions: ['read-transaction-sale-shipment'],
  },
]

export default TransactionSaleRoutes
