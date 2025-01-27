import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogActivityUser from '../../components/users/TableLogAcitivityUser'

function DataAcitivityLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogActivityUser xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataAcitivityLogUser
