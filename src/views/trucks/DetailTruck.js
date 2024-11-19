import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import { formatToISODate } from '../../utils/DateUtils'
import TableTruckLog from '../../components/trucks/TableTruckLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailTruck = () => {
  const { authorizePermissions } = useAuth()
  const canReadTruckLogs = authorizePermissions.some((perm) => perm.name === 'read-truck-logs')

  const { truckId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [truck, setTruck] = useState({})
  const [truckLogs, setTruckLogs] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [error, setError] = useState('')

  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const searchParamsRef = useRef()

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchTruck(truckId)]

    if (canReadTruckLogs) {
      const queryParams = new URLSearchParams(location.search)
      const searchActivityParamValue = queryParams.get('type')
      const startDateParamValue = queryParams.get('startDate')
      const endDateParamValue = queryParams.get('endDate')

      searchParamsRef.current = {}

      if (matchingTypes.includes(searchActivityParamValue)) {
        searchParamsRef.current.type = searchActivityParamValue
      }
      if (startDateParamValue) {
        searchParamsRef.current.startDate = startDateParamValue
      }
      if (endDateParamValue) {
        searchParamsRef.current.endDate = endDateParamValue
      }

      fetchPromises.push(fetchTruckLogs(truckId, page, searchParamsRef.current))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

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
      navigate(`/trucks/${truckId}/detail`)
    }

    fetchTruckLogs(truckId, 1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  async function fetchTruck(truckId) {
    try {
      const response = await axiosPrivate.get(`/api/trucks/${truckId}`)

      setTruck(response.data.data)
    } catch (e) {
      console.log(e)

      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTruckLogs(truckId, page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/trucks/${truckId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setTruckLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      clearInput()
    } catch (e) {
      console.log(e)
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

      fetchTruckLogs(truckId, newPage, searchParamsRef).finally(() => setSearchLoading(false))
    }
  }

  function clearInput() {
    setSearchTypeValue('')
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
          <CCol md={12} xs={12}>
            <CCard>
              <CCardBody>
                <CCardTitle>{'T' + truck.truckId + ' ' + truck.model}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>Model: {truck.model}</CListGroupItem>
                <CListGroupItem>Plat Nomor: {truck.licensePlate}</CListGroupItem>
                <CListGroupItem>Model: {truck.model}</CListGroupItem>
                <CListGroupItem>Brand: {truck.brand.name}</CListGroupItem>
                <CListGroupItem style={{ display: 'flex', alignItems: 'center' }}>
                  Warna: {truck.color.name}{' '}
                  {truck.color?.rgb && (
                    <div
                      style={{
                        display: 'inline-block',
                        width: '60px',
                        height: '30px',
                        backgroundColor: `${truck.color.rgb}`,
                        marginLeft: '10px',
                        borderRadius: '4px',
                        border: `1px solid ${truck.color.rgb}`,
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.15)',
                        cursor: 'pointer',
                        marginTop: '2px', // Center align with text
                      }}
                      title={`RGB: ${truck.color.rgb}`}
                    />
                  )}
                </CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadTruckLogs && (
            <CCol className="mt-3" md={12} xs={12}>
              <TableTruckLog
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
                truckLogs={truckLogs}
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailTruck
