import React, { useEffect, useRef, useState } from 'react'
import { CDatePicker, CFormInput, CSpinner } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'

import { formatToISODate } from '../../utils/DateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
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
  CSmartPagination,
} from '@coreui/react-pro'
import { NavLink } from 'react-router-dom'
import moment from 'moment'

const responseStatusOptions = [
  { label: 'Pilih Status', value: '' },
  { label: 'SUKSES', value: 'SUKSES' },
  { label: 'GAGAL', value: 'GAGAL' },
]

const matchingResponseStatus = responseStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const DataPurchase = () => {
  const { authorizePermissions } = useAuth()

  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [telegramMessages, setTelegramMessages] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchValue, setSearchValue] = useState('')
  const [searchDateValue, setSearchDateValue] = useState('')
  const [searchResponseStatusValue, setSearchResponseStatusValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  async function fetchData(page, searchParams = {}) {
    try {
      const params = searchParams.search
        ? {
            page,
            size: 5,
            chatId: searchParams.search,
            message: searchParams.search,
            errorMessage: searchParams.search,
            ...searchParams,
          }
        : { page, size: 5, ...searchParams }

      const response = await axiosPrivate.get('/api/telegram-messages', { params })

      setTelegramMessages(response.data.data)
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
      setSearchLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setSearchLoading(false))
    }
  }

  useEffect(() => {
    setError('')
  }, [searchValue, searchDateValue, searchResponseStatusValue])

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchValue = queryParams.get('search')
    const sentAt = queryParams.get('sentAt')
    const responseStatus = queryParams.get('responseStatus')

    searchParamsRef.current = {}

    const trimmedSearchValue = searchValue ? searchValue.trim() : ''

    if (!!trimmedSearchValue) {
      searchParamsRef.current.search = searchValue
    }

    if (sentAt) {
      searchParamsRef.current.sentAt = sentAt
    }

    if (matchingResponseStatus.includes(responseStatus)) {
      searchParamsRef.current.responseStatus = responseStatus
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    setSearchLoading(true)
    setPage(1)

    const searchParams = {}

    const trimmedSearchValue = searchValue ? searchValue.trim() : ''

    if (!!trimmedSearchValue) {
      searchParams.search = searchValue
    }

    if (searchDateValue) {
      searchParams.sentAt = formatToISODate(searchDateValue)
    }

    if (matchingResponseStatus.includes(searchResponseStatusValue)) {
      searchParams.responseStatus = searchResponseStatusValue
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/telegram-messages/data`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
    setSearchValue('')
    setSearchDateValue('')
    setSearchResponseStatusValue('')
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
                <strong>Data Pesan Telegram</strong>
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
                    <CCol xs={12} md={4} className="mb-2">
                      <CFormLabel>Cari</CFormLabel>
                      <CFormInput
                        placeholder="Cari..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={searchLoading}
                      />
                    </CCol>

                    <CCol xs={12} md={4} className="mb-2">
                      <CFormLabel htmlFor="paymentStatusInput">Status</CFormLabel>
                      <CFormSelect
                        id="paymentStatusInput"
                        options={responseStatusOptions}
                        value={searchResponseStatusValue}
                        onChange={(e) => setSearchResponseStatusValue(e.target.value)}
                        disabled={searchLoading}
                      />
                    </CCol>

                    {/* Date Range Picker */}
                    <CCol xs={12} md={4} className="mb-2">
                      <CFormLabel htmlFor="dateRangeInput">Tanggal</CFormLabel>
                      <CDatePicker
                        placeholder={'Tanggal'}
                        disabled={searchLoading}
                        value={searchDateValue}
                        onDateChange={(e) => setSearchDateValue(e)}
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
                        <CTableHeaderCell
                          scope="col"
                          rowSpan={2}
                          className="text-center align-middle"
                        >
                          Id
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          colSpan={2}
                          className="text-center align-middle"
                        >
                          Penerima
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          rowSpan={2}
                          className="text-center align-middle"
                        >
                          Pesan
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          rowSpan={2}
                          className="text-center align-middle"
                        >
                          Tanggal Dikirim
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          rowSpan={2}
                          className="text-center align-middle"
                        >
                          Status
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          rowSpan={2}
                          className="text-center align-middle"
                        >
                          Pesan Kesalahan
                        </CTableHeaderCell>
                      </CTableRow>

                      <CTableRow>
                        <CTableHeaderCell scope="col">Pengguna</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Id Pesan</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {telegramMessages.map((message) => (
                        <CTableRow key={message.telegramMessageId}>
                          <CTableDataCell>TM{message.telegramMessageId}</CTableDataCell>
                          <CTableDataCell>
                            {canReadUser && message.user ? (
                              <NavLink to={`/users/${message.user.userId}/detail`}>
                                {message.user.username || '-'}
                              </NavLink>
                            ) : (
                              message.user?.username || '-'
                            )}
                          </CTableDataCell>
                          <CTableDataCell>{message.chatId || '-'}</CTableDataCell>
                          <CTableDataCell>{message.message}</CTableDataCell>
                          <CTableDataCell>
                            {moment(message.sentAt).format('MMMM D, YYYY h:mm A')}
                          </CTableDataCell>
                          <CTableDataCell>{message.responseStatus}</CTableDataCell>
                          <CTableDataCell>{message.errorMessage || '-'}</CTableDataCell>
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

export default DataPurchase
