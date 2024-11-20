import React from 'react'
const CreateRent = React.lazy(() => import('../../views/transactions/rents/CreateRent'))

const TransactionSaleRoutes = [
  {
    path: '/transactions/rents/new',
    name: 'Tambah Transaski Penyewaan',
    element: CreateRent,
    permissions: [],
  },
]

export default TransactionSaleRoutes
