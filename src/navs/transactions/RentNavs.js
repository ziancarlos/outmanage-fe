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
        permissions: ['read-transaction-rents'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan Baru',
        to: '/transactions/rents/new',
        permissions: [
          'create-transaction-rent',
          'read-projects',
          'read-clients',
          'read-inventories',
        ],
      },
      {
        component: CNavItem,
        name: 'Log Transaksi Penyewaan',
        to: '/transactions/rents/log',
        permissions: ['read-transaction-rents-logs'],
      },
      {
        component: CNavItem,
        name: 'Transaksi Penyewaan Batal',
        to: '/transactions/rents/cancel',
        permissions: ['read-transaction-rents'],
      },
    ],
  },
]

export default SaleNavs
