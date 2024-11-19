import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faProjectDiagram, faTruck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TruckNavs = [
  {
    component: CNavGroup,
    name: 'Truk',
    icon: <FontAwesomeIcon icon={faTruck} className="nav-icon no-fill-icon" />,
    permissions: ['read-trucks', `create-truck`],
    items: [
      {
        component: CNavItem,
        name: 'Data Truk',
        to: '/trucks/data',
        permissions: ['read-trucks'],
      },
      {
        component: CNavItem,
        name: 'Tambah Truk',
        to: '/trucks/new',
        permissions: ['read-trucks-brands', 'read-trucks-colors', `create-truck`],
      },
      {
        component: CNavItem,
        name: 'Data Log Truk',
        to: '/trucks/log',
        permissions: ['read-trucks-logs'],
      },
    ],
  },
]

export default TruckNavs
