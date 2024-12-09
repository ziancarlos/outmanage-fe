import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ReportNavs = [
  {
    component: CNavGroup,
    name: 'Laporan',
    icon: <FontAwesomeIcon icon={faChartLine} className="nav-icon no-fill-icon" />,
    permissions: ['read-purchases', 'create-purchase', 'read-purchases-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Laporan Laba Rugi',
        to: '/reports/income-statement',
        permissions: ['read-report-income-statments'],
      },
      {
        component: CNavItem,
        name: 'Laporan Hutang',
        to: '/reports/account-payable',
        permissions: ['read-report-account-payables'],
      },
      {
        component: CNavItem,
        name: 'Laporan Piutang',
        to: '/reports/account-receivable',
        permissions: ['read-report-account-receivables'],
      },
    ],
  },
]

export default ReportNavs
