import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDateRangePicker,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CLoadingButton,
  CMultiSelect,
  CRow,
  CSmartPagination,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  useDebouncedCallback,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { faEye, faSearch } from '@fortawesome/free-solid-svg-icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import moment from 'moment'
import useAuth from '../../hooks/useAuth'
import { formatRupiah } from '../../utils/CurrencyUtils'
import { formatToISODate } from '../../utils/DateUtils'

const DataPurchase = () => {
  const { authorizePermissions } = useAuth()

  const canReadSupplier = authorizePermissions.some((perm) => perm.name === 'read-supplier')
  const canReadPurchase = authorizePermissions.some((perm) => perm.name === 'read-purchase')

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [fetchSuppliersLoading, setFetchSuppliersLoading] = useState(false)

  const [purchases, setPurchasings] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [suppliersOptions, setSuppliersOptions] = useState([])
  const [searchSupplierValue, setSearchSupplierValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchDeliveryStatusValue, setSearchDeliveryStatusValue] = useState('')
  const [searchPaymentStatusValue, setSearchPaymentStatusValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  const fetchSuppliers = async (value) => {
    setFetchSuppliersLoading(true)
    try {
      try {
        const params = value
          ? { name: value, phoneNumber: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/suppliers', { params })
        const options = response.data.data.map((supplier) => ({
          value: supplier.supplierId,
          label: `${supplier.name} | ${supplier.phoneNumber}`,
        }))

        setSuppliersOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchSuppliersLoading(false)
    }
  }

  const debouncedFetchSuppliers = useDebouncedCallback((value) => {
    fetchSuppliers(value)
  }, 300)

  async function fetchData(page, searchParams) {
    try {
      const params = { page: page, size: 5, ...searchParams }

      const response = await axiosPrivate.get('/api/purchases', { params })

      setPurchasings(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      clearInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setLoading(false))
    }
  }

  function handleDetail(purchaseId) {
    navigate(`/purchases/${purchaseId}/detail`)
  }

  function handleUpdate(purchaseId) {
    navigate(`/purchases/${purchaseId}/edit`)
  }

  useEffect(() => {
    setError('')
  }, [
    searchSupplierValue,
    searchDeliveryStatusValue,
    searchPaymentStatusValue,
    searchStartDateValue,
    searchEndDateValue,
  ])

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const supplierIdValue = queryParams.get('supplierId')
    const deliveryStatusValue = queryParams.get('deliveryStatus')
    const paymentStatusValue = queryParams.get('paymentStatus')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (!isNaN(parseInt(supplierIdValue))) {
      searchParamsRef.current.supplierId = supplierIdValue
    }
    if (['SUDAH-SELESAI', 'BELUM-SELESAI'].includes(deliveryStatusValue)) {
      searchParamsRef.current.deliveryStatus = deliveryStatusValue
    }
    if (['LUNAS', 'SEBAGIAN', 'BELUM-LUNAS'].includes(paymentStatusValue)) {
      searchParamsRef.current.paymentStatus = paymentStatusValue
    }
    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (!isNaN(parseInt(searchSupplierValue[0]?.value))) {
      searchParams.supplierId = searchSupplierValue[0].value
    }

    if (['SUDAH-SELESAI', 'BELUM-SELESAI'].includes(searchDeliveryStatusValue)) {
      searchParams.deliveryStatus = searchDeliveryStatusValue
    }

    if (['LUNAS', 'SEBAGIAN', 'BELUM-LUNAS'].includes(searchPaymentStatusValue)) {
      searchParams.paymentStatus = searchPaymentStatusValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = formatToISODate(searchStartDateValue)
    }

    if (searchEndDateValue) {
      searchParams.endDate = formatToISODate(searchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/purchases/data`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
    setSuppliersOptions([])
    setSearchSupplierValue('')
    setSearchDeliveryStatusValue('')
    setSearchPaymentStatusValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
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
                    <CCol xs={12} md={4} className="mb-3">
                      <CMultiSelect
                        options={suppliersOptions}
                        onFilterChange={debouncedFetchSuppliers}
                        onShow={fetchSuppliers}
                        disabled={searchLoading}
                        loading={fetchSuppliersLoading}
                        multiple={false}
                        onChange={(e) => setSearchSupplierValue(e)}
                        label={'Pemasok'}
                        resetSelectionOnOptionsChange={true}
                        placeholder="Pilih Pemasok"
                      />
                    </CCol>

                    <CCol xs={12} md={4} className="mb-3">
                      <CFormLabel htmlFor="typeInput">Status Pengiriman</CFormLabel>
                      <CFormSelect
                        id="typeInput"
                        value={searchDeliveryStatusValue}
                        onChange={(e) => setSearchDeliveryStatusValue(e.target.value)}
                        options={[
                          { label: 'Pilih Status Pengiriman', value: '' },
                          { label: 'Sudah Selesai', value: 'SUDAH-SELESAI' },
                          { label: 'Belum Selesai', value: 'BELUM-SELESAI' },
                        ]}
                      />
                    </CCol>

                    <CCol xs={12} md={4} className="mb-3">
                      <CFormLabel htmlFor="typeInput">Status Pembayaran</CFormLabel>
                      <CFormSelect
                        id="typeInput"
                        value={searchPaymentStatusValue}
                        onChange={(e) => setSearchPaymentStatusValue(e.target.value)}
                        options={[
                          { label: 'Pilih Status Pembayaran', value: '' },
                          { label: 'Lunas', value: 'LUNAS' },
                          { label: 'Sebagian', value: 'SEBAGIAN' },
                          { label: 'Belum Lunas', value: 'BELUM-LUNAS' },
                        ]}
                      />
                    </CCol>

                    <CCol xs={12} md={12} className="mb-3">
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

                    <CCol className="d-flex align-items-center mt-2 mt-md-0" xs={12}>
                      <CLoadingButton
                        color="primary"
                        type="submit"
                        loading={searchLoading}
                        disabled={searchLoading}
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </CLoadingButton>
                    </CCol>
                  </CRow>
                </CForm>

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
                      {purchases.map((purchase, idx) => (
                        <CTableRow key={idx}>
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
                            {
                              <CBadge color={purchase.deliveryStatus == 1 ? 'success' : 'warning'}>
                                {purchase.deliveryStatus == 1 ? 'Selesai' : 'Belum Selesai'}
                              </CBadge>
                            }
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
      )}
    </>
  )
}

export default DataPurchase
