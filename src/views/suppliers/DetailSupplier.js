import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react-pro'

import { useLocation, useNavigate, useParams } from 'react-router-dom'

import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import TableSupplierLog from '../../components/suppliers/TableSupplierLog'
import { formatToISODate } from '../../utils/DateUtils'
import TablePurchase from '../../components/purchases/TablePurchase'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]

const deliveryStatusOptions = [
  { label: 'Pilih Status Pengiriman', value: '' },
  { label: 'Sudah Selesai', value: 'SUDAH-SELESAI' },
  { label: 'Belum Selesai', value: 'BELUM-SELESAI' },
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

const matchingPaymentStatus = paymentStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailSupplier = () => {
  const { authorizePermissions } = useAuth()
  const canReadSupplierLog = authorizePermissions.some((perm) => perm.name === 'read-supplier-logs')
  const canReadPurchases = authorizePermissions.some((perm) => perm.name === 'read-purchases')

  const { supplierId } = useParams()

  const logout = useLogout()
  const location = useLocation()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [supplier, setSupplier] = useState({})

  const [loading, setLoading] = useState(true)

  const [supplierLogs, setSupplierLogs] = useState([])
  const [supplierLogsPage, setSupplierLogsPage] = useState(1)
  const [supplierLogsTotalPage, setSupplierLogsTotalPages] = useState(1)
  const [supplierLogsSearchTypeValue, setSupplierLogsSearchTypeValue] = useState('')
  const [supplierLogsSearchStartDateValue, setSupplierLogsSearchStartDateValue] = useState('')
  const [supplierLogsSearchEndDateValue, setSupplierLogsSearchEndDateValue] = useState('')
  const [supplierLogsSearchLoading, setSupplierLogsSearchLoading] = useState(false)
  const [supplierLogsError, setSupplierLogsError] = useState('')
  const supplierSearchParamsRef = useRef()

  const [purchases, setPurchases] = useState([])
  const [purchasesPage, setPurchasesPage] = useState(1)
  const [purchasesTotalPages, setPurchasesTotalPages] = useState(1)
  const [purchasesSearchLoading, setPurchasesSearchLoading] = useState(false)

  const [purchasesSearchStartDateValue, setPurchasesSearchStartDateValue] = useState('')
  const [purchasesSearchEndDateValue, setPurchasesSearchEndDateValue] = useState('')
  const [purchasesSearchDeliveryStatusValue, setPurchasesSearchDeliveryStatusValue] = useState('')
  const [purchasesSearchPaymentStatusValue, setPurchasesSearchPaymentStatusValue] = useState('')
  const [purchasesError, setPurchasesError] = useState('')
  const purchasesSearchParamsRef = useRef()

  useEffect(() => {
    setSupplierLogsError('')
  }, [
    supplierLogsSearchTypeValue,
    supplierLogsSearchStartDateValue,
    supplierLogsSearchEndDateValue,
  ])

  useEffect(() => {
    setPurchasesError('')
  }, [
    purchasesSearchStartDateValue,
    purchasesSearchEndDateValue,
    purchasesSearchDeliveryStatusValue,
    purchasesSearchPaymentStatusValue,
  ])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchSupplier(supplierId)]

    const searchParams = new URLSearchParams(location.search)

    if (canReadSupplierLog) {
      const supplierLogParam = searchParams.get('supplierLog')

      if (!!supplierLogParam) {
        try {
          const parsedParams = JSON.parse(supplierLogParam)

          supplierSearchParamsRef.current = {}

          if (matchingTypes.includes(parsedParams.type)) {
            supplierSearchParamsRef.current.type = parsedParams.type
          }
          if (parsedParams.startDate) {
            supplierSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            supplierSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearSupplierLogsSearchInput()
        }
      }

      fetchPromises.push(fetchSupplierLog(supplierId, 1, supplierSearchParamsRef.current))
    }

    if (canReadPurchases) {
      const purchasesParam = searchParams.get('purchases')

      if (!!purchasesParam) {
        try {
          const parsedParams = JSON.parse(purchasesParam)

          purchasesSearchParamsRef.current = {}

          if (matchingDeliveryStatus.includes(parsedParams.deliveryStatus)) {
            purchasesSearchParamsRef.current.deliveryStatus = parsedParams.deliveryStatus
          }
          if (matchingPaymentStatus.includes(parsedParams.paymentStatus)) {
            purchasesSearchParamsRef.current.paymentStatus = parsedParams.paymentStatus
          }
          if (parsedParams.startDate) {
            purchasesSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            purchasesSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearPurchasesSearchInput()
        }
      }

      fetchPromises.push(fetchPurchases(supplierId, 1, purchasesSearchParamsRef.current))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

  async function fetchPurchases(supplierId, page, searchParams = {}) {
    try {
      searchParams = { supplierId, ...searchParams }
      const params = { page: page, size: 5, ...searchParams }

      console.log(params)

      const response = await axiosPrivate.get('/api/purchases', { params })

      setPurchases(response.data.data)
      setPurchasesTotalPages(response.data.paging.totalPage)
      setPurchasesPage(response.data.paging.page)

      clearPurchasesSearchInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setPurchasesError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function purchasesHandleSearch(e) {
    e.preventDefault()

    setPurchasesSearchLoading(true)

    setPurchasesPage(1)

    const searchParams = {}

    if (matchingDeliveryStatus.includes(purchasesSearchDeliveryStatusValue)) {
      searchParams.deliveryStatus = purchasesSearchDeliveryStatusValue
    }

    if (matchingPaymentStatus.includes(purchasesSearchPaymentStatusValue)) {
      searchParams.paymentStatus = purchasesSearchPaymentStatusValue
    }

    if (purchasesSearchStartDateValue) {
      searchParams.startDate = formatToISODate(purchasesSearchStartDateValue)
    }

    if (purchasesSearchEndDateValue) {
      searchParams.endDate = formatToISODate(purchasesSearchEndDateValue)
    }

    purchasesSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('purchases', JSON.stringify(searchParams))
    } else {
      newParams.delete('purchases')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchPurchases(supplierId, 1, purchasesSearchParamsRef.current).finally(() =>
      setPurchasesSearchLoading(false),
    )
  }

  function clearPurchasesSearchInput() {
    setPurchasesSearchDeliveryStatusValue('')
    setPurchasesSearchPaymentStatusValue('')
    setPurchasesSearchStartDateValue('')
    setPurchasesSearchEndDateValue('')
  }

  function supplierLogHandleSearch(e) {
    e.preventDefault()
    setSupplierLogsSearchLoading(true)
    setSupplierLogsPage(1)

    const searchParams = {}

    if (matchingTypes.includes(supplierLogsSearchTypeValue)) {
      searchParams.type = supplierLogsSearchTypeValue
    }

    if (supplierLogsSearchStartDateValue) {
      searchParams.startDate = formatToISODate(supplierLogsSearchStartDateValue)
    }

    if (supplierLogsSearchEndDateValue) {
      searchParams.endDate = formatToISODate(supplierLogsSearchEndDateValue)
    }

    supplierSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('supplierLog', JSON.stringify(searchParams))
    } else {
      newParams.delete('supplierLog')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchSupplierLog(supplierId, 1, supplierSearchParamsRef.current).finally(() =>
      setSupplierLogsSearchLoading(false),
    )
  }

  function clearSupplierLogsSearchInput() {
    setSupplierLogsSearchTypeValue('')
    setSupplierLogsSearchStartDateValue('')
    setSupplierLogsSearchEndDateValue('')
  }

  async function fetchSupplier(supplierId) {
    try {
      const response = await axiosPrivate.get(`/api/suppliers/${supplierId}`)

      setSupplier(response.data.data)
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

  async function fetchSupplierLog(supplierId, page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/suppliers/${supplierId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setSupplierLogs(response.data.data)
      setSupplierLogsTotalPages(response.data.paging.totalPage)
      setSupplierLogsPage(response.data.paging.page)

      clearSupplierLogsSearchInput()
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

  function supplierLogHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= supplierLogsTotalPage && newPage !== supplierLogsPage) {
      setSupplierLogsPage(newPage)

      setLoading(true)

      fetchSupplierLog(supplierId, newPage, supplierSearchParamsRef.current).finally(() =>
        setLoading(false),
      )
    }
  }

  function purchasesHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= purchasesTotalPages && newPage !== purchasesPage) {
      setSupplierLogsPage(newPage)

      setPurchasesSearchLoading(true)

      setPurchases(supplierId, newPage, supplierSearchParamsRef.current).finally(() =>
        setPurchasesSearchLoading(false),
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
                <CCardTitle>{'#' + supplier.supplierId + ' ' + supplier.name}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                {!!supplier.email && <CListGroupItem>Email: {supplier.email}</CListGroupItem>}
                <CListGroupItem>Nomor Handphone: {supplier.phoneNumber}</CListGroupItem>
                <CListGroupItem>Alamat: {supplier.address}</CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadPurchases && (
            <TablePurchase
              deliveryStatusOptions={deliveryStatusOptions}
              paymentStatusOptions={paymentStatusOptions}
              navigate={navigate}
              authorizePermissions={authorizePermissions}
              error={purchasesError}
              handleSearch={purchasesHandleSearch}
              searchLoading={purchasesSearchLoading}
              searchDeliveryStatusValue={purchasesSearchDeliveryStatusValue}
              setSearchDeliveryStatusValue={setPurchasesSearchDeliveryStatusValue}
              searchPaymentStatusValue={purchasesSearchPaymentStatusValue}
              setSearchPaymentStatusValue={setPurchasesSearchPaymentStatusValue}
              searchStartDateValue={purchasesSearchStartDateValue}
              searchEndDateValue={purchasesSearchEndDateValue}
              setSearchStartDateValue={setPurchasesSearchStartDateValue}
              setSearchEndDateValue={setPurchasesSearchEndDateValue}
              purchases={purchases}
              page={purchasesPage}
              totalPages={purchasesTotalPages}
              handlePageChange={purchasesHandlePageChange}
            />
          )}

          {canReadSupplierLog && (
            <CCol xs={12}>
              <TableSupplierLog
                title={'Data Log Pemasok'}
                error={supplierLogsError}
                handleSearch={supplierLogHandleSearch}
                typeOptions={typeOptions}
                searchTypeValue={supplierLogsSearchTypeValue}
                setSearchTypeValue={setSupplierLogsSearchTypeValue}
                searchStartDateValue={supplierLogsSearchStartDateValue}
                setSearchStartDateValue={setSupplierLogsSearchStartDateValue}
                searchEndDateValue={supplierLogsSearchEndDateValue}
                setSearchEndDateValue={setSupplierLogsSearchEndDateValue}
                searchLoading={supplierLogsSearchLoading}
                suppliersLogs={supplierLogs}
                page={supplierLogsPage}
                totalPages={supplierLogsTotalPage}
                handlePageChange={supplierLogHandlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailSupplier
