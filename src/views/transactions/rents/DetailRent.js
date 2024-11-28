import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../../hooks/useLogout'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
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
  faEye,
  faFileAlt,
  faL,
  faMoneyBill1,
  faPaperPlane,
  faSave,
  faShippingFast,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import useAuth from '../../../hooks/useAuth'
import { formatRupiah } from '../../../utils/CurrencyUtils'
import moment from 'moment'
function DetailRent() {
  const { authorizePermissions } = useAuth()

  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')
  const canReadProject = authorizePermissions.some((perm) => perm.name === 'read-project')

  const { transactionRentId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const searchParamsRef = useRef()
  const [loading, setLoading] = useState(true)
  const [refetch, setRefetch] = useState(false)

  const [transactionRent, setTransactionRent] = useState({})

  useEffect(() => {
    setLoading(true)
    const fetchPromises = []

    fetchPromises.push(fetchTransactionRent(transactionRentId))

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  async function fetchTransactionRent(transactionRentId) {
    try {
      const response = await axiosPrivate.get(`/api/transactions/rents/${transactionRentId}`)

      console.log(response.data.data)
      setTransactionRent(response.data.data)
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
                  {'TR' + transactionRent.transactionRentId}
                  <CBadge
                    className="me-2"
                    color={
                      transactionRent.shipmentStatus === 2
                        ? 'success'
                        : transactionRent.shipmentStatus === 1
                          ? 'warning'
                          : transactionRent.shipmentStatus === 0
                            ? 'danger'
                            : 'secondary'
                    }
                  >
                    {transactionRent.shipmentStatus === 2
                      ? 'SELESAI'
                      : transactionRent.shipmentStatus === 1
                        ? 'PROSES'
                        : transactionRent.shipmentStatus === 0
                          ? 'BELUM DIKIRIM'
                          : transactionRent.shipmentStatus}
                  </CBadge>
                  <CBadge
                    color={
                      transactionRent.paymentStatus === 2
                        ? 'success'
                        : transactionRent.paymentStatus === 1
                          ? 'warning'
                          : transactionRent.paymentStatus === 0
                            ? 'danger'
                            : 'secondary'
                    }
                  >
                    {transactionRent.paymentStatus === 2
                      ? 'LUNAS'
                      : transactionRent.paymentStatus === 1
                        ? 'SEBAGIAN'
                        : transactionRent.paymentStatus === 0
                          ? 'BELUM LUNAS'
                          : transactionRent.paymentStatus}
                  </CBadge>
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  {transactionRent.client?.clientId ? (
                    <>
                      Klien:{' '}
                      {canReadClient ? (
                        <NavLink to={`/clients/${transactionRent.client.clientId}/detail`}>
                          {transactionRent.client.name}
                        </NavLink>
                      ) : (
                        transactionRent.client.name
                      )}
                    </>
                  ) : transactionRent.project?.projectId ? (
                    <>
                      Proyek:{' '}
                      {canReadProject ? (
                        <NavLink to={`/projects/${transactionRent.project.projectId}/detail`}>
                          {transactionRent.project.name}
                        </NavLink>
                      ) : (
                        transactionRent.project.name
                      )}
                    </>
                  ) : (
                    transactionRent.project?.projectId || 'No details available'
                  )}
                </CListGroupItem>

                <CListGroupItem>
                  Tanggal Pembelian:{' '}
                  {moment(transactionRent.transactionDate).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
                {!!transactionRent.internalNote && (
                  <CListGroupItem>Catatan Internal: {transactionRent.internalNote}</CListGroupItem>
                )}

                <CListGroupItem>
                  Jumlah Dibayar: {formatRupiah(transactionRent.totalPaid || 0)}
                </CListGroupItem>
                <CListGroupItem>
                  Ongkos Pengiriman: {formatRupiah(transactionRent.deliveryShipmentFee || 0)}
                </CListGroupItem>
                <CListGroupItem>
                  Ongkos Jemput: {formatRupiah(transactionRent.deliveryReturnFee || 0)}
                </CListGroupItem>
                <CListGroupItem>
                  Estimasi Biaya Sewa: {formatRupiah(transactionRent.rent_fee || 0)}
                </CListGroupItem>
                <CListGroupItem>
                  Total Keseluruhan: {formatRupiah(transactionRent.grandTotal)}
                </CListGroupItem>
                {transactionRent?.deposit?.transactionRentSecurityDepositId && (
                  <CListGroupItem>
                    Deposit:{' '}
                    <NavLink
                      to={`/deposits/${transactionRent?.deposit?.transactionRentSecurityDepositId}/detail`}
                    >
                      {' '}
                      {formatRupiah(transactionRent.deposit.amount || 0)}
                    </NavLink>
                  </CListGroupItem>
                )}

                {transactionRent.remainingBalance > 0 && (
                  <CListGroupItem>
                    Sisa Pembayaran: {formatRupiah(transactionRent.remainingBalance || 0)}
                  </CListGroupItem>
                )}
              </CListGroup>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DetailRent
