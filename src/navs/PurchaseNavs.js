import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const PurchaseNavs = [
  {
    component: CNavGroup,
    name: 'Pembelian',
    icon: <FontAwesomeIcon icon={faCreditCard} className="nav-icon no-fill-icon" />,
    permissions: ['read-purchases', 'create-purchase', 'read-purchases-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Pembelian',
        to: '/purchases/data',
        permissions: ['read-purchases'],
      },
      {
        component: CNavItem,
        name: 'Tambah Pembelian',
        to: '/purchases/new',
        permissions: ['create-purchase', 'read-suppliers', 'read-inventories'],
      },
      {
        component: CNavItem,
        name: 'Data Log Pembelian',
        to: '/purchases/log',
        permissions: ['read-purchases-logs'],
      },
      {
        component: CNavItem,
        name: 'Pembelian Batal',
        to: '/purchases/cancel',
        permissions: ['read-purchases'],
      },
    ],
  },
]

export default PurchaseNavs
