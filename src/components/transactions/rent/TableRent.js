import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faEye } from '@fortawesome/free-solid-svg-icons'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CAlert,
  CForm,
  CFormLabel,
  CFormSelect,
  CDateRangePicker,
  CLoadingButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CSmartPagination,
} from '@coreui/react-pro'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import { formatRupiah } from '../../../utils/CurrencyUtils'

function TableRent({
  deliveryStatusOptions,
  returnedStatusOptions,
  paymentStatusOptions,
  navigate,
  authorizePermissions,
  error,
  handleSearch,
  searchLoading,
  searchDeliveryStatusValue,
  setSearchDeliveryStatusValue,
  searchReturnedStatusValue,
  setSearchReturnedStatusValue,
  searchPaymentStatusValue,
  setSearchPaymentStatusValue,
  searchStartDateValue,
  searchEndDateValue,
  setSearchStartDateValue,
  setSearchEndDateValue,
  transactionRents,
  page,
  totalPages,
  handlePageChange,
}) {
  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadProject = authorizePermissions.some((perm) => perm.name === 'read-project')
  const canReadTransactionRent = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale',
  )

  const handleDetail = (rentId) => {
    navigate(`/transactions/rents/${rentId}/detail`)
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Data Transaksi Penyewaan</strong>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
          </CAlert>
        )}

        {/* Filter Form */}
        <CForm onSubmit={handleSearch} noValidate>
          <CRow className="mb-4">
            <CCol xs={12} md={4} className="mb-2">
              <CFormLabel htmlFor="paymentStatusInput">Status Pembayaran</CFormLabel>
              <CFormSelect
                id="paymentStatusInput"
                value={searchPaymentStatusValue}
                onChange={(e) => setSearchPaymentStatusValue(e.target.value)}
                options={paymentStatusOptions}
              />
            </CCol>
            <CCol xs={12} md={4} className="mb-2">
              <CFormLabel htmlFor="deliveryStatusInput">Status Pengiriman</CFormLabel>
              <CFormSelect
                id="deliveryStatusInput"
                value={searchDeliveryStatusValue}
                onChange={(e) => setSearchDeliveryStatusValue(e.target.value)}
                options={deliveryStatusOptions}
              />
            </CCol>
            <CCol xs={12} md={4} className="mb-2">
              <CFormLabel htmlFor="deliveryStatusInput">Status Pengembalian</CFormLabel>
              <CFormSelect
                id="deliveryStatusInput"
                value={searchReturnedStatusValue}
                onChange={(e) => setSearchReturnedStatusValue(e.target.value)}
                options={returnedStatusOptions}
              />
            </CCol>

            <CCol xs={12} md={12} className="mb-2">
              <CFormLabel htmlFor="dateRangeInput">Tanggal</CFormLabel>
              <CDateRangePicker
                placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                startDate={searchStartDateValue}
                endDate={searchEndDateValue}
                disabled={searchLoading}
                onStartDateChange={(date) => setSearchStartDateValue(date)}
                onEndDateChange={(date) => setSearchEndDateValue(date)}
              />
            </CCol>
            <CCol xs={12} className="d-flex align-items-center">
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

        {/* Table */}
        <div className="table-responsive">
          <CTable striped bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Id</CTableHeaderCell>
                <CTableHeaderCell>Klien/Proyek</CTableHeaderCell>
                <CTableHeaderCell>Jumlah Keselurahan</CTableHeaderCell>
                <CTableHeaderCell>Tanggal</CTableHeaderCell>
                <CTableHeaderCell>Status Pembayaran</CTableHeaderCell>
                <CTableHeaderCell>Status Pengiriman</CTableHeaderCell>
                <CTableHeaderCell>Status Pengembalian</CTableHeaderCell>
                <CTableHeaderCell>Aksi</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {transactionRents.map((ts) => (
                <CTableRow key={ts.transactionRentId}>
                  <CTableDataCell>TR{ts.transactionRentId}</CTableDataCell>
                  <CTableDataCell>
                    {ts.client?.clientId ? (
                      canReadClient ? (
                        <NavLink to={`/clients/${ts.client.clientId}/detail`}>
                          {ts.client.name}
                        </NavLink>
                      ) : (
                        ts.client.name
                      )
                    ) : ts.project?.projectId ? (
                      canReadProject ? (
                        <NavLink to={`/projects/${ts.project.projectId}/detail`}>
                          {ts.project.name}
                        </NavLink>
                      ) : (
                        ts.project.name
                      )
                    ) : (
                      ts.project.projectId
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{formatRupiah(ts.grandTotal)}</CTableDataCell>
                  <CTableDataCell>
                    {moment(ts.transactionDate).format('MMMM D, YYYY h:mm A')}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={
                        ts.paymentStatus === 2
                          ? 'success'
                          : ts.paymentStatus === 1
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {ts.paymentStatus === 2
                        ? 'LUNAS'
                        : ts.paymentStatus === 1
                          ? 'SEBAGIAN'
                          : 'BELUM LUNAS'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={
                        ts.shipmentStatus === 2
                          ? 'success'
                          : ts.shipmentStatus === 1
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {ts.shipmentStatus === 2
                        ? 'SELESAI'
                        : ts.shipmentStatus === 1
                          ? 'PROSES'
                          : 'BELUM DIKIRIM'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={
                        ts.returnStatus === 2
                          ? 'success'
                          : ts.returnStatus === 1
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {ts.returnStatus === 2
                        ? 'DIKEMBALIKAN'
                        : ts.returnStatus === 1
                          ? 'PROSES'
                          : 'BELUM DIKEMBALIKAN'}
                    </CBadge>
                  </CTableDataCell>
                  {canReadTransactionRent && (
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => handleDetail(ts.transactionRentId)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </CButton>
                    </CTableDataCell>
                  )}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        {/* Pagination */}
        <CSmartPagination
          size="sm"
          activePage={page}
          pages={totalPages}
          onActivePageChange={handlePageChange}
        />
      </CCardBody>
    </CCard>
  )
}

export default TableRent
