/* eslint-disable react/prop-types */
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CForm,
  CFormSelect,
  CFormLabel,
  CAlert,
  CDateRangePicker,
  CSmartPagination,
  CLoadingButton,
  CCardHeader,
} from '@coreui/react-pro'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'

import React from 'react'

function TableUserLog({
  error,
  handleSearch,
  activityOptions,
  searchActivityValue,
  setSearchActivityValue,
  searchStartDateValue,
  setSearchStartDateValue,
  searchEndDateValue,
  setSearchEndDateValue,
  searchLoading,
  activities,
  page,
  totalPages,
  handlePageChange,
}) {
  return (
    <CCol xs={12} className="mt-3">
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Aktifitas Pengguna</strong>
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
                <CFormLabel htmlFor="activitySelect">Aktifitas</CFormLabel>
                <CFormSelect
                  id="activitySelect"
                  options={activityOptions}
                  disabled={searchLoading}
                  value={searchActivityValue}
                  onChange={(e) => setSearchActivityValue(e.target.value)}
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

              <CCol className="d-fwslex align-items-center" xs={12}>
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

          <CTable striped bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Id Aktifitas User</CTableHeaderCell>
                <CTableHeaderCell scope="col">Aktifitas</CTableHeaderCell>
                <CTableHeaderCell scope="col">Alamat Ip</CTableHeaderCell>
                <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {activities.map((activity) => (
                <CTableRow key={activity.activityId}>
                  <CTableDataCell>#{activity.activityId}</CTableDataCell>
                  <CTableDataCell>
                    {activity.activity === 0 ? 'Login Gagal' : 'Login Berhasil'}
                  </CTableDataCell>
                  <CTableDataCell>{activity.ipAddress}</CTableDataCell>
                  <CTableDataCell>
                    {moment(activity.createdAt).format('MMMM D, YYYY h:mm A')}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <CSmartPagination
            size="sm"
            activePage={page}
            pages={totalPages} // Set the total number of pages
            onActivePageChange={handlePageChange} // Handle page change
          />

          {/* Pagination */}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default TableUserLog
