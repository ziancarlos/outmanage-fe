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
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableFilterLayout from '../TableFilterLayout'
import TableCardLayout from '../TableCardLayout'

const statusOptions = [
  { label: 'Pilih Status', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Selesai', value: 'SELESAI' },
]

const matchingStatusOptions = statusOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const shipmentTypeOptions = [
  { label: 'Pilih Status', value: '' },
  { label: 'Antar', value: 'ANTAR' },
  { label: 'Jemput', value: 'JEMPUT' },
  { label: 'Belum Ditentukan', value: 'BELUM-DITENTUKAN' },
]

const matchingShipmentTypeOptions = shipmentTypeOptions
  .filter((option) => option.value)
  .map((option) => option.value)

function TableShipment({
  title = 'Data Pengiriman',
  authorizePermissions,
  endpoint = '/api/shipments',
  ...props
}) {
  const canReadShipment = authorizePermissions.some((perm) => perm.name === 'read-shipment')
  const canReadFleet = authorizePermissions.some((perm) => perm.name === 'read-fleet')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [shipments, setShipments] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [shipmentTypeValue, setShipmentTypeValue] = useState('')
  const [licensePlateValue, setLicensePlateValue] = useState('')
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

    if (matchingShipmentTypeOptions.includes(shipmentTypeValue)) {
      filterRef.current.shipmentType = parsedParams.shipmentType
    }

    if (matchingStatusOptions.includes(parsedParams.statusValue)) {
      filterRef.current.status = parsedParams.statusValue
    }

    if (parsedParams.licensePlate) {
      filterRef.current.licensePlate = parsedParams.licensePlate
    }

    filterRef.current.page = parseInt(parsedParams.page) || 1
    setPage(filterRef.current.page)

    fethShipments(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [shipmentTypeValue, statusValue, licensePlateValue])

  async function fethShipments() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 10,
        ...(filterRef.current.shipmentType && {
          shipmentType: filterRef.current.shipmentType,
        }),
        ...(filterRef.current.status && {
          status: filterRef.current.status,
        }),
        ...(filterRef.current.licensePlateValue && {
          licensePlate: filterRef.current.licensePlateValue,
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

    if (matchingShipmentTypeOptions.includes(shipmentTypeValue)) {
      filterRef.current.shipmentType = shipmentTypeValue
    }

    if (matchingStatusOptions.includes(statusValue)) {
      filterRef.current.status = statusValue
    }

    if (licensePlateValue) {
      filterRef.current.licensePlate = licensePlateValue
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

  function clearSearchInput() {
    setShipmentTypeValue('')
    setStatusValue('')
    setLicensePlateValue('')
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
              <CCol lg={4} className="mb-2">
                <CFormInput
                  id="status"
                  value={licensePlateValue}
                  placeholder="Masukkan nomor polisi..."
                  label={'Nomor Polisi'}
                  onChange={(e) => setLicensePlateValue(e.target.value)}
                  disabled={loading}
                />
              </CCol>
              <CCol lg={4} className="mb-2">
                <CFormSelect
                  id="status"
                  value={statusValue}
                  label={'Status Pengiriman'}
                  onChange={(e) => setStatusValue(e.target.value)}
                  options={statusOptions}
                  disabled={loading}
                />
              </CCol>
              <CCol lg={4} className="mb-2">
                <CFormSelect
                  id="status"
                  value={shipmentTypeValue}
                  label={'Tipe Pengiriman'}
                  onChange={(e) => setShipmentTypeValue(e.target.value)}
                  options={shipmentTypeOptions}
                  disabled={loading}
                />
              </CCol>
            </TableFilterLayout>

            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Plat Nomor</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tipe</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    {canReadShipment && <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shipments.map((shipment) => {
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

                        <CTableDataCell>
                          {!!shipment.licensePlate ? (
                            shipment.licensePlate
                          ) : !!shipment.fleet?.fleetId ? (
                            canReadFleet ? (
                              <NavLink to={`/fleets/${shipment.fleet.fleetId}/detail`}>
                                {shipment.fleet.licensePlate}
                              </NavLink>
                            ) : (
                              shipment.fleet.licensePlate
                            )
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>

                        <CTableDataCell>
                          <CBadge
                            color={
                              shipment.shipmentType === 'JEMPUT'
                                ? 'primary'
                                : shipment.shipmentType === 'ANTAR'
                                  ? 'success'
                                  : 'secondary'
                            }
                          >
                            {shipment.shipmentType}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={shipment.status === 'SELESAI' ? 'success' : 'warning'}>
                            {shipment.status}
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
