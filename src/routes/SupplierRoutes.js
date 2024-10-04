import React from 'react'
const DataSupplier = React.lazy(() => import('../views/suppliers/DataSupplier'))
const DataSupplierLog = React.lazy(() => import('../views/suppliers/DataSupplierLog'))
const DetailSupplier = React.lazy(() => import('../views/suppliers/DetailSupplier'))
const CreateSupplier = React.lazy(() => import('../views/suppliers/CreateSupplier'))
const UpdateSupplier = React.lazy(() => import('../views/suppliers/UpdateSupplier'))

const SupplierRoutes = [
  {
    path: '/suppliers/data',
    name: 'Data Pemasok',
    element: DataSupplier,
    permissions: ['read-suppliers'],
  },

  {
    path: '/suppliers/new',
    name: 'Tambah Pemasok',
    element: CreateSupplier,
    permissions: ['create-supplier'],
  },

  {
    path: '/suppliers/log',
    name: 'Data Log Pemasok',
    element: DataSupplierLog,
    permissions: ['read-suppliers-logs'],
  },

  {
    path: '/suppliers/:supplierId/detail',
    name: 'Detil Pemasok',
    element: DetailSupplier,
    permissions: ['read-supplier'],
  },

  {
    path: '/suppliers/:supplierId/edit',
    name: 'Ubah Pemasok',
    element: UpdateSupplier,
    permissions: ['update-supplier'],
  },
]

export default SupplierRoutes
