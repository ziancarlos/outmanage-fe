import React, { useEffect, useState } from 'react'
import {
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormCheck,
  CRow,
  CSpinner,
  CButton,
  CLoadingButton,
} from '@coreui/react-pro'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableCardLayout from '../../components/TableCardLayout'
import Swal from 'sweetalert2'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function DetailRole() {
  const { roleId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPermissions, setSelectedPermissions] = useState([])

  const canUpdatePermissions = authorizePermissions.some(
    (perm) => perm.name === 'update-permissions',
  )

  useEffect(() => {
    setLoading(true)

    fetchPermissions().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchPermissions() {
    try {
      const response = await axiosPrivate.get(`/api/roles/${roleId}/permissions/related`)
      setPermissions(response.data.data)

      // Initialize selectedPermissions based on the permissions fetched
      const initialSelected = response.data.data
        .filter((permission) => permission.related === 1)
        .map((permission) => permission.permissionId)
      setSelectedPermissions(initialSelected)
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

  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions((prevSelected) => {
      if (checked) {
        return [...prevSelected, permissionId]
      } else {
        return prevSelected.filter((id) => id !== permissionId)
      }
    })
  }

  const handleSave = async () => {
    try {
      // Map permissions into the required format for the backend
      const updatedPermissions = permissions.map((permission) => ({
        permissionId: permission.permissionId,
        related: selectedPermissions.includes(permission.permissionId) ? 1 : 0,
      }))

      // Send the updated permissions to the backend
      await axiosPrivate.patch(`/api/role/${roleId}/permissions`, {
        permissions: updatedPermissions,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Izin berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate(`/roles/${roleId}/detail`)
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([404, 400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CCol>
          <TableCardLayout
            title={'Detil Peran'}
            error={error}
            footer={
              canUpdatePermissions && (
                <CLoadingButton
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                  loading={loading}
                >
                  <FontAwesomeIcon icon={faSave} />
                </CLoadingButton>
              )
            }
          >
            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                    {canUpdatePermissions && <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {permissions.map((permission) => {
                    return (
                      <CTableRow key={permission.permissionId}>
                        <CTableDataCell>R{permission.permissionId}</CTableDataCell>
                        <CTableDataCell>{permission.name}</CTableDataCell>
                        <CTableDataCell>
                          {canUpdatePermissions ? (
                            <CFormCheck
                              id={`${permission.permissionId}`}
                              checked={selectedPermissions.includes(permission.permissionId)}
                              onChange={(e) =>
                                handlePermissionChange(permission.permissionId, e.target.checked)
                              }
                            />
                          ) : (
                            <CFormCheck
                              id={`${permission.permissionId}`}
                              checked={permission.related === 1}
                              disabled
                            />
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </TableCardLayout>
        </CCol>
      )}
    </CRow>
  )
}
