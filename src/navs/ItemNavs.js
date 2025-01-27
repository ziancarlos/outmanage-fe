import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faBox, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ItemNavs = [
  {
    component: CNavGroup,
    name: 'Barang',
    icon: <FontAwesomeIcon icon={faBox} className="nav-icon no-fill-icon" />,
    permissions: ['read-items', 'create-item', 'read-items-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Barang',
        to: '/items/data',
        permissions: ['read-items'],
      },
      {
        component: CNavItem,
        name: 'Tambah Barang',
        to: '/items/new',
        permissions: ['create-user'],
      },
      {
        component: CNavItem,
        name: 'Data Log Barang',
        to: '/items/logs',
        permissions: ['read-items-logs'],
      },
    ],
  },
]

export default ItemNavs
