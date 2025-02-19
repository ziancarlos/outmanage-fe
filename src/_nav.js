import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer } from '@coreui/icons'
import { CNavItem } from '@coreui/react-pro'
import { Translation } from 'react-i18next'
import UserNavs from './navs/UserNavs'
import RoleNavs from './navs/RoleNavs'
import CustomerNavs from './navs/CustomerNavs'

import ItemNavs from './navs/ItemNavs'

import DeliveryOrderNavs from './navs/DeliveryOrderNavs'
import ShipmentNavs from './navs/ShipmentNavs'
import FleetNavs from './navs/FleetNavs'

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
  ...DeliveryOrderNavs,
  ...ShipmentNavs,
  ...FleetNavs,
]

export default _nav
