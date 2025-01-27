/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CFormInput,
  CFormSelect,
  CMultiSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  useDebouncedCallback,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faEye, faUndo } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableFilterLayout from '../TableFilterLayout'
import TableCardLayout from '../TableCardLayout'

const statusOptions = [
  { label: 'Pilih Status', value: '' },
  { label: 'Belum Diproses', value: 'UNPROCESSED' },
  { label: 'Proses', value: 'PROCESSED' },
  { label: 'Selesai', value: 'COMPLETED' },
]

const matchingStatusOptions = statusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

function getStatusColor(status) {
  switch (status) {
    case 'UNPROCESSED':
      return 'danger' // Red
    case 'PROCESSED':
      return 'warning' // Yellow
    case 'COMPLETED':
      return 'success' // Green
    default:
      return 'secondary' // Default color
  }
}

function TableShipment({
  title = 'Data Pengiriman',
  authorizePermissions,
  endpoint = '/api/shipments',
  ...props
}) {
  const canReadShipment = authorizePermissions.some((perm) => perm.name === 'read-shipment')
  const canReadShipmentType = authorizePermissions.some(
    (perm) => perm.name === 'read-shipment-type',
  )
  const canReadCustomer = authorizePermissions.some((perm) => perm.name === 'read-customer')
  const canUpdateShipment = authorizePermissions.some((perm) => perm.name === 'update-shipment')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [shipments, setShipments] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [fetchShipmentTypesLoading, setFetchShipmentTypesLoading] = useState(false)
  const [fetchCustomerLoading, setFetchCustomerLoading] = useState(false)

  const [customerOptions, setCustomerOptions] = useState([])
  const [shipmentTypesOptions, setShipmentTypesOptions] = useState([])

  const [customerValue, setCustomerValue] = useState('')
  const [shipmentTypeValue, setShipmentTypeValue] = useState('')
  const [statusValue, setStatusValue] = useState('')

  const [refetch, setRefetch] = useState(false)
  const filterRef = useRef({})

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const searchParams = new URLSearchParams(location.search)
    const queryParams = searchParams.get('shipments')

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

    if (parsedParams.shipmentTypeId) {
      filterRef.current.shipmentTypeId = parsedParams.shipmentTypeId
    }

    if (matchingStatusOptions.includes(parsedParams.statusValue)) {
      filterRef.current.statusValue = parsedParams.statusValue
    }

    filterRef.current.page = parseInt(parsedParams.page) || 1
    setPage(filterRef.current.page)

    fethShipments(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [shipmentTypeValue, statusValue, customerValue])

  const fetchShipmentType = async (value) => {
    if (!value) return

    setFetchShipmentTypesLoading(true)

    try {
      try {
        const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/shipment-types', { params })
        const options = response.data.data.map((shipmentType) => ({
          value: shipmentType.shipmentTypeId,
          label: `${shipmentType.name}`,
        }))

        setShipmentTypesOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchShipmentTypesLoading(false)
    }
  }

  const debouncedFetchShipmentType = useDebouncedCallback((value) => {
    fetchShipmentType(value)
  }, 300)

  const fetchCustomer = async (value) => {
    if (!value) return

    setFetchCustomerLoading(true)

    try {
      try {
        const params = value
          ? { name: value, initials: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/customers', { params })
        const options = response.data.data.map((customer) => ({
          value: customer.customerId,
          label: `${customer.name} | ${customer.initials}`,
        }))

        setCustomerOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchCustomerLoading(false)
    }
  }

  const debouncedFetchCustomer = useDebouncedCallback((value) => {
    fetchCustomer(value)
  }, 300)

  async function fethShipments() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 10,
        ...(filterRef.current.customerId && {
          customerId: filterRef.current.customerId,
        }),
        ...(filterRef.current.shipmentTypeId && {
          shipmentTypeId: filterRef.current.shipmentTypeId,
        }),
        ...(filterRef.current.statusValue && {
          status: filterRef.current.statusValue,
        }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setShipments(response.data.data)
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
      newParams.set('shipments', JSON.stringify(filterRef.current))
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

    if (shipmentTypeValue) {
      filterRef.current.shipmentTypeId = shipmentTypeValue.value
    }
    if (matchingStatusOptions.includes(statusValue)) {
      filterRef.current.statusValue = statusValue
    }

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(filterRef.current).length > 0) {
      newParams.set('shipments', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('shipments')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(shipmentId) {
    navigate(`/shipments/${shipmentId}/detail`)
  }

  function handleUpdate(shipmentId) {
    navigate(`/shipments/${shipmentId}/edit`)
  }

  function clearSearchInput() {
    setCustomerValue('')
    setCustomerOptions([])
    setShipmentTypeValue('')
    setShipmentTypesOptions([])
    setStatusValue('')
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
              <CCol lg={5} className="mb-2">
                <CMultiSelect
                  options={customerOptions}
                  loading={fetchCustomerLoading}
                  onFilterChange={debouncedFetchCustomer}
                  onShow={fetchCustomer}
                  disabled={loading}
                  multiple={false}
                  resetSelectionOnOptionsChange={true}
                  cleaner={false}
                  placeholder="Silahkan memilih kustomer"
                  label={'Kustomer'}
                  onChange={(e) => {
                    setCustomerValue(e[0])
                  }}
                />
              </CCol>
              <CCol lg={4} className="mb-2">
                <CMultiSelect
                  options={shipmentTypesOptions}
                  loading={fetchShipmentTypesLoading}
                  onFilterChange={debouncedFetchShipmentType}
                  onShow={fetchShipmentType}
                  disabled={loading}
                  multiple={false}
                  resetSelectionOnOptionsChange={true}
                  cleaner={false}
                  label={'Tipe Pengiriman'}
                  placeholder="Silahkan memilih tipe pengiriman"
                  onChange={(e) => {
                    setShipmentTypeValue(e[0])
                  }}
                />
              </CCol>
              <CCol lg={3} className="mb-2">
                <CFormSelect
                  id="status"
                  value={statusValue}
                  label={'Status Pengiriman'}
                  onChange={(e) => setStatusValue(e.target.value)}
                  options={statusOptions}
                  disabled={loading}
                />
              </CCol>
            </TableFilterLayout>

            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kustomer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tipe Pengiriman</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    {(canReadShipment || canUpdateShipment) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shipments.map((shipment) => {
                    const shipmentType = canReadShipmentType ? (
                      <NavLink
                        to={`/shipment-types/${shipment.shipmentType.shipmentTypeId}/detail`}
                      >
                        {shipment.shipmentType.name}
                      </NavLink>
                    ) : (
                      shipment.shipmentType.name
                    )
                    const customer = canReadCustomer ? (
                      <NavLink to={`/customers/${shipment.customer.customerId}/detail`}>
                        {shipment.customer.name}
                      </NavLink>
                    ) : (
                      shipment.customer.name
                    )

                    const actionButtons = (
                      <>
                        {canReadShipment && (
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(shipment.shipmentId)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateShipment && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(shipment.shipmentId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={shipment.shipmentId}>
                        <CTableDataCell>
                          {canReadShipment ? (
                            <NavLink to={`/shipments/${shipment.shipmentId}/detail`}>
                              S{shipment.shipmentId}
                            </NavLink>
                          ) : (
                            `S${shipment.shipmentId}`
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{customer}</CTableDataCell>
                        <CTableDataCell>{shipmentType}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getStatusColor(shipment.status)}>
                            {shipment.status === 'UNPROCESSED'
                              ? 'Belum Diproses'
                              : shipment.status === 'PROCESSED'
                                ? 'Proses'
                                : shipment.status === 'COMPLETED'
                                  ? 'Selesai'
                                  : shipment.status}
                          </CBadge>
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

export default TableShipment
