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

function TableSecurityDeposit({
  paymentStatusOptions,
  returnPaymentStatusOptions,
  navigate,
  authorizePermissions,
  error,
  handleSearch,
  searchLoading,
  searchPaymentStatusValue,
  setSearchPaymentStatusValue,
  searchReturnPaymentStatusValue,
  setSearchReturnPaymentStatusValue,
  securityDeposits,
  page,
  totalPages,
  handlePageChange,
}) {
  function handleDetail(transactionRentSecurityDepositId) {
    navigate(`/deposits/${transactionRentSecurityDepositId}/detail`)
  }

  // Render component
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Data Deposit Keamanan</strong>
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
                  <CFormLabel htmlFor="paymentStatusInput">Status Pembayaran</CFormLabel>
                  <CFormSelect
                    id="paymentStatusInput"
                    value={searchPaymentStatusValue}
                    onChange={(e) => setSearchPaymentStatusValue(e.target.value)}
                    options={paymentStatusOptions}
                  />
                </CCol>

                {/* Payment Status Selection */}
                <CCol xs={12} md={6} className="mb-2">
                  <CFormLabel htmlFor="paymentStatusInput">
                    Status Pengembalian Pembayaran
                  </CFormLabel>
                  <CFormSelect
                    id="paymentStatusInput"
                    value={searchReturnPaymentStatusValue}
                    onChange={(e) => setSearchReturnPaymentStatusValue(e.target.value)}
                    options={returnPaymentStatusOptions}
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
                    <CTableHeaderCell scope="col">Penyewaan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jumlah Deposit</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pembayaran</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status Pengembalian</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {securityDeposits.map((deposit) => (
                    <CTableRow key={deposit.transactionRentSecurityDepositId}>
                      <CTableDataCell>D{deposit.transactionRentSecurityDepositId}</CTableDataCell>
                      <CTableDataCell>
                        <NavLink to={`/transactions/rents/${deposit.transactionRentId}/detail`}>
                          TR{deposit.transactionRentId}
                        </NavLink>
                      </CTableDataCell>
                      <CTableDataCell>{formatRupiah(deposit.amount)}</CTableDataCell>

                      <CTableDataCell>
                        <CBadge
                          color={
                            deposit.paymentStatus === 2
                              ? 'success'
                              : deposit.paymentStatus === 1
                                ? 'warning'
                                : deposit.paymentStatus === 0
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {deposit.paymentStatus === 2
                            ? 'LUNAS'
                            : deposit.paymentStatus === 1
                              ? 'SEBAGIAN'
                              : deposit.paymentStatus === 0
                                ? 'BELUM LUNAS'
                                : deposit.paymentStatus}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          color={
                            deposit.returnPaymentStatus === 2
                              ? 'success'
                              : deposit.returnPaymentStatus === 1
                                ? 'warning'
                                : deposit.returnPaymentStatus === 0
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {deposit.returnPaymentStatus === 2
                            ? 'DIKEMBALIKAN'
                            : deposit.returnPaymentStatus === 1
                              ? 'SEBAGIAN'
                              : deposit.returnPaymentStatus === 0
                                ? 'BELUM DIKEMBALIKAN'
                                : deposit.returnPaymentStatus}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          onClick={() => handleDetail(deposit.transactionRentSecurityDepositId)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </CButton>
                      </CTableDataCell>
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

export default TableSecurityDeposit
