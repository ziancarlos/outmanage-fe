import React from 'react'
const DataOperationalExpense = React.lazy(
  () => import('../views/operational-expenses/DataOperationalExpense'),
)
const DataCancelOperationalExpense = React.lazy(
  () => import('../views/operational-expenses/DataCancelOperationalExpense'),
)
const DataOperationalExpenseLog = React.lazy(
  () => import('../views/operational-expenses/DataOperationalExpenseLog'),
)

const CreateOperationalExpense = React.lazy(
  () => import('../views/operational-expenses/CreateOperationalExpense'),
)

const UpdateOperationalExpense = React.lazy(
  () => import('../views/operational-expenses/UpdateOperationalExpense'),
)

const DetailOperationalExpense = React.lazy(
  () => import('../views/operational-expenses/DetailOperationalExpense'),
)

const OperationalExpensesRoutes = [
  {
    path: '/operational-expenses/data',
    name: 'Data Klien',
    element: DataOperationalExpense,
    permissions: ['read-operational-expenses'],
  },

  {
    path: '/operational-expenses/new',
    name: 'Tambah Biaya Operasional',
    element: CreateOperationalExpense,
    permissions: ['create-operational-expense'],
  },
  {
    path: '/operational-expenses/log',
    name: 'Data Log Biaya Operasional',
    element: DataOperationalExpenseLog,
    permissions: ['read-operational-expenses-logs'],
  },

  {
    path: '/operational-expenses/:operationalExpenseId/detail',
    name: 'Detil Biaya Operasional',
    element: DetailOperationalExpense,
    permissions: ['read-operational-expense'],
  },

  {
    path: '/operational-expenses/:operationalExpenseId/edit',
    name: 'Ubah Biaya Operasional',
    element: UpdateOperationalExpense,
    permissions: ['update-operational-expense'],
  },
  {
    path: '/operational-expenses/cancel',
    name: 'Data Batal Biaya Operasional',
    element: DataCancelOperationalExpense,
    permissions: ['read-operational-expenses'],
  },
]

export default OperationalExpensesRoutes
