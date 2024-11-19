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

function TableSale({
  deliveryStatusOptions,
  paymentStatusOptions,
  navigate,
  authorizePermissions,
  error,
  handleSearch,
  searchLoading,
  searchDeliveryStatusValue,
  setSearchDeliveryStatusValue,
  searchPaymentStatusValue,
  setSearchPaymentStatusValue,
  searchStartDateValue,
  searchEndDateValue,
  setSearchStartDateValue,
  setSearchEndDateValue,
  transactionSales,
  page,
  totalPages,
  handlePageChange,
}) {
  function handleDetail(purchaseId) {
    navigate(`/transactions/sales/${purchaseId}/detail`)
  }

  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadTransactionSale = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale',
  )

  // Render component
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Data Transaksi Penjualan</strong>
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
              <CRow className="mb-4">
                {/* Delivery Status Selection */}
                <CCol xs={12} md={6} className="mb-2">
                  <CFormLabel htmlFor="deliveryStatusInput">Status Pengiriman</CFormLabel>
                  <CFormSelect
                    id="deliveryStatusInput"
                    value={searchDeliveryStatusValue}
                    onChange={(e) => setSearchDeliveryStatusValue(e.target.value)}
                    options={deliveryStatusOptions}
                  />
                </CCol>

                {/* Payment Status Selection */}
                <CCol xs={12} md={6} className="mb-2">
                  <CFormLabel htmlFor="paymentStatusInput">Status Pembayaran</CFormLabel>
                  <CFormSelect
                    id="paymentStatusInput"
                    value={searchPaymentStatusValue}
                    onChange={(e) => setSearchPaymentStatusValue(e.target.value)}
                    options={paymentStatusOptions}
                  />
                </CCol>

                {/* Date Range Picker */}
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

                {/* Search Button */}
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

            {/* Purchases Table */}
            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Klien</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jumlah Keselurahan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tanggal Pembelian</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pembayaran</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pengiriman</CTableHeaderCell>
                    {canReadTransactionSale && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {transactionSales.map((ts) => (
                    <CTableRow key={ts.transactionSaleId}>
                      <CTableDataCell>TS{ts.transactionSaleId}</CTableDataCell>
                      <CTableDataCell>
                        {canReadClient ? (
                          <NavLink to={`/clients/${ts.client.clientId}/detail`}>
                            {ts.client.name}
                          </NavLink>
                        ) : (
                          ts.client.name
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
                                : ts.paymentStatus === 0
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {ts.paymentStatus === 2
                            ? 'LUNAS'
                            : ts.paymentStatus === 1
                              ? 'SEBAGIAN'
                              : ts.paymentStatus === 0
                                ? 'BELUM LUNAS'
                                : ts.paymentStatus}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          className="me-2"
                          color={
                            ts.shipmentStatus === 2
                              ? 'success'
                              : ts.shipmentStatus === 1
                                ? 'warning'
                                : ts.shipmentStatus === 0
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {ts.shipmentStatus === 2
                            ? 'SELESAI'
                            : ts.shipmentStatus === 1
                              ? 'PROSES'
                              : ts.shipmentStatus === 0
                                ? 'BELUM DIKIRIM'
                                : ts.shipmentStatus}
                        </CBadge>
                      </CTableDataCell>

                      {canReadTransactionSale && (
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(ts.transactionSaleId)}
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
              pages={totalPages} // Set the total number of pages
              onActivePageChange={handlePageChange} // Handle page change
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TableSale
