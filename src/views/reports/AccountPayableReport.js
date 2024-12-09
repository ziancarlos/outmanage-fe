import React, { useEffect, useRef, useState } from 'react'
import { CSpinner, useDebouncedCallback } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'

import { formatToISODate } from '../../utils/DateUtils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faSearch } from '@fortawesome/free-solid-svg-icons'
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

const AccountPayableReport = () => {
  const { authorizePermissions } = useAuth()

  const canReadTransactionSale = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale',
  )
  const canReadTransactionRent = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent',
  )

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [accountPayable, setAccountPayable] = useState([])
  const [accountPayableDetails, setAccountPayableDetails] = useState([])

  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  async function fetchData(searchParams = {}) {
    try {
      const params = { ...searchParams }

      const response = await axiosPrivate.get('/api/reports/account-payables', { params })

      setAccountPayable(response.data.data)
      setAccountPayableDetails(response.data.details)

      clearInput()
    } catch (e) {
      console.log(e)
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

  useEffect(() => {
    setError('')
  }, [searchStartDateValue, searchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    fetchData(searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    const searchParams = {}

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
      navigate(`/reports/account-payable`)
    }

    fetchData(searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
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
                <strong>Laporan Hutang</strong>
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

                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell colSpan={2}>Tanggal Mulai</CTableHeaderCell>
                        <CTableDataCell colSpan={2}>
                          {accountPayableDetails.startDate
                            ? moment(accountPayableDetails.startDate).format('MMMM D, YYYY')
                            : '-'}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell colSpan={2}>Tanggal Selesai</CTableHeaderCell>
                        <CTableDataCell colSpan={2}>
                          {accountPayableDetails.endDate
                            ? moment(accountPayableDetails.endDate).format('MMMM D, YYYY')
                            : '-'}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell colSpan={2}>Jumlah Hutang</CTableHeaderCell>
                        <CTableDataCell colSpan={2}>
                          {formatRupiah(accountPayableDetails?.accountReceivablesAmount)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tanggal Transaksi</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Sisa Pembayaran</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status Pembayaran</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {accountPayable.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            {canReadTransactionSale && item.payablesType === 'OPERATIONAL' ? (
                              <NavLink to={`/operational-expenses/${item.transactionId}/detail`}>
                                OE{item.transactionId}
                              </NavLink>
                            ) : canReadTransactionRent && item.payablesType === 'PURCHASE' ? (
                              <NavLink to={`/purchases/${item.transactionId}/detail`}>
                                P{item.transactionId}
                              </NavLink>
                            ) : (
                              <span>
                                {item.payablesType === 'OPERATIONAL'
                                  ? `OE${item.transactionId}`
                                  : `P${item.transactionId}`}
                              </span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {moment(item.transactionDate).format('MMMM D, YYYY h:mm A')}
                          </CTableDataCell>
                          <CTableDataCell>{formatRupiah(item.remainingPayment)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge
                              color={
                                item.paymentStatus === 2
                                  ? 'success'
                                  : item.paymentStatus === 1
                                    ? 'warning'
                                    : item.paymentStatus === 0
                                      ? 'danger'
                                      : 'secondary'
                              }
                            >
                              {item.paymentStatus === 2
                                ? 'LUNAS'
                                : item.paymentStatus === 1
                                  ? 'SEBAGIAN'
                                  : item.paymentStatus === 0
                                    ? 'BELUM LUNAS'
                                    : item.paymentStatus}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default AccountPayableReport
