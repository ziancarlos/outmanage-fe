/* eslint-disable react/prop-types */
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDateRangePicker,
  CForm,
  CFormSelect,
  CLoadingButton,
  CRow,
  CSmartPagination,
  CTable,
  CTableBody,
  CTableDataCell,
  CFormLabel,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import JSONPretty from 'react-json-pretty'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'
function TableTruckLog({
  error,
  handleSearch,
  typeOptions,
  searchTypeValue,
  setSearchTypeValue,
  searchStartDateValue,
  setSearchStartDateValue,
  searchEndDateValue,
  setSearchEndDateValue,
  searchLoading,
  truckLogs,
  page,
  totalPages,
  handlePageChange,
  authorizePermissions,
}) {
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')
  const canReadTruck = authorizePermissions.some((perm) => perm.name === 'read-truck')

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Data Log Truk</strong>
      </CCardHeader>
      <CCardBody>
        {!!error && (
          <CRow className="mb-3">
            <CCol>
              <CAlert color="danger">{error}</CAlert>
            </CCol>
          </CRow>
        )}

        <CForm onSubmit={handleSearch} noValidate>
          <CRow className="mb-4">
            <CCol xs={12} md={4} className="mb-2">
              <CFormLabel htmlFor="typeInput">Tipe Perubahaan</CFormLabel>
              <CFormSelect
                id="typeInput"
                options={typeOptions}
                value={searchTypeValue}
                disabled={searchLoading}
                onChange={(e) => setSearchTypeValue(e.target.value)}
              />
            </CCol>

            <CCol xs={12} md={8} className="mb-2">
              <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
              <CDateRangePicker
                placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                startDate={searchStartDateValue}
                endDate={searchEndDateValue}
                disabled={searchLoading}
                onStartDateChange={(date) => setSearchStartDateValue(date)}
                onEndDateChange={(date) => setSearchEndDateValue(date)}
              />
            </CCol>

            <CCol className="d-flex align-items-center " xs={12}>
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
                <CTableHeaderCell scope="col">Truk</CTableHeaderCell>
                <CTableHeaderCell scope="col">Penanggung Jawab</CTableHeaderCell>
                <CTableHeaderCell scope="col">Jenis Perubahaan</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nilai Lama</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nilai Baru</CTableHeaderCell>
                <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {truckLogs.map((log, idx) => (
                <CTableRow key={idx}>
                  <CTableDataCell>TL{log.truckLogId}</CTableDataCell>
                  <CTableDataCell>
                    {canReadTruck ? (
                      <NavLink to={`/trucks/${log.truckId}/detail`}>T{log.truckId}</NavLink>
                    ) : (
                      'T' + log.truckId
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    {canReadUser ? (
                      <NavLink to={`/users/${log.user.userId}/detail`}>{log.user.username}</NavLink>
                    ) : (
                      log.user.username
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{log.changeType}</CTableDataCell>
                  <CTableDataCell>
                    {!!log.oldValue ? (
                      <div className="json-viewer">
                        <JSONPretty
                          data={log.oldValue}
                          theme={{ main: 'monospace', key: 'red', value: 'green' }}
                        />
                      </div>
                    ) : (
                      '-'
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="json-viewer">
                      <JSONPretty
                        data={log.newValue}
                        theme={{ main: 'monospace', key: 'red', value: 'green' }}
                      />
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    {moment(log.createdAt).format('MMMM D, YYYY h:mm A')}
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

export default TableTruckLog
