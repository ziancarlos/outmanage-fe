import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faShippingFast } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ShipmentNavs = [
  {
    component: CNavGroup,
    name: 'Pengiriman',
    icon: <FontAwesomeIcon icon={faShippingFast} className="nav-icon no-fill-icon" />,
    permissions: ['read-shipments', 'create-shipment', 'read-shipments-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Pengiriman',
        to: '/shipments/data',
        permissions: ['read-shipments'],
      },
      {
        component: CNavItem,
        name: 'Tambah Pengiriman',
        to: '/shipments/new',
        permissions: ['create-shipment', 'read-roles'],
      },

      {
        component: CNavItem,
        name: 'Data Log Pengiriman',
        to: '/shipments/logs',
        permissions: ['read-shipments-logs'],
      },
    ],
  },
]

export default ShipmentNavs
