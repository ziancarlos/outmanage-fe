import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableInventoryLog from '../../components/inventories/TableInventoryLog'
import { formatToISODate } from '../../utils/DateUtils'
import DataQuantityLog from '../../components/inventories/TableQuantityLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const DataInventoryLog = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)

  const [inventoriesQuantityLogs, setInventoriesQuantityLogs] = useState([])

  const [error, setError] = useState('')

  const [searchDetailValue, setSearchDetailValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  const searchParamsRef = useRef()

  useEffect(() => {
    setError('')
  }, [searchDetailValue, searchStartDateValue, searchEndDateValue])

  function handleSearch(e) {
    e.preventDefault()
    setSearchLoading(true)
    setPage(1)

    const searchParams = {}

    const trimmedSearchDetailValue = searchDetailValue ? searchDetailValue.trim() : ''
    if (!!trimmedSearchDetailValue) {
      searchParams.details = searchDetailValue
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
      navigate(`/inventories/quantity/log`)
    }

    fetchData(1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  async function fetchData(page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/quantity-logs`, {
        params: { page, size: 5, ...searchParams },
      })

      setInventoriesQuantityLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      clearSearchInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function clearSearchInput() {
    setSearchDetailValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setSearchLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setSearchLoading(false))
    }
  }

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchDetailsParamValue = queryParams.get('details')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (searchDetailsParamValue) {
      searchParamsRef.current.details = searchDetailsParamValue
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
        <DataQuantityLog
          authorizePermissions={authorizePermissions}
          inventoryQuantityLogs={inventoriesQuantityLogs}
          error={error}
          loading={searchLoading}
          searchDetailValue={searchDetailValue}
          searchStartDateValue={searchStartDateValue}
          searchEndDateValue={searchEndDateValue}
          page={page}
          totalPage={totalPages}
          handleSearch={handleSearch}
          setSearchDetailValue={setSearchDetailValue}
          setSearchStartDateValue={setSearchStartDateValue}
          setSearchEndDateValue={setSearchEndDateValue}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  )
}

export default DataInventoryLog
