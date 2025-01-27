import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogCustomer from '../../components/customers/TableLogCustomer'

function DataLogUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogCustomer xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default DataLogUser
