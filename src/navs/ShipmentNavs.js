import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faShippingFast } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ShipmentNavs = [
  {
    component: CNavGroup,
    name: 'Pengiriman',
    icon: <FontAwesomeIcon icon={faShippingFast} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Data Pengiriman',
        to: '/shipments/data',
        permissions: [],
      },
      {
        component: CNavItem,
        name: 'Tambah Pengiriman',
        to: '/shipments/new',
        permissions: [],
      },

      {
        component: CNavItem,
        name: 'Data Log Pengiriman',
        to: '/shipments/logs',
        permissions: [],
      },
    ],
  },
]

export default ShipmentNavs
