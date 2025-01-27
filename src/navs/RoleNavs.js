import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RoleNavs = [
  {
    component: CNavGroup,
    name: 'Peran',
    icon: <FontAwesomeIcon icon={faKey} className="nav-icon no-fill-icon" />,
    permissions: ['read-roles', 'create-roles'],
    items: [
      {
        component: CNavItem,
        name: 'Data Peran',
        to: '/roles/data',
        permissions: ['read-roles'],
      },
      {
        component: CNavItem,
        name: 'Tambah Peran',
        to: '/roles/new',
        permissions: ['create-role'],
      },
    ],
  },
]

export default RoleNavs
