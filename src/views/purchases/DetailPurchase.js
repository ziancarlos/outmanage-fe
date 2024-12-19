import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormRange,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CLoadingButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CMultiSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsF,
} from '@coreui/react-pro'

import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import TablePurchaseLog from '../../components/purchases/TablePurchaseLog'
import Swal from 'sweetalert2'
import {
  faCheck,
  faCircleCheck,
  faEye,
  faMoneyBill,
  faMoneyBill1,
  faMoneyBillTrendUp,
  faS,
  faSave,
  faTimeline,
  faTimes,
  faTimesCircle,
  faWallet,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatRupiah } from '../../utils/CurrencyUtils'
import { formatToISODate } from '../../utils/DateUtils'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailPurchase = () => {
  const { authorizePermissions } = useAuth()

  const canReadPurchaseLog = authorizePermissions.some((perm) => perm.name === 'read-purchase-logs')
  const canReadPurchaseInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-purchase-inventories',
  )
  const canReadPurchaseInventoriesDetails = authorizePermissions.some(
    (perm) => perm.name === 'read-purchase-inventories-details',
  )

  const canReadPurchasePayments = authorizePermissions.some(
    (perm) => perm.name === 'read-purchase-payments',
  )
  const canCreatePurchasePayment = authorizePermissions.some(
    (perm) => perm.name === 'create-purchase-payment',
  )
  const canCreatePurchaseInventoryDetail = authorizePermissions.some(
    (perm) => perm.name === 'create-purchase-inventory-detail',
  )
  const canDeletePurchase = authorizePermissions.some((perm) => perm.name === 'delete-purchase')

  const canReadSupplier = authorizePermissions.some((perm) => perm.name === 'read-supplier')
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')

  const { purchaseId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const searchParamsRef = useRef()

  const [visibileModalPayment, setVisibileModalPayment] = useState(false)

  const [purchase, setPurchase] = useState({})

  const [purchaseLogs, setPurchaseLogs] = useState([])
  const [purchaseLogPage, setPurchaseLogPage] = useState(1)
  const [purchaseLogTotalPages, setPurchaseLogTotalPages] = useState(1)
  const [purchaseLogError, setPurchaseLogError] = useState('')
  const [purchaseLogSearchTypeValue, setPurchaseLogSearchTypeValue] = useState('')
  const [purchaseLogSearchStartDateValue, setPurchaseLogSearchStartDateValue] = useState('')
  const [purchaseLogSearchEndDateValue, setPurchaseLogSearchEndDateValue] = useState('')
  const [purchaseLogSearchLoading, setPurchaseLogSearchLoading] = useState(false)

  const [purchaseInventories, setPurchaseInventories] = useState([])

  const [purchaseInventoriesDetails, setPurchaseInventoriesDetails] = useState([])

  const [purchasePayments, setPurchasePayments] = useState([])
  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')
  const [amountPaidValue, setAmountPaidValue] = useState(0)
  const [bankValue, setBankValue] = useState('')
  const [bankOptions, setBankOptions] = useState([])
  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')
  const [cashRecipentValue, setCashRecipentValue] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [visibileModalArrivalInventory, setVisibileModalArrivalInventory] = useState(false)
  const [purchaseInventoryId, setPurchaseInventoryId] = useState(null)
  const [arrivalPurchaseInventory, setArrivalPurchaseInventory] = useState(null)
  const [modalArrivalInventoryLoading, setModalArrivalInventoryLoading] = useState(false)
  const [arrivalInventoryError, setArrivalInventoryError] = useState('')
  const [receivedQuantityValue, setReceivedQuantityValue] = useState(0)
  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setPurchaseLogError('')
  }, [purchaseLogSearchTypeValue, purchaseLogSearchStartDateValue, purchaseLogSearchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = []

    fetchPromises.push(fetchPurchase(purchaseId))

    if (canReadPurchaseLog) {
      const queryParams = new URLSearchParams(location.search)
      const searchTypeParamValue = queryParams.get('type')
      const startDateParamValue = queryParams.get('startDate')
      const endDateParamValue = queryParams.get('endDate')

      searchParamsRef.current = {}

      if (matchingTypes.includes(searchTypeParamValue)) {
        searchParamsRef.current.type = searchTypeParamValue
      }
      if (startDateParamValue) {
        searchParamsRef.current.startDate = startDateParamValue
      }
      if (endDateParamValue) {
        searchParamsRef.current.endDate = endDateParamValue
      }

      fetchPromises.push(fetchPurchaseLogs(purchaseId, purchaseLogPage, searchParamsRef.current))
    }

    if (canReadPurchaseInventories) {
      fetchPromises.push(fetchPurchaseInventories(purchaseId))
    }

    if (canReadPurchasePayments) {
      fetchPromises.push(fetchPurchasePayments(purchaseId))
    }

    if (canCreatePurchasePayment) {
      fetchPromises.push(fetchBankOptions())
    }

    if (canReadPurchaseInventoriesDetails) {
      fetchPromises.push(fetchPurchaseInventoriesDetails(purchaseId))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  useEffect(() => {
    clearPaymentMethodForm()
    setAmountPaidValue(0)
    setCheckedPaymentMethodOptions('transfer')
    setPaymentError('')
    setPaymentSuccess('')

    if (visibileModalPayment) {
      setLoading(true)

      fetchPurchase(purchaseId).finally(() => setLoading(false))
    }
  }, [visibileModalPayment])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  async function fetchPurchaseInventoriesDetails(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/inventories/details`)

      setPurchaseInventoriesDetails(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function handleCancel(e) {
    e.preventDefault()

    try {
      setLoading(true)

      await axiosPrivate.delete(`/api/purchases/${purchaseId}`)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembelian berhasil di batalkan.',
        confirmButtonText: 'OK',
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: e.response.data.error,
          confirmButtonText: 'OK',
        })
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)

      setRefetch((prev) => !prev)
    }
  }

  function handleShowModalArrivalInventory(item) {
    setVisibileModalArrivalInventory(true)
    setPurchaseInventoryId(item.purchaseHasInventoryId)
    setArrivalPurchaseInventory(item)
  }

  function handleCloseModalArrivalInventory() {
    setVisibileModalArrivalInventory(false)
    setPurchaseInventoryId(null)
    setArrivalPurchaseInventory(null)
    setReceivedQuantityValue(0)
  }

  async function fetchPurchase(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}`)

      setPurchase(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchPurchaseInventories(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/inventories`)

      setPurchaseInventories(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchPurchasePayments(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/payments`)

      setPurchasePayments(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchBankOptions() {
    try {
      const response = await axiosPrivate.get('/api/bank')

      const options = response.data.data.map((bank) => ({
        value: bank.bankCode,
        label: bank.bankName,
      }))

      setBankOptions(options)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setPaymentError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function purchaseLogHandleSearch(e) {
    e.preventDefault()
    setPurchaseLogSearchLoading(true)
    setPurchaseLogPage(1)

    const searchParams = {}

    if (matchingTypes.includes(purchaseLogSearchTypeValue)) {
      searchParams.type = purchaseLogSearchTypeValue
    }

    if (purchaseLogSearchStartDateValue) {
      searchParams.startDate = formatToISODate(purchaseLogSearchStartDateValue)
    }

    if (purchaseLogSearchEndDateValue) {
      searchParams.endDate = formatToISODate(purchaseLogSearchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/purchases/${purchaseId}/detail`)
    }

    fetchPurchaseLogs(purchaseId, 1, searchParams).finally(() => setPurchaseLogSearchLoading(false))
  }

  async function fetchPurchaseLogs(purchaseId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setPurchaseLogs(response.data.data)
      setPurchaseLogTotalPages(response.data.paging.totalPage)
      setPurchaseLogPage(response.data.paging.page)

      setPurchaseLogSearchTypeValue('')
      setPurchaseLogSearchStartDateValue('')
      setPurchaseLogSearchEndDateValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setPurchaseLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  const handlePurchaseLogPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= purchaseLogTotalPages && newPage !== purchaseLogPage) {
      setPurchaseLogPage(newPage)

      setLoading(true)

      fetchPurchaseLogs(purchaseId, newPage, searchParamsRef).finally(() => setLoading(false))
    }
  }

  function handlePaymentAmount(value) {
    setAmountPaidValue(
      Math.max(0, Math.min(Number(value.replace(/[^0-9]/g, '')), purchase.remainingBalance)),
    )
  }

  async function handleCheckAccountNumber() {
    setAccountNameValue('')
    setPaymentError('')
    setPaymentSuccess('')

    try {
      setLoading(true)

      const response = await axiosPrivate.post('/api/bank', {
        bankCode: bankValue.value,
        accountNumber: accountNumberValue,
      })

      setPaymentSuccess('Bank dan nomor rekening ditemukkan')
      setAccountNameValue(response.data.data.accountName)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setPaymentError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function validatePaymentForm() {
    if (
      checkedPaymentMethodOptions === 'transfer' &&
      (!bankValue || !accountNumberValue || !accountNameValue)
    ) {
      return 'Harap berikan rincian bank dan rekening yang valid untuk transfer.'
    }

    if (checkedPaymentMethodOptions === 'cash' && !cashRecipentValue) {
      return 'Harap berikan nama penerima uang tunai untuk pembayaran tunai.'
    }

    if (amountPaidValue < 1) {
      return 'Harap jumlah yang dibayarkan lebih besar dari 0.'
    }

    return null
  }

  function clearPaymentMethodForm() {
    setBankValue('')
    setAccountNameValue('')
    setAccountNumberValue('')
    setCashRecipentValue('')
  }

  function clearPaymentForm() {
    clearPaymentMethodForm()
    setAmountPaidValue(0)
    setVisibileModalPayment(false)
    setCheckedPaymentMethodOptions('transfer')
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault()

    try {
      setPaymentLoading(true)

      const errorMessage = validatePaymentForm()
      if (errorMessage) {
        setPaymentError(errorMessage)
        return
      }

      let request = {}

      if (checkedPaymentMethodOptions === 'transfer') {
        request = {
          paymentDetails: {
            bankCode: bankValue.value,
            accountNumber: accountNumberValue,
            amountPaid: amountPaidValue,
          },
        }
      }

      if (checkedPaymentMethodOptions === 'cash') {
        request = {
          paymentDetails: {
            cashRecipent: cashRecipentValue,
            amountPaid: amountPaidValue,
          },
        }
      }

      await axiosPrivate.post(`/api/purchases/${purchaseId}/payments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran berhasil diproses.',
        confirmButtonText: 'OK',
      })

      clearPaymentForm()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setPaymentError(e.response.data.error)
        setPaymentSuccess('')
      } else {
        navigate('/500')
      }
    } finally {
      setPaymentLoading(false)

      setRefetch((prev) => !prev)
    }
  }

  useEffect(() => {
    setArrivalInventoryError('')
  }, [receivedQuantityValue])

  function validateArrivalInventoryForm() {
    if (receivedQuantityValue < 1) {
      return 'Kuantitas harus lebih besar dari 0.'
    }

    return null
  }

  async function handldeArrivalInventorySubmit(e) {
    e.preventDefault()

    const errorMessage = validateArrivalInventoryForm()

    if (errorMessage) {
      return setArrivalInventoryError(errorMessage)
    }

    try {
      setModalArrivalInventoryLoading(true)

      await axiosPrivate.post(`/api/purchases/${purchaseId}/inventories/${purchaseInventoryId}`, {
        receivedQuantity: receivedQuantityValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Penerimaan barang berhasil diproses.',
        confirmButtonText: 'OK',
      })

      setVisibileModalArrivalInventory(false)

      setRefetch((prev) => !prev)

      setReceivedQuantityValue(0)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        setArrivalInventoryError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setModalArrivalInventoryLoading(false)
    }
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
          <CRow>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="success"
                icon={<FontAwesomeIcon icon={faWallet} size="lg" />}
                padding={false}
                title="Total Keseluruhan"
                value={formatRupiah(purchase.grandTotal || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="secondary"
                icon={<FontAwesomeIcon icon={faMoneyBillTrendUp} size="lg" />}
                padding={false}
                title="Jumlah Dibayar"
                value={formatRupiah(purchase.totalPaid || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faMoneyBill} size="lg" />}
                padding={false}
                title="Sisa Pembayaran"
                value={formatRupiah(purchase.remainingBalance || 0)}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>
                    {'PO' + purchase.purchaseId}{' '}
                    <CBadge
                      className="ms-2 me-2"
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
                    <CBadge
                      className="me-2"
                      color={
                        purchase.deliveryStatus === 2
                          ? 'success'
                          : purchase.deliveryStatus === 1
                            ? 'warning'
                            : purchase.deliveryStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {purchase.deliveryStatus === 2
                        ? 'SELESAI'
                        : purchase.deliveryStatus === 1
                          ? 'SEBAGIAN'
                          : purchase.deliveryStatus === 0
                            ? 'BELUM SAMPAI'
                            : purchase.deliveryStatus}
                    </CBadge>
                  </CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Tanggal Pembelian: {moment(purchase.purchaseDate).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                  <CListGroupItem>
                    Pemasok:{' '}
                    {canReadSupplier ? (
                      <NavLink to={`/suppliers/${purchase.supplier.supplierId}/detail`}>
                        {purchase.supplier.name}
                      </NavLink>
                    ) : (
                      purchase.supplier.name
                    )}
                  </CListGroupItem>
                  <CListGroupItem>Deskripsi: {purchase.description || '-'}</CListGroupItem>
                </CListGroup>

                {(() => {
                  // Conditions for the buttons
                  const canMakePayment =
                    purchase.paymentStatus !== 2 &&
                    purchase.deletedAt === null &&
                    canCreatePurchasePayment

                  const canCancelPurchase =
                    purchase.paymentStatus === 0 &&
                    purchase.deliveryStatus === 0 &&
                    purchase.deletedAt === null &&
                    canDeletePurchase

                  // Button components
                  const renderPaymentButton = canMakePayment && (
                    <CButton
                      color="success"
                      variant="outline"
                      onClick={() => setVisibileModalPayment(!visibileModalPayment)}
                      className="me-1"
                    >
                      <FontAwesomeIcon icon={faMoneyBill1} className="me-2" />
                      Pembayaran
                    </CButton>
                  )

                  const renderCancelButton = canCancelPurchase && (
                    <CButton color="danger" variant="outline" onClick={(e) => handleCancel(e)}>
                      <FontAwesomeIcon icon={faX} className="me-2" />
                      Pembatalan
                    </CButton>
                  )

                  // Check if any button should be displayed
                  const shouldRenderFooter = renderPaymentButton || renderCancelButton

                  // Conditionally render footer if there are buttons to show
                  return shouldRenderFooter ? (
                    <CCardFooter>
                      {renderPaymentButton}
                      {renderCancelButton}
                    </CCardFooter>
                  ) : null
                })()}
              </CCard>
            </CCol>

            {canReadPurchaseInventories && (
              <CCol md={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pembelian Barang</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Total Harga</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Harga Satuan</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas Diterima</CTableHeaderCell>

                            <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {purchaseInventories.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>POI{item.purchaseHasInventoryId}</CTableDataCell>

                              <CTableDataCell>
                                {canReadInventory ? (
                                  <>
                                    <NavLink
                                      to={`/inventories/${item.inventory.inventoryId}/detail`}
                                      className="me-2"
                                    >
                                      {item.inventory.name}
                                    </NavLink>
                                    {item.inventory.condition === 0 ? (
                                      <CBadge color="primary">BARU</CBadge>
                                    ) : item.inventory.condition === 1 ? (
                                      <CBadge color="warning">BEKAS</CBadge>
                                    ) : (
                                      <span>{item.inventory.condition}</span> // Fallback for any other condition
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <a className="me-2">{item.inventory.name}</a>{' '}
                                    {item.inventory.condition === 0 ? (
                                      <CBadge color="primary">BARU</CBadge>
                                    ) : item.inventory.condition === 1 ? (
                                      <CBadge color="warning">BEKAS</CBadge>
                                    ) : (
                                      <span>{item.inventory.condition}</span> // Fallback for any other condition
                                    )}
                                  </>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                              <CTableDataCell>
                                {formatRupiah(item.pricePerUnit * item.quantity)}
                              </CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                              <CTableDataCell>
                                {parseInt(item.arrivedQuantity).toLocaleString()}
                              </CTableDataCell>
                              <CTableDataCell className="d-flex align-middle">
                                {item.arrivedQuantity != item.quantity &&
                                purchase.deletedAt === null &&
                                canCreatePurchaseInventoryDetail ? (
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => {
                                      handleShowModalArrivalInventory(item)
                                    }}
                                  >
                                    <FontAwesomeIcon color="white" icon={faCircleCheck} />
                                  </CButton>
                                ) : (
                                  '-'
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )}

            {canReadPurchaseInventoriesDetails && (
              <CCol md={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Penerimaan Barang</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Tanggal Diterima</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas Diterima</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {purchaseInventoriesDetails.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>
                                {'PORG' + item.purchaseHasInventoryDetailId}
                              </CTableDataCell>
                              <CTableDataCell>
                                {canReadInventory ? (
                                  <>
                                    <NavLink
                                      to={`/inventories/${item.inventory.inventoryId}/detail`}
                                      className="me-2"
                                    >
                                      {item.inventory.name}
                                    </NavLink>
                                    {item.inventory.condition === 0 ? (
                                      <CBadge color="primary">BARU</CBadge>
                                    ) : item.inventory.condition === 1 ? (
                                      <CBadge color="warning">BEKAS</CBadge>
                                    ) : (
                                      <span>{item.inventory.condition}</span> // Fallback for any other condition
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <a className="me-2">{item.inventory.name}</a>{' '}
                                    {item.inventory.condition === 0 ? (
                                      <CBadge color="primary">BARU</CBadge>
                                    ) : item.inventory.condition === 1 ? (
                                      <CBadge color="warning">BEKAS</CBadge>
                                    ) : (
                                      <span>{item.inventory.condition}</span> // Fallback for any other condition
                                    )}
                                  </>
                                )}
                              </CTableDataCell>

                              <CTableDataCell>
                                {moment(item.arrivalDate).format('MMMM D, YYYY h:mm A')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {item.arrivedQuantity.toLocaleString()}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )}

            {canReadPurchasePayments && (
              <CCol md={12}>
                <CCard className="mb-4">
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pembayaran</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell
                              scope="col"
                              rowSpan={3}
                              className="text-center align-middle"
                            >
                              Id
                            </CTableHeaderCell>

                            <CTableHeaderCell
                              scope="col"
                              rowSpan={3}
                              className="text-center align-middle"
                            >
                              Tanggal Pembayaran
                            </CTableHeaderCell>
                            <CTableHeaderCell
                              scope="col"
                              colSpan={3}
                              className="text-center align-middle"
                            >
                              Metode Pembayaran
                            </CTableHeaderCell>

                            <CTableHeaderCell
                              scope="col"
                              rowSpan={3}
                              className="text-center align-middle"
                            >
                              Jumlah Yang Dibayarkan
                            </CTableHeaderCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableHeaderCell
                              scope="col"
                              rowSpan={2}
                              className="text-center align-middle"
                            >
                              Penerima Uang Tunai
                            </CTableHeaderCell>
                            <CTableHeaderCell
                              scope="col"
                              colSpan={2}
                              className="text-center align-middle"
                            >
                              Transfer
                            </CTableHeaderCell>
                          </CTableRow>

                          <CTableRow>
                            <CTableHeaderCell scope="col">Nomor Rekening</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Bank</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {purchasePayments.map((payment, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-center">
                                POP{payment.purchasePaymentId}
                              </CTableDataCell>
                              <CTableDataCell>
                                {moment(payment.paymentDate).format('MMMM D, YYYY h:mm A')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {payment.cashRecipent ? payment.cashRecipent : '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {payment.accountNumber ? payment.accountNumber : '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {payment.bankName ? payment.bankName : '-'}
                              </CTableDataCell>
                              <CTableDataCell>{formatRupiah(payment.amountPaid)}</CTableDataCell>
                            </CTableRow>
                          ))}

                          <CTableRow>
                            <CTableHeaderCell className="text-center align-middle" colSpan={5}>
                              <strong>Total</strong>
                            </CTableHeaderCell>
                            <CTableDataCell>
                              <strong>
                                {formatRupiah(
                                  purchasePayments.reduce(
                                    (total, payment) => total + Number(payment.amountPaid),
                                    0,
                                  ),
                                )}
                              </strong>
                            </CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )}

            {canReadPurchaseLog && (
              <CCol md={12} xs={12}>
                <TablePurchaseLog
                  title={'Data Log Pembelian'}
                  error={purchaseLogError}
                  handleSearch={purchaseLogHandleSearch}
                  typeOptions={typeOptions}
                  searchTypeValue={purchaseLogSearchTypeValue}
                  setSearchTypeValue={setPurchaseLogSearchTypeValue}
                  searchStartDateValue={purchaseLogSearchStartDateValue}
                  setSearchStartDateValue={setPurchaseLogSearchStartDateValue}
                  searchEndDateValue={purchaseLogSearchEndDateValue}
                  setSearchEndDateValue={setPurchaseLogSearchEndDateValue}
                  searchLoading={purchaseLogSearchLoading}
                  purchasesLogs={purchaseLogs}
                  page={purchaseLogPage}
                  totalPages={purchaseLogTotalPages}
                  handlePageChange={handlePurchaseLogPageChange}
                  authorizePermissions={authorizePermissions}
                />
              </CCol>
            )}

            {canCreatePurchaseInventoryDetail && (
              <CModal
                visible={visibileModalArrivalInventory}
                onClose={handleCloseModalArrivalInventory}
                aria-labelledby="LiveDemoExampleLabel"
              >
                <CModalHeader>
                  <CModalTitle id="LiveDemoExampleLabel">Konfirmasi Penerimaan Barang</CModalTitle>
                </CModalHeader>
                <CForm noValidate onSubmit={handldeArrivalInventorySubmit}>
                  <CModalBody>
                    {modalArrivalInventoryLoading || arrivalPurchaseInventory === null ? (
                      <div className="pt-3 text-center">
                        <CSpinner color="primary" variant="grow" />
                      </div>
                    ) : (
                      <>
                        {arrivalInventoryError && (
                          <CAlert color="danger">{arrivalInventoryError}</CAlert>
                        )}

                        <div className="mb-3">
                          <CFormInput
                            value={`${arrivalPurchaseInventory?.inventory.name} | ${arrivalPurchaseInventory?.inventory.condition === 0 ? 'BARU' : 'BEKAS'}`}
                            label="Barang"
                            disabled
                            readOnly
                          />
                        </div>

                        <div className="mb-3">
                          <CFormInput
                            value={`${(arrivalPurchaseInventory?.quantity - arrivalPurchaseInventory?.arrivedQuantity).toLocaleString()}`}
                            label="Kuantitas Belum Diterima"
                            disabled
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <CFormInput
                            type="text"
                            value={`${arrivalPurchaseInventory?.arrivedQuantity.toLocaleString()}`}
                            label="Kuantitas Diterima"
                            disabled
                            readOnly
                          />
                        </div>

                        <div className="mb-3">
                          <CFormInput
                            label="Kuantitas Diterima Sekarang"
                            value={receivedQuantityValue.toLocaleString()} // Display formatted number
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.-]+/g, '') // Clean the input
                              const numberValue = Number(value) // Convert to number

                              // Only update the state if the cleaned value is a valid number and greater than 0
                              if (!isNaN(numberValue)) {
                                setReceivedQuantityValue(numberValue) // Update the state with the number
                              }
                            }}
                            disabled={modalArrivalInventoryLoading}
                          />
                        </div>
                      </>
                    )}
                  </CModalBody>

                  <CModalFooter>
                    <CLoadingButton
                      color="primary"
                      type="submit"
                      disabled={
                        modalArrivalInventoryLoading || validateArrivalInventoryForm() !== null
                      }
                      loading={modalArrivalInventoryLoading}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </CLoadingButton>

                    <CButton color="secondary" onClick={() => handleCloseModalArrivalInventory()}>
                      <FontAwesomeIcon icon={faTimes} />
                    </CButton>
                  </CModalFooter>
                </CForm>
              </CModal>
            )}

            {canCreatePurchasePayment && (
              <CModal
                visible={visibileModalPayment}
                onClose={() => setVisibileModalPayment(false)}
                aria-labelledby="LiveDemoExampleLabel"
              >
                <CForm onSubmit={handlePaymentSubmit} noValidate>
                  <CModalHeader>
                    <CModalTitle id="LiveDemoExampleLabel">Pembayaran</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    {paymentError && <CAlert color="danger">{paymentError}</CAlert>}
                    {paymentSuccess && <CAlert color="success">{paymentSuccess}</CAlert>}

                    <div className="mt-3 mb-3">
                      <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>

                      <CFormRange
                        id="customRange1"
                        min={0}
                        max={purchase.remainingBalance}
                        onChange={(e) => setAmountPaidValue(e.target.value)}
                        disabled={paymentLoading}
                        value={amountPaidValue}
                      />

                      <CFormInput
                        type="text"
                        value={formatRupiah(amountPaidValue)}
                        onChange={(e) => handlePaymentAmount(e.target.value)}
                        disabled={paymentLoading}
                      />
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="paymentMethod" className="fw-bold d-block">
                        Metode Pembayaran
                      </CFormLabel>
                      <CFormCheck
                        inline
                        type="radio"
                        name="paymentMethod"
                        id="transfer"
                        label="Transfer"
                        value="transfer"
                        checked={checkedPaymentMethodOptions === 'transfer'}
                        onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                        disabled={paymentLoading}
                      />

                      <CFormCheck
                        inline
                        type="radio"
                        name="paymentMethod"
                        id="cash"
                        label="Tunai"
                        value="cash"
                        checked={checkedPaymentMethodOptions === 'cash'}
                        onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                        className="me-3"
                        disabled={paymentLoading}
                      />
                    </div>

                    {checkedPaymentMethodOptions === 'cash' && (
                      <div className="mb-3">
                        <CFormLabel className="fw-bold">Penerima uang tunai</CFormLabel>
                        <CFormInput
                          type="text"
                          value={cashRecipentValue}
                          onChange={(e) => setCashRecipentValue(e.target.value)}
                          placeholder="Masukkan penerima uang tunai"
                          disabled={paymentLoading}
                        />
                      </div>
                    )}

                    {checkedPaymentMethodOptions === 'transfer' && (
                      <div>
                        <div className="mb-3">
                          <CFormLabel className="fw-bold">Bank</CFormLabel>
                          <CMultiSelect
                            options={bankOptions.map((option) => ({
                              ...option,
                              selected: option.value === bankValue.value,
                            }))}
                            onChange={(e) => {
                              if (e.length < 1) return
                              if (e[0].value === bankValue.value) return

                              setBankValue(e[0])
                            }}
                            multiple={false}
                            virtualScroller
                            visibleItems={5}
                            placeholder="Pilih bank"
                            cleaner={false}
                            disabled={paymentLoading}
                          />
                        </div>
                        <div className="mb-3">
                          <CFormLabel className="fw-bold">Nomor Rekening</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              placeholder="Masukkan nomor rekening"
                              value={accountNumberValue}
                              onChange={(e) => setAccountNumberValue(e.target.value)}
                              disabled={paymentLoading}
                            />

                            <CButton
                              type="button"
                              color="primary"
                              variant="outline"
                              id="button-addon1"
                              onClick={handleCheckAccountNumber}
                              disabled={!!paymentError || paymentLoading}
                            >
                              Cek
                            </CButton>
                          </CInputGroup>
                        </div>

                        <div className="mb-3">
                          <CFormLabel className="fw-bold">Nama Rekening</CFormLabel>
                          <CFormInput type="text" readOnly value={accountNameValue} disabled />
                        </div>
                      </div>
                    )}
                  </CModalBody>

                  <CModalFooter>
                    <CLoadingButton
                      color="primary"
                      type="submit"
                      disabled={validatePaymentForm() !== null || paymentLoading}
                      loading={paymentLoading}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </CLoadingButton>

                    <CButton color="secondary" onClick={() => setVisibileModalPayment(false)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </CButton>
                  </CModalFooter>
                </CForm>
              </CModal>
            )}
          </CRow>
        </>
      )}
    </>
  )
}

export default DetailPurchase
