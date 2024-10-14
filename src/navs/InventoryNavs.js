import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faBoxesStacked } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const InventoryNavs = [
  {
    component: CNavGroup,
    name: 'Inventaris',
    icon: <FontAwesomeIcon icon={faBoxesStacked} className="nav-icon no-fill-icon" />,
    permissions: ['read-inventories', 'create-inventory', 'read-inventories-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Inventaris',
        to: '/inventories/data',
        permissions: ['read-inventories'],
      },

      {
        component: CNavItem,
        name: 'Tambah Barang',
        to: '/inventories/new',
        permissions: ['create-inventory'],
      },
      {
        component: CNavItem,
        name: 'Data Log Kuantitas',
        to: '/inventories/quantity/log',
        permissions: ['read-inventory-quantity-logs'],
      },
      {
        component: CNavItem,
        name: 'Data Log Barang',
        to: '/inventories/log',
        permissions: ['read-inventories-logs'],
      },
    ],
  },
]

export default InventoryNavs
