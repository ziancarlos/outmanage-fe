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

import { useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableClientLog from '../../components/clients/TableClientLog'
import useAuth from '../../hooks/useAuth'
import TableProject from '../../components/projects/TableProject'
import { formatToISODate } from '../../utils/DateUtils'
import TableSale from '../../components/transactions/sale/TableSale'
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

const DetailClient = () => {
  const { authorizePermissions } = useAuth()
  const canReadClientLogs = authorizePermissions.some((perm) => perm.name === 'read-client-logs')
  const canReadProjects = authorizePermissions.some((perm) => perm.name === 'read-projects')
  const canReadTransactionSales = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sales',
  )
  const canReadTransactionRents = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rents',
  )

  const { clientId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [client, setClient] = useState({})
  const [clientLogs, setClientLogs] = useState([])

  const [clientLogsPage, setClientLogsPage] = useState(1)
  const [setClientLogsTotalPages, setClienLogsTotalPages] = useState(1)
  const [clientLogsSearchTypeValue, setClientLogsSearchTypeValue] = useState('')
  const [clientLogsSearchStartDateValue, setClientLogsSearchStartDateValue] = useState('')
  const [clientLogsSearchEndDateValue, setClientLogsSearchEndDateValue] = useState('')
  const [clientLogsSearchLoading, setClientLogsSearchLoading] = useState(false)
  const [clientLogsError, setClientLogsError] = useState('')
  const clientSearchParamsRef = useRef()

  const [projectsError, setProjectsError] = useState('')
  const [projectsSearchValue, setProjectsSearchValue] = useState('')
  const [projectsSearchLoading, setProjectsSearchLoading] = useState(false)
  const [projectsPage, setProjectsPage] = useState(1)
  const [projectsTotalPages, setProjectsTotalPages] = useState(1)
  const projectSearchParamsRef = useRef()

  const [transactionSales, setTransactionSales] = useState([])

  const [transactionSalesSearchStartDateValue, setTransactionSalesSearchStartDateValue] =
    useState('')
  const [transactionSalesSearchEndDateValue, setTransactionSalesSearchEndDateValue] = useState('')
  const [transactionSalesSearchDeliveryStatusValue, setTransactionSalesSearchDeliveryStatusValue] =
    useState('')
  const [transactionSalesSearchPaymentStatusValue, setTransactionSalesSearchPaymentStatusValue] =
    useState('')
  const [transactionSalesPage, setTransactionSalesPage] = useState(1)
  const [transactionSalesTotalPages, setTransactionSalesTotalPages] = useState(1)
  const [transactionSalesSearchLoading, setTransactionSalesSearchLoading] = useState(false)
  const transactionSalesSearchParamsRef = useRef()
  const [transactionSalesError, setTransactionSalesError] = useState('')

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

  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setClientLogsError('')
  }, [clientLogsSearchTypeValue, clientLogsSearchStartDateValue, clientLogsSearchEndDateValue])

  useEffect(() => {
    setTransactionSalesError('')
  }, [
    transactionSalesSearchStartDateValue,
    transactionSalesSearchEndDateValue,
    transactionSalesSearchDeliveryStatusValue,
    transactionSalesSearchPaymentStatusValue,
  ])

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

    const fetchPromises = [fetchClient(clientId)]

    const searchParams = new URLSearchParams(location.search)

    if (canReadClientLogs) {
      const clientLogParam = searchParams.get('clientLog')

      if (!!clientLogParam) {
        try {
          const parsedParams = JSON.parse(clientLogParam)
          clientSearchParamsRef.current = {}

          if (matchingTypes.includes(parsedParams.type)) {
            clientSearchParamsRef.current.type = parsedParams.type
          }
          if (parsedParams.startDate) {
            clientSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            clientSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearClientLogsSearchInput()
        }
      }

      fetchPromises.push(fetchClientLogs(clientId, clientLogsPage, clientSearchParamsRef.current))
    }

    if (canReadTransactionSales) {
      const transactionSaleParam = searchParams.get('transactionSales')

      if (!!transactionSaleParam) {
        try {
          const parsedParams = JSON.parse(transactionSaleParam)
          transactionSalesSearchParamsRef.current = {}

          if (matchingDeliveryStatus.includes(parsedParams.deliveryStatus)) {
            transactionSalesSearchParamsRef.current.deliveryStatus = parsedParams.deliveryStatus
          }
          if (matchingPaymentStatus.includes(parsedParams.paymentStatus)) {
            transactionSalesSearchParamsRef.current.paymentStatus = parsedParams.paymentStatus
          }
          if (parsedParams.startDate) {
            transactionSalesSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            transactionSalesSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearTransactionSaleSearchInput()
        }
      }

      fetchPromises.push(
        fetchTransactionSale(
          clientId,
          transactionSalesPage,
          transactionSalesSearchParamsRef.current,
        ),
      )
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
        fetchTransactionRent(clientId, transactionRentPage, transactionRentSearchParamsRef.current),
      )
    }

    if (canReadProjects) {
      const projectsSearchParam = searchParams.get('search')

      const trimmedSearchValue = projectsSearchParam ? projectsSearchParam.trim() : ''

      if (!!trimmedSearchValue) {
        projectSearchParamsRef.current = projectsSearchParam
      }

      fetchPromises.push(fetchProjects(clientId, projectsPage, projectsSearchParam))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

  function clearTransactionSaleSearchInput() {
    setTransactionSalesSearchDeliveryStatusValue('')
    setTransactionSalesSearchPaymentStatusValue('')
    setTransactionSalesSearchStartDateValue('')
    setTransactionSalesSearchEndDateValue('')
  }

  function clearTransactionRentSearchInput() {
    setTransactionRentSearchDeliveryStatusValue('')
    setTransactionRentSearchPaymentStatusValue('')
    setTransactionRentSearchStartDateValue('')
    setTransactionRentSearchEndDateValue('')
  }

  function transactionSaleHandleSearch(e) {
    e.preventDefault()
    setTransactionSalesSearchLoading(true)
    setTransactionSalesPage(1)

    const searchParams = {}

    if (matchingDeliveryStatus.includes(transactionSalesSearchDeliveryStatusValue)) {
      searchParams.deliveryStatus = transactionSalesSearchDeliveryStatusValue
    }

    if (matchingPaymentStatus.includes(transactionSalesSearchPaymentStatusValue)) {
      searchParams.paymentStatus = transactionSalesSearchPaymentStatusValue
    }

    if (transactionSalesSearchStartDateValue) {
      searchParams.startDate = formatToISODate(transactionSalesSearchStartDateValue)
    }

    if (transactionSalesSearchEndDateValue) {
      searchParams.endDate = formatToISODate(transactionSalesSearchEndDateValue)
    }

    transactionSalesSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('transactionSales', JSON.stringify(searchParams))
    } else {
      newParams.delete('transactionSales')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchTransactionSale(clientId, 1, clientSearchParamsRef.current).finally(() =>
      setTransactionSalesSearchLoading(false),
    )

    clearTransactionSaleSearchInput()
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

    fetchTransactionRent(clientId, 1, clientSearchParamsRef.current).finally(() =>
      setTransactionRentSearchLoading(false),
    )

    clearTransactionRentSearchInput()
  }

  function clientLogHandleSearch(e) {
    e.preventDefault()
    setClientLogsSearchLoading(true)
    setClientLogsPage(1)

    const searchParams = {}

    if (matchingTypes.includes(clientLogsSearchTypeValue)) {
      searchParams.type = clientLogsSearchTypeValue
    }

    if (clientLogsSearchStartDateValue) {
      searchParams.startDate = formatToISODate(clientLogsSearchStartDateValue)
    }

    if (clientLogsSearchEndDateValue) {
      searchParams.endDate = formatToISODate(clientLogsSearchEndDateValue)
    }

    clientSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('clientLog', JSON.stringify(searchParams))
    } else {
      newParams.delete('clientLog')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchClientLogs(clientId, 1, clientSearchParamsRef.current).finally(() =>
      setClientLogsSearchLoading(false),
    )
  }

  function projectsHandleSearch(e) {
    e.preventDefault()
    setProjectsSearchLoading(true)
    setProjectsPage(1)

    const newParams = new URLSearchParams(location.search)

    projectSearchParamsRef.current = null

    const trimmedSearchValue = projectsSearchValue ? projectsSearchValue.trim() : ''

    if (!!trimmedSearchValue) {
      projectSearchParamsRef.current = projectsSearchValue

      newParams.set('search', projectSearchParamsRef.current)
    } else {
      newParams.delete('search')
    }

    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })

    fetchProjects(clientId, 1, projectSearchParamsRef.current).finally(() =>
      setProjectsSearchLoading(false),
    )
  }

  function clearClientLogsSearchInput() {
    setClientLogsSearchTypeValue('')
    setClientLogsSearchStartDateValue('')
    setClientLogsSearchEndDateValue('')
  }

  async function fetchClient(clientId) {
    try {
      const response = await axiosPrivate.get(`/api/clients/${clientId}`)

      setClient(response.data.data)
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

  async function fetchClientLogs(clientId, page, searchParams = {}) {
    try {
      console.log(searchParams)
      const response = await axiosPrivate.get(`/api/clients/${clientId}/logs`, {
        params: { page, size: 3, ...searchParams },
      })

      setClientLogs(response.data.data)
      setClienLogsTotalPages(response.data.paging.totalPage)
      setClientLogsPage(response.data.paging.page)

      clearClientLogsSearchInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setClientLogsError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchProjects(clientId, page, value = null) {
    try {
      const params = !!value
        ? { name: value, clientId, page: page, size: 5 }
        : { clientId, page: page, size: 5 }

      const response = await axiosPrivate.get('/api/projects', { params })

      setProjects(response.data.data)
      setProjectsTotalPages(response.data.paging.totalPage)
      setProjectsPage(response.data.paging.page)

      setProjectsSearchValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setProjectsError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTransactionSale(clientId, page, value = null) {
    try {
      const params = !!value ? { clientId } : { clientId, page: page, size: 5 }

      const response = await axiosPrivate.get('/api/transactions/sales', { params })

      setTransactionSales(response.data.data)
      setTransactionSalesTotalPages(response.data.paging.totalPage)
      setTransactionSalesPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setTransactionSalesError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTransactionRent(clientId, page, value = null) {
    try {
      const params = !!value ? { clientId } : { clientId, page: page, size: 5 }

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

  function clientLogHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= setClientLogsTotalPages && newPage !== clientLogsPage) {
      setClientLogsPage(newPage)

      setClientLogsSearchLoading(true)

      fetchClientLogs(clientId, newPage, clientSearchParamsRef.current).finally(() =>
        setClientLogsSearchLoading(false),
      )
    }
  }

  function transactionSaleHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= transactionSalesTotalPages && newPage !== transactionSalesPage) {
      setTransactionSalesPage(newPage)

      setTransactionSalesSearchLoading(true)

      fetchTransactionSale(clientId, newPage, transactionSalesSearchParamsRef.current).finally(() =>
        setTransactionSalesSearchLoading(false),
      )
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

  function projectsHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= projectsTotalPages && newPage !== projectsPage) {
      setProjectsPage(newPage)

      setProjectsSearchLoading(true)

      fetchProjects(clientId, newPage, projectSearchParamsRef.current).finally(() =>
        setProjectsSearchLoading(false),
      )
    }
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol md={12} xs={12} className="mb-3">
            <CCard>
              <CCardBody>
                <CCardTitle>{'C' + client.clientId}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>Nama: {client.name}</CListGroupItem>
                <CListGroupItem>No. Hp: {client.phoneNumber}</CListGroupItem>
                {!!client.email && <CListGroupItem>Email: {client.email}</CListGroupItem>}
                <CListGroupItem>Alamat: {client.address}</CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadProjects && (
            <CCol className="mb-3" md={12} xs={12}>
              <TableProject
                error={projectsError}
                handleSearch={projectsHandleSearch}
                searchValue={projectsSearchValue}
                setSearchValue={setProjectsSearchValue}
                searchLoading={projectsSearchLoading}
                projects={projects}
                page={projectsPage}
                totalPages={projectsTotalPages}
                handlePageChange={projectsHandlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}

          {canReadTransactionSales && (
            <CCol className="mb-3" md={12} xs={12}>
              <TableSale
                deliveryStatusOptions={deliveryStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                navigate={navigate}
                authorizePermissions={authorizePermissions}
                error={transactionSalesError}
                handleSearch={transactionSaleHandleSearch}
                searchLoading={transactionSalesSearchLoading}
                searchDeliveryStatusValue={transactionSalesSearchDeliveryStatusValue}
                setSearchDeliveryStatusValue={setTransactionSalesSearchDeliveryStatusValue}
                searchPaymentStatusValue={transactionSalesSearchPaymentStatusValue}
                setSearchPaymentStatusValue={setTransactionSalesSearchPaymentStatusValue}
                searchStartDateValue={transactionSalesSearchStartDateValue}
                searchEndDateValue={transactionSalesSearchEndDateValue}
                setSearchStartDateValue={setTransactionSalesSearchStartDateValue}
                setSearchEndDateValue={setTransactionSalesSearchEndDateValue}
                transactionSales={transactionSales}
                page={transactionSalesPage}
                totalPages={transactionSalesTotalPages}
                handlePageChange={transactionSaleHandlePageChange}
              />
            </CCol>
          )}

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

          {canReadClientLogs && (
            <CCol xs={12} className="mb-3">
              <TableClientLog
                error={clientLogsError}
                handleSearch={clientLogHandleSearch}
                typeOptions={typeOptions}
                searchTypeValue={clientLogsSearchTypeValue}
                setSearchTypeValue={setClientLogsSearchTypeValue}
                searchStartDateValue={clientLogsSearchStartDateValue}
                setSearchStartDateValue={setClientLogsSearchStartDateValue}
                searchEndDateValue={clientLogsSearchEndDateValue}
                setSearchEndDateValue={setClientLogsSearchEndDateValue}
                searchLoading={clientLogsSearchLoading}
                clientsLogs={clientLogs}
                page={clientLogsPage}
                totalPages={setClientLogsTotalPages}
                handlePageChange={clientLogHandlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailClient
