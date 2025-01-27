import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CustomerNavs = [
  {
    component: CNavGroup,
    name: 'Kustomer',
    icon: <FontAwesomeIcon icon={faUser} className="nav-icon no-fill-icon" />,
    permissions: ['read-customers', 'create-customer', 'read-customers-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Kustomer',
        to: '/customers/data',
        permissions: ['read-customers'],
      },
      {
        component: CNavItem,
        name: 'Tambah Kustomer',
        to: '/customers/new',
        permissions: ['create-customer', 'read-roles'],
      },

      {
        component: CNavItem,
        name: 'Data Log Kustomer',
        to: '/customers/logs',
        permissions: ['read-customers-logs'],
      },
    ],
  },
]

export default CustomerNavs
