import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogShipmentType from '../../components/shipment-types/TableLogShipmentType'

function DataLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogShipmentType xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataLogUser
