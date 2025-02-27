import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableShipment from '../../components/shipments/TableShipment'

export default function DataDeliveryOrder() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableShipment xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
