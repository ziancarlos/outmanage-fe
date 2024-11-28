import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { faKey, faShieldAlt, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SecurityDepositNavs = [
  {
    component: CNavGroup,
    name: 'Deposit Keamanan',
    icon: <FontAwesomeIcon icon={faShieldAlt} className="nav-icon no-fill-icon" />,
    permissions: [],
    items: [
      {
        component: CNavItem,
        name: 'Data Deposit',
        to: '/deposits/data',
        permissions: [`read-deposits`],
      },
      {
        component: CNavItem,
        name: 'Data Log Deposit',
        to: '/deposits/log',
        permissions: ['read-deposits-logs'],
      },
    ],
  },
]

export default SecurityDepositNavs
