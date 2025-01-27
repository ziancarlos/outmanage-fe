import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CListGroupItem,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faPencil, faTasks, faTrash } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'

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

const DetailShipment = () => {
  const { shipmentId } = useParams()
  const { authorizePermissions } = useAuth()
  const canReadShipmentType = authorizePermissions.some(
    (perm) => perm.name === 'read-shipment-type',
  )
  const canReadCustomer = authorizePermissions.some((perm) => perm.name === 'read-customer')
  const canReadItem = authorizePermissions.some((perm) => perm.name === 'read-item')
  const canUpdateShipmentStatusProcessed = authorizePermissions.some(
    (perm) => perm.name === 'update-shipment-status-processed',
  )
  const canUpdateShipmentStatusCompleted = authorizePermissions.some(
    (perm) => perm.name === 'update-shipment-status-completed',
  )

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [shipment, setShipment] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchShipment().finally(() => {
      setLoading(false)
    })
  }, [shipmentId])

  async function fetchShipment() {
    try {
      const response = await axiosPrivate.get(`/api/shipments/${shipmentId}`)

      setShipment(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 401, 400].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  const handleStatusChange = async (status) => {
    const isUnprocessed = status === 'UNPROCESSED'
    const endpoint = isUnprocessed
      ? `/api/shipments/${shipmentId}/processed`
      : `/api/shipments/${shipmentId}/completed`

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Informasi!',
      text: 'Apakah ingin merubah status pengiriman?',
      confirmButtonText: 'OK',
      cancelButtonText: 'BATAL',
      showCancelButton: true,
    })

    if (result.isConfirmed) {
      setLoading(true)

      try {
        await axiosPrivate.patch(endpoint)

        fetchShipment()
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout() // Log out if the refresh token request fails
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true }) // Navigate to a 404 page for unauthorized access
        } else if ([400, 404].includes(e.response?.status)) {
          setError(e.response.data.error) // Handle specific client-side errors
        } else {
          navigate('/500') // For other errors, navigate to a 500 page
        }
      } finally {
        setLoading(false)

        await Swal.fire({
          icon: 'success',
          title: 'Status berhasil diperbarui',
          text: `Status pengiriman telah berhasil diubah menjadi ${status === 'UNPROCESSED' ? 'Proses' : 'Selesai'}.`,
          confirmButtonText: 'OK',
        })
      }
    }
  }

  return (
    <>
      <CRow>
        {loading ? (
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        ) : (
          (function () {
            const shipmentType = canReadShipmentType ? (
              <NavLink to={`/shipment-types/${shipment.shipmentType?.shipmentTypeId}/detail`}>
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
            return (
              <CRow>
                <DetailCardLayout
                  title={`S${shipment.shipmentId}`}
                  className="mb-3"
                  footer={
                    <div>
                      {shipment.status === 'UNPROCESSED' && canUpdateShipmentStatusProcessed && (
                        <CButton
                          color="info"
                          variant="outline"
                          className="me-2 my-1"
                          onClick={() => handleStatusChange('UNPROCESSED')}
                        >
                          <FontAwesomeIcon icon={faTasks} className="me-2" />
                          Proses
                        </CButton>
                      )}

                      {shipment.status === 'PROCESSED' && canUpdateShipmentStatusCompleted && (
                        <CButton
                          color="success"
                          variant="outline"
                          className="me-2 my-1"
                          onClick={() => handleStatusChange('PROCESSED')}
                        >
                          <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                          Selesai
                        </CButton>
                      )}
                      <CButton
                        color="warning"
                        variant="outline"
                        className="me-2 my-1"
                        onClick={() => {
                          navigate(`/shipments/${shipmentId}/edit`)
                        }}
                      >
                        <FontAwesomeIcon icon={faPencil} className="me-2" />
                        Ubah
                      </CButton>
                      {/* <CButton color="danger" variant="outline" className="me-2 my-1">
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Batal
                      </CButton> */}
                    </div>
                  }
                >
                  <CListGroupItem>Kustomer: {customer} </CListGroupItem>
                  <CListGroupItem>Tipe pengiriman: {shipmentType}</CListGroupItem>
                  <CListGroupItem>Plat Kendaraan: {shipment.licensePlate || '-'}</CListGroupItem>
                  <CListGroupItem>Alamat Tujuan: {shipment.address || '-'}</CListGroupItem>
                  <CListGroupItem>Catatan Internal: {shipment.internalNotes || '-'}</CListGroupItem>
                  <CListGroupItem>
                    <CBadge color={getStatusColor(shipment.status)}>
                      {shipment.status === 'UNPROCESSED'
                        ? 'Belum Diproses'
                        : shipment.status === 'PROCESSED'
                          ? 'Proses'
                          : shipment.status === 'COMPLETED'
                            ? 'Selesai'
                            : shipment.status}
                    </CBadge>
                  </CListGroupItem>
                </DetailCardLayout>

                <CCol xs={12}>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Barang | SKU</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {shipment.items.map((item, idx) => {
                          const itemNavsLink = canReadItem ? (
                            <NavLink to={`/items/${item.item.itemId}/detail`}>
                              {item.item.name} | {item.item.stockKeepingUnit}
                            </NavLink>
                          ) : (
                            item.item.name | item.item.stockKeepingUnit
                          )
                          return (
                            <CTableRow key={idx}>
                              <CTableDataCell>SI{item.shipmentHasItemId}</CTableDataCell>
                              <CTableDataCell>{itemNavsLink}</CTableDataCell>
                              <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCol>
              </CRow>
            )
          })()
        )}
      </CRow>
    </>
  )
}

export default DetailShipment
