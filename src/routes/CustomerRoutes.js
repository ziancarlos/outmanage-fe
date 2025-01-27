import React from 'react'
const DataCustomer = React.lazy(() => import('../views/customers/DataCustomer'))
const CreateCustomer = React.lazy(() => import('../views/customers/CreateCustomer'))
const UpdateCustomer = React.lazy(() => import('../views/customers/UpdateCustomer'))
const DetailCustomer = React.lazy(() => import('../views/customers/DetailCustomer'))
const DataLogCustomer = React.lazy(() => import('../views/customers/DataLogCustomer'))

const CustomerRoutes = [
  {
    path: '/customers/data',
    name: 'Data Kustomer',
    element: DataCustomer,
    permissions: ['read-customers'],
  },
  {
    path: '/customers/logs',
    name: 'Data Log Kustomer',
    element: DataLogCustomer,
    permissions: ['read-customers-logs'],
  },
  {
    path: '/customers/new',
    name: 'Tambah Kustomer',
    element: CreateCustomer,
    permissions: ['create-customer'],
  },
  {
    path: '/customers/:customerId/edit',
    name: 'Ubah Kustomer',
    element: UpdateCustomer,
    permissions: ['update-customer'],
  },
  {
    path: '/customers/:customerId/detail',
    name: 'Detil Kustomer',
    element: DetailCustomer,
    permissions: ['read-customer'],
  },
]

export default CustomerRoutes
