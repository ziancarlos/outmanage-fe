import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormRange,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CLoadingButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CMultiSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import {
  faCheckCircle,
  faEye,
  faFileAlt,
  faFlagCheckered,
  faL,
  faMoneyBill1,
  faPaperPlane,
  faS,
  faSave,
  faShippingFast,
  faTimes,
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons'

import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import moment from 'moment'
import useLogout from '../../../hooks/useLogout'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import useAuth from '../../../hooks/useAuth'
import Swal from 'sweetalert2'
import { formatRupiah } from '../../../utils/CurrencyUtils'
import TableSaleLog from '../../../components/transactions/sale/TableSaleLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailSaleShipment = () => {
  const { authorizePermissions } = useAuth()

  const canReadTruck = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadTransactionSaleShipmentDetails = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-shipment-details',
  )
  const canDownloadTransactionSaleShipmentDeliveryNote = authorizePermissions.some(
    (perm) => perm.name === 'download-transaction-sale-shipment-delivery-note',
  )
  const canUpdateTransactionSaleShipmentShipped = authorizePermissions.some(
    (perm) => perm.name === 'update-transaction-sale-shipment-shipped',
  )
  const canUpdateTransactionSaleShipmentCompleted = authorizePermissions.some(
    (perm) => perm.name === 'update-transaction-sale-shipment-completed',
  )

  const { transactionSaleId, transactionSaleShipmentId } = useParams()

  const [transactionSaleShipment, setTransactionSaleShipment] = useState({})
  const [transactionSaleShipmentDetails, setTransactionSaleShipmentDetails] = useState({})

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    console.log(transactionSaleShipmentId)

    fetchPromises.push(fetchTransactionSaleShipment(transactionSaleId, transactionSaleShipmentId))

    if (canReadTransactionSaleShipmentDetails) {
      fetchPromises.push(
        fetchTransactionSaleShipmentDetails(transactionSaleId, transactionSaleShipmentId),
      )
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  async function fetchTransactionSaleShipment(transactionSaleId, transactionSaleShipmentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/shipments/${transactionSaleShipmentId}`,
      )

      setTransactionSaleShipment(response.data.data)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTransactionSaleShipmentDetails(transactionSaleId, transactionSaleShipmentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/shipments/${transactionSaleShipmentId}/details`,
      )

      setTransactionSaleShipmentDetails(response.data.data)
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

  async function generateDeliveryNote(transactionSaleId, transactionSaleShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/shipments/${transactionSaleShipmentId}/download-delivery-note`,
        {
          responseType: 'blob', // Ensure the response is treated as a file
        },
      )

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'SuratPengantar.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Gagal mendapatkan surat pengantar',
          confirmButtonText: 'OK',
        })
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateShipmentShipped(transactionSaleId, transactionSaleShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/transactions/sales/${transactionSaleId}/shipments/${transactionSaleShipmentId}/shipped`,
      )

      setRefetch(!refetch)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil mengubah status pengiriman menjadi dikirim',
        confirmButtonText: 'OK',
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: e.response.data.error,
          confirmButtonText: 'OK',
        })
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateShipmentCompleted(transactionSaleId, transactionSaleShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/transactions/sales/${transactionSaleId}/shipments/${transactionSaleShipmentId}/completed`,
      )

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil mengubah status pengiriman menjadi selesai',
        confirmButtonText: 'OK',
      })
      setRefetch(!refetch)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: e.response.data.error,
          confirmButtonText: 'OK',
        })
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
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
          <CCol md={12} xs={12} className="mb-4">
            <CCard>
              <CCardBody>
                <CCardTitle>
                  TSS{transactionSaleShipment.transactionSaleShipmentId}
                  <CBadge
                    className="me-2"
                    color={
                      transactionSaleShipment.shipmentStatus === 1
                        ? 'success'
                        : transactionSaleShipment.shipmentStatus === 0
                          ? 'danger'
                          : 'secondary'
                    }
                  >
                    {transactionSaleShipment.shipmentStatus === 1
                      ? 'SUDAH DIKIRIM'
                      : transactionSaleShipment.shipmentStatus === 0
                        ? 'PROSES'
                        : 'UNKNOWN'}
                  </CBadge>
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Truk:{' '}
                  {transactionSaleShipment.truck?.truckId ? (
                    canReadTruck ? (
                      <NavLink to={`/trucks/${transactionSaleShipment.truck.truckId}/detail`}>
                        {transactionSaleShipment.truck.licensePlate}
                      </NavLink>
                    ) : (
                      transactionSaleShipment.truck.licensePlate
                    )
                  ) : (
                    '-'
                  )}
                </CListGroupItem>
                <CListGroupItem>
                  Catatan Internal: {transactionSaleShipment.internalNote}
                </CListGroupItem>
                <CListGroupItem>Alamat: {transactionSaleShipment.address || '-'}</CListGroupItem>
                <CListGroupItem>
                  Tanggal Dikirim:{' '}
                  {transactionSaleShipment.shipmentDate
                    ? moment(transactionSaleShipment.shipmentDate).format('MMMM D, YYYY h:mm A')
                    : '-'}
                </CListGroupItem>
              </CListGroup>
              {(() => {
                const { shipmentStatus } = transactionSaleShipment

                // Define permission checks
                const canDownloadNote =
                  shipmentStatus === 0 && canDownloadTransactionSaleShipmentDeliveryNote
                const canMarkAsShipped =
                  shipmentStatus === 0 && canUpdateTransactionSaleShipmentShipped

                // Render buttons conditionally based on permissions
                const renderDownloadButton = canDownloadNote && (
                  <CButton
                    color="success"
                    variant="outline"
                    className="me-1"
                    onClick={() =>
                      generateDeliveryNote(transactionSaleId, transactionSaleShipmentId)
                    }
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Surat Pengantar
                  </CButton>
                )

                const renderShippedButton = canMarkAsShipped && (
                  <CButton
                    color="info"
                    variant="outline"
                    className="me-1"
                    onClick={() =>
                      updateShipmentShipped(transactionSaleId, transactionSaleShipmentId)
                    }
                  >
                    <FontAwesomeIcon icon={faTruckFast} className="me-2" /> Dikirim
                  </CButton>
                )

                // Check if any button should be rendered
                const shouldRenderFooter = renderDownloadButton || renderShippedButton

                return shouldRenderFooter ? (
                  <CCardFooter>
                    {renderDownloadButton}
                    {renderShippedButton}
                  </CCardFooter>
                ) : null
              })()}
            </CCard>
          </CCol>

          {canReadTransactionSaleShipmentDetails && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Rincian Barang Yang Diangkut</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">No.</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {transactionSaleShipmentDetails.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{idx + 1}.</CTableDataCell>
                            <CTableDataCell>
                              {canReadInventory ? (
                                <>
                                  <NavLink
                                    to={`/inventories/${item.inventory.inventoryId}/detail`}
                                    className="me-2"
                                  >
                                    {item.inventory.name}
                                  </NavLink>
                                  {item.inventory.condition === 0 ? (
                                    <CBadge color="primary">BARU</CBadge>
                                  ) : item.inventory.condition === 1 ? (
                                    <CBadge color="warning">BEKAS</CBadge>
                                  ) : (
                                    <span>{item.inventory.condition}</span> // Fallback for any other condition
                                  )}
                                </>
                              ) : (
                                <>
                                  <a className="me-2">{item.inventory.name}</a>{' '}
                                  {item.inventory.condition === 0 ? (
                                    <CBadge color="primary">BARU</CBadge>
                                  ) : item.inventory.condition === 1 ? (
                                    <CBadge color="warning">BEKAS</CBadge>
                                  ) : (
                                    <span>{item.inventory.condition}</span> // Fallback for any other condition
                                  )}
                                </>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailSaleShipment
