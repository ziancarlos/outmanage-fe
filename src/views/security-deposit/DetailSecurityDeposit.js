import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
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
  faCreditCard,
  faEye,
  faFileAlt,
  faL,
  faMoneyBill,
  faMoneyBill1,
  faMoneyBillWave,
  faPaperPlane,
  faSave,
  faShippingFast,
  faTimes,
  faUndo,
} from '@fortawesome/free-solid-svg-icons'
import useAuth from '../../hooks/useAuth'
import { formatRupiah } from '../../utils/CurrencyUtils'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Swal from 'sweetalert2'
import TableSecurityDeposit from '../../components/security-deposit/TableSecurityDeposit'
import TableSecurityDepositLog from '../../components/security-deposit/TableSecurityDepositLog'
const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

function DetailSecurityDeposit() {
  const { authorizePermissions } = useAuth()

  const canReadDepositPayments = authorizePermissions.some(
    (perm) => perm.name === 'read-deposit-payments',
  )
  const canReadReturnPayments = authorizePermissions.some(
    (perm) => perm.name === 'read-deposit-return-payments',
  )
  const canCreateDepositPayment = authorizePermissions.some(
    (perm) => perm.name === 'create-deposit-payment',
  )
  const canCreateDepositReturnPayment = authorizePermissions.some(
    (perm) => perm.name === 'create-deposit-return-payment',
  )
  const canReadDepositLogs = authorizePermissions.some((perm) => perm.name === 'read-deposit-logs')

  const { depositId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const searchParamsRef = useRef()
  const [loading, setLoading] = useState(true)
  const [refetch, setRefetch] = useState(false)

  const [securityDeposit, setSecurityDeposit] = useState({})
  const [depositPayments, setDepositPayments] = useState([])
  const [depositReturnPayments, setDepositReturnPayments] = useState([])

  const [bankOptions, setBankOptions] = useState([])

  // Payment-related state variables
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

  // Return payment-related state variables
  const [visibleModalReturnPayment, setVisibleModalReturnPayment] = useState(false)
  const [checkedReturnPaymentMethodOptions, setCheckedReturnPaymentMethodOptions] =
    useState('transfer')
  const [amountReturnedValue, setAmountReturnedValue] = useState(0)
  const [returnBankValue, setReturnBankValue] = useState('')
  const [returnAccountNumberValue, setReturnAccountNumberValue] = useState('')
  const [returnAccountNameValue, setReturnAccountNameValue] = useState('')
  const [returnCashRecipentValue, setReturnCashRecipentValue] = useState('')
  const [returnPaymentError, setReturnPaymentError] = useState('')
  const [returnPaymentSuccess, setReturnPaymentSuccess] = useState('')
  const [returnPaymentLoading, setReturnPaymentLoading] = useState(false)

  const [securityDepositLogs, setSecurityDepositLogs] = useState([])
  const [securityDepositLogPage, setSecurityDepositLogPage] = useState(1)
  const [securityDepositLogTotalPages, setSecurityDepositLogTotalPages] = useState(1)
  const [securityDepositLogError, setSecurityDepositLogError] = useState('')
  const [securityDepositLogSearchTypeValue, setSecurityDepositLogSearchTypeValue] = useState('')
  const [securityDepositLogSearchStartDateValue, setSecurityDepositLogSearchStartDateValue] =
    useState('')
  const [securityDepositLogSearchEndDateValue, setSecurityDepositLogSearchEndDateValue] =
    useState('')
  const [securityDepositLogSearchLoading, setSecurityDepositLogSearchLoading] = useState(false)

  function securityDepositLogHandleSearch(e) {
    e.preventDefault()
    setSecurityDepositLogSearchLoading(true)
    setSecurityDepositLogPage(1)

    const searchParams = {}

    if (matchingTypes.includes(securityDepositLogSearchTypeValue)) {
      searchParams.type = securityDepositLogSearchTypeValue
    }

    if (securityDepositLogSearchStartDateValue) {
      searchParams.startDate = formatToISODate(securityDepositLogSearchStartDateValue)
    }

    if (securityDepositLogSearchEndDateValue) {
      searchParams.endDate = formatToISODate(securityDepositLogSearchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/deposits/${depositId}/detail`)
    }

    fetchSecurityDepositLogs(depositId, 1, searchParams).finally(() =>
      setSecurityDepositLogSearchLoading(false),
    )
  }

  const handleSecurityDepositLogPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= securityDepositLogTotalPages &&
      newPage !== securityDepositLogPage
    ) {
      setSecurityDepositLogPage(newPage)

      setSecurityDepositLogSearchLoading(true)

      fetchSecurityDepositLogs(depositId, newPage, searchParamsRef).finally(() =>
        setSecurityDepositLogSearchLoading(false),
      )
    }
  }

  async function fetchSecurityDepositLogs(depositId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/deposits/${depositId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setSecurityDepositLogs(response.data.data)
      setSecurityDepositLogTotalPages(response.data.paging.totalPage)
      setSecurityDepositLogPage(response.data.paging.page)

      setSecurityDepositLogSearchTypeValue('')
      setSecurityDepositLogSearchStartDateValue('')
      setSecurityDepositLogSearchEndDateValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setSecurityDepositLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
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
    setVisibleModalPayment(false)
  }

  useEffect(() => {
    clearPaymentMethodForm()
    setCheckedPaymentMethodOptions('transfer')
    setAmountPaidValue(0)
    setPaymentError('')
    setPaymentSuccess('')

    if (visibleModalPayment) {
      setLoading(true)
      fetchSecurityDeposit(depositId).finally(() => setLoading(false))
    }
  }, [visibleModalPayment])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  function clearReturnPaymentMethodForm() {
    setReturnBankValue('')
    setReturnAccountNameValue('')
    setReturnAccountNumberValue('')
    setReturnCashRecipentValue('')
  }

  function clearReturnPaymentForm() {
    clearReturnPaymentMethodForm()
    setAmountReturnedValue(0)
    setVisibleModalReturnPayment(false)
  }

  useEffect(() => {
    clearReturnPaymentMethodForm()
    setAmountReturnedValue(0)
    setCheckedReturnPaymentMethodOptions('transfer')
    setReturnPaymentError('')
    setReturnPaymentSuccess('')

    if (visibleModalReturnPayment) {
      setLoading(true)
      fetchSecurityDeposit(depositId).finally(() => setLoading(false))
    }
  }, [visibleModalReturnPayment])

  useEffect(() => {
    setReturnPaymentError('')
    setReturnPaymentSuccess('')
  }, [checkedReturnPaymentMethodOptions, returnBankValue, returnAccountNumberValue])

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchSecurityDeposit(depositId))

    if (canReadDepositPayments) {
      fetchPromises.push(fetchDepositPayment(depositId))
    }
    if (canReadReturnPayments) {
      fetchPromises.push(fetchDepositReturnPayment(depositId))
    }

    if (canCreateDepositReturnPayment || canCreateDepositPayment) {
      fetchPromises.push(fetchBankOptions())
    }

    if (canReadDepositLogs) {
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
        fetchSecurityDepositLogs(depositId, securityDepositLogPage, searchParamsRef.current),
      )
    }
    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

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

  async function fetchDepositPayment(depositId) {
    try {
      const response = await axiosPrivate.get(`/api/deposits/${depositId}/payments`)

      setDepositPayments(response.data.data)
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

  async function fetchDepositReturnPayment(depositId) {
    try {
      const response = await axiosPrivate.get(`/api/deposits/${depositId}/returns`)

      setDepositReturnPayments(response.data.data)
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

  async function fetchSecurityDeposit(depositId) {
    try {
      const response = await axiosPrivate.get(`/api/deposits/${depositId}`)

      setSecurityDeposit(response.data.data)
      console.log(response.data.data)
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

  function handlePaymentAmount(value) {
    setAmountPaidValue(
      Math.max(
        0,
        Math.min(
          Number(value.replace(/[^0-9]/g, '')),
          parseInt(securityDeposit.amount) - parseInt(securityDeposit.totalPaid),
        ),
      ),
    )
  }

  function handleReturnAmount(value) {
    setAmountReturnedValue(
      Math.max(
        0,
        Math.min(
          Number(value.replace(/[^0-9]/g, '')),
          parseInt(securityDeposit.amount) - parseInt(securityDeposit.totalReturn),
        ),
      ),
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

  async function handleCheckAccountNumberReturnPayment() {
    setReturnAccountNameValue('')
    setReturnPaymentError('')
    setReturnPaymentSuccess('')

    try {
      setLoading(true)

      const response = await axiosPrivate.post('/api/bank', {
        bankCode: returnBankValue.value,
        accountNumber: returnAccountNumberValue,
      })

      setReturnPaymentSuccess('Bank dan nomor rekening ditemukkan')
      setReturnAccountNameValue(response.data.data.accountName)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setReturnPaymentError(e.response?.data.error)
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

      await axiosPrivate.post(`/api/deposits/${depositId}/payments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran deposit berhasil diproses.',
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

  function validateReturnPaymentForm() {
    if (
      checkedReturnPaymentMethodOptions === 'transfer' &&
      (!returnBankValue || !returnAccountNumberValue || !returnAccountNameValue)
    ) {
      return 'Harap berikan rincian bank dan rekening yang valid untuk transfer.'
    }

    if (checkedReturnPaymentMethodOptions === 'cash' && !returnCashRecipentValue) {
      return 'Harap berikan nama penerima uang tunai untuk pembayaran tunai.'
    }

    if (amountReturnedValue < 1) {
      return 'Harap jumlah yang dibayarkan lebih besar dari 0.'
    }

    return null
  }

  async function handleReturnPaymentSubmit(e) {
    e.preventDefault()

    try {
      setReturnPaymentLoading(true)

      const errorMessage = validateReturnPaymentForm()
      if (errorMessage) {
        setReturnPaymentError(errorMessage)
        return
      }

      let request = {}

      if (checkedReturnPaymentMethodOptions === 'transfer') {
        request = {
          paymentDetails: {
            bankCode: returnBankValue.value,
            accountNumber: returnAccountNumberValue,
            amountPaid: amountReturnedValue,
          },
        }
      }

      if (checkedReturnPaymentMethodOptions === 'cash') {
        request = {
          paymentDetails: {
            cashRecipent: returnCashRecipentValue,
            amountPaid: amountReturnedValue,
          },
        }
      }

      await axiosPrivate.post(`/api/deposits/${depositId}/returns`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengembalian deposit berhasil diproses.',
        confirmButtonText: 'OK',
      })

      clearReturnPaymentForm()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setReturnPaymentError(e.response.data.error)
        setReturnPaymentSuccess('')
      } else {
        navigate('/500')
      }
    } finally {
      setReturnPaymentLoading(false)

      setRefetch((prev) => !prev)
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
                color="success"
                icon={<FontAwesomeIcon icon={faMoneyBillWave} size="lg" />}
                padding={false}
                title="Deposit yang Dibayar"
                value={formatRupiah(securityDeposit.totalPaid || 0)}
              />
            </CCol>

            <CCol xs={6}>
              <CWidgetStatsF
                className="mb-3"
                color="warning"
                icon={<FontAwesomeIcon icon={faUndo} size="lg" />}
                padding={false}
                title="Deposit yang Dikembalikan"
                value={formatRupiah(securityDeposit.totalReturn || 0)}
              />
            </CCol>

            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faMoneyBill} size="lg" />}
                padding={false}
                title="Jumlah Deposit"
                value={formatRupiah(securityDeposit.amount || 0)}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>
                    {'D' + securityDeposit.transactionRentSecurityDepositId}

                    <CBadge
                      className="ms-2 me-2"
                      color={
                        securityDeposit.paymentStatus === 2
                          ? 'success'
                          : securityDeposit.paymentStatus === 1
                            ? 'warning'
                            : securityDeposit.paymentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {securityDeposit.paymentStatus === 2
                        ? 'LUNAS'
                        : securityDeposit.paymentStatus === 1
                          ? 'SEBAGIAN'
                          : securityDeposit.paymentStatus === 0
                            ? 'BELUM LUNAS'
                            : securityDeposit.paymentStatus}
                    </CBadge>

                    <CBadge
                      className="me-2"
                      color={
                        securityDeposit.returnPaymentStatus === 2
                          ? 'success'
                          : securityDeposit.returnPaymentStatus === 1
                            ? 'warning'
                            : securityDeposit.returnPaymentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {securityDeposit.returnPaymentStatus === 2
                        ? 'DIKEMBALIKAN'
                        : securityDeposit.returnPaymentStatus === 1
                          ? 'SEBAGIAN'
                          : securityDeposit.returnPaymentStatus === 0
                            ? 'BELUM DIKEMBALIKAN'
                            : securityDeposit.returnPaymentStatus}
                    </CBadge>
                  </CCardTitle>
                </CCardBody>

                <CListGroup flush>
                  <CListGroupItem>
                    Transaksi Penyewaan:{' '}
                    <NavLink to={`/transactions/rents/${securityDeposit.transactionRentId}/detail`}>
                      TR{securityDeposit.transactionRentId}
                    </NavLink>
                  </CListGroupItem>
                </CListGroup>

                {(canCreateDepositPayment && securityDeposit.paymentStatus !== 2) ||
                (canCreateDepositReturnPayment &&
                  securityDeposit.paymentStatus === 2 &&
                  securityDeposit.returnPaymentStatus !== 2) ? (
                  <CCardFooter>
                    {/* Show Pembayaran Deposit only if not fully paid (paymentStatus !== 2) and the user has permission */}
                    {canCreateDepositPayment && securityDeposit.paymentStatus !== 2 ? (
                      <CButton
                        color="primary"
                        variant="outline"
                        className="me-1"
                        onClick={() => setVisibleModalPayment(!visibleModalPayment)}
                      >
                        <FontAwesomeIcon icon={faCreditCard} className="me-2" /> Pembayaran Deposit
                      </CButton>
                    ) : null}

                    {/* Show Pengembalian Deposit only if fully paid and not fully returned (paymentStatus === 2 && returnPaymentStatus !== 2) and the user has permission */}
                    {canCreateDepositReturnPayment &&
                    securityDeposit.paymentStatus === 2 &&
                    securityDeposit.returnPaymentStatus !== 2 ? (
                      <CButton
                        color="success"
                        variant="outline"
                        onClick={() => setVisibleModalReturnPayment(!visibleModalReturnPayment)}
                      >
                        <FontAwesomeIcon icon={faUndo} className="me-2" /> Pengembalian Deposit
                      </CButton>
                    ) : null}
                  </CCardFooter>
                ) : null}
              </CCard>
            </CCol>

            {canReadDepositPayments && (
              <CCol md={12}>
                <CCard className="mb-4">
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pembayaran Deposit</strong>
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
                          {depositPayments.map((payment, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-center">
                                DP{payment.transactionRentSecurityDepositPaymentId}
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
                                  depositPayments.reduce(
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

            {canReadReturnPayments && (
              <CCol md={12}>
                <CCard className="mb-4">
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Rincian Pengembalian Deposit</strong>
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
                          {depositReturnPayments.map((payment, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-center">
                                DRP{payment.transactionRentSecurityDepositReturnPaymentId}
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
                                  depositReturnPayments.reduce(
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

            {canReadDepositLogs && (
              <CCol md={12}>
                <TableSecurityDepositLog
                  title={'Data Log Deposit Keamanan'}
                  error={securityDepositLogError}
                  handleSearch={securityDepositLogHandleSearch}
                  typeOptions={typeOptions}
                  searchTypeValue={securityDepositLogSearchTypeValue}
                  setSearchTypeValue={setSecurityDepositLogSearchTypeValue}
                  searchStartDateValue={securityDepositLogSearchStartDateValue}
                  setSearchStartDateValue={setSecurityDepositLogSearchStartDateValue}
                  searchEndDateValue={securityDepositLogSearchEndDateValue}
                  setSearchEndDateValue={setSecurityDepositLogSearchEndDateValue}
                  searchLoading={securityDepositLogSearchLoading}
                  securityDepositLogs={securityDepositLogs}
                  page={securityDepositLogPage}
                  totalPages={securityDepositLogTotalPages}
                  handlePageChange={handleSecurityDepositLogPageChange}
                  authorizePermissions={authorizePermissions}
                />
              </CCol>
            )}

            {canCreateDepositPayment && (
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
                        max={parseInt(securityDeposit.amount) - parseInt(securityDeposit.totalPaid)}
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

            {canCreateDepositReturnPayment && (
              <CModal
                visible={visibleModalReturnPayment}
                onClose={() => setVisibleModalReturnPayment(false)}
                aria-labelledby="LiveDemoExampleLabel"
              >
                <CForm onSubmit={handleReturnPaymentSubmit} noValidate>
                  <CModalHeader>
                    <CModalTitle id="LiveDemoExampleLabel">Pengembalian Deposit</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    {returnPaymentError && <CAlert color="danger">{returnPaymentError}</CAlert>}
                    {returnPaymentSuccess && (
                      <CAlert color="success">{returnPaymentSuccess}</CAlert>
                    )}

                    <div className="mt-3 mb-3">
                      <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>

                      <CFormRange
                        id="customRange2"
                        min={0}
                        max={
                          parseInt(securityDeposit.amount) - parseInt(securityDeposit.totalReturn)
                        }
                        onChange={(e) => setAmountReturnedValue(e.target.value)}
                        disabled={paymentLoading}
                        value={amountReturnedValue}
                      />

                      <CFormInput
                        type="text"
                        value={formatRupiah(amountReturnedValue)}
                        onChange={(e) => handleReturnAmount(e.target.value)}
                        disabled={returnPaymentLoading}
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
                        checked={checkedReturnPaymentMethodOptions === 'transfer'}
                        onChange={(e) => setCheckedReturnPaymentMethodOptions(e.target.value)}
                        disabled={returnPaymentLoading}
                      />

                      <CFormCheck
                        inline
                        type="radio"
                        name="paymentMethod"
                        id="cash"
                        label="Tunai"
                        value="cash"
                        checked={checkedReturnPaymentMethodOptions === 'cash'}
                        onChange={(e) => setCheckedReturnPaymentMethodOptions(e.target.value)}
                        className="me-3"
                        disabled={returnPaymentLoading}
                      />
                    </div>

                    {checkedReturnPaymentMethodOptions === 'cash' && (
                      <div className="mb-3">
                        <CFormLabel className="fw-bold">Penerima uang tunai</CFormLabel>
                        <CFormInput
                          type="text"
                          value={returnCashRecipentValue}
                          onChange={(e) => setReturnCashRecipentValue(e.target.value)}
                          placeholder="Masukkan penerima uang tunai"
                          disabled={returnPaymentLoading}
                        />
                      </div>
                    )}

                    {checkedReturnPaymentMethodOptions === 'transfer' && (
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
                              console.log('halo')
                              setReturnBankValue(e[0])
                            }}
                            multiple={false}
                            virtualScroller
                            visibleItems={5}
                            placeholder="Pilih bank"
                            cleaner={false}
                            disabled={returnPaymentLoading}
                          />
                        </div>
                        <div className="mb-3">
                          <CFormLabel className="fw-bold">Nomor Rekening</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              placeholder="Masukkan nomor rekening"
                              value={returnAccountNumberValue}
                              onChange={(e) => setReturnAccountNumberValue(e.target.value)}
                              disabled={returnPaymentLoading}
                            />

                            <CButton
                              type="button"
                              color="primary"
                              variant="outline"
                              id="button-addon1"
                              onClick={handleCheckAccountNumberReturnPayment}
                              disabled={!!returnPaymentError || returnPaymentLoading}
                            >
                              Cek
                            </CButton>
                          </CInputGroup>
                        </div>

                        <div className="mb-3">
                          <CFormLabel className="fw-bold">Nama Rekening</CFormLabel>
                          <CFormInput
                            type="text"
                            readOnly
                            value={returnAccountNameValue}
                            disabled
                          />
                        </div>
                      </div>
                    )}
                  </CModalBody>

                  <CModalFooter>
                    <CLoadingButton
                      color="primary"
                      type="submit"
                      disabled={validateReturnPaymentForm() !== null || returnPaymentLoading}
                      loading={returnPaymentLoading}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </CLoadingButton>

                    <CButton color="secondary" onClick={() => setVisibleModalReturnPayment(false)}>
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

export default DetailSecurityDeposit
