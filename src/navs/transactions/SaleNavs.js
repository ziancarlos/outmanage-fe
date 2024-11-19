import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faExchangeAlt, faReceipt, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SaleNavs = [
  {
    component: CNavGroup,
    name: 'Transaksi Penjualan',
    icon: <FontAwesomeIcon icon={faReceipt} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Transaksi Penjualan',
        to: '/transactions/sales/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penjualan Baru',
        to: '/transactions/sales/new',
        permissions: ['create-transaction-sale', 'read-clients', `read-inventories`],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Penjualan',
        to: '/transactions/sales/log',
        permissions: ['read-operational-expenses-logs'],
      },
    ],
  },
]

export default SaleNavs
