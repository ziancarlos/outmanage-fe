import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableProjectLog from '../../components/projects/TableProjectLog'
import TablePurchaseLog from '../../components/purchases/TablePurchaseLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]
const DataPurchaseLog = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)

  const [purchasesLogs, setPurchasesLogs] = useState([])

  const [error, setError] = useState('')

  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState('')

  const searchParamsRef = useRef()

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  function handleSearch(e) {
    e.preventDefault()

    const searchParams = {}

    if (
      typeOptions[1].value === searchTypeValue ||
      typeOptions[2].value === searchTypeValue ||
      typeOptions[3].value === searchTypeValue
    ) {
      searchParams.type = searchTypeValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = searchStartDateValue
    }

    if (searchEndDateValue) {
      searchParams.endDate = searchEndDateValue
    }

    searchParamsRef.current = searchParams

    setPage(1)

    setSearchLoading(true)

    fetchData(1, searchParams).finally(() => setSearchLoading(false))

    if (searchParams) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/project/data`)
    }

    setSearchTypeValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')
  }

  async function fetchData(page, searchParams) {
    try {
      const response = await axiosPrivate.get('/api/purchases/logs', {
        params: { page: page, size: 5, ...searchParams },
      })

      console.log(response)

      setPurchasesLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
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
      setPaginationLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setPaginationLoading(false))
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
            <TablePurchaseLog
              title={'Purchase Log'}
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
              purchasesLogs={purchasesLogs}
              page={page}
              totalPages={totalPages}
              paginationLoading={paginationLoading}
              handlePageChange={handlePageChange}
              authorizePermissions={authorizePermissions}
            />
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataPurchaseLog
