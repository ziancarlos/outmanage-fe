import React from 'react'
const DataItem = React.lazy(() => import('../views/items/DataItem'))
const CreateItem = React.lazy(() => import('../views/items/CreateItem'))
const UpdateItem = React.lazy(() => import('../views/items/UpdateItem'))
const DetailItem = React.lazy(() => import('../views/items/DetailItem'))
const DataLogItem = React.lazy(() => import('../views/items/DataLogItem'))

const ItemRoutes = [
  {
    path: '/items/data',
    name: 'Data Barang',
    element: DataItem,
    permissions: ['read-items'],
  },
  {
    path: '/items/logs',
    name: 'Data Log Barang',
    element: DataLogItem,
    permissions: ['read-items-logs'],
  },
  {
    path: '/items/new',
    name: 'Tambah Barang',
    element: CreateItem,
    permissions: ['create-item'],
  },
  {
    path: '/items/:itemId/edit',
    name: 'Ubah Barang',
    element: UpdateItem,
    permissions: ['update-item'],
  },
  {
    path: '/items/:itemId/detail',
    name: 'Detil Barang',
    element: DetailItem,
    permissions: ['read-item'],
  },
]

export default ItemRoutes
