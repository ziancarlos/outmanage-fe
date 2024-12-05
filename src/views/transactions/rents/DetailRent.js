import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../../hooks/useLogout'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
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
  CFormSelect,
  CFormTextarea,
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
  faMoneyBill1,
  faPaperPlane,
  faSave,
  faShippingFast,
  faTimes,
  faTruck,
  faArrowLeft,
  faCalculator,
  faWallet,
  faMoneyBill1Wave,
  faArrowAltCircleLeft,
  faCreditCard,
  faFileInvoiceDollar,
  faCircleArrowLeft,
  faDollarSign,
  faMoneyBill,
  faDollar,
  faMoneyBillWaveAlt,
  faMoneyBillTrendUp,
  faCircleCheck,
  faExclamationCircle,
  faBug,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useAuth from '../../../hooks/useAuth'
import { formatRupiah, handlePriceInput } from '../../../utils/CurrencyUtils'
import moment from 'moment'
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
import TableRentLog from '../../../components/transactions/rent/TableRentLog'
import { formatToISODate } from '../../../utils/DateUtils'
const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const issueOptions = [
  { label: 'Pilih tipe isu', value: '' },
  { label: 'Rusak', value: 'RUSAK' },
  { label: 'Hilang', value: 'HILANG' },
]

const INTERNAL_NOTE_REGEX = /^.{3,60000}$/

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)
const matchingissueOptions = issueOptions
  .filter((option) => option.value)
  .map((option) => option.value)

