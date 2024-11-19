import { CNavGroup, CNavItem } from '@coreui/react-pro'
import {
  faCalendarCheck,
  faExchangeAlt,
  faReceipt,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons'
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
        to: '/transactions/rent/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan Baru',
        to: '/transactions/rent/new',
        permissions: ['create-operational-expense'],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Penyewaan',
        to: '/transactions/rent/log',
        permissions: ['read-operational-expenses-logs'],
      },
    ],
  },
]

export default SaleNavs
