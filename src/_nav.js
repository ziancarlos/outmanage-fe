import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer } from '@coreui/icons'
import { CNavItem } from '@coreui/react-pro'
import { Translation } from 'react-i18next'
import UserNavs from './navs/UserNavs'
import RoleNavs from './navs/RoleNavs'
import CustomerNavs from './navs/CustomerNavs'
import ShipmentTypeNavs from './navs/ShipmentTypeNavs'
import ItemNavs from './navs/ItemNavs'
import ShipmentNavs from './navs/ShipmentNavs'

const _nav = [
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info-gradient',
      text: 'NEW',
    },
  },

  ...UserNavs,
  ...RoleNavs,
  ...CustomerNavs,
  ...ItemNavs,
  ...ShipmentTypeNavs,
  ...ShipmentNavs,
]

export default _nav
