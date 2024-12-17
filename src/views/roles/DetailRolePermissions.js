import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormCheck,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react-pro'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

function DetailRolePermissions() {
  const { roleId } = useParams()

  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  async function getPermissionsRelated(roleId) {
    try {
      const response = await axiosPrivate.get(`/api/roles/${roleId}/permissions/related`)
      setPermissions(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  useEffect(() => {
    getPermissionsRelated(roleId).finally(() => {
      setLoading(false)
    })
  }, [])

  return loading ? (
    <div className="pt-3 text-center">
      <CSpinner color="primary" variant="grow" />
    </div>
  ) : (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Detil Peran Dan Izin</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Id</CTableHeaderCell>
                  <CTableHeaderCell>Nama</CTableHeaderCell>
                  <CTableHeaderCell>Relasi</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {permissions.map((permission) => (
                  <CTableRow key={permission.permissionId}>
                    <CTableDataCell>RP{permission.permissionId}</CTableDataCell>
                    <CTableDataCell>{permission.name}</CTableDataCell>
                    <CTableDataCell>
                      <CFormCheck
                        id={`permission-${permission.permissionId}`}
                        checked={permission.related === 1}
                        disabled
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DetailRolePermissions
