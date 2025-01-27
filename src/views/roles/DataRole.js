import React from 'react'
import { CRow } from '@coreui/react-pro'

import TableRole from '../../components/roles/TableRole'
import useAuth from '../../hooks/useAuth'

function ManageRole() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableRole xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default ManageRole
