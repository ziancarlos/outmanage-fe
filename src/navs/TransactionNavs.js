import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TransactionNavs = [
  {
    component: CNavGroup,
    name: 'Transaksi',
    icon: <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Transaksi Pembelian',
        to: '/operational-expenses/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan',
        to: '/operational-expenses/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Pembelian Baru',
        to: '/operational-expenses/new',
        permissions: ['create-operational-expense'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan Baru',
        to: '/operational-expenses/new',
        permissions: ['create-operational-expense'],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Pembelian',
        to: '/operational-expenses/log',
        permissions: ['read-operational-expenses-logs'],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Penyewaan',
        to: '/operational-expenses/log',
        permissions: ['read-operational-expenses-logs'],
      },
    ],
  },
]

export default TransactionNavs
