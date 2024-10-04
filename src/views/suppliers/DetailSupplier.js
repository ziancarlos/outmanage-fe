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

import { useNavigate, useParams } from 'react-router-dom'

import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import TableSupplierLog from '../../components/suppliers/TableSupplierLog'
import { formatToISODate } from '../../utils/DateUtils'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const DetailSupplier = () => {
  const { authorizePermissions } = useAuth()
  const canReadSupplierLog = authorizePermissions.some((perm) => perm.name === 'read-supplier-logs')

  const { supplierId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [supplier, setSupplier] = useState({})
  const [supplierLogs, setSupplierLogs] = useState([])

  const [supplierLogsPage, setSupplierLogsPage] = useState(1)
  const [supplierLogsTotalPage, setSupplierLogsTotalPages] = useState(1)
  const [supplierLogsSearchTypeValue, setSupplierLogsSearchTypeValue] = useState('')
  const [supplierLogsSearchStartDateValue, setSupplierLogsSearchStartDateValue] = useState('')
  const [supplierLogsSearchEndDateValue, setSupplierLogsSearchEndDateValue] = useState('')
  const [supplierLogsSearchLoading, setSupplierLogsSearchLoading] = useState(false)
  const [supplierLogsError, setSupplierLogsError] = useState('')
  const supplierSearchParamsRef = useRef()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSupplierLogsError('')
  }, [
    supplierLogsSearchTypeValue,
    supplierLogsSearchStartDateValue,
    supplierLogsSearchEndDateValue,
  ])

  useEffect(() => {
    setLoading(true)

    if (canReadSupplierLog) {
      const queryParams = new URLSearchParams(location.search)
      const searchTypeParamValue = queryParams.get('type')
      const startDateParamValue = queryParams.get('startDate')
      const endDateParamValue = queryParams.get('endDate')

      supplierSearchParamsRef.current = {}

      if (searchTypeParamValue) {
        supplierSearchParamsRef.current.type = searchTypeParamValue
      }
      if (startDateParamValue) {
        supplierSearchParamsRef.current.startDate = startDateParamValue
      }
      if (endDateParamValue) {
        supplierSearchParamsRef.current.endDate = endDateParamValue
      }

      Promise.all([
        fetchSupplier(supplierId),
        fetchSupplierLog(supplierId, supplierLogsPage, supplierSearchParamsRef.current),
      ]).finally(() => setLoading(false))
    } else {
      Promise.all([fetchSupplier(supplierId)]).finally(() => setLoading(false))
    }
  }, [])

  function supplierLogHandleSearch(e) {
    e.preventDefault()

    setSupplierLogsSearchLoading(true)

    setSupplierLogsPage(1)

    const searchParams = {}
    if (
      typeOptions[1].value === supplierLogsSearchTypeValue ||
      typeOptions[2].value === supplierLogsSearchTypeValue
    ) {
      searchParams.type = supplierLogsSearchTypeValue
    }

    if (supplierLogsSearchStartDateValue) {
      searchParams.startDate = formatToISODate(supplierLogsSearchStartDateValue)
    }

    if (supplierLogsSearchEndDateValue) {
      searchParams.endDate = formatToISODate(supplierLogsSearchEndDateValue)
    }

    supplierSearchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/suppliers/${supplierId}/detail`)
    }

    clearSupplierLogsSearchInput()

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
                <CCardTitle>{'#' + supplier.supplierId + ' ' + supplier.name}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                {!!supplier.email && <CListGroupItem>Email: {supplier.email}</CListGroupItem>}
                <CListGroupItem>Nomor Handphone: {supplier.phoneNumber}</CListGroupItem>
                <CListGroupItem>Alamat: {supplier.address}</CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadSupplierLog && (
            <CCol className="mt-3" xs={12}>
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
