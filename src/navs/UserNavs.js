import { CNavItem, CNavTitle } from '@coreui/react-pro'
import { faKey, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const UserNavs = [
  {
    component: CNavItem,
    name: 'Mengelola Pengguna',
    to: '/users',
    icon: <FontAwesomeIcon icon={faUsers} className="nav-icon no-fill-icon" />,
    permissions: ['read-users'],
  },
]

export default UserNavs
