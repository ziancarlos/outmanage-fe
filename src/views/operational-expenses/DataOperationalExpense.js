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
  CRow,
  CSmartPagination,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocation, useNavigate } from 'react-router-dom'
import { faEye, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'
import { formatToISODate } from '../../utils/DateUtils'
import { formatRupiah } from '../../utils/CurrencyUtils'
import moment from 'moment'
const paymentStatusOptions = [
  { label: 'Pilih Status Pembayaran', value: '' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Belum Lunas', value: 'BELUM-LUNAS' },
]

const matchingPaymentStatus = paymentStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const DataOperationalExpense = () => {
  const { authorizePermissions } = useAuth()
  const canUpdateOperationalExpense = authorizePermissions.some(
    (perm) => perm.name === 'update-operational-expense',
  )
  const canReadOperationalExpense = authorizePermissions.some(
    (perm) => perm.name === 'read-operational-expense',
  )

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [operationalExpenses, setOperationalExpenses] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchDescriptionValue, setSearchDescriptionValue] = useState('')
  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchPaymentStatusValue, setSearchPaymentStatusValue] = useState('')

  const [typeOptions, setTypeOptions] = useState([])
  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const operationalExpenseTypeIdValue = queryParams.get('operationalExpenseTypeId')
    const paymentStatusValue = queryParams.get('paymentStatus')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (operationalExpenseTypeIdValue) {
      searchParamsRef.current.operationalExpenseTypeId = operationalExpenseTypeIdValue
    }

    if (matchingPaymentStatus.includes(paymentStatusValue)) {
      searchParamsRef.current.paymentStatus = paymentStatusValue
    }

    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    Promise.all([fetchData(page, searchParamsRef.current), fetchType()]).finally(() =>
      setLoading(false),
    )
  }, [])

  useEffect(() => {
    setError('')
  }, [
    searchDescriptionValue,
    searchStartDateValue,
    searchEndDateValue,
    searchTypeValue,
    searchPaymentStatusValue,
  ])

  async function fetchType() {
    try {
      const response = await axiosPrivate.get('/api/operational-expenses/types')

      setTypeOptions([
        { label: 'Pilih tipe perubahaan', value: '' },
        ...response.data.data.map((type) => ({
          label: type.type,
          value: type.operationalExpenseTypeId,
        })),
      ])
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchData(page, searchParams = {}) {
    try {
      const params = { page: page, size: 5, ...searchParams }

      const response = await axiosPrivate.get('/api/operational-expenses', { params })

      setOperationalExpenses(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      setSearchTypeValue('')
      setSearchStartDateValue('')
      setSearchEndDateValue('')
      setSearchDescriptionValue('')
      setSearchPaymentStatusValue('')
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

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)

      setSearchLoading(true)

      fetchData(newPage, searchParamsRef.current).finally(() => setSearchLoading(false))
    }
  }

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    const validType = typeOptions.map((option) => option.value.toString()).filter(Boolean)

    if (searchTypeValue && validType.includes(searchTypeValue)) {
      searchParams.operationalExpenseTypeId = searchTypeValue
    }

    if (matchingPaymentStatus.includes(searchPaymentStatusValue)) {
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
      navigate(`/operational-expenses/data`)
    }

    fetchData(1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  function handleDetail(operationalExpenseId) {
    navigate(`/operational-expenses/${operationalExpenseId}/detail`)
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
                <strong>Data Pengeluaran Operasional</strong>
              </CCardHeader>
              <CCardBody>
                {error && (
                  <CRow>
                    <CCol>
                      <CAlert color="danger">{error}</CAlert>
                    </CCol>
                  </CRow>
                )}

                <CForm onSubmit={handleSearch} noValidate>
                  <CRow className="mb-3">
                    <CCol md={8} xs={12} className="mb-xs-2">
                      <CFormSelect
                        id="paymentStatusInput"
                        value={searchPaymentStatusValue}
                        onChange={(e) => setSearchPaymentStatusValue(e.target.value)}
                        options={paymentStatusOptions}
                        label={'Status Pembayaran'}
                      />
                    </CCol>

                    <CCol md={4} xs={12} className="mb-xs-2">
                      <CFormSelect
                        label={'Pilih tipe pengeluaran'}
                        options={typeOptions}
                        onChange={(e) => setSearchTypeValue(e.target.value)}
                        value={searchTypeValue}
                        disabled={searchLoading}
                      />
                    </CCol>

                    <CCol xs={12} className="mt-2">
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

                    <CCol md={4} xs={12} className="d-flex align-items-center mt-2">
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

                <div className="table-responsive">
                  <CTable bordered responsive striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Id Pengeluaran Operasional</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tipe Pengeluaran</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status Pembayaran</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Total Pembayaran</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tanggal</CTableHeaderCell>
                        {canReadOperationalExpense && (
                          <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                        )}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {operationalExpenses.map((expense, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>#{expense.operationalExpenseId}</CTableDataCell>
                          <CTableDataCell>{expense.type}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge
                              color={
                                expense.paymentStatus === 2
                                  ? 'success'
                                  : expense.paymentStatus === 1
                                    ? 'warning'
                                    : expense.paymentStatus === 0
                                      ? 'danger'
                                      : 'secondary'
                              }
                            >
                              {expense.paymentStatus === 2
                                ? 'LUNAS'
                                : expense.paymentStatus === 1
                                  ? 'SEBAGIAN'
                                  : expense.paymentStatus === 0
                                    ? 'BELUM LUNAS'
                                    : expense.paymentStatus}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{formatRupiah(expense.grandTotal)}</CTableDataCell>
                          <CTableDataCell>
                            {moment(expense.date).format('MMMM D, YYYY h:mm A')}
                          </CTableDataCell>
                          {canReadOperationalExpense && (
                            <CTableDataCell className="d-flex align-middle">
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => handleDetail(expense.operationalExpenseId)}
                                className="me-1"
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
      )}
    </>
  )
}

export default DataOperationalExpense
