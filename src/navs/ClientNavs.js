import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ClientNavs = [
  {
    component: CNavGroup,
    name: 'Klien',
    icon: <FontAwesomeIcon icon={faBuilding} className="nav-icon no-fill-icon" />,
    permissions: ['read-clients', 'create-client', 'read-clients-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Klien',
        to: '/clients/data',
        permissions: ['read-clients'],
      },
      {
        component: CNavItem,
        name: 'Tambah Klien',
        to: '/clients/new',
        permissions: ['create-client'],
      },
      {
        component: CNavItem,
        name: 'Data Log Klien',
        to: '/clients/log',
        permissions: ['read-clients-logs'],
      },
    ],
  },
]

export default ClientNavs
