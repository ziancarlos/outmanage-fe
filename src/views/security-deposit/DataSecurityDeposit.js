import React, { useEffect, useRef, useState } from 'react'
import { CSpinner } from '@coreui/react-pro'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'

import { formatToISODate } from '../../utils/DateUtils'
import TableSecurityDeposit from '../../components/security-deposit/TableSecurityDeposit'

const paymentStatusOptions = [
  { label: 'Pilih Status Pembayaran', value: '' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Belum Lunas', value: 'BELUM-LUNAS' },
]
const returnPaymentStatusOptions = [
  { label: 'Pilih Status Pengembalian', value: '' },
  { label: 'Dikembalikan', value: 'DIKEMBALIKAN' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
  { label: 'Belum Dikembalikan', value: 'BELUM-DIKEMBALIKAN' },
]

const matchingPaymentStatus = paymentStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const matchingReturnPaymentStatus = returnPaymentStatusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const DataSecurityDeposit = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [securityDeposits, setSecurityDeposits] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchPaymentStatusValue, setSearchPaymentStatusValue] = useState('')
  const [searchReturnPaymentStatusValue, setSearchReturnPaymentStatusValue] = useState('')

  const searchParamsRef = useRef()

  const [error, setError] = useState('')

  async function fetchData(page, searchParams = {}) {
    try {
      const params = { page: page, size: 5, ...searchParams }

      const response = await axiosPrivate.get('/api/deposits', { params })

      console.log(response)
      setSecurityDeposits(response.data.data)
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
    searchReturnPaymentStatusValue,
    searchPaymentStatusValue,
    searchStartDateValue,
    searchEndDateValue,
  ])

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const paymentStatusValue = queryParams.get('paymentStatus')
    const returnPaymentStatusValue = queryParams.get('returnPaymentStatus')

    searchParamsRef.current = {}

    if (matchingPaymentStatus.includes(paymentStatusValue)) {
      searchParamsRef.current.paymentStatus = paymentStatusValue
    }
    if (matchingReturnPaymentStatus.includes(returnPaymentStatusValue)) {
      searchParamsRef.current.returnPaymentStatus = returnPaymentStatusValue
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (matchingPaymentStatus.includes(searchPaymentStatusValue)) {
      searchParams.paymentStatus = searchPaymentStatusValue
    }

    if (matchingReturnPaymentStatus.includes(searchReturnPaymentStatusValue)) {
      searchParams.returnPaymentStatus = searchReturnPaymentStatusValue
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/deposits/data`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  function clearInput() {
    setSearchReturnPaymentStatusValue('')
    setSearchPaymentStatusValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <TableSecurityDeposit
          paymentStatusOptions={paymentStatusOptions}
          returnPaymentStatusOptions={returnPaymentStatusOptions}
          navigate={navigate}
          authorizePermissions={authorizePermissions}
          error={error}
          handleSearch={handleSearch}
          searchLoading={searchLoading}
          searchPaymentStatusValue={searchPaymentStatusValue}
          setSearchPaymentStatusValue={setSearchPaymentStatusValue}
          searchReturnPaymentStatusValue={searchReturnPaymentStatusValue}
          setSearchReturnPaymentStatusValue={setSearchReturnPaymentStatusValue}
          securityDeposits={securityDeposits}
          page={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  )
}

export default DataSecurityDeposit
