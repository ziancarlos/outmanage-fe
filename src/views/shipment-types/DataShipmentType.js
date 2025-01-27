import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableShipmentType from '../../components/shipment-types/TableShipmentType'

function ManageUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableShipmentType xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default ManageUser
