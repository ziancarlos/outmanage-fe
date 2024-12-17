import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const OperationalExpenseNavs = [
  {
    component: CNavGroup,
    name: 'Biaya Operasional',
    icon: <FontAwesomeIcon icon={faMoneyBill} className="nav-icon no-fill-icon" />,
    permissions: [
      'read-operational-expenses',
      'create-operational-expense',
      'read-operational-expenses-logs',
    ],
    items: [
      {
        component: CNavItem,
        name: 'Data Biaya Operasional',
        to: '/operational-expenses/data',
        permissions: ['read-operational-expenses'],
      },
      {
        component: CNavItem,
        name: 'Tambah Biaya Operasional',
        to: '/operational-expenses/new',
        permissions: ['create-operational-expense'],
      },
      {
        component: CNavItem,
        name: 'Data Log Biaya Operasional',
        to: '/operational-expenses/log',
        permissions: ['read-operational-expenses-logs'],
      },
      {
        component: CNavItem,
        name: 'Biaya Operasional Batal',
        to: '/operational-expenses/cancel',
        permissions: ['read-operational-expenses'],
      },
    ],
  },
]

export default OperationalExpenseNavs
