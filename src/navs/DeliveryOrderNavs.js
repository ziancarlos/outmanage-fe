import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faBoxesPacking, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DeliveryOrderNavs = [
  {
    component: CNavGroup,
    name: 'DO',
    icon: <FontAwesomeIcon icon={faBoxesPacking} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Data DO',
        to: '/delivery-orders/data',
        permissions: ['read-delivery-orders'],
      },
      {
        component: CNavItem,
        name: 'Tambah DO',
        to: '/delivery-orders/new',
        permissions: ['create-delivery-order', 'read-customers', 'read-items'],
      },

      {
        component: CNavItem,
        name: 'Data Log DO',
        to: '/delivery-orders/logs',
        permissions: ['read-delivery-orders-logs'],
      },
    ],
  },
]

export default DeliveryOrderNavs
