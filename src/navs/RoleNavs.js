import { CNavItem } from '@coreui/react-pro'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RoleNavs = [
  {
    component: CNavItem,
    name: 'Peran Dan Izin',
    to: '/roles',
    icon: <FontAwesomeIcon icon={faKey} className="nav-icon no-fill-icon" />,
    permissions: ['read-roles'],
  },
]

export default RoleNavs
