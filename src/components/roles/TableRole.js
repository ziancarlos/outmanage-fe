/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import {
  CCol,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import TableCardLayout from '../TableCardLayout'

function TableRole({ title = 'Data Peran', authorizePermissions, ...props }) {
  const canrReadPermissionWithRelated = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related',
  )
  const canUpdateRole = authorizePermissions.some((perm) => perm.name === 'update-role')
  const canReadRole = authorizePermissions.some((perm) => perm.name === 'read-role')

  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  const filterRef = useRef({})

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    fetchUser(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setError('')
  }, [])

  async function fetchUser() {
    try {
      const response = await axiosPrivate.get('/api/roles')

      setRoles(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handleUpdate(roleId) {
    navigate(`/roles/${roleId}/edit`)
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CCol {...props}>
          <TableCardLayout title={title} error={error}>
            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                    {(canrReadPermissionWithRelated || (canUpdateRole && canReadRole)) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {roles.map((role) => {
                    const actionButtons = (
                      <>
                        {canrReadPermissionWithRelated && (
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => navigate(`/roles/${role.roleId}/detail`)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        )}
                        {canUpdateRole && canReadRole && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(role.roleId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={role.roleId}>
                        <CTableDataCell>R{role.roleId}</CTableDataCell>
                        <CTableDataCell>{role.name}</CTableDataCell>
                        <CTableDataCell> {actionButtons} </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </TableCardLayout>
        </CCol>
      )}
    </>
  )
}

export default TableRole
