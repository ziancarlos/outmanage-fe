import React from 'react'
const CreateRent = React.lazy(() => import('../../views/transactions/rents/CreateRent'))
const DataRent = React.lazy(() => import('../../views/transactions/rents/DataRent'))
const DetailRent = React.lazy(() => import('../../views/transactions/rents/DetailRent'))

const TransactionRentRoutes = [
  {
    path: '/transactions/rents/new',
    name: 'Tambah Transaski Penyewaan',
    element: CreateRent,
    permissions: [],
  },
  {
    path: '/transactions/rents/data',
    name: 'Data Transaski Penyewaan',
    element: DataRent,
    permissions: [],
  },
  {
    path: '/transactions/rents/:transactionRentId/detail',
    name: 'Data Transaski Penyewaan',
    element: DetailRent,
    permissions: [],
  },
]

export default TransactionRentRoutes
