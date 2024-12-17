import React, { useEffect, useRef, useState } from 'react'
import { CSpinner, useDebouncedCallback } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'

import { formatToISODate } from '../../utils/DateUtils'
import TablePurchase from '../../components/purchases/TablePurchase'

const deliveryStatusOptions = [
  { label: 'Pilih Status Pengiriman', value: '' },
  { label: 'Sudah Selesai', value: 'SUDAH-SELESAI' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Belum Sampai', value: 'BELUM-SAMPAI' },
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

const DataPurchase = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [purchases, setPurchases] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchDeliveryStatusValue, setSearchDeliveryStatusValue] = useState('')
  const [searchPaymentStatusValue, setSearchPaymentStatusValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  async function fetchData(page, searchParams = {}) {
    try {
      const params = { page: page, size: 5, ...searchParams, status: 'BATAL' }

      const response = await axiosPrivate.get('/api/purchases', { params })

      setPurchases(response.data.data)
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
  }, [
    searchDeliveryStatusValue,
    searchPaymentStatusValue,
    searchStartDateValue,
    searchEndDateValue,
  ])

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const deliveryStatusValue = queryParams.get('deliveryStatus')
    const paymentStatusValue = queryParams.get('paymentStatus')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (matchingDeliveryStatus.includes(deliveryStatusValue)) {
      searchParamsRef.current.deliveryStatus = deliveryStatusValue
    }
    if (matchingPaymentStatus.includes(paymentStatusValue)) {
      searchParamsRef.current.paymentStatus = paymentStatusValue
    }
    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (matchingDeliveryStatus.includes(searchDeliveryStatusValue)) {
      searchParams.deliveryStatus = searchDeliveryStatusValue
    }

    if (matchingPaymentStatus.includes(searchPaymentStatusValue)) {
      searchParams.paymentStatus = searchPaymentStatusValue
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
      navigate(`/purchases/cancel`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
    setSearchDeliveryStatusValue('')
    setSearchPaymentStatusValue('')
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
        <TablePurchase
          deliveryStatusOptions={deliveryStatusOptions}
          paymentStatusOptions={paymentStatusOptions}
          navigate={navigate}
          authorizePermissions={authorizePermissions}
          error={error}
          handleSearch={handleSearch}
          searchLoading={searchLoading}
          searchDeliveryStatusValue={searchDeliveryStatusValue}
          setSearchDeliveryStatusValue={setSearchDeliveryStatusValue}
          searchPaymentStatusValue={searchPaymentStatusValue}
          setSearchPaymentStatusValue={setSearchPaymentStatusValue}
          searchStartDateValue={searchStartDateValue}
          searchEndDateValue={searchEndDateValue}
          setSearchStartDateValue={setSearchStartDateValue}
          setSearchEndDateValue={setSearchEndDateValue}
          purchases={purchases}
          page={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  )
}

export default DataPurchase
