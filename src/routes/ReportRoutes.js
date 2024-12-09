import React from 'react'

const IncomeStatementReport = React.lazy(() => import('../views/reports/IncomeStatementReport.js'))
const AccountPayableReport = React.lazy(() => import('../views/reports/AccountPayableReport.js'))
const AccountReceivableReport = React.lazy(
  () => import('../views/reports/AccountReceivableReport.js'),
)

const ReportRoutes = [
  {
    path: '/reports/income-statement',
    name: 'Laporan Laba Rugi',
    element: IncomeStatementReport,
    permissions: ['read-report-income-statments'],
  },
  {
    path: '/reports/account-payable',
    name: 'Laporan Hutang',
    element: AccountPayableReport,
    permissions: ['read-report-account-payables'],
  },
  {
    path: '/reports/account-receivable',
    name: 'Laporan Piutang',
    element: AccountReceivableReport,
    permissions: ['read-report-account-receivables'],
  },
]

export default ReportRoutes
