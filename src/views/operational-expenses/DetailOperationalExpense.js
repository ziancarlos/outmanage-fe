import { useEffect, useRef, useState } from 'react'
import { formatRupiah } from '../../utils/CurrencyUtils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate, useParams } from 'react-router-dom'
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
import useAuth from '../../hooks/useAuth'
import moment from 'moment'
import TableOperationalExpenseLog from '../../components/operational-expense/TableOperationalExpenseLog'
import { formatToISODate } from '../../utils/DateUtils'
import {
  faMoneyBill,
  faMoneyBill1,
  faMoneyBillTrendUp,
  faSave,
  faTimes,
  faWallet,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Swal from 'sweetalert2'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

function DetailOperationalExpense() {
  const { operationalExpenseId } = useParams()
  const { authorizePermissions } = useAuth()

  const canReadOperationalExpenseLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-operational-expense-logs',
  )
  const canReadOperationalExpensePayments = authorizePermissions.some(
    (perm) => perm.name === 'read-operational-expense-payments',
  )
  const canCreateOperationalExpensePayment = authorizePermissions.some(
    (perm) => perm.name === 'create-operational-expense-payment',
  )
  const canDeleteOperationalExpense = authorizePermissions.some(
    (perm) => perm.name === 'delete-operational-expense',
  )

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [operationalExpense, setOperationalExpense] = useState('')
  const [operationalExpensePayments, setOperationalExpensePayments] = useState([])
  const [operationalExpensesLog, setOperationalExpensesLog] = useState([])

  const [loading, setLoading] = useState(true)

  const [operationalExpenseLogError, setOperationalExpenseLogError] = useState('')
  const [searchOperationalExpenseLogTypeValue, setSearchOperationalExpenseLogTypeValue] =
    useState('')
  const [searchOperationalExpenseLogStartDateValue, setSearchOperationalExpenseLogStartDateValue] =
    useState('')
  const [searchOperationalExpenseLogEndDateValue, setSearchOperationalExpenseLogEndDateValue] =
    useState('')
  const [searchOperationalExpenseLogLoading, setSearchOperationalExpenseLogLoading] =
    useState(false)

  const [operationalExpenseLogPage, setOperationalExpenseLogPage] = useState(1)
  const [operationalExpenseLogTotalPage, setOperationalExpenseLogTotalPage] = useState(1)

  const [visibileModalPayment, setVisibileModalPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')
  const [amountPaidValue, setAmountPaidValue] = useState(0)
  const [bankValue, setBankValue] = useState('')
  const [bankOptions, setBankOptions] = useState([])
  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')
  const [cashRecipentValue, setCashRecipentValue] = useState('')

  const [refetch, setRefetch] = useState(false)

  const searchParamsRef = useRef()

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchOperationalExpense(operationalExpenseId)]

    if (canReadOperationalExpenseLogs) {
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

      fetchPromises.push(fetchOperationalExpenseLog(1, searchParamsRef.current))
    }

    if (canReadOperationalExpensePayments) {
      fetchPromises.push(fetchOperationalExpensePayments(operationalExpenseId))
    }

    if (canCreateOperationalExpensePayment) {
      fetchPromises.push(fetchBankOptions())
    }

    Promise.all(fetchPromises).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setOperationalExpenseLogError('')
  }, [
    searchOperationalExpenseLogTypeValue,
    searchOperationalExpenseLogStartDateValue,
    searchOperationalExpenseLogEndDateValue,
  ])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  useEffect(() => {
    clearPaymentMethodForm()
    setAmountPaidValue(0)
    setCheckedPaymentMethodOptions('transfer')
    setPaymentError('')
    setPaymentSuccess('')

    if (visibileModalPayment) {
      setLoading(true)

      fetchOperationalExpense(operationalExpenseId).finally(() => setLoading(false))
    }
  }, [visibileModalPayment])

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
    setPaymentError('')
    setPaymentSuccess('')
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

      await axiosPrivate.post(`/api/operational-expenses/${operationalExpenseId}/payments`, request)

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

  async function handleCancel(e) {
    e.preventDefault()

    try {
      setLoading(true)

      await axiosPrivate.delete(`/api/operational-expenses/${operationalExpenseId}`)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengeluaran operasional berhasil di batalkan.',
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
      Math.max(
        0,
        Math.min(
          Number(value.replace(/[^0-9]/g, '')),
          operationalExpense.grandTotal - operationalExpense.totalPaid,
        ),
      ),
    )
  }

  async function fetchOperationalExpensePayments(operationalExpenseId) {
    try {
      const response = await axiosPrivate.get(
        `/api/operational-expenses/${operationalExpenseId}/payments`,
      )

      setOperationalExpensePayments(response.data.data)
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

  async function fetchOperationalExpenseLog(page, searchParams) {
    try {
      const response = await axiosPrivate.get(
        `/api/operational-expenses/${operationalExpenseId}/logs`,
        {
          params: { page: page, size: 3, ...searchParams },
        },
      )

      setOperationalExpensesLog(response.data.data)
      setOperationalExpenseLogTotalPage(response.data.paging.totalPage)
      setOperationalExpenseLogPage(response.data.paging.page)

      setSearchOperationalExpenseLogTypeValue('')
      setSearchOperationalExpenseLogStartDateValue('')
      setSearchOperationalExpenseLogEndDateValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setOperationalExpenseLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchOperationalExpense(operationalExpenseId) {
    try {
      const response = await axiosPrivate.get(`/api/operational-expenses/${operationalExpenseId}`)

      setOperationalExpense(response.data.data)
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

  function handleOperationalExpenseSearch(e) {
    e.preventDefault()

    setSearchOperationalExpenseLogLoading(true)

    setOperationalExpenseLogPage(1)

    const searchParams = {}

    if (matchingTypes.includes(searchOperationalExpenseLogTypeValue)) {
      searchParams.type = searchOperationalExpenseLogTypeValue
    }

    if (searchOperationalExpenseLogStartDateValue) {
      searchParams.startDate = formatToISODate(searchOperationalExpenseLogStartDateValue)
    }

    if (searchOperationalExpenseLogEndDateValue) {
      searchParams.endDate = formatToISODate(searchOperationalExpenseLogEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/operational-expenses/${operationalExpenseId}/detail`)
    }

    fetchOperationalExpenseLog(1, searchParamsRef.current).finally(() =>
      setSearchOperationalExpenseLogLoading(false),
    )
  }

  const handleOperationalExpenseLogPage = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= operationalExpenseLogTotalPage &&
      newPage !== operationalExpenseLogPage
    ) {
      setOperationalExpenseLogPage(newPage)
      setSearchOperationalExpenseLogLoading(true)
      fetchOperationalExpenseLog(newPage, searchParamsRef.current).finally(() =>
        setSearchOperationalExpenseLogLoading(false),
      )
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
                value={formatRupiah(operationalExpense.grandTotal || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="secondary"
                icon={<FontAwesomeIcon icon={faMoneyBillTrendUp} size="lg" />}
                padding={false}
                title="Jumlah Dibayar"
                value={formatRupiah(operationalExpense.totalPaid || 0)}
              />
            </CCol>
            <CCol xs={12}>
              <CWidgetStatsF
                className="mb-3"
                color="danger"
                icon={<FontAwesomeIcon icon={faMoneyBill} size="lg" />}
                padding={false}
                title="Sisa Pembayaran"
                value={formatRupiah(operationalExpense.remainingBalance || 0)}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>
                    {'OE' + operationalExpense.operationalExpenseId}{' '}
                    <CBadge
                      className="ms-2 me-2"
                      color={
                        operationalExpense.paymentStatus === 2
                          ? 'success'
                          : operationalExpense.paymentStatus === 1
                            ? 'warning'
                            : operationalExpense.paymentStatus === 0
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {operationalExpense.paymentStatus === 2
                        ? 'LUNAS'
                        : operationalExpense.paymentStatus === 1
                          ? 'SEBAGIAN'
                          : operationalExpense.paymentStatus === 0
                            ? 'BELUM LUNAS'
                            : operationalExpense.paymentStatus}
                    </CBadge>
                  </CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Tanggal Pengeluaran:{' '}
                    {moment(operationalExpense.date).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                  <CListGroupItem>
                    Deskripsi: {operationalExpense.description || '-'}
                  </CListGroupItem>
                </CListGroup>
                {(() => {
                  // Permission and status checks
                  const canShowPaymentButton =
                    operationalExpense.paymentStatus !== 2 &&
                    canReadOperationalExpensePayments &&
                    operationalExpense.deletedAt === null

                  const canShowCancelButton =
                    canDeleteOperationalExpense &&
                    operationalExpense.deletedAt === null &&
                    operationalExpense.paymentStatus === 0

                  // Render button components
                  const renderPaymentButton = canShowPaymentButton && (
                    <CButton
                      color="success"
                      variant="outline"
                      className="me-1"
                      onClick={() => setVisibileModalPayment(!visibileModalPayment)}
                    >
                      <FontAwesomeIcon icon={faMoneyBill1} className="me-2" />
                      Pembayaran
                    </CButton>
                  )

                  const renderCancelButton = canShowCancelButton && (
                    <CButton color="danger" variant="outline" onClick={(e) => handleCancel(e)}>
                      <FontAwesomeIcon icon={faX} className="me-2" />
                      Pembatalan
                    </CButton>
                  )

                  // Check if any button should be displayed
                  const shouldRenderFooter = renderPaymentButton || renderCancelButton

                  // Conditionally render footer
                  return shouldRenderFooter ? (
                    <CCardFooter>
                      {renderPaymentButton}
                      {renderCancelButton}
                    </CCardFooter>
                  ) : null
                })()}
              </CCard>
            </CCol>
          </CRow>

          {canReadOperationalExpensePayments && (
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
                        {operationalExpensePayments.map((payment, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell className="text-center">
                              OEP{payment.operationalExpensePaymentId}
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
                            <CTableDataCell className="align-middle">
                              {formatRupiah(payment.amountPaid)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                        <CTableRow>
                          <CTableHeaderCell className="text-center align-middle" colSpan={5}>
                            <strong>Total</strong>
                          </CTableHeaderCell>
                          <CTableDataCell>
                            <strong>
                              {formatRupiah(
                                operationalExpensePayments.reduce(
                                  (total, payment) => total + payment.amountPaid,
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

          {canReadOperationalExpenseLogs && (
            <TableOperationalExpenseLog
              title={'Data Log Biaya Operasional'}
              error={operationalExpenseLogError}
              handleSearch={handleOperationalExpenseSearch}
              typeOptions={typeOptions}
              searchTypeValue={searchOperationalExpenseLogTypeValue}
              setSearchTypeValue={setSearchOperationalExpenseLogTypeValue}
              searchStartDateValue={searchOperationalExpenseLogStartDateValue}
              setSearchStartDateValue={setSearchOperationalExpenseLogStartDateValue}
              searchEndDateValue={searchOperationalExpenseLogEndDateValue}
              setSearchEndDateValue={setSearchOperationalExpenseLogEndDateValue}
              searchLoading={searchOperationalExpenseLogLoading}
              operationalExpenseLog={operationalExpensesLog}
              page={operationalExpenseLogPage}
              totalPages={operationalExpenseLogTotalPage}
              handlePageChange={handleOperationalExpenseLogPage}
              authorizePermissions={authorizePermissions}
            />
          )}

          {canReadOperationalExpensePayments && (
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
                      max={operationalExpense.grandTotal - operationalExpense.totalPaid}
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
                  <CLoadingButton color="primary" type="submit">
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>

                  <CButton color="secondary" onClick={() => setVisibileModalPayment(false)}>
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

export default DetailOperationalExpense
