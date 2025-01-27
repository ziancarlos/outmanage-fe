import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableItem from '../../components/items/TableItem'

export default function ManageItem() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableItem xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
