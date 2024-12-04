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

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailRentShipment = () => {
  const { authorizePermissions } = useAuth()

  const canReadTruck = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')

  const { transactionRentId, transactionRentShipmentId } = useParams()

  const [transactionRentShipment, setTransactionRentShipment] = useState({})
  const [transactionRentShipmentDetails, setTransactionRentShipmentDetails] = useState({})

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionRentShipment(transactionRentId, transactionRentShipmentId))

    if (true) {
      fetchPromises.push(
        fetchTransactionRentShipmentDetails(transactionRentId, transactionRentShipmentId),
      )
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  async function fetchTransactionRentShipment(transactionRentId, transactionRentShipmentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentShipmentId}`,
      )

      console.log(response.data.data)

      setTransactionRentShipment(response.data.data)
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

  async function fetchTransactionRentShipmentDetails(transactionRentId, transactionRentShipmentId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentShipmentId}/inventories`,
      )

      setTransactionRentShipmentDetails(response.data.data)
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

  async function generateDeliveryNote(transactionRentId, transactionRentShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentShipmentId}/download-delivery-note`,
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

  async function updateShipmentShipped(transactionRentId, transactionRentShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentShipmentId}/shipped`,
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

  async function updateShipmentCompleted(transactionRentId, transactionRentShipmentId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentShipmentId}/completed`,
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
                  TRS{transactionRentShipment.transactionRentShipmentId}
                  <CBadge
                    className="me-2"
                    color={
                      transactionRentShipment.shipmentStatus === 1
                        ? 'success'
                        : transactionRentShipment.shipmentStatus === 0
                          ? 'danger'
                          : 'secondary'
                    }
                  >
                    {transactionRentShipment.shipmentStatus === 1
                      ? 'SUDAH DIKIRIM'
                      : transactionRentShipment.shipmentStatus === 0
                        ? 'BELUM DIKIRIM'
                        : 'UNKNOWN'}
                  </CBadge>
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Truk:{' '}
                  {transactionRentShipment.truck?.truckId ? (
                    canReadTruck ? (
                      <NavLink to={`/trucks/${transactionRentShipment.truck.truckId}/detail`}>
                        {transactionRentShipment.truck.licensePlate}
                      </NavLink>
                    ) : (
                      transactionRentShipment.truck.licensePlate
                    )
                  ) : (
                    '-'
                  )}
                </CListGroupItem>
                <CListGroupItem>
                  Catatan Internal: {transactionRentShipment.internalNote}
                </CListGroupItem>
                <CListGroupItem>Alamat: {transactionRentShipment.address || '-'}</CListGroupItem>
                <CListGroupItem>
                  Tanggal Dikirim:{' '}
                  {transactionRentShipment.shipmentDate
                    ? moment(transactionRentShipment.shipmentDate).format('MMMM D, YYYY h:mm A')
                    : '-'}
                </CListGroupItem>
              </CListGroup>
              <CCardFooter>
                <CButton
                  color="success"
                  variant="outline"
                  className="me-1"
                  onClick={() => generateDeliveryNote(transactionRentId, transactionRentShipmentId)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Surat Pengantar
                </CButton>

                {transactionRentShipment.shipmentStatus === 0 && (
                  <CButton
                    color="info"
                    variant="outline"
                    className="me-1"
                    onClick={() =>
                      updateShipmentShipped(transactionRentId, transactionRentShipmentId)
                    }
                  >
                    <FontAwesomeIcon icon={faTruckFast} className="me-2" /> Dikirim
                  </CButton>
                )}
              </CCardFooter>
            </CCard>
          </CCol>

          <CCol md={12} className="mb-4">
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Rincian Barang Yang Dikirim</strong>
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
                      {transactionRentShipmentDetails.map((item, idx) => (
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
        </CRow>
      )}
    </>
  )
}

export default DetailRentShipment
