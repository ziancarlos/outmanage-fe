import React, { useEffect, useState } from 'react'

import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCol,
  CRow,
  CTableDataCell,
  CSpinner,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import useAuth from '../../hooks/useAuth'
import useLogout from '../../hooks/useLogout'

function DataRoles() {
  const { authorizePermissions } = useAuth()
  const canReadPermissionsWithRelatedByRoleId = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related-by-role-id',
  )

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)

    fetchRoles().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchRoles() {
    try {
      const response = await axiosPrivate.get('/api/roles')

      setRoles(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/400', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handleDetail(roleId) {
    navigate(`/roles/${roleId}/permissions`)
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader>
                <strong>Data Peran</strong>
              </CCardHeader>
              <CCardBody>
                <CTable striped hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Id Peran</CTableHeaderCell>
                      <CTableHeaderCell>Nama</CTableHeaderCell>
                      {canReadPermissionsWithRelatedByRoleId && (
                        <CTableHeaderCell>Aksi</CTableHeaderCell>
                      )}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {roles.map((role) => (
                      <CTableRow key={role.roleId}>
                        <CTableDataCell>#{role.roleId}</CTableDataCell>
                        <CTableDataCell>{role.name}</CTableDataCell>
                        {canReadPermissionsWithRelatedByRoleId && (
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => handleDetail(role.roleId)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </CButton>
                          </CTableDataCell>
                        )}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataRoles
