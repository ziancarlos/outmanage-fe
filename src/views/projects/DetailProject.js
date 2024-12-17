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

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import { formatToISODate } from '../../utils/DateUtils'
import TableProjectLog from '../../components/projects/TableProjectLog'
import TableRent from '../../components/transactions/rent/TableRent'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const deliveryStatusOptions = [
  { label: 'Pilih Status Pengiriman', value: '' },
  { label: 'Sudah Selesai', value: 'SUDAH-SELESAI' },
  { label: 'Proses', value: 'PROSES' },
  { label: 'Belum Dikirim', value: 'BELUM-DIKIRIM' },
]

const returnedStatusOptions = [
  { label: 'Pilih Status Pengiriman', value: '' },
  { label: 'Sudah Dikembalikan', value: 'SUDAH-DIBALIKAN' },
  { label: 'Proses', value: 'PROSES' },
  { label: 'Belum Dikembalikan', value: 'BELUM-DIBALIKAN' },
]

const paymentStatusOptions = [
  { label: 'Pilih Status Pembayaran', value: '' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Belum Lunas', value: 'BELUM-LUNAS' },
]

const matchingDeliveryStatus = deliveryStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const matchingReturnedStatus = returnedStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const matchingPaymentStatus = paymentStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const DetailProject = () => {
  const { authorizePermissions } = useAuth()
  const canReadProjectLogs = authorizePermissions.some((perm) => perm.name === 'read-project-logs')
  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadTransactionRents = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rents',
  )

  const { projectId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [project, setProject] = useState({})
  const [projectLogs, setProjectLogs] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [error, setError] = useState('')

  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParamsRef = useRef()

  const [transactionRents, setTransactionRents] = useState([])
  const [transactionRentSearchStartDateValue, setTransactionRentSearchStartDateValue] = useState('')
  const [transactionRentSearchEndDateValue, setTransactionRentSearchEndDateValue] = useState('')
  const [transactionRentSearchDeliveryStatusValue, setTransactionRentSearchDeliveryStatusValue] =
    useState('')
  const [transactionRentSearchReturnStatusValue, setTransactionRentSearchReturnStatusValue] =
    useState('')
  const [transactionRentSearchPaymentStatusValue, setTransactionRentSearchPaymentStatusValue] =
    useState('')
  const [transactionRentPage, setTransactionRentPage] = useState(1)
  const [transactionRentTotalPages, setTransactionRentTotalPages] = useState(1)
  const [transactionRentSearchLoading, setTransactionRentSearchLoading] = useState(false)
  const transactionRentSearchParamsRef = useRef()
  const [transactionRentError, setTransactionRentError] = useState('')

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  useEffect(() => {
    setTransactionRentError('')
  }, [
    transactionRentSearchStartDateValue,
    transactionRentSearchEndDateValue,
    transactionRentSearchDeliveryStatusValue,
    transactionRentSearchPaymentStatusValue,
  ])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchProject(projectId)]
    const searchParams = new URLSearchParams(location.search)

    if (canReadProjectLogs) {
      const projectLogParam = searchParams.get('projectLog')

      if (!!projectLogParam) {
        try {
          const parsedParams = JSON.parse(projectLogParam)
          searchParamsRef.current = {}

          if (matchingTypes.includes(parsedParams.type)) {
            searchParamsRef.current.type = parsedParams.type
          }
          if (parsedParams.startDate) {
            searchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            searchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearInput()
        }
      }

      fetchPromises.push(fetchProjectLogs(projectId, page, searchParamsRef.current))
    }

    if (canReadTransactionRents) {
      const transactionRentParam = searchParams.get('transactionRent')

      if (!!transactionRentParam) {
        try {
          const parsedParams = JSON.parse(transactionRentParam)
          transactionRentSearchParamsRef.current = {}

          if (matchingDeliveryStatus.includes(parsedParams.deliveryStatus)) {
            transactionRentSearchParamsRef.current.deliveryStatus = parsedParams.deliveryStatus
          }
          if (matchingDeliveryStatus.includes(parsedParams.returnStatus)) {
            transactionRentSearchParamsRef.current.returnStatus = parsedParams.returnStatus
          }
          if (matchingPaymentStatus.includes(parsedParams.paymentStatus)) {
            transactionRentSearchParamsRef.current.paymentStatus = parsedParams.paymentStatus
          }
          if (parsedParams.startDate) {
            transactionRentSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            transactionRentSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearTransactionRentSearchInput()
        }
      }

      fetchPromises.push(
        fetchTransactionRent(
          projectId,
          transactionRentPage,
          transactionRentSearchParamsRef.current,
        ),
      )
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

  function clearTransactionRentSearchInput() {
    setTransactionRentSearchDeliveryStatusValue('')
    setTransactionRentSearchPaymentStatusValue('')
    setTransactionRentSearchStartDateValue('')
    setTransactionRentSearchEndDateValue('')
  }

  function transactionRentHandleSearch(e) {
    e.preventDefault()
    setTransactionRentSearchLoading(true)
    setTransactionRentPage(1)

    const searchParams = {}

    if (matchingDeliveryStatus.includes(transactionRentSearchDeliveryStatusValue)) {
      searchParams.deliveryStatus = transactionRentSearchDeliveryStatusValue
    }
    if (matchingReturnedStatus.includes(transactionRentSearchReturnStatusValue)) {
      searchParams.returnStatus = transactionRentSearchReturnStatusValue
    }

    if (matchingPaymentStatus.includes(transactionRentSearchPaymentStatusValue)) {
      searchParams.paymentStatus = transactionRentSearchPaymentStatusValue
    }

    if (transactionRentSearchStartDateValue) {
      searchParams.startDate = formatToISODate(transactionRentSearchStartDateValue)
    }

    if (transactionRentSearchEndDateValue) {
      searchParams.endDate = formatToISODate(transactionRentSearchEndDateValue)
    }

    transactionRentSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('transactionRent', JSON.stringify(searchParams))
    } else {
      newParams.delete('transactionRent')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchTransactionRent(projectId, 1, transactionRentSearchParamsRef.current).finally(() =>
      setTransactionRentSearchLoading(false),
    )

    clearTransactionRentSearchInput()
  }

  async function fetchTransactionRent(projectId, page, value = null) {
    try {
      const params = !!value ? { projectId } : { projectId, page: page, size: 5 }

      const response = await axiosPrivate.get('/api/transactions/rents', { params })

      setTransactionRents(response.data.data)
      setTransactionRentTotalPages(response.data.paging.totalPage)
      setTransactionRentPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setTransactionRentError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

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

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('projectLog', JSON.stringify(searchParams))
    } else {
      newParams.delete('projectLog')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchProjectLogs(projectId, 1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  async function fetchProject(projectId) {
    try {
      const response = await axiosPrivate.get(`/api/projects/${projectId}`)

      setProject(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchProjectLogs(projectId, page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/projects/${projectId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setProjectLogs(response.data.data)
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

      fetchProjectLogs(projectId, newPage, searchParamsRef).finally(() => setSearchLoading(false))
    }
  }

  function transactionRentHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= transactionRentTotalPages && newPage !== transactionRentPage) {
      setTransactionRentPage(newPage)

      setTransactionRentSearchLoading(true)

      fetchTransactionRent(clientId, newPage, transactionRentSearchParamsRef.current).finally(() =>
        setTransactionRentSearchLoading(false),
      )
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
          <CCol md={12} xs={12} className={'mb-3'}>
            <CCard>
              <CCardBody>
                <CCardTitle>{'P' + project.projectId + ' ' + project.name}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Klien:{' '}
                  {canReadClient ? (
                    <NavLink to={`/clients/${project.client.clientId}/detail`}>
                      {project.client.name}
                    </NavLink>
                  ) : (
                    project.client.name
                  )}
                </CListGroupItem>
                <CListGroupItem>Alamat: {project.address}</CListGroupItem>
                {project.description && (
                  <CListGroupItem>Deskripsi: {project.description}</CListGroupItem>
                )}
              </CListGroup>
            </CCard>
          </CCol>

          {canReadTransactionRents && (
            <CCol className="mb-3" md={12} xs={12}>
              <TableRent
                deliveryStatusOptions={deliveryStatusOptions}
                returnedStatusOptions={returnedStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                navigate={navigate}
                authorizePermissions={authorizePermissions}
                error={transactionRentError}
                handleSearch={transactionRentHandleSearch}
                searchLoading={transactionRentSearchLoading}
                searchDeliveryStatusValue={transactionRentSearchDeliveryStatusValue}
                setSearchDeliveryStatusValue={setTransactionRentSearchDeliveryStatusValue}
                searchReturnedStatusValue={transactionRentSearchReturnStatusValue}
                setSearchReturnedStatusValue={setTransactionRentSearchReturnStatusValue}
                searchPaymentStatusValue={transactionRentSearchPaymentStatusValue}
                setSearchPaymentStatusValue={setTransactionRentSearchPaymentStatusValue}
                searchStartDateValue={transactionRentSearchStartDateValue}
                searchEndDateValue={transactionRentSearchEndDateValue}
                setSearchStartDateValue={setTransactionRentSearchStartDateValue}
                setSearchEndDateValue={setTransactionRentSearchEndDateValue}
                transactionRents={transactionRents}
                page={transactionRentPage}
                totalPages={transactionRentTotalPages}
                handlePageChange={transactionRentHandlePageChange}
              />
            </CCol>
          )}

          {canReadProjectLogs && (
            <CCol md={12} xs={12} className="mb-3">
              <TableProjectLog
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
                projectsLogs={projectLogs}
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

export default DetailProject
