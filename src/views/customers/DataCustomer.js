import React from 'react'

import { CRow } from '@coreui/react-pro'

import TableCustomer from '../../components/customers/TableCustomer'
import useAuth from '../../hooks/useAuth'

function ManageUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableCustomer xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default ManageUser
