import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SaleNavs = [
  {
    component: CNavGroup,
    name: 'Transaksi Penyewaan',
    icon: <FontAwesomeIcon icon={faCalendarCheck} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan',
        to: '/transactions/rents/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan Baru',
        to: '/transactions/rents/new',
        permissions: [],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Penyewaan',
        to: '/transactions/rents/log',
        permissions: ['read-operational-expenses-logs'],
      },
    ],
  },
]

export default SaleNavs
