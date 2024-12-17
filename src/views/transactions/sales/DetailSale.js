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
import {
  faEye,
  faFileAlt,
  faL,
  faMoneyBill,
  faMoneyBill1,
  faMoneyBill1Wave,
  faMoneyBillTrendUp,
  faPaperPlane,
  faSave,
  faShippingFast,
  faTimes,
  faTruck,
  faWallet,
  faX,
} from '@fortawesome/free-solid-svg-icons'

import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import moment from 'moment'
import useLogout from '../../../hooks/useLogout'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useAuth from '../../../hooks/useAuth'
import Swal from 'sweetalert2'
import { formatRupiah } from '../../../utils/CurrencyUtils'
import TableSaleLog from '../../../components/transactions/sale/TableSaleLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailSale = () => {
  const { authorizePermissions } = useAuth()

  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadTransactionSaleLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-logs',
  )
  const canCreateTransactionSalePayment = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-sale-payment',
  )
  const canReadTransactionSalePayments = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-payments',
  )
  const canReadTransactionSaleInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )
  const canReadTruck = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )

  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadTransactionSaleShipments = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-shipments',
  )
  const canReadTransactionSaleShipment = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-shipment',
  )
  const canCreateTransactionSaleShipment = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-sale-shipment',
  )
  const canDownloadTransactionSaleOfferLetter = authorizePermissions.some(
    (perm) => perm.name === 'download-transaction-sale-offer-letter',
  )
  const canDeleteTransactionSale = authorizePermissions.some(
    (perm) => perm.name === 'delete-transaction-sale',
  )

  const { transactionSaleId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const searchParamsRef = useRef()

  const [transactionSale, setTransactionSale] = useState('')
  const [transactionSalePayments, setTransactionSalePayments] = useState([])
  const [transactionSaleInventories, setTransactionSaleInventories] = useState([])
  const [transactionSaleShipment, setTransactionSaleShipment] = useState([])

  const [refetch, setRefetch] = useState(false)

  const [visibileModalPayment, setVisibileModalPayment] = useState(false)
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

  const [transactionSaleLogs, setTransactionSaleLogs] = useState([])
  const [transactionSaleLogPage, setTransactionSaleLogPage] = useState(1)
  const [transactionSaleLogTotalPages, setTransactionSaleLogTotalPages] = useState(1)
  const [transactionSaleLogError, setTransactionSaleLogError] = useState('')
  const [transactionSaleLogSearchTypeValue, setTransactionSaleLogSearchTypeValue] = useState('')
  const [transactionSaleLogSearchStartDateValue, setTransactionSaleLogSearchStartDateValue] =
    useState('')
  const [transactionSaleLogSearchEndDateValue, setTransactionSaleLogSearchEndDateValue] =
    useState('')
  const [transactionSaleLogSearchLoading, setTransactionSaleLogSearchLoading] = useState(false)

  useEffect(() => {
    setTransactionSaleLogError('')
  }, [
    transactionSaleLogSearchTypeValue,
    transactionSaleLogSearchStartDateValue,
    transactionSaleLogSearchEndDateValue,
  ])
  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionSale(transactionSaleId))

    if (canReadTransactionSalePayments) {
      fetchPromises.push(fetchTransactionSalePayments(transactionSaleId))
    }

    if (canCreateTransactionSalePayment) {
      fetchPromises.push(fetchBankOptions())
    }

    if (canReadTransactionSaleLogs) {
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

      fetchPromises.push(
        fetchTransactionSaleLogs(
          transactionSaleId,
          transactionSaleLogPage,
          searchParamsRef.current,
        ),
      )
    }

    if (canReadTransactionSaleInventories) {
      fetchPromises.push(fetchTransactionSaleInventories(transactionSaleId))
    }

    if (canReadTransactionSaleShipments) {
      fetchPromises.push(fetchTransactionSaleShipment(transactionSaleId))
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

      fetchTransactionSale(transactionSaleId).finally(() => setLoading(false))
    }
  }, [visibileModalPayment])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  async function fetchTransactionSaleLogs(transactionSaleId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/sales/${transactionSaleId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setTransactionSaleLogs(response.data.data)
      setTransactionSaleLogTotalPages(response.data.paging.totalPage)
      setTransactionSaleLogPage(response.data.paging.page)

      setTransactionSaleLogSearchTypeValue('')
      setTransactionSaleLogSearchStartDateValue('')
      setTransactionSaleLogSearchEndDateValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setTransactionSaleLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function transactionSaleLogHandleSearch(e) {
    e.preventDefault()
    setTransactionSaleLogSearchLoading(true)
    setTransactionSaleLogPage(1)

    const searchParams = {}

    if (matchingTypes.includes(transactionSaleLogSearchTypeValue)) {
      searchParams.type = transactionSaleLogSearchTypeValue
    }

    if (transactionSaleLogSearchStartDateValue) {
      searchParams.startDate = formatToISODate(transactionSaleLogSearchStartDateValue)
    }

    if (transactionSaleLogSearchEndDateValue) {
      searchParams.endDate = formatToISODate(transactionSaleLogSearchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/transactions/sales/${transactionSaleId}/detail`)
    }

    fetchTransactionSaleLogs(transactionSaleId, 1, searchParams).finally(() =>
      setTransactionSaleLogSearchLoading(false),
    )
  }

  const handleTransactionSaleLogPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= transactionSaleLogTotalPages &&
      newPage !== transactionSaleLogPage
    ) {
      setTransactionSaleLogPage(newPage)

      setTransactionSaleLogSearchLoading(true)

      fetchTransactionSaleLogs(transactionSaleId, newPage, searchParamsRef).finally(() =>
        setTransactionSaleLogSearchLoading(false),
      )
    }
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

      await axiosPrivate.post(`/api/transactions/sales/${transactionSaleId}/payments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran berhasil diproses.',
        confirmButtonText: 'OK',
      })

      clearPaymentForm()
    } catch (e) {
      console.log(e)
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

  async function generateOfferingLetter(transactionSaleId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/download-offer-letter`,
        {
          responseType: 'blob', // Ensure the response is treated as a file
        },
      )

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `surat-penawaran-TS${transactionSaleId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Gagal mendapatkan surat penawaran',
          confirmButtonText: 'OK',
        })
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(e) {
    e.preventDefault()

    try {
      setLoading(true)

      await axiosPrivate.delete(`/api/transactions/sales/${transactionSaleId}`)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi penjualan berhasil di batalkan.',
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

  function handlePaymentAmount(value) {
    setAmountPaidValue(
      Math.max(0, Math.min(Number(value.replace(/[^0-9]/g, '')), transactionSale.remainingBalance)),
    )
  }

  async function fetchTransactionSalePayments(transactionSaleId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/payments`,
      )

      setTransactionSalePayments(response.data.data)
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

  async function fetchTransactionSale(transactionSaleId) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/sales/${transactionSaleId}`)

      setTransactionSale(response.data.data)
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

  async function fetchTransactionSaleInventories(transactionSaleId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/inventories`,
      )

      setTransactionSaleInventories(response.data.data)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTransactionSaleShipment(transactionSaleId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/shipments`,
      )

      console.log(response.data.data)
      setTransactionSaleShipment(response.data.data)
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

  function handleShipment(transactionSaleId) {
    navigate(`/transactions/sales/${transactionSaleId}/shipment`)
  }

  function handleDetail(transactionSaleId, transactionSaleShipmentId) {
    navigate(
      `/transactions/sales/${transactionSaleId}/shipment/${transactionSaleShipmentId}/detail`,
    )
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
            <CCol xs={6}>
              <CWidgetStatsF
                className="mb-3"
                color="info"
                icon={<FontAwesomeIcon icon={faMoneyBill1Wave} size="lg" />}
                padding={false}
                title="Total Pembelian"
                value={formatRupiah(transactionSale.purchaseTotal || 0)}
              />
            </CCol>

            <CCol xs={6}>
              <CWidgetStatsF
                className="mb-3"
                color="primary"
                icon={<FontAwesomeIcon icon={faTruck} size="lg" />}
                padding={false}
                title="Ongkos Pengiriman"
                value={formatRupiah(transactionSale.deliveryFee || 0)}
              />
            </CCol>

            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="success"
                icon={<FontAwesomeIcon icon={faWallet} size="lg" />}
                padding={false}
                title="Total Keseluruhan"
                value={formatRupiah(transactionSale.grandTotal || 0)}
              />
            </CCol>

            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="secondary"
                icon={<FontAwesomeIcon icon={faMoneyBillTrendUp} size="lg" />}
                padding={false}
                title="Jumlah Dibayar"
                value={formatRupiah(transactionSale.totalPaid || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faMoneyBill} size="lg" />}
                padding={false}
                title="Sisa Pembayaran"
                value={formatRupiah(transactionSale.remainingBalance || 0)}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>
                    {'TS' + transactionSale.transactionSaleId}
                    <CBadge
                      className="ms-2 me-2"
                      color={
                        transactionSale.paymentStatus === 2
                          ? 'success'
                          : transactionSale.paymentStatus === 1
                            ? 'warning'
                            : transactionSale.paymentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {transactionSale.paymentStatus === 2
                        ? 'LUNAS'
                        : transactionSale.paymentStatus === 1
                          ? 'SEBAGIAN'
                          : transactionSale.paymentStatus === 0
                            ? 'BELUM LUNAS'
                            : transactionSale.paymentStatus}
                    </CBadge>

                    <CBadge
                      className="me-2"
                      color={
                        transactionSale.shipmentStatus === 2
                          ? 'success'
                          : transactionSale.shipmentStatus === 1
                            ? 'warning'
                            : transactionSale.shipmentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {transactionSale.shipmentStatus === 2
                        ? 'SELESAI'
                        : transactionSale.shipmentStatus === 1
                          ? 'PROSES'
                          : transactionSale.shipmentStatus === 0
                            ? 'BELUM DIKIRIM'
                            : transactionSale.shipmentStatus}
                    </CBadge>
                  </CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Tanggal Pembelian:{' '}
                    {moment(transactionSale.transactionDate).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                  <CListGroupItem>
                    Klien:{' '}
                    {canReadClient ? (
                      <NavLink to={`/clients/${transactionSale.client.clientId}/detail`}>
                        {transactionSale.client.name}
                      </NavLink>
                    ) : (
                      transactionSale.client.name
                    )}
                  </CListGroupItem>
                  <CListGroupItem>Deskripsi: {transactionSale.description || '-'}</CListGroupItem>
                </CListGroup>

                {(() => {
                  // Define permission and status checks
                  const needsPayment =
                    transactionSale.totalPaid !== transactionSale.grandTotal &&
                    canCreateTransactionSalePayment &&
                    transactionSale.deletedAt === null

                  const canInitiateShipment =
                    canReadTransactionSaleInventories &&
                    canReadTruck &&
                    canCreateTransactionSaleShipment &&
                    transactionSale.shipmentStatus !== 2 &&
                    transactionSale.deletedAt === null

                  const canGenerateOfferingLetter =
                    canDownloadTransactionSaleOfferLetter &&
                    transactionSale.shipmentStatus === 0 &&
                    transactionSale.paymentStatus === 0 &&
                    transactionSale.deletedAt === null

                  const canCancelSale =
                    transactionSale.paymentStatus === 0 &&
                    transactionSale.shipmentStatus === 0 &&
                    transactionSale.deletedAt === null &&
                    canDeleteTransactionSale

                  // Render Payment Button
                  const renderPaymentButton = needsPayment && (
                    <CButton
                      color="success"
                      variant="outline"
                      onClick={() => setVisibileModalPayment(!visibileModalPayment)}
                      className="me-1"
                    >
                      <FontAwesomeIcon icon={faMoneyBill1} className="me-2" /> Pembayaran
                    </CButton>
                  )

                  // Render Shipment Button
                  const renderShipmentButton = canInitiateShipment && (
                    <CButton
                      color="info"
                      variant="outline"
                      className="me-1"
                      onClick={() => handleShipment(transactionSaleId)}
                    >
                      <FontAwesomeIcon icon={faShippingFast} className="me-2" /> Pengiriman
                    </CButton>
                  )

                  // Render Offering Letter Button
                  const renderOfferingLetterButton = canGenerateOfferingLetter && (
                    <CButton
                      color="warning"
                      variant="outline"
                      className="me-1"
                      onClick={() => generateOfferingLetter(transactionSaleId)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Surat Penawaran
                    </CButton>
                  )

                  const renderCancelButton = canCancelSale && (
                    <CButton
                      color="danger"
                      variant="outline"
                      className="me-1"
                      onClick={(e) => handleCancel(e)}
                    >
                      <FontAwesomeIcon icon={faX} className="me-2" />
                      Pembatalan
                    </CButton>
                  )

                  // Check if any button should be rendered
                  const shouldRenderFooter =
                    renderPaymentButton ||
                    renderShipmentButton ||
                    renderOfferingLetterButton ||
                    renderCancelButton

                  // Conditionally render the footer
                  return shouldRenderFooter ? (
                    <CCardFooter>
                      {renderPaymentButton}
                      {renderShipmentButton}
                      {renderOfferingLetterButton}
                      {renderCancelButton}
                    </CCardFooter>
                  ) : null
                })()}
              </CCard>
            </CCol>

            {canReadTransactionSaleInventories && (
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
                            <CTableHeaderCell scope="col">Kuantitas Diproses</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas Dikirim</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionSaleInventories.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>
                                TSI{item.transactionSaleHasInventoryId}
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
                              <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                              <CTableDataCell>
                                {formatRupiah(item.pricePerUnit * item.quantity)}
                              </CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                              <CTableDataCell>
                                {parseInt(item.processedQuantity).toLocaleString()}
                              </CTableDataCell>
                              <CTableDataCell>
                                {parseInt(item.shippedQuantity).toLocaleString()}
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

            {canReadTransactionSaleShipments && (
              <CCol md={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pengiriman Barang</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Truk</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Status Pengiriman</CTableHeaderCell>
                            {canReadTransactionSaleShipment && (
                              <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                            )}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionSaleShipment.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>TSS{item.transactionSaleShipmentId}</CTableDataCell>

                              <CTableDataCell>
                                {item.truck?.truckId ? (
                                  canReadTruck ? (
                                    <NavLink to={`/trucks/${item.truck.truckId}/detail`}>
                                      {item.truck.licensePlate}
                                    </NavLink>
                                  ) : (
                                    item.truck.licensePlate
                                  )
                                ) : (
                                  '-'
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge
                                  className="me-2"
                                  color={
                                    item.shipmentStatus === 1
                                      ? 'success'
                                      : item.shipmentStatus === 0
                                        ? 'danger'
                                        : 'secondary'
                                  }
                                >
                                  {item.shipmentStatus === 1
                                    ? 'SUDAH DIKIRIM'
                                    : item.shipmentStatus === 0
                                      ? 'PROSES'
                                      : 'UNKNOWN'}
                                </CBadge>
                              </CTableDataCell>

                              {canReadTransactionSaleShipment && (
                                <CTableDataCell>
                                  <CButton
                                    color="info"
                                    size="sm"
                                    onClick={() =>
                                      handleDetail(
                                        transactionSaleId,
                                        item.transactionSaleShipmentId,
                                      )
                                    }
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
                  </CCardBody>
                </CCard>
              </CCol>
            )}

            {canReadTransactionSalePayments && (
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
                          {transactionSalePayments.map((payment, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-center">
                                TSP{payment.transactionSalePaymentId}
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
                                  transactionSalePayments.reduce(
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

            {canReadTransactionSaleLogs && (
              <CCol md={12} xs={12}>
                <TableSaleLog
                  title={'Data Log Transaksi Pembelian'}
                  error={transactionSaleLogError}
                  handleSearch={transactionSaleLogHandleSearch}
                  typeOptions={typeOptions}
                  searchTypeValue={transactionSaleLogSearchTypeValue}
                  setSearchTypeValue={setTransactionSaleLogSearchTypeValue}
                  searchStartDateValue={transactionSaleLogSearchStartDateValue}
                  setSearchStartDateValue={setTransactionSaleLogSearchStartDateValue}
                  searchEndDateValue={transactionSaleLogSearchEndDateValue}
                  setSearchEndDateValue={setTransactionSaleLogSearchEndDateValue}
                  searchLoading={transactionSaleLogSearchLoading}
                  transactionSaleLogs={transactionSaleLogs}
                  page={transactionSaleLogPage}
                  totalPages={transactionSaleLogTotalPages}
                  handlePageChange={handleTransactionSaleLogPageChange}
                  authorizePermissions={authorizePermissions}
                />
              </CCol>
            )}

            {canCreateTransactionSalePayment && (
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
                        max={transactionSale.remainingBalance}
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

export default DetailSale
