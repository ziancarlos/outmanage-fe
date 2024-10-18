/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CLoadingButton,
  CPagination,
  CPaginationItem,
  CRow,
  CSmartPagination,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faTrash,
  faUndo,
  faEye,
  faEyeSlash,
  faSearch,
} from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom'

function TableUser({
  users,
  handleUpdate,
  handlePageChange,
  page,
  totalPages,
  handleDelete,
  toggleRemoved,
  showRemoved,
  handleRestore,
  handleDetail,
  searchValue,
  setSearchValue,
  handleSearch,
  loading,
  error,
  authorizePermissions,
}) {
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')
  const canReadRemovedUsers = authorizePermissions.some(
    (perm) => perm.name === 'read-removed-users',
  )
  const canReadUserActivities = authorizePermissions.some(
    (perm) => perm.name === 'read-users-activities',
  )
  const canRestoreUser = authorizePermissions.some((perm) => perm.name === 'restore-user')
  const canUpdateUser = authorizePermissions.some((perm) => perm.name === 'update-user')
  const canRemoveUser = authorizePermissions.some((perm) => perm.name === 'remove-user')
  const canReadRoles = authorizePermissions.some((perm) => perm.name === 'read-roles')
  const canrReadPermissionWithRelatedByRoleId = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related-by-role-id',
  )

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        {canReadRemovedUsers ? (
          <>
            <strong>{showRemoved ? 'Pengguna Dihapus' : 'Pengguna Aktif'}</strong>
            <button
              className={`btn ${showRemoved ? 'btn-primary' : 'btn-danger'}`}
              onClick={toggleRemoved}
            >
              <FontAwesomeIcon icon={showRemoved ? faEye : faEyeSlash} />
              {showRemoved ? ' Pengguna Aktif' : ' Pengguna Dihapus'}
            </button>
          </>
        ) : (
          <strong>{'Active Users'}</strong>
        )}
      </CCardHeader>
      <CCardBody>
        {error && (
          <CRow className="mb-3">
            <CCol>
              <CAlert color="danger">{error}</CAlert>
            </CCol>
          </CRow>
        )}

        <CForm onSubmit={handleSearch} noValidate>
          <CRow className="mb-3">
            <CCol md={8} xs={12}>
              <CFormInput
                type="text"
                placeholder="Cari..."
                value={searchValue}
                disabled={loading}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search"
              />
            </CCol>

            <CCol md={4} xs={12} className="d-flex align-items-center mt-2 mt-md-0">
              <CLoadingButton color="light" type="submit" loading={loading} disabled={loading}>
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Filter
              </CLoadingButton>
            </CCol>
          </CRow>
        </CForm>

        <div className="table-responsive">
          <CTable striped bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Id User</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nama Pengguna</CTableHeaderCell>
                <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                <CTableHeaderCell scope="col">Peran</CTableHeaderCell>
                <CTableHeaderCell scope="col">Telegram Chat Id</CTableHeaderCell>
                {canReadUser ||
                canReadUserActivities ||
                canRestoreUser ||
                canUpdateUser ||
                canRemoveUser ? (
                  <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                ) : (
                  ''
                )}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user) => (
                <CTableRow key={user.userId}>
                  <CTableDataCell>#{user.userId}</CTableDataCell>
                  <CTableDataCell>{user.username}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>
                    {canrReadPermissionWithRelatedByRoleId ? (
                      <NavLink to={`/roles/${user.role.roleId}/permissions`}>
                        {user.role.name}
                      </NavLink>
                    ) : (
                      user.role.name
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{user.telegramChatId || '-'}</CTableDataCell>
                  <CTableDataCell>
                    {canReadUser || canReadUserActivities ? (
                      <CButton color="info" size="sm" onClick={() => handleDetail(user.userId)}>
                        <FontAwesomeIcon icon={faEye} />
                      </CButton>
                    ) : null}
                    {showRemoved ? (
                      canRestoreUser ? (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleRestore(user.userId)}
                        >
                          <FontAwesomeIcon icon={faUndo} />
                        </button>
                      ) : null
                    ) : (
                      <>
                        {canUpdateUser && canReadRoles ? (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(user.userId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        ) : null}
                        {canRemoveUser ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(user.userId)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        ) : null}
                      </>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        <CSmartPagination
          size="sm"
          activePage={page}
          pages={totalPages} // Set the total number of pages
          onActivePageChange={handlePageChange} // Handle page change
        />
      </CCardBody>
    </CCard>
  )
}

export default TableUser
