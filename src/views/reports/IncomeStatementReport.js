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

const IncomeStatementReport = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [incomeStatement, setIncomeStatement] = useState([])

  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  async function fetchData(page, searchParams = {}) {
    try {
      const params = { ...searchParams }

      const response = await axiosPrivate.get('/api/reports/income-statements', { params })

      console.log(response.data.data)
      setIncomeStatement(response.data.data)

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

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
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
      navigate(`/reports/income-statement`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
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
                <strong>Laporan Laba Rugi</strong>
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

                {/* Purchases Table */}
                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell colSpan={2} className="text-center">
                          Laporan Laba Rugi
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      <CTableRow>
                        <CTableHeaderCell>Tanggal Mulai</CTableHeaderCell>
                        <CTableDataCell className="text-center">
                          {incomeStatement.startDate
                            ? moment(incomeStatement.startDate).format('MMMM D, YYYY')
                            : '-'}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Tanggal Selesai</CTableHeaderCell>
                        <CTableDataCell className="text-center">
                          {incomeStatement.endDate
                            ? moment(incomeStatement.endDate).format('MMMM D, YYYY')
                            : '-'}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow className="table-primary">
                        <CTableHeaderCell colSpan={2} className="text-center">
                          Pendapatan
                        </CTableHeaderCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Pendapatan Penyewaan</CTableHeaderCell>
                        <CTableDataCell className="text-right">
                          {formatRupiah(incomeStatement?.income?.rentIncome)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Pendapatan Penjualan</CTableHeaderCell>
                        <CTableDataCell className="text-right">
                          {formatRupiah(incomeStatement?.income?.saleIncome)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Total Pendapatan</CTableHeaderCell>
                        <CTableDataCell className="text-right font-weight-bold">
                          {formatRupiah(incomeStatement?.income?.totalIncome)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow className="table-warning">
                        <CTableHeaderCell colSpan={2} className="text-center">
                          Pengeluaran
                        </CTableHeaderCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Biaya Pembelian</CTableHeaderCell>
                        <CTableDataCell className="text-right">
                          {formatRupiah(incomeStatement?.expenses?.purchaseExpense)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Biaya Pengeluaran</CTableHeaderCell>
                        <CTableDataCell className="text-right">
                          {formatRupiah(incomeStatement?.expenses?.operationalExpense)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Total Pengeluaran</CTableHeaderCell>
                        <CTableDataCell className="text-right font-weight-bold">
                          {formatRupiah(incomeStatement?.expenses?.totalExpenses)}
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableHeaderCell>Keuntungan Bersih</CTableHeaderCell>
                        <CTableDataCell
                          className="text-right font-weight-bold"
                          style={{ color: incomeStatement?.netProfit < 0 ? 'red' : 'green' }}
                        >
                          {formatRupiah(incomeStatement?.netProfit)}
                        </CTableDataCell>
                      </CTableRow>
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

export default IncomeStatementReport
