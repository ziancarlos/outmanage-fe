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

const DetailRentReturn = () => {
  const { authorizePermissions } = useAuth()

  const canReadTruck = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-sale-inventories',
  )
  const canReadTransactionRentReturnInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-transaction-rent-return-inventories',
  )
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canUpdateTransactionRentReturnCompleted = authorizePermissions.some(
    (perm) => perm.name === 'update-transaction-rent-return-completed',
  )

  const { transactionRentId, transactionRentReturnId } = useParams()

  const [transactionRentReturn, setTransactionRentReturn] = useState({})
  const [transactionRentReturnDetails, setTransactionRentReturnDetails] = useState({})

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionRentReturn(transactionRentId, transactionRentReturnId))

    if (canReadTransactionRentReturnInventories) {
      fetchPromises.push(
        fetchTransactionRentReturnInventories(transactionRentId, transactionRentReturnId),
      )
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  async function fetchTransactionRentReturn(transactionRentId, transactionRentReturnId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/returns/${transactionRentReturnId}`,
      )

      setTransactionRentReturn(response.data.data)
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

  async function fetchTransactionRentReturnInventories(transactionRentId, transactionRentReturnId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/returns/${transactionRentReturnId}/inventories`,
      )

      setTransactionRentReturnDetails(response.data.data)
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

  async function generateDeliveryNote(transactionRentId, transactionRentReturnId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/rents/${transactionRentId}/returns/${transactionRentReturnId}/download-delivery-note`,
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

  async function updateReturnToCompleted(transactionRentId, transactionRentReturnId) {
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/transactions/rents/${transactionRentId}/returns/${transactionRentReturnId}/completed`,
      )

      setRefetch(!refetch)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil mengubah status pengembalian menjadi selesai',
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
                <CCardTitle>
                  TRS{transactionRentReturn.transactionRentReturnId}
                  <CBadge
                    className="me-2"
                    color={
                      transactionRentReturn.shipmentStatus === 1
                        ? 'success'
                        : transactionRentReturn.shipmentStatus === 0
                          ? 'danger'
                          : 'secondary'
                    }
                  >
                    {transactionRentReturn.shipmentStatus === 1
                      ? 'SUDAH DIKIRIM'
                      : transactionRentReturn.shipmentStatus === 0
                        ? 'BELUM DIKIRIM'
                        : 'UNKNOWN'}
                  </CBadge>
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Truk:{' '}
                  {transactionRentReturn.truck?.truckId ? (
                    canReadTruck ? (
                      <NavLink to={`/trucks/${transactionRentReturn.truck.truckId}/detail`}>
                        {transactionRentReturn.truck.licensePlate}
                      </NavLink>
                    ) : (
                      transactionRentReturn.truck.licensePlate
                    )
                  ) : (
                    '-'
                  )}
                </CListGroupItem>
                <CListGroupItem>
                  Catatan Internal: {transactionRentReturn.internalNote}
                </CListGroupItem>
                <CListGroupItem>Alamat: {transactionRentReturn.address || '-'}</CListGroupItem>
                <CListGroupItem>
                  Tanggal Dikirim:{' '}
                  {transactionRentReturn.shipmentDate
                    ? moment(transactionRentReturn.shipmentDate).format('MMMM D, YYYY h:mm A')
                    : '-'}
                </CListGroupItem>
              </CListGroup>
              <CCardFooter>
                <CButton
                  color="success"
                  variant="outline"
                  className="me-1"
                  onClick={() => generateDeliveryNote(transactionRentId, transactionRentReturnId)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Surat Pengembalian
                </CButton>

                {canUpdateTransactionRentReturnCompleted &&
                  transactionRentReturn.shipmentStatus === 0 && (
                    <CButton
                      color="info"
                      variant="outline"
                      className="me-1"
                      onClick={() =>
                        updateReturnToCompleted(transactionRentId, transactionRentReturnId)
                      }
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Selesai
                    </CButton>
                  )}
              </CCardFooter>
            </CCard>
          </CCol>

          {canReadTransactionRentReturnInventories && (
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
                        {transactionRentReturnDetails.map((item, idx) => (
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

export default DetailRentReturn