function DetailRent() {
  const { authorizePermissions } = useAuth()

  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadProject = authorizePermissions.some((perm) => perm.name === 'read-project')
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadTruck = authorizePermissions.some((perm) => perm.name === 'read-truck')
  const canReadTransactionRentInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-inventories',
  )
  const canReadTransactionRentBills = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-bills',
  )
  const canReadTransactionRentBill = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-bill',
  )
  const canReadTransactionRentShipments = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-shipments',
  )
  const canReadTransactionRentShipment = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-shipment',
  )
  const canReadTransactionRentReturns = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-returns',
  )
  const canReadTransactionRentReturn = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-return',
  )
  const canReadTransactionRentIssues = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-issues',
  )
  const canReadTransactionRentPayments = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-payments',
  )
  const canReadTransactionRentLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-logs',
  )
  const canCreateTransactionRentPayment = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-rent-payment',
  )
  const canCreateTransactionRentBill = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-rent-bill',
  )
  const canCreateTransactionRentShipment = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-rent-shipment',
  )
  const canCreateTransactionRentReturn = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-rent-return',
  )
  const canCreateTransactionRentIssue = authorizePermissions.some(
    (perm) => perm.name === 'create-transaction-rent-issue',
  )

  const { transactionRentId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const searchParamsRef = useRef()
  const [loading, setLoading] = useState(true)
  const [refetch, setRefetch] = useState(false)

  const [transactionRent, setTransactionRent] = useState({})
  const [transactionRentPayments, setTransactionRentPayments] = useState([])
  const [transactionRentInventories, setTransactionRentInventories] = useState([])
  const [transactionRentBills, setTransactionRentBills] = useState([])
  const [transactionRentIsssues, setTransactionRentIsssues] = useState([])
  const [transactionRentShipments, setTransactionRentShipments] = useState([])
  const [transactionRentReturnShipments, setTransactionRentReturnShipments] = useState([])

  const [bankOptions, setBankOptions] = useState([])
  const [visibleModalPayment, setVisibleModalPayment] = useState(false)
  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')
  const [amountPaidValue, setAmountPaidValue] = useState(0)
  const [bankValue, setBankValue] = useState('')
  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')
  const [cashRecipentValue, setCashRecipentValue] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [transactionRentLogs, setTransactionRentLogs] = useState([])
  const [transactionRentLogPage, setTransactionRentLogPage] = useState(1)
  const [transactionRentLogTotalPages, setTransactionRentLogTotalPages] = useState(1)
  const [transactionRentLogError, setTransactionRentLogError] = useState('')
  const [transactionRentLogSearchTypeValue, setTransactionRentLogSearchTypeValue] = useState('')
  const [transactionRentLogSearchStartDateValue, setTransactionRentLogSearchStartDateValue] =
    useState('')
  const [transactionRentLogSearchEndDateValue, setTransactionRentLogSearchEndDateValue] =
    useState('')
  const [transactionRentLogSearchLoading, setTransactionRentLogSearchLoading] = useState(false)

  const [visibileModalIssueInventory, setVisibileModalIssueInventory] = useState(false)
  const [transactionRentHasInventoryId, setTransactionRentHasInventoryId] = useState(null)
  const [issuePurchaseInventory, setIssuePurchaseInventory] = useState(null)
  const [modalIssueInventoryLoading, setModalIssueInventoryLoading] = useState(false)
  const [issueInventoryError, setIssueInventoryError] = useState('')
  const [issuePricePerUnitValue, setIssuePricePerUnitValue] = useState('')
  const [issueInternalNoteValue, setIssueInternalNoteValue] = useState('')
  const [issueTypeValue, setIssueTypeValue] = useState('')
  const [issueQuantityValue, setIssueQuantityValue] = useState(0)

  function validateIssueInventoryForm() {
    if (issueQuantityValue < 1 || issuePricePerUnitValue < 1) {
      return 'Kuantitas dan harga isu harus lebih besar dari 0.'
    }

    if (issueInternalNoteValue && !INTERNAL_NOTE_REGEX.test(issueInternalNoteValue)) {
      return 'Catatan internal harus memiliki minimal 3 karakter dan maksimal 60.000 karakter.'
    }

    if (!matchingissueOptions.includes(issueTypeValue)) {
      return 'Tipe isu harus memiliki diantara pilihan yang diberikan.'
    }

    return null
  }

  function handleShowModalIssueInventory(item) {
    setVisibileModalIssueInventory(true)
    setTransactionRentHasInventoryId(item.transactionRentHasInventoryId)
    setIssuePurchaseInventory(item)
  }

  async function handldeIssueInventorySubmit(e) {
    e.preventDefault()
    const errorMessage = validateIssueInventoryForm()

    if (errorMessage) {
      return setIssueInventoryError(errorMessage)
    }

    try {
      setModalIssueInventoryLoading(true)

      const request = {
        quantity: issueQuantityValue,
        pricePerUnit: issuePricePerUnitValue,
        typeValue: issueTypeValue,
      }

      if (issueInternalNoteValue) {
        request.internalNote = issueInternalNoteValue
      }

      await axiosPrivate.post(
        `/api/transactions/rents/${transactionRentId}/issues/${transactionRentHasInventoryId}`,
        request,
      )

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Barang bermasalah berhasil diproses.',
        confirmButtonText: 'OK',
      })

      setVisibileModalIssueInventory(false)

      setRefetch((prev) => !prev)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        setIssueInventoryError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setModalIssueInventoryLoading(false)
    }
  }
  useEffect(() => {
    setIssueInventoryError('')
  }, [issuePricePerUnitValue, issueInternalNoteValue, issueTypeValue, issueQuantityValue])

  function handleCloseModalIssueInventory() {
    setVisibileModalIssueInventory(false)
    setTransactionRentHasInventoryId(null)
    setIssuePurchaseInventory(null)
    setIssueQuantityValue(0)
    setIssueInventoryError('')
    setIssuePricePerUnitValue('')
    setIssueInternalNoteValue('')
    setIssueTypeValue('')
  }

  useEffect(() => {
    clearPaymentMethodForm()
    setCheckedPaymentMethodOptions('transfer')
    setAmountPaidValue(0)
    setPaymentError('')
    setPaymentSuccess('')

    if (visibleModalPayment) {
      setLoading(true)
      fetchTransactionRent(transactionRentId).finally(() => setLoading(false))
    }
  }, [visibleModalPayment])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionRent(transactionRentId))

    if (canCreateTransactionRentPayment) {
      fetchPromises.push(fetchBankOptions())
    }

    if (canReadTransactionRentPayments) {
      fetchPromises.push(fetchPayments(transactionRentId))
    }

    if (canReadTransactionRentInventories) {
      fetchPromises.push(fetchInventories(transactionRentId))
    }

    if (canReadTransactionRentReturns) {
      fetchPromises.push(fetchReturns(transactionRentId))
    }

    if (canReadTransactionRentShipments) {
      fetchPromises.push(fetchShipments(transactionRentId))
    }

    if (canReadTransactionRentBills) {
      fetchPromises.push(fetchBills(transactionRentId))
    }

    if (canReadTransactionRentIssues) {
      fetchPromises.push(fetchIssues(transactionRentId))
    }

    if (canReadTransactionRentLogs) {
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
        fetchTransactionRentLogs(
          transactionRentId,
          transactionRentLogPage,
          searchParamsRef.current,
        ),
      )
    }
    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  function handleShipment(transactionRentId) {
    navigate(`/transactions/rents/${transactionRentId}/shipment`)
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
    setVisibleModalPayment(false)
  }

  async function fetchTransactionRentLogs(transactionRentId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/rents/${transactionRentId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setTransactionRentLogs(response.data.data)
      setTransactionRentLogTotalPages(response.data.paging.totalPage)
      setTransactionRentLogPage(response.data.paging.page)

      setTransactionRentLogSearchTypeValue('')
      setTransactionRentLogSearchStartDateValue('')
      setTransactionRentLogSearchEndDateValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setTransactionRentLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function transactionRentLogHandleSearch(e) {
    e.preventDefault()
    setTransactionRentLogSearchLoading(true)
    setTransactionRentLogPage(1)

    const searchParams = {}

    if (matchingTypes.includes(transactionRentLogSearchTypeValue)) {
      searchParams.type = transactionRentLogSearchTypeValue
    }

    if (transactionRentLogSearchStartDateValue) {
      searchParams.startDate = formatToISODate(transactionRentLogSearchStartDateValue)
    }

    if (transactionRentLogSearchEndDateValue) {
      searchParams.endDate = formatToISODate(transactionRentLogSearchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/transactions/rents/${transactionRentId}/detail`)
    }

    fetchTransactionRentLogs(transactionRentId, 1, searchParams).finally(() =>
      setTransactionRentLogSearchLoading(false),
    )
  }

  useEffect(() => {
    setTransactionRentLogError('')
  }, [
    transactionRentLogSearchTypeValue,
    transactionRentLogSearchStartDateValue,
    transactionRentLogSearchEndDateValue,
  ])

  const handleTransactionRentLogPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= transactionRentLogTotalPages &&
      newPage !== transactionRentLogPage
    ) {
      setTransactionRentLogPage(newPage)

      setTransactionRentLogSearchLoading(true)

      fetchTransactionRentLogs(transactionRentId, newPage, searchParamsRef).finally(() =>
        setTransactionRentLogSearchLoading(false),
      )
    }
  }

  async function fetchPayments(transactionRentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/payments`,
      )

      setTransactionRentPayments(response.data.data)
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

  function handlePaymentAmount(value) {
    setAmountPaidValue(
      Math.max(
        0,
        Math.min(Number(value.replace(/[^0-9]/g, '')), parseInt(transactionRent.remainingBalance)),
      ),
    )
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

      await axiosPrivate.post(`/api/transactions/rents/${transactionRentId}/payments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran transaksi penyewaan berhasil diproses.',
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

  async function fetchTransactionRent(transactionRentId) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/rents/${transactionRentId}`)

      setTransactionRent(response.data.data)
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

  async function fetchInventories(transactionRentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/inventories`,
      )

      setTransactionRentInventories(response.data.data)
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

  async function fetchBills(transactionRentId) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/rents/${transactionRentId}/bills`)

      setTransactionRentBills(response.data.data)
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

  async function fetchIssues(transactionRentId) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/rents/${transactionRentId}/issues`)

      setTransactionRentIsssues(response.data.data)
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

  async function fetchShipments(transactionRentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/shipments`,
      )

      setTransactionRentShipments(response.data.data)
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

  async function fetchReturns(transactionRentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/returns`,
      )

      setTransactionRentReturnShipments(response.data.data)
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
                color="primary"
                icon={<FontAwesomeIcon icon={faTruck} size="lg" />}
                padding={false}
                title="Ongkos Pengiriman"
                value={formatRupiah(transactionRent.deliveryShipmentFee || 0)}
              />
            </CCol>
            <CCol xs={6}>
              <CWidgetStatsF
                className="mb-3"
                color="warning"
                icon={<FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" />}
                padding={false}
                title="Ongkos Penjemputan"
                value={formatRupiah(transactionRent.deliveryReturnFee || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faBug} size="lg" />}
                padding={false}
                title="Biaya Bermasalah"
                value={formatRupiah(transactionRent.issuesTotal || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="info"
                icon={<FontAwesomeIcon icon={faMoneyBill1Wave} size="lg" />}
                padding={false}
                title="Estimasi Biaya Sewa"
                value={formatRupiah(transactionRent.rentFee || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="success"
                icon={<FontAwesomeIcon icon={faWallet} size="lg" />}
                padding={false}
                title="Total Keseluruhan"
                value={formatRupiah(transactionRent.grandTotal || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="secondary"
                icon={<FontAwesomeIcon icon={faMoneyBillTrendUp} size="lg" />}
                padding={false}
                title="Jumlah Dibayar"
                value={formatRupiah(transactionRent.totalPaid || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faMoneyBill} size="lg" />}
                padding={false}
                title="Sisa Pembayaran"
                value={formatRupiah(transactionRent.remainingBalance || 0)}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>
                    {'TR' + transactionRent.transactionRentId}

                    <CBadge
                      className="ms-2 me-2"
                      color={
                        transactionRent.paymentStatus === 2
                          ? 'success'
                          : transactionRent.paymentStatus === 1
                            ? 'warning'
                            : transactionRent.paymentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {transactionRent.paymentStatus === 2
                        ? 'LUNAS'
                        : transactionRent.paymentStatus === 1
                          ? 'SEBAGIAN'
                          : transactionRent.paymentStatus === 0
                            ? 'BELUM LUNAS'
                            : transactionRent.paymentStatus}
                    </CBadge>
                    <CBadge
                      className="me-2"
                      color={
                        transactionRent.shipmentStatus === 2
                          ? 'success'
                          : transactionRent.shipmentStatus === 1
                            ? 'warning'
                            : transactionRent.shipmentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {transactionRent.shipmentStatus === 2
                        ? 'SELESAI'
                        : transactionRent.shipmentStatus === 1
                          ? 'PROSES'
                          : transactionRent.shipmentStatus === 0
                            ? 'BELUM DIKIRIM'
                            : transactionRent.shipmentStatus}
                    </CBadge>
                    <CBadge
                      color={
                        transactionRent.returnStatus === 2
                          ? 'success'
                          : transactionRent.returnStatus === 1
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {transactionRent.returnStatus === 2
                        ? 'DIKEMBALIKAN'
                        : transactionRent.returnStatus === 1
                          ? 'PROSES'
                          : 'BELUM DIKEMBALIKAN'}
                    </CBadge>
                  </CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Tanggal Transaksi:{' '}
                    {moment(transactionRent.transactionDate).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                  <CListGroupItem>
                    {transactionRent.client?.clientId ? (
                      <>
                        Klien:{' '}
                        {canReadClient ? (
                          <NavLink to={`/clients/${transactionRent.client.clientId}/detail`}>
                            {transactionRent.client.name}
                          </NavLink>
                        ) : (
                          transactionRent.client.name
                        )}
                      </>
                    ) : transactionRent.project?.projectId ? (
                      <>
                        Proyek:{' '}
                        {canReadProject ? (
                          <NavLink to={`/projects/${transactionRent.project.projectId}/detail`}>
                            {transactionRent.project.name}
                          </NavLink>
                        ) : (
                          transactionRent.project.name
                        )}
                      </>
                    ) : (
                      transactionRent.project?.projectId || 'No details available'
                    )}
                  </CListGroupItem>
                  {transactionRent?.deposit?.transactionRentSecurityDepositId && (
                    <CListGroupItem>
                      Deposit:{' '}
                      <NavLink
                        to={`/deposits/${transactionRent?.deposit?.transactionRentSecurityDepositId}/detail`}
                      >
                        {' '}
                        D{`${transactionRent?.deposit?.transactionRentSecurityDepositId}`}
                      </NavLink>
                    </CListGroupItem>
                  )}
                  <CListGroupItem>
                    Catatan Internal: {transactionRent.internalNote || '-'}
                  </CListGroupItem>
                </CListGroup>

                {(() => {
                  // Permission and status checks
                  const needsPayment =
                    transactionRent.paymentStatus !== 2 && canCreateTransactionRentPayment

                  const canCreateBill =
                    canCreateTransactionRentBill &&
                    canReadTransactionRentInventories &&
                    transactionRentInventories.some(
                      (inventory) => inventory.availableRentQuantity > 0,
                    )

                  const canCreateShipment =
                    canCreateTransactionRentShipment &&
                    canReadTransactionRentInventories &&
                    transactionRentInventories.some(
                      (inventory) => inventory.unprocessedQuantity > 0,
                    )

                  const canCreateReturn =
                    canCreateTransactionRentReturn &&
                    canReadTransactionRentInventories &&
                    transactionRentInventories.some(
                      (inventory) => inventory.availableRentQuantity > 0,
                    )

                  // Render Button Components
                  const renderPaymentButton = needsPayment && (
                    <CButton
                      color="success"
                      variant="outline"
                      onClick={() => setVisibleModalPayment(!visibleModalPayment)}
                      className="me-1"
                    >
                      <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                      Pembayaran
                    </CButton>
                  )

                  const renderBillButton = canCreateBill && (
                    <CButton
                      color="warning"
                      variant="outline"
                      className="me-1"
                      onClick={() => navigate(`/transactions/rents/${transactionRentId}/bill`)}
                    >
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                      Tagihan Baru
                    </CButton>
                  )

                  const renderShipmentButton = canCreateShipment && (
                    <CButton
                      color="info"
                      variant="outline"
                      className="me-1"
                      onClick={() => handleShipment(transactionRent.transactionRentId)}
                    >
                      <FontAwesomeIcon icon={faShippingFast} className="me-2" />
                      Pengiriman
                    </CButton>
                  )

                  const renderReturnButton = canCreateReturn && (
                    <CButton
                      color="danger"
                      variant="outline"
                      className="me-1"
                      onClick={() => navigate(`/transactions/rents/${transactionRentId}/return`)}
                    >
                      <FontAwesomeIcon icon={faCircleArrowLeft} className="me-2" />
                      Pengembalian
                    </CButton>
                  )

                  // Check if any button should be displayed
                  const shouldRenderFooter =
                    renderPaymentButton ||
                    renderBillButton ||
                    renderShipmentButton ||
                    renderReturnButton

                  // Conditionally render footer
                  return shouldRenderFooter ? (
                    <CCardFooter>
                      {renderPaymentButton}
                      {renderBillButton}
                      {renderShipmentButton}
                      {renderReturnButton}
                    </CCardFooter>
                  ) : null
                })()}
              </CCard>
            </CCol>

            {canReadTransactionRentInventories && (
              <>
                <CCol md={12} className="mb-4">
                  <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                      <strong>Rincian Penyewaan Barang</strong>
                    </CCardHeader>
                    <CCardBody>
                      <div className="table-responsive">
                        <CTable striped bordered responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                              <CTableHeaderCell scope="col">
                                Harga Satuan per Bulan
                              </CTableHeaderCell>
                              <CTableHeaderCell scope="col">Kuantitas Disewa</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Kuantitas Tersedia</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Kuantitas Bermasalah</CTableHeaderCell>
                              {canCreateTransactionRentIssue && (
                                <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                              )}
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {transactionRentInventories.map((item, idx) => (
                              <CTableRow key={idx}>
                                <CTableDataCell>
                                  TRI{item.transactionRentHasInventoryId}
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
                                <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                                <CTableDataCell>
                                  {item.rentedQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.availableRentQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.issueQuantity.toLocaleString()}
                                </CTableDataCell>
                                {canCreateTransactionRentIssue && (
                                  <CTableDataCell>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => {
                                        handleShowModalIssueInventory(item)
                                      }}
                                    >
                                      <FontAwesomeIcon color="white" icon={faExclamationCircle} />
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

                <CCol md={6} className="mb-4">
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
                              <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Qty Keluar</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Qty Diproses</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Qty Belum Diproses</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {transactionRentInventories.map((item, idx) => (
                              <CTableRow key={idx}>
                                <CTableDataCell>
                                  TRI{item.transactionRentHasInventoryId}
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
                                  {item.shippedQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.processedQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.unprocessedQuantity.toLocaleString()}
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={6} className="mb-4">
                  <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                      <strong>Rincian Pengembalian Barang</strong>
                    </CCardHeader>
                    <CCardBody>
                      <div className="table-responsive">
                        <CTable striped bordered responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Qty Kembali</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Qty Diproses</CTableHeaderCell>
                              <CTableHeaderCell scope="col">
                                Qty Belum Dikembalikan
                              </CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {transactionRentInventories.map((item, idx) => (
                              <CTableRow key={idx}>
                                <CTableDataCell>
                                  TRI{item.transactionRentHasInventoryId}
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
                                  {item.returnedQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.processReturnQuantity.toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.unprocessedReturn.toLocaleString()}
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </>
            )}

            {canReadTransactionRentBills && (
              <CCol md={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Tagihan Penyewaan</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Tanggal Mulai</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Tanggal Selesai</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Total Keseluruhan</CTableHeaderCell>
                            {canReadTransactionRentBill && (
                              <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                            )}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionRentBills.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>TRB{item.transactionRentBillId}</CTableDataCell>
                              <CTableDataCell>
                                {moment(item.startDate).format('MMMM D, YYYY h:mm A')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {item.endDate
                                  ? moment(item.endDate).format('MMMM D, YYYY h:mm A')
                                  : '-'}
                              </CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.grandTotal || 0)}</CTableDataCell>
                              {canReadTransactionRentBill && (
                                <CTableDataCell>
                                  <CButton
                                    color="info"
                                    size="sm"
                                    onClick={() => {
                                      navigate(
                                        `/transactions/rents/${transactionRentId}/bill/${item.transactionRentBillId}/detail`,
                                      )
                                    }}
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

            {canReadTransactionRentShipments && (
              <CCol md={6} xs={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pengiriman</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Truk</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Status Pengiriman</CTableHeaderCell>
                            {canReadTransactionRentShipment && (
                              <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                            )}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionRentShipments.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>TRS{item.transactionRentShipmentId}</CTableDataCell>
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
                                      ? 'BELUM DIKIRIM'
                                      : 'UNKNOWN'}
                                </CBadge>
                              </CTableDataCell>

                              {canReadTransactionRentShipment && (
                                <CTableDataCell>
                                  <CButton
                                    color="info"
                                    size="sm"
                                    onClick={() => {
                                      navigate(
                                        `/transactions/rents/${transactionRentId}/shipment/${item.transactionRentShipmentId}/detail`,
                                      )
                                    }}
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

            {canReadTransactionRentReturns && (
              <CCol md={6} xs={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pengembalian</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Truk</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Status Pengiriman</CTableHeaderCell>
                            {canReadTransactionRentReturn && (
                              <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                            )}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionRentReturnShipments.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>TRR{item.transactionRentReturnId}</CTableDataCell>
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
                                    ? 'SUDAH KEMBALI'
                                    : item.shipmentStatus === 0
                                      ? 'DIPROSES'
                                      : 'UNKNOWN'}
                                </CBadge>
                              </CTableDataCell>
                              {canReadTransactionRentReturn && (
                                <CTableDataCell>
                                  <CButton
                                    color="info"
                                    size="sm"
                                    onClick={() => {
                                      navigate(
                                        `/transactions/rents/${transactionRentId}/return/${item.transactionRentReturnId}/detail`,
                                      )
                                    }}
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

            {canReadTransactionRentIssues && (
              <CCol md={12} className="mb-4">
                <CCard>
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Isu Penyewaan</strong>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Tipe Isu</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Catatan Internal</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Harga Per Unit</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Total Keseluruhan</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {transactionRentIsssues.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>TRIU{item.transactionRentIssueId}</CTableDataCell>
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
                                {item.issueType == 0 ? 'RUSAK' : 'HILANG'}
                              </CTableDataCell>
                              <CTableDataCell>{item.internalNote || '-'}</CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.grandTotal)}</CTableDataCell>
                            </CTableRow>
                          ))}

                          <CTableRow>
                            <CTableHeaderCell className="text-center align-middle" colSpan={6}>
                              <strong>Total</strong>
                            </CTableHeaderCell>
                            <CTableDataCell>
                              <strong>
                                {formatRupiah(
                                  transactionRentIsssues.reduce(
                                    (total, issue) => total + Number(issue.grandTotal),
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

            {canReadTransactionRentPayments && (
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
                          {transactionRentPayments.map((payment, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-center">
                                TRP{payment.transactionRentPaymentId}
                              </CTableDataCell>
                              <CTableDataCell>
                                {moment(payment.paymentDate).format('MMMM D, YYYY h:mm A')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {payment.cashRecipient ? payment.cashRecipient : '-'}
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
                                  transactionRentPayments.reduce(
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

            {canReadTransactionRentLogs && (
              <CCol md={12}>
                <TableRentLog
                  title={'Data Log Transaksi Penyewaan'}
                  error={transactionRentLogError}
                  handleSearch={transactionRentLogHandleSearch}
                  typeOptions={typeOptions}
                  searchTypeValue={transactionRentLogSearchTypeValue}
                  setSearchTypeValue={setTransactionRentLogSearchTypeValue}
                  searchStartDateValue={transactionRentLogSearchStartDateValue}
                  setSearchStartDateValue={setTransactionRentLogSearchStartDateValue}
                  searchEndDateValue={transactionRentLogSearchEndDateValue}
                  setSearchEndDateValue={setTransactionRentLogSearchEndDateValue}
                  searchLoading={transactionRentLogSearchLoading}
                  transactionRentLogs={transactionRentLogs}
                  page={transactionRentLogPage}
                  totalPages={transactionRentLogTotalPages}
                  handlePageChange={handleTransactionRentLogPageChange}
                  authorizePermissions={authorizePermissions}
                />
              </CCol>
            )}
          </CRow>

          {canCreateTransactionRentPayment && (
            <CModal
              visible={visibleModalPayment}
              onClose={() => setVisibleModalPayment(false)}
              aria-labelledby="LiveDemoExampleLabel"
            >
              <CForm onSubmit={handlePaymentSubmit} noValidate>
                <CModalHeader>
                  <CModalTitle id="LiveDemoExampleLabel">Pembayaran Deposit</CModalTitle>
                </CModalHeader>
                <CModalBody>
                  {paymentError && <CAlert color="danger">{paymentError}</CAlert>}
                  {paymentSuccess && <CAlert color="success">{paymentSuccess}</CAlert>}

                  <div className="mt-3 mb-3">
                    <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>

                    <CFormRange
                      id="customRange1"
                      min={0}
                      max={parseInt(transactionRent.remainingBalance)}
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

                  <CButton color="secondary" onClick={() => setVisibleModalPayment(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>
          )}

          {canCreateTransactionRentIssue && (
            <CModal
              visible={visibileModalIssueInventory}
              onClose={handleCloseModalIssueInventory}
              aria-labelledby="LiveDemoExampleLabel"
            >
              <CModalHeader>
                <CModalTitle id="LiveDemoExampleLabel">Konfirmasi Isu Penyewaan Barang</CModalTitle>
              </CModalHeader>
              <CForm noValidate onSubmit={handldeIssueInventorySubmit}>
                <CModalBody>
                  {modalIssueInventoryLoading || issuePurchaseInventory === null ? (
                    <div className="pt-3 text-center">
                      <CSpinner color="primary" variant="grow" />
                    </div>
                  ) : (
                    <>
                      {issueInventoryError && <CAlert color="danger">{issueInventoryError}</CAlert>}

                      <div className="mb-3">
                        <CFormInput
                          value={`${issuePurchaseInventory?.inventory.name} | ${issuePurchaseInventory?.inventory.condition === 0 ? 'BARU' : 'BEKAS'}`}
                          label="Barang"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <CFormInput
                          value={`${issuePurchaseInventory?.returnedQuantity.toLocaleString()}`}
                          label="Kuantitas Dikembalikan"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <CFormInput
                          value={`${issuePurchaseInventory?.issueQuantity.toLocaleString()}`}
                          label="Kuantitas Bermasalah"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <CFormInput
                          label="Kuantitas Bermasalah"
                          value={issueQuantityValue.toLocaleString()} // Display formatted number
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.-]+/g, '') // Clean the input
                            const numberValue = Number(value) // Convert to number

                            if (!isNaN(numberValue)) {
                              setIssueQuantityValue(numberValue) // Update the state with the number
                            }
                          }}
                          disabled={modalIssueInventoryLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <CFormInput
                          type="text"
                          placeholder="Harga Satuan"
                          label="Harga Satuan"
                          value={issuePricePerUnitValue ? formatRupiah(issuePricePerUnitValue) : ''}
                          onChange={(e) => {
                            const value = handlePriceInput(e.target.value)
                            if (!isNaN(value) && Number(value) >= 0) {
                              setIssuePricePerUnitValue(value)
                            }
                          }}
                          disabled={modalIssueInventoryLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <CFormSelect
                          id="role"
                          label="Pilih tipe isu"
                          value={issueTypeValue}
                          onChange={(e) => setIssueTypeValue(e.target.value)}
                          options={issueOptions}
                          disabled={modalIssueInventoryLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <CFormLabel className="fw-bold">
                          Catatan Internal <CBadge color="info">Optional</CBadge>
                        </CFormLabel>
                        <CFormTextarea
                          rows={3}
                          placeholder="Masukkan Catatan Internal"
                          value={issueInternalNoteValue}
                          onChange={(e) => setIssueInternalNoteValue(e.target.value)}
                          disabled={modalIssueInventoryLoading}
                        />
                      </div>
                    </>
                  )}
                </CModalBody>

                <CModalFooter>
                  <CLoadingButton
                    color="primary"
                    type="submit"
                    disabled={modalIssueInventoryLoading || validateIssueInventoryForm() !== null}
                    loading={modalIssueInventoryLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>

                  <CButton color="secondary" onClick={() => handleCloseModalIssueInventory()}>
                    <FontAwesomeIcon icon={faTimes} />
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>
          )}
        </>
      )}
    </>
  )
}

export default DetailRent
