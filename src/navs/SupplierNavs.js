import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faWarehouse } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SupplierNavs = [
  {
    component: CNavGroup,
    name: 'Pemasok',
    icon: <FontAwesomeIcon icon={faWarehouse} className="nav-icon no-fill-icon" />,
    permissions: ['read-suppliers', 'create-supplier', 'read-suppliers-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Pemasok',
        to: '/suppliers/data',
        permissions: ['read-suppliers'],
      },
      {
        component: CNavItem,
        name: 'Tambah Pemasok',
        to: '/suppliers/new',
        permissions: ['create-supplier'],
      },
      {
        component: CNavItem,
        name: 'Data Log Pemasok',
        to: '/suppliers/log',
        permissions: ['read-suppliers-logs'],
      },
    ],
  },
]

export default SupplierNavs
