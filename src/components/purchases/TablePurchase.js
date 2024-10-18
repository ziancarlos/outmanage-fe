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
  CMultiSelect,
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
import { formatRupiah } from '../../utils/CurrencyUtils'

function TablePurchase({
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
  purchases,
  page,
  totalPages,
  handlePageChange,
}) {
  function handleDetail(purchaseId) {
    navigate(`/purchases/${purchaseId}/detail`)
  }

  function handleUpdate(purchaseId) {
    navigate(`/purchases/${purchaseId}/edit`)
  }

  // Permissions
  const canReadSupplier = authorizePermissions.some((perm) => perm.name === 'read-supplier')
  const canReadPurchase = authorizePermissions.some((perm) => perm.name === 'read-purchase')

  // Render component
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Data Pembelian</strong>
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
                    <CTableHeaderCell scope="col">Id Pembelian</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Pemasok</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jumlah Keselurahan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tanggal Pembelian</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pembayaran</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pengiriman</CTableHeaderCell>
                    {canReadPurchase && <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {purchases.map((purchase) => (
                    <CTableRow key={purchase.purchaseId}>
                      <CTableDataCell>#{purchase.purchaseId}</CTableDataCell>
                      <CTableDataCell>
                        {canReadSupplier ? (
                          <NavLink to={`/suppliers/${purchase.supplier.supplierId}/detail`}>
                            {purchase.supplier.name}
                          </NavLink>
                        ) : (
                          purchase.supplier.name
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{formatRupiah(purchase.grandTotal)}</CTableDataCell>
                      <CTableDataCell>
                        {moment(purchase.purchaseDate).format('MMMM D, YYYY h:mm A')}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          color={
                            purchase.paymentStatus === 2
                              ? 'success'
                              : purchase.paymentStatus === 1
                                ? 'warning'
                                : purchase.paymentStatus === 0
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {purchase.paymentStatus === 2
                            ? 'LUNAS'
                            : purchase.paymentStatus === 1
                              ? 'SEBAGIAN'
                              : purchase.paymentStatus === 0
                                ? 'BELUM LUNAS'
                                : purchase.paymentStatus}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={purchase.deliveryStatus === 1 ? 'success' : 'warning'}>
                          {purchase.deliveryStatus === 1 ? 'Selesai' : 'Belum Selesai'}
                        </CBadge>
                      </CTableDataCell>
                      {canReadPurchase && (
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(purchase.purchaseId)}
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

export default TablePurchase
