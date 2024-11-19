import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useLogout from '../../../hooks/useLogout'
import useAuth from '../../../hooks/useAuth'
import { formatToISODate } from '../../../utils/DateUtils'
import TableSaleLog from '../../../components/transactions/sale/TableSaleLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]
const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DataSaleLog = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)

  const [transactionSaleLogs, setPurchasesLogs] = useState([])

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

    if (matchingTypes.includes(searchTypeValue)) {
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
      navigate(`/transactions/sales/log`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
    setSearchTypeValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')
  }

  async function fetchData(page, searchParams) {
    try {
      const response = await axiosPrivate.get('/api/transactions/sales/logs', {
        params: { page: page, size: 5, ...searchParams },
      })

      setPurchasesLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      clearInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response.data.error)
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
    setLoading(true)

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
            <TableSaleLog
              title={'Data Log Transaksi Pembelian'}
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
              transactionSaleLogs={transactionSaleLogs}
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

export default DataSaleLog
