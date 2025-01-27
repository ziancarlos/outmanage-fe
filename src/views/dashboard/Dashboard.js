import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardSubtitle,
  CCardTitle,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
  CWidgetStatsF,
} from '@coreui/react-pro'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilDollar,
  cilFactory,
  cilPeople,
  cilStorage,
  cilUser,
  cilTask,
  cilIndustry,
  cilCart,
  cilCreditCard,
} from '@coreui/icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../utils/CurrencyUtils'

const Dashboard = () => {
  useEffect(() => {
    console.log('halo')
  }, [])

  return <></>
}

export default Dashboard
