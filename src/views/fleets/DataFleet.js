import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableFleet from '../../components/fleets/TableFleet'

export default function DataFleet() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableFleet xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
