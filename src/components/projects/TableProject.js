/* eslint-disable react/prop-types */
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faEye, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CLoadingButton, CSmartPagination } from '@coreui/react-pro'
function TableProject({
  error,
  handleSearch,
  searchValue,
  setSearchValue,
  searchLoading,
  projects,
  page,
  totalPages,
  handlePageChange,
  authorizePermissions,
}) {
  const canUpdateProject = authorizePermissions.some((perm) => perm.name === 'update-project')
  const canReadProject = authorizePermissions.some((perm) => perm.name === 'read-project')
  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const navigate = useNavigate()

  function handleDetail(projectId) {
    navigate(`/projects/${projectId}/detail`)
  }

  function handleUpdate(projectId) {
    navigate(`/projects/${projectId}/edit`)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Data Proyek</strong>
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
                placeholder="Search..."
                value={searchValue}
                disabled={searchLoading}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search"
              />
            </CCol>

            <CCol md={4} xs={12} className="d-flex align-items-center">
              <CLoadingButton
                color="light"
                type="submit"
                loading={searchLoading}
                disabled={searchLoading}
              >
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
                <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                <CTableHeaderCell scope="col">Alamat</CTableHeaderCell>
                <CTableHeaderCell scope="col">Klien</CTableHeaderCell>
                {(canReadProject || canUpdateProject) && (
                  <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                )}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {projects.map((project, idx) => (
                <CTableRow key={idx}>
                  <CTableDataCell>P{project.projectId}</CTableDataCell>
                  <CTableDataCell>{project.name}</CTableDataCell>
                  <CTableDataCell>{project.address}</CTableDataCell>
                  <CTableDataCell>
                    {canReadClient ? (
                      <NavLink to={`/clients/${project.client.clientId}/detail`}>
                        {project.client.name}
                      </NavLink>
                    ) : (
                      project.client.name
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    {canReadProject ? (
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => handleDetail(project.projectId)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </CButton>
                    ) : (
                      ''
                    )}

                    {canUpdateProject ? (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleUpdate(project.projectId)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    ) : (
                      ''
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

export default TableProject
