import React, { useEffect } from 'react'
import { CRow } from '@coreui/react-pro'
import TableUser from '../../components/users/TableUser'
import useAuth from '../../hooks/useAuth'

function DataArchivedUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableUser
        xs={12}
        title="Data Pengguna Nonaktif"
        authorizePermissions={authorizePermissions}
        endpoint="/api/users/removed"
      />
    </CRow>
  )
}

export default DataArchivedUser
