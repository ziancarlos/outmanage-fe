import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilCalendar,
  cilChartPie,
  cilCursor,
  cilDrop,
  cilEnvelopeOpen,
  cilGrid,
  cilLayers,
  cilMap,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilSpreadsheet,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { Translation } from 'react-i18next'
import UserNavs from './navs/UserNavs'
import RoleNavs from './navs/RoleNavs'
import ClientNavs from './navs/ClientNavs'
import ProjectNavs from './navs/ProjectNavs'
import SupplierNavs from './navs/SupplierNavs'
import InventoryNavs from './navs/InventoryNavs'
import PurchaseRoutes from './routes/PurchaseRoutes'
import PurchaseNavs from './navs/PurchaseNavs'
import OperationalExpenseNavs from './navs/OperationalExpenseNavs'
import TelegramMessage from './navs/TelegramMessageNavs'
import TransactionNavs from './navs/transactions/SaleNavs'
import TruckNavs from './navs/TruckNavs'
import SaleNavs from './navs/transactions/SaleNavs'
import RentNavs from './navs/transactions/RentNavs'
import SecurityDepositNavs from './navs/SecurityDepositNavs'
import ReportNavs from './navs/ReportNavs'

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

  {
    component: CNavTitle,
    name: 'Pengguna',
    permissions: [],
  },

  ...UserNavs,

  ...RoleNavs,

  {
    component: CNavTitle,
    name: 'Systems',
    permissions: [],
  },

  ...ClientNavs,

  ...ProjectNavs,

  ...SupplierNavs,

  ...InventoryNavs,

  ...PurchaseNavs,

  ...OperationalExpenseNavs,

  ...SaleNavs,

  ...RentNavs,

  ...SecurityDepositNavs,

  ...ReportNavs,

  ...TruckNavs,

  ...TelegramMessage,
]

export default _nav
