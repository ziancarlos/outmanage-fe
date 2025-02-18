import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableDeliveryOrder from '../../components/delivery-orders/TableDeliveryOrder'

export default function DataDeliveryOrder() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableDeliveryOrder xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
