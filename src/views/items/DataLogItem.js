import React from 'react'

import { CRow } from '@coreui/react-pro'

import useAuth from '../../hooks/useAuth'
import TableLogItem from '../../components/items/TableLogItem'

export default function DataLogManageUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableLogItem xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}
