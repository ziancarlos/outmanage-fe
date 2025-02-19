import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogFleet from '../../components/fleets/TableLogFleet'

export default function DataLogManageUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogFleet xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
