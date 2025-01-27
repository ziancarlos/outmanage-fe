import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableShipment from '../../components/shipments/TableShipment'

function DataShipment() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableShipment xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataShipment
