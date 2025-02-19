/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CDateRangePicker,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faEye, faUndo } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import TableFilterLayout from '../TableFilterLayout'
import TableCardLayout from '../TableCardLayout'
import SelectCustomer from '../customers/SelectCustomer'
import moment from 'moment'

const formatToISODate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

const statusOptions = [
  { label: 'Pilih Status', value: '' },
  { label: 'SELESAI', value: 'SELESAI' },
  { label: 'PROSES', value: 'PROSES' },
  { label: 'PENDING', value: 'PENDING' },
]
const matchingStatusOptions = statusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

export default function TableDeliveryOrder({
  title = 'Data DO',
  customerId = null,
  size = 10,
  authorizePermissions,
  endpoint = '/api/delivery-orders',
  ...props
}) {
  const canReadDeliveryOrder = authorizePermissions.some(
    (perm) => perm.name === 'read-delivery-order',
  )
  const canUpdateDeliveryOrder = authorizePermissions.some(
    (perm) => perm.name === 'update-delivery-order',
  )
  const canReadCustomer = authorizePermissions.some((perm) => perm.name === 'read-customer')
  const canReadCustomers = authorizePermissions.some((perm) => perm.name === 'read-customers')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [deliveryOrders, setDeliveryOrders] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [customerValue, setCustomerValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [startDateValue, setStartDateValue] = useState('')
  const [endDateValue, setEndDateValue] = useState('')

  const [refetch, setRefetch] = useState(false)
  const filterRef = useRef({})

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const searchParams = new URLSearchParams(location.search)
    const queryParams = searchParams.get('delivery-orders')

    let parsedParams = {}

    if (queryParams) {
      try {
        parsedParams = JSON.parse(queryParams)
      } catch (error) {
        navigate(`${location.pathname}`, { replace: true })
      }
    }

    if (parsedParams.customerId) {
      filterRef.current.customerId = parsedParams.customerId
    }

    if (matchingStatusOptions.includes(parsedParams.status)) {
      filterRef.current.status = parsedParams.status
    }

    if (parsedParams.startDate) {
      filterRef.current.startDate = parsedParams.startDate
    }
    if (parsedParams.endDate) {
      filterRef.current.endDate = parsedParams.endDate
    }

    filterRef.current.page = parseInt(parsedParams.page) || 1
    setPage(filterRef.current.page)

    fetchDeliveryOrder(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [startDateValue, endDateValue, statusValue, customerValue])

  async function fetchDeliveryOrder() {
    try {
      const params = {
        page: filterRef.current.page,
        size: size,
        ...(filterRef.current.customerId ||
          (customerId && {
            customerId: filterRef.current.customerId || customerId,
          })),
        ...(filterRef.current.status && {
          status: filterRef.current.status,
        }),
        ...(filterRef.current.startDate && {
          startDate: filterRef.current.startDate,
        }),
        ...(filterRef.current.endDate && {
          endDate: filterRef.current.endDate,
        }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setDeliveryOrders(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      filterRef.current.page = newPage
      setPage(filterRef.current.page)

      const newParams = new URLSearchParams(location.search)
      newParams.set('delivery-orders', JSON.stringify(filterRef.current))
      navigate(`${location.pathname}?${newParams}`, { replace: true })

      setRefetch((val) => !val)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()

    filterRef.current = {}

    filterRef.current.page = 1

    if (customerValue) {
      filterRef.current.customerId = customerValue.value
    }

    if (matchingStatusOptions.includes(statusValue)) {
      filterRef.current.status = statusValue
    }

    if (startDateValue) {
      filterRef.current.startDate = formatToISODate(startDateValue)
    }

    if (endDateValue) {
      filterRef.current.endDate = formatToISODate(endDateValue)
    }

    console.log(filterRef.current)
    const newParams = new URLSearchParams(location.search)

    if (Object.keys(filterRef.current).length > 0) {
      newParams.set('delivery-orders', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('delivery-orders')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(deliveryOrderId) {
    navigate(`/delivery-orders/${deliveryOrderId}/detail`)
  }

  function handleUpdate(deliveryOrderId) {
    navigate(`/delivery-orders/${deliveryOrderId}/edit`)
  }

  function clearSearchInput() {
    setCustomerValue('')
    setStatusValue('')
    setStartDateValue('')
    setEndDateValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CCol {...props}>
          <TableCardLayout
            title={title}
            error={error}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          >
            <TableFilterLayout handleSearch={handleSearch} loading={loading}>
              {canReadCustomers && !customerId && (
                <CCol xs={12} md={6} className="mb-2">
                  <SelectCustomer
                    label={'Kustomer'}
                    formLoading={loading}
                    navigate={navigate}
                    axiosPrivate={axiosPrivate}
                    customerValue={customerValue}
                    setCustomerValue={setCustomerValue}
                  />
                </CCol>
              )}

              <CCol xs={12} md={6} className="mb-2">
                <CFormLabel htmlFor="activitySelect">Status</CFormLabel>
                <CFormSelect
                  id="activitySelect"
                  options={statusOptions}
                  value={statusValue}
                  disabled={loading}
                  onChange={(e) => setStatusValue(e.target.value)}
                />
              </CCol>

              <CCol xs={12} md={canReadCustomers && !customerId ? 12 : 6} className="mb-2">
                <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
                <CDateRangePicker
                  placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                  disabled={loading}
                  startDate={startDateValue}
                  endDate={endDateValue}
                  onStartDateChange={(date) => setStartDateValue(date)}
                  onEndDateChange={(date) => setEndDateValue(date)}
                />
              </CCol>
            </TableFilterLayout>

            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kustomer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tanggal Dibuat</CTableHeaderCell>
                    {(canReadDeliveryOrder || canUpdateDeliveryOrder) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {deliveryOrders.map((deliveryOrder) => {
                    const actionButtons = (
                      <>
                        {canReadDeliveryOrder && (
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(deliveryOrder.deliveryOrderId)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateDeliveryOrder && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(deliveryOrder.deliveryOrderId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={deliveryOrder.deliveryOrderId}>
                        <CTableDataCell>DO{deliveryOrder.deliveryOrderId}</CTableDataCell>
                        <CTableDataCell>
                          {canReadCustomer ? (
                            <NavLink to={`/customers/${deliveryOrder.customer.customerId}/detail`}>
                              {deliveryOrder.customer.name}
                            </NavLink>
                          ) : (
                            deliveryOrder.customer.name
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              deliveryOrder.status === 'SELESAI'
                                ? 'success'
                                : deliveryOrder.status === 'PROSES'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {deliveryOrder.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {moment(deliveryOrder.createdAt).format('MMMM D, YYYY h:mm A')}
                        </CTableDataCell>
                        <CTableDataCell>{actionButtons}</CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </TableCardLayout>
        </CCol>
      )}
    </>
  )
}
