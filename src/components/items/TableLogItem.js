/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import {
  CCol,
  CDateRangePicker,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'

import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import TableFilterLayout from '../TableFilterLayout'
import TableCardLayout from '../TableCardLayout'
import moment from 'moment'
import JSONPretty from 'react-json-pretty'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const matchingTypeOptions = typeOptions
  .filter((option) => option.value)
  .map((option) => option.value)

export default function TableLogItem({
  title = 'Data Log Barang',
  itemId = null,
  size = 4,
  authorizePermissions,
  ...props
}) {
  const canReadItem = authorizePermissions.some((perm) => perm.name === 'read-item')
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [itemsLogs, setItemsLogs] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchActivityValue, setSearchActivityValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')

  const [refetch, setRefetch] = useState(false)
  const filterRef = useRef({})

  const [error, setError] = useState('')

  const formatToISODate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  }

  useEffect(() => {
    setLoading(true)

    const searchParams = new URLSearchParams(location.search)
    const queryParams = searchParams.get('itemsLogs')

    let parsedParams = {}

    if (queryParams) {
      try {
        parsedParams = JSON.parse(queryParams)
      } catch (error) {
        navigate(`${location.pathname}`, { replace: true })
      }
    }

    if (matchingTypeOptions.includes(parsedParams.changeType)) {
      filterRef.current.changeType = parsedParams.changeType
    }
    if (parsedParams.startDate) {
      filterRef.current.startDate = parsedParams.startDate
    }
    if (parsedParams.endDate) {
      filterRef.current.endDate = parsedParams.endDate
    }

    filterRef.current.page = parseInt(parsedParams.page) || 1
    setPage(filterRef.current.page)

    fetchItem(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  async function fetchItem() {
    try {
      const params = {
        size,
        ...filterRef.current,
      }

      if (itemId) {
        params.itemId = itemId
      }

      const response = await axiosPrivate.get('/api/items/logs', { params })

      setItemsLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      filterRef.current.page = newPage
      setPage(filterRef.current.page)

      const newParams = new URLSearchParams(location.search)
      newParams.set('itemsLogs', JSON.stringify(filterRef.current))
      navigate(`${location.pathname}?${newParams}`, { replace: true })

      setRefetch((val) => !val)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()

    filterRef.current = {}

    filterRef.current.page = 1

    if (matchingTypeOptions.includes(searchActivityValue)) {
      filterRef.current.changeType = searchActivityValue
    }

    if (searchStartDateValue) {
      filterRef.current.startDate = formatToISODate(searchStartDateValue)
    }

    if (searchEndDateValue) {
      filterRef.current.endDate = formatToISODate(searchEndDateValue)
    }

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(filterRef.current).length > 0) {
      newParams.set('itemsLogs', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('itemsLogs')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function clearSearchInput() {
    setSearchActivityValue('')
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
        <CCol {...props}>
          <TableCardLayout
            title={title}
            error={error}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          >
            <TableFilterLayout handleSearch={handleSearch} loading={loading}>
              <CCol xs={12} md={4} className="mb-2">
                <CFormLabel htmlFor="activitySelect">Tipe Perubahaan</CFormLabel>
                <CFormSelect
                  id="activitySelect"
                  options={typeOptions}
                  disabled={loading}
                  value={searchActivityValue}
                  onChange={(e) => setSearchActivityValue(e.target.value)}
                />
              </CCol>

              <CCol xs={12} md={8} className="mb-2">
                <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
                <CDateRangePicker
                  placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                  startDate={searchStartDateValue}
                  endDate={searchEndDateValue}
                  disabled={loading}
                  onStartDateChange={(date) => setSearchStartDateValue(date)}
                  onEndDateChange={(date) => setSearchEndDateValue(date)}
                />
              </CCol>
            </TableFilterLayout>

            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kustomer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tipe Perubahaan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nilai Lama</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nilai Baru</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Penanggung Jawab</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tanggal Perubahaan</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {itemsLogs.map((log) => {
                    const item = canReadItem ? (
                      log.item?.itemId ? (
                        <NavLink to={`/items/${log.item.itemId}/detail`}>{log.item.name}</NavLink>
                      ) : (
                        '-'
                      )
                    ) : log.item.itemId ? (
                      log.item.name
                    ) : (
                      '-'
                    )

                    const username = canReadUser ? (
                      log.user?.userId ? (
                        <NavLink to={`/users/${log.user.userId}/detail`}>
                          {log.user.username}
                        </NavLink>
                      ) : (
                        '-'
                      )
                    ) : log.user.userId ? (
                      log.user.username
                    ) : (
                      '-'
                    )

                    return (
                      <CTableRow key={log.itemLogId}>
                        <CTableDataCell>CL{log.itemLogId}</CTableDataCell>
                        <CTableDataCell>{item}</CTableDataCell>
                        <CTableDataCell>{log.changeType}</CTableDataCell>
                        <CTableDataCell>
                          {log.oldValue ? (
                            <JSONPretty
                              data={log.oldValue}
                              theme={{ main: 'monospace', key: 'red', value: 'green' }}
                            />
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <JSONPretty
                            data={log.newValue}
                            theme={{ main: 'monospace', key: 'red', value: 'green' }}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{username}</CTableDataCell>
                        <CTableDataCell>
                          {moment(log.createdAt).format('MMMM D, YYYY h:mm A')}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </TableCardLayout>
        </CCol>
      )}
    </>
  )
}
