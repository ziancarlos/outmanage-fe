import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faTruckFront, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ShipmentTypeNavs = [
  {
    component: CNavGroup,
    name: 'Tipe Pengiriman',
    icon: <FontAwesomeIcon icon={faTruckFront} className="nav-icon no-fill-icon" />,
    permissions: ['read-shipment-types', 'create-shipment-type', 'read-shipment-types-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Tipe Pengiriman',
        to: '/shipment-types/data',
        permissions: ['read-shipment-types'],
      },
      {
        component: CNavItem,
        name: 'Tambah Tipe Pengiriman',
        to: '/shipment-types/new',
        permissions: ['create-shipment-type'],
      },
      {
        component: CNavItem,
        name: 'Data Log Tipe Pengiriman',
        to: '/shipment-types/logs',
        permissions: ['read-shipment-types-logs'],
      },
    ],
  },
]

export default ShipmentTypeNavs
