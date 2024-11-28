import React from 'react'

const DataSecurityDeposit = React.lazy(
  () => import('../views/security-deposit/DataSecurityDeposit'),
)
const DetailSecurityDeposit = React.lazy(
  () => import('../views/security-deposit/DetailSecurityDeposit'),
)
const DataSecurityDepositLog = React.lazy(
  () => import('../views/security-deposit/DataSecurityDepositLog'),
)

const SecurityDepositRoutes = [
  {
    path: '/deposits/data',
    name: 'Data Deposit Keamanan',
    element: DataSecurityDeposit,
    permissions: ['read-deposits'],
  },
  {
    path: '/deposits/:depositId/detail',
    name: 'Detil Deposit Keamanan',
    element: DetailSecurityDeposit,
    permissions: ['read-deposit'],
  },
  {
    path: '/deposits/log',
    name: 'Data Log Deposit Keamanan',
    element: DataSecurityDepositLog,
    permissions: ['read-deposits-logs'],
  },
]

export default SecurityDepositRoutes
