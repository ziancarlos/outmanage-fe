import React from 'react'
const DataInventory = React.lazy(() => import('../views/inventories/DataInventory'))
const DataInventoryLog = React.lazy(() => import('../views/inventories/DataInventoryLog'))
const DetailInventory = React.lazy(() => import('../views/inventories/DetailInventory'))
const CreateInventory = React.lazy(() => import('../views/inventories/CreateInventory'))

const InventoryRoutes = [
  {
    path: '/inventories/data',
    name: 'Data Inventaris',
    element: DataInventory,
    permissions: ['read-inventories'],
  },

  {
    path: '/inventories/new',
    name: 'Tambah Inventaris',
    element: CreateInventory,
    permissions: ['create-inventory'],
  },

  {
    path: '/inventories/log',
    name: 'Data Log Inventaris',
    element: DataInventoryLog,
    permissions: ['read-inventories-logs'],
  },

  {
    path: '/inventories/:inventoryId/detail',
    name: 'Detil Inventaris',
    element: DetailInventory,
    permissions: ['read-inventory'],
  },
]

export default InventoryRoutes
