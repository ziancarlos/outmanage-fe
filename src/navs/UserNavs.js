import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { faKey, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const UserNavs = [
  {
    component: CNavGroup,
    name: 'Pengguna',
    icon: <FontAwesomeIcon icon={faUsers} className="nav-icon no-fill-icon" />,
    permissions: [
      'read-users',
      'create-user',
      'read-removed-users',
      'read-users-logs',
      'read-users-activities',
    ],
    items: [
      {
        component: CNavItem,
        name: 'Data Pengguna',
        to: '/users/data',
        permissions: ['read-users'],
      },
      {
        component: CNavItem,
        name: 'Tambah Pengguna',
        to: '/users/new',
        permissions: ['create-user', 'read-roles'],
      },
      {
        component: CNavItem,
        name: 'Data Pengguna Nonaktif',
        to: '/users/data/removed',
        permissions: ['read-removed-users'],
      },
      {
        component: CNavItem,
        name: 'Data Log Pengguna',
        to: '/users/logs',
        permissions: ['read-users-logs'],
      },
      {
        component: CNavItem,
        name: 'Data Aktifitas Pengguna',
        to: '/users/activities/logs',
        permissions: ['read-users-activities'],
      },
    ],
  },
]

export default UserNavs
