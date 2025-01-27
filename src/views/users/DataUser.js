import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CSpinner, CCol, CRow } from '@coreui/react-pro'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import TableUser from '../../components/users/TableUser'
import Swal from 'sweetalert2'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'

function ManageUser() {
  const { authorizePermissions } = useAuth()

  return (
    <CRow>
      <TableUser xs={12} authorizePermissions={authorizePermissions} />
    </CRow>
  )
}

export default ManageUser
