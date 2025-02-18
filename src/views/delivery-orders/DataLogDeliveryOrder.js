import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogDeliveryOrder from '../../components/delivery-orders/TableLogDeliveryOrder'

function DataLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogDeliveryOrder xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataLogUser
