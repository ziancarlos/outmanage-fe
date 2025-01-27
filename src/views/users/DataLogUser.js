import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogUser from '../../components/users/TableLogUser'

function DataLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogUser xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataLogUser
