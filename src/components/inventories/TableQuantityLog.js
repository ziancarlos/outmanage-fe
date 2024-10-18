import React from 'react'
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CDateRangePicker,
  CLoadingButton,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CSmartPagination,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom'
import moment from 'moment'

const DataQuantityLog = ({
  authorizePermissions,
  inventoryQuantityLogs,
  error,
  searchLoading,
  searchDetailValue,
  searchStartDateValue,
  searchEndDateValue,
  page,
  totalPage,
  handleSearch,
  setSearchDetailValue,
  setSearchStartDateValue,
  setSearchEndDateValue,
  handlePageChange,
}) => {
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')
  return (
    <CCol md={12} className="mb-4">
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Data Inventaris Kuantitas Log</strong>
        </CCardHeader>
        <CCardBody>
          {!!error && (
            <CRow className="mb-3">
              <CCol>
                <CAlert color="danger">{error}</CAlert>
              </CCol>
            </CRow>
          )}

          <CForm noValidate onSubmit={handleSearch}>
            <CRow className="mb-4">
              <CCol className="mb-2" md={4}>
                <CFormInput
                  label="Detil Perubahaan"
                  placeholder="Cari..."
                  onChange={(e) => setSearchDetailValue(e.target.value)}
                  disabled={searchLoading}
                  value={searchDetailValue}
                />
              </CCol>

              <CCol xs={12} md={8} className="mb-2">
                <CFormLabel>Tanggal</CFormLabel>
                <CDateRangePicker
                  placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                  startDate={searchStartDateValue}
                  endDate={searchEndDateValue}
                  disabled={searchLoading}
                  onStartDateChange={(date) => setSearchStartDateValue(date)}
                  onEndDateChange={(date) => setSearchEndDateValue(date)}
                />
              </CCol>

              <CCol className="d-flex align-items-center 0" xs={12}>
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
                  <CTableHeaderCell scope="col">Id Kuantitas Log</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Penanggung Jawab</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kuantitas Awal</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kuantitas Baru</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kuantitas Dirubah</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Perubahaan</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {inventoryQuantityLogs.map((item, idx) => (
                  <CTableRow key={idx}>
                    <CTableDataCell>{'#' + item.inventoryQuantityLog}</CTableDataCell>
                    <CTableDataCell>
                      {canReadUser ? (
                        <NavLink to={`/users/${item.user.userId}/detail`}>
                          {item.user.username}
                        </NavLink>
                      ) : (
                        item.user.username
                      )}
                    </CTableDataCell>

                    <CTableDataCell>
                      {canReadInventory ? (
                        <NavLink to={`/inventories/${item.inventory.inventoryId}/detail`}>
                          {item.inventory.name}
                        </NavLink>
                      ) : (
                        item.inventory.name
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.inventory.condition === 0 ? (
                        <CBadge color="primary">BARU</CBadge>
                      ) : item.inventory.condition === 1 ? (
                        <CBadge color="warning">BEKAS</CBadge>
                      ) : (
                        <span>{item.inventory.condition}</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{item.oldQuantity.toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{item.newQuantity.toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{item.details}</CTableDataCell>
                    <CTableDataCell>
                      {moment(item.createdAt).format('MMMM D, YYYY h:mm A')}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          <CSmartPagination
            size="sm"
            activePage={page}
            pages={totalPage}
            onActivePageChange={handlePageChange}
          />
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default DataQuantityLog
