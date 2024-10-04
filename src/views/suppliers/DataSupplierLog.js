import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableSupplierLog from '../../components/suppliers/TableSupplierLog'
import { formatToISODate } from '../../utils/DateUtils'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const DataSupplierLog = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)

  const [suppliersLogs, setSuppliersLogs] = useState([])

  const [error, setError] = useState('')

  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  const searchParamsRef = useRef()

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (typeOptions[1].value === searchTypeValue || typeOptions[2].value === searchTypeValue) {
      searchParams.type = searchTypeValue
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
      navigate(`/suppliers/log`)
    }

    setSearchTypeValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  async function fetchData(page, searchParams) {
    try {
      const response = await axiosPrivate.get('/api/suppliers/logs', {
        params: { page: page, size: 3, ...searchParams },
      })

      setSuppliersLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setSupplierLogsError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchTypeParamValue = queryParams.get('type')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (searchTypeParamValue) {
      searchParamsRef.current.type = searchTypeParamValue
    }
    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol>
            <TableSupplierLog
              title={'Data Log Pemasok'}
              error={error}
              handleSearch={handleSearch}
              typeOptions={typeOptions}
              searchTypeValue={searchTypeValue}
              setSearchTypeValue={setSearchTypeValue}
              searchStartDateValue={searchStartDateValue}
              setSearchStartDateValue={setSearchStartDateValue}
              searchEndDateValue={searchEndDateValue}
              setSearchEndDateValue={setSearchEndDateValue}
              searchLoading={searchLoading}
              suppliersLogs={suppliersLogs}
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              authorizePermissions={authorizePermissions}
            />
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataSupplierLog
