import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogShipment from '../../components/shipments/TableLogShipment'

function DataLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogShipment xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataLogUser
