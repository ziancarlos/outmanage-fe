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
  faFileInvoiceDollar,
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

const DetailRentBill = () => {
  const { authorizePermissions } = useAuth()

  const canReadTruck = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadRentBillInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-bill-inventories',
  )
  const canUpdateTransactionRentBillCompleted = authorizePermissions.some(
    (perm) => perm.name === 'update-transaction-rent-bill-completed',
  )

  const { transactionRentId, transactionRentBillId } = useParams()

  const [transactionRentBill, setTransactionRentShipment] = useState({})
  const [transactionRentBillDetails, setTransactionRentShipmentDetails] = useState({})

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionRentBill(transactionRentId, transactionRentBillId))

    if (canReadRentBillInventories) {
      fetchPromises.push(
        fetchTransactionRentBillInventories(transactionRentId, transactionRentBillId),
      )
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  async function fetchTransactionRentBill(transactionRentId, transactionRentBillId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/bills/${transactionRentBillId}`,
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

  async function fetchTransactionRentBillInventories(transactionRentId, transactionRentBillId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/bills/${transactionRentBillId}/inventories`,
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

  async function generateDeliveryNote(transactionRentId, transactionRentBillId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/shipments/${transactionRentBillId}/download-delivery-note`,
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

  async function updateBillToComplete(transactionRentId, transactionRentBillId) {
    setLoading(true)
    try {
      await axiosPrivate.patch(
        `/api/transactions/rents/${transactionRentId}/bills/${transactionRentBillId}/completed`,
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
                <CCardTitle>TRB{transactionRentBill.transactionRentBillId}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Tanggal Mulai:{' '}
                  {moment(transactionRentBill.startDate).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
                <CListGroupItem>
                  Tanggal Selesai:{' '}
                  {transactionRentBill.endDate
                    ? moment(transactionRentBill.endDate).format('MMMM D, YYYY h:mm A')
                    : '-'}
                </CListGroupItem>
                <CListGroupItem>
                  Total Keseluruhan: {formatRupiah(transactionRentBill.grandTotal || 0)}
                </CListGroupItem>
                <CListGroupItem>
                  Catatan Internal: {transactionRentBill.internalNote || '-'}
                </CListGroupItem>
              </CListGroup>
              <CCardFooter>
                <CButton
                  color="success"
                  variant="outline"
                  className="me-1"
                  onClick={() => generateDeliveryNote(transactionRentId, transactionRentBillId)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Surat Tagihan
                </CButton>

                {canUpdateTransactionRentBillCompleted && !transactionRentBill.endDate && (
                  <CButton
                    color="info"
                    variant="outline"
                    className="me-1"
                    onClick={() => updateBillToComplete(transactionRentId, transactionRentBillId)}
                  >
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" /> Tutup Tagihan
                  </CButton>
                )}
              </CCardFooter>
            </CCard>
          </CCol>

          {canReadRentBillInventories && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Rincian Barang Yang Disewakan</strong>
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
                        {transactionRentBillDetails.map((item, idx) => (
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

export default DetailRentBill
