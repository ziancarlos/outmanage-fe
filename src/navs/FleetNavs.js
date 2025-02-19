import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faBox, faTruck, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const FleetNavs = [
  {
    component: CNavGroup,
    name: 'Armada',
    icon: <FontAwesomeIcon icon={faTruck} className="nav-icon no-fill-icon" />,
    permissions: ['read-fleets', 'create-fleet', 'read-fleets-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Armada',
        to: '/fleets/data',
        permissions: ['read-fleets'],
      },
      {
        component: CNavItem,
        name: 'Tambah Armada',
        to: '/fleets/new',
        permissions: ['create-user'],
      },
      {
        component: CNavItem,
        name: 'Data Log Armada',
        to: '/fleets/logs',
        permissions: ['read-fleets-logs'],
      },
    ],
  },
]

export default FleetNavs
