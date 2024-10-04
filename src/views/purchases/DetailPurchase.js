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

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import TablePurchaseLog from '../../components/purchases/TablePurchaseLog'
import Swal from 'sweetalert2'
import { faS, faSave, faTimeline, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
]
const DetailPurchase = () => {
  const { authorizePermissions } = useAuth()

  const canReadPurchaseLog = authorizePermissions.some((perm) => perm.name === 'read-purchase-logs')
  const canReadPurchaseInventories = authorizePermissions.some(
    (perm) => perm.name === 'read-purchase-inventories',
  )
  const canReadPurchasePayments = authorizePermissions.some(
    (perm) => perm.name === 'read-purchase-payments',
  )
  const canCreatePurchasePayment = authorizePermissions.some(
    (perm) => perm.name === 'create-purchase-payment',
  )
  const canUpdatePurchaseInventories = authorizePermissions.some(
    (perm) => perm.name === 'update-purchase-inventories',
  )
  const canReadSupplier = authorizePermissions.some((perm) => perm.name === 'read-supplier')
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')

  const { purchaseId } = useParams()

  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const searchParamsRef = useRef()

  const [visibileModalArrived, setVisibileModalArrived] = useState(false)
  const [visibileModalPayment, setVisibileModalPayment] = useState(false)

  const [purchase, setProject] = useState({})

  const [purchaseLogs, setProjectLogs] = useState([])
  const [purchaseLogPage, setPurchaseLogPage] = useState(1)
  const [purchaseLogTotalPages, setPurchaseLogTotalPages] = useState(1)
  const [purchaseLogError, setPurchaseLogError] = useState('')
  const [purchaseLogSearchTypeValue, setPurchaseLogSearchTypeValue] = useState('')
  const [purchaseLogSearchStartDateValue, setPurchaseLogSearchStartDateValue] = useState('')
  const [purchaseLogSearchEndDateValue, setPurchaseLogSearchEndDateValue] = useState('')
  const [purchaseLogSearchLoading, setPurchaseLogSearchLoading] = useState(false)

  const [purchaseInventories, setPurchaseInventories] = useState([])

  const [purchasePayments, setPurchasePayments] = useState([])
  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')
  const [amountPaidValue, setAmountPaidValue] = useState(0)
  const [bankValue, setBankValue] = useState('')
  const [bankOptions, setBankOptions] = useState([])
  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')
  const [cashRecipentValue, setCashRecipentValue] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [receivedPurchaseInventories, setReceivedPurchaseInventories] = useState([])
  const [arrivedError, setArrivedError] = useState('')
  const [arrivedLoading, setArrivedLoading] = useState(false)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setPurchaseLogError('')
  }, [purchaseLogSearchTypeValue, purchaseLogSearchStartDateValue, purchaseLogSearchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = []

    fetchPromises.push(fetchPurchase(purchaseId))

    if (canReadPurchaseLog) {
      fetchPromises.push(fetchPurchaseLogs(purchaseId, purchaseLogPage))
    }

    if (canReadPurchaseInventories) {
      fetchPromises.push(fetchPurchaseInventories(purchaseId))
    }

    if (canReadPurchasePayments) {
      fetchPromises.push(fetchPurchasePayments(purchaseId))
    }

    if (canCreatePurchasePayment) {
      fetchPromises.push(fetchBankOptions())
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  useEffect(() => {
    setArrivedError('')
  }, [receivedPurchaseInventories])

  useEffect(() => {
    setArrivedError('')

    if (visibileModalArrived) {
      setLoading(true)

      fetchReceivedPurchaseInventories(purchaseId).finally(() => setLoading(false))
    }
  }, [visibileModalArrived])

  useEffect(() => {
    clearPaymentMethodForm()
    setAmountPaidValue(0)
    setCheckedPaymentMethodOptions('transfer')
    setPaymentError('')
    setPaymentSuccess('')

    if (visibileModalPayment) {
      setLoading(true)

      fetchPurchase(purchaseId).finally(() => setLoading(false))
    }
  }, [visibileModalPayment])

  useEffect(() => {
    setPaymentError('')
    setPaymentSuccess('')
  }, [checkedPaymentMethodOptions, bankValue, accountNumberValue])

  function handleArrivedQuantityChange(index, value) {
    if (!isNaN(value) && Number(value) >= 0) {
      const updatedItems = [...receivedPurchaseInventories]

      updatedItems[index]['receivedQuantity'] = Number(value)

      setReceivedPurchaseInventories(updatedItems)
    }
  }

  async function fetchPurchase(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}`)

      setProject(response.data.data)
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

  async function fetchPurchaseInventories(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/inventories`)

      setPurchaseInventories(response.data.data)
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

  async function fetchPurchasePayments(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/payments`)

      setPurchasePayments(response.data.data)
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

  async function fetchBankOptions() {
    try {
      const response = await axiosPrivate.get('/api/bank')

      const options = response.data.data.map((bank) => ({
        value: bank.bankCode,
        label: bank.bankName,
      }))

      setBankOptions(options)
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

  function purchaseLogHandleSearch(e) {
    e.preventDefault()

    searchParamsRef.current = {}

    if (
      typeOptions[1].value === purchaseLogSearchTypeValue ||
      typeOptions[2].value === purchaseLogSearchTypeValue ||
      typeOptions[3].value === purchaseLogSearchTypeValue
    ) {
      searchParamsRef.current = { ...searchParamsRef.current, type: purchaseLogSearchTypeValue }
    }

    if (purchaseLogSearchStartDateValue) {
      searchParamsRef.current = {
        ...searchParamsRef.current,
        startDate: purchaseLogSearchStartDateValue,
      }
    }

    if (purchaseLogSearchEndDateValue) {
      searchParamsRef.current = {
        ...searchParamsRef.current,
        endDate: purchaseLogSearchEndDateValue,
      }
    }

    setPurchaseLogSearchLoading(true)

    setPurchaseLogPage(1)

    fetchPurchaseLogs(purchaseId, 1, searchParamsRef.current).finally(() =>
      setPurchaseLogSearchLoading(false),
    )

    setPurchaseLogSearchTypeValue('')
    setPurchaseLogSearchStartDateValue('')
    setPurchaseLogSearchEndDateValue('')
  }

  async function fetchPurchaseLogs(purchaseId, page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setProjectLogs(response.data.data)
      setPurchaseLogTotalPages(response.data.paging.totalPage)
      setPurchaseLogPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setPurchaseLogError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchReceivedPurchaseInventories(purchaseId) {
    try {
      const response = await axiosPrivate.get(`/api/purchases/${purchaseId}/inventories`)

      setReceivedPurchaseInventories(
        response.data.data.map((item) => {
          return {
            inventory: item.inventory,
            quantity: item.quantity,
            receivedQuantity: item.arrivedQuantity,
          }
        }),
      )
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (
        e.response?.status === 401 ||
        e.response?.status === 404 ||
        e.response?.status === 400
      ) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  const handlePurchaseLogPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= purchaseLogTotalPages && newPage !== purchaseLogPage) {
      setPurchaseLogPage(newPage)

      setLoading(true)

      fetchPurchaseLogs(purchaseId, newPage, searchParamsRef).finally(() => setLoading(false))
    }
  }

  function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(number)
      .replace('IDR', 'Rp')
      .trim()
  }

  function handlePaymentAmount(value) {
    setAmountPaidValue(
      Math.max(0, Math.min(Number(value.replace(/[^0-9]/g, '')), purchase.remainingBalance)),
    )
  }

  async function handleCheckAccountNumber() {
    setAccountNameValue('')
    setPaymentError('')
    setPaymentSuccess('')

    try {
      setLoading(true)

      const response = await axiosPrivate.post('/api/bank', {
        bankCode: bankValue.value,
        accountNumber: accountNumberValue,
      })

      setPaymentSuccess('Bank dan nomor rekening ditemukkan')
      setAccountNameValue(response.data.data.accountName)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setPaymentError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function validatePaymentForm() {
    if (
      checkedPaymentMethodOptions === 'transfer' &&
      (!bankValue || !accountNumberValue || !accountNameValue)
    ) {
      return 'Harap berikan rincian bank dan rekening yang valid untuk transfer.'
    }

    if (checkedPaymentMethodOptions === 'cash' && !cashRecipentValue) {
      return 'Harap berikan nama penerima uang tunai untuk pembayaran tunai.'
    }

    return null
  }

  function clearPaymentMethodForm() {
    setBankValue('')
    setAccountNameValue('')
    setAccountNumberValue('')
    setCashRecipentValue('')
  }

  function clearPaymentForm() {
    clearPaymentMethodForm()
    setAmountPaidValue(0)
    setVisibileModalPayment(false)
    setCheckedPaymentMethodOptions('transfer')
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault()

    try {
      setPaymentLoading(true)

      const errorMessage = validatePaymentForm()
      if (errorMessage) {
        setPaymentError(errorMessage)
        return
      }

      let request = {}

      if (checkedPaymentMethodOptions === 'transfer') {
        request = {
          paymentDetails: {
            bankCode: bankValue.value,
            accountNumber: accountNumberValue,
            amountPaid: amountPaidValue,
          },
        }
      }

      if (checkedPaymentMethodOptions === 'cash') {
        request = {
          paymentDetails: {
            cashRecipent: cashRecipentValue,
            amountPaid: amountPaidValue,
          },
        }
      }

      await axiosPrivate.post(`/api/purchases/${purchaseId}/payments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran berhasil diproses.',
        confirmButtonText: 'OK',
      })

      clearPaymentForm()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setPaymentError(e.response.data.error)
        setPaymentSuccess('')
      } else {
        navigate('/500')
      }
    } finally {
      setPaymentLoading(false)

      setRefetch((prev) => !prev)
    }
  }

  async function handleReceivedQuantitySubmit(e) {
    e.preventDefault()

    try {
      setArrivedLoading(true)

      const request = {
        receivedItems: receivedPurchaseInventories.map((item) => {
          return {
            inventoryId: item.inventory.inventoryId,
            receivedQuantity: item.receivedQuantity,
          }
        }),
      }

      await axiosPrivate.post(`/api/purchases/${purchaseId}/inventories`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Penerimaan barang berhasil diproses.',
        confirmButtonText: 'OK',
      })

      setVisibileModalArrived(false)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setArrivedError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setRefetch((prev) => !prev)

      setArrivedLoading(false)
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
                  {'#' + purchase.purchaseId}{' '}
                  <CBadge
                    className="me-2"
                    color={purchase.deliveryStatus == 1 ? 'success' : 'warning'}
                  >
                    {purchase.deliveryStatus === 1 ? 'SAMPAI' : 'BELUM SAMPAI'}
                  </CBadge>
                  <CBadge
                    color={
                      purchase.paymentStatus === 2
                        ? 'success'
                        : purchase.paymentStatus === 1
                          ? 'warning'
                          : purchase.paymentStatus === 0
                            ? 'danger'
                            : 'secondary'
                    }
                  >
                    {purchase.paymentStatus === 2
                      ? 'LUNAS'
                      : purchase.paymentStatus === 1
                        ? 'SEBAGIAN'
                        : purchase.paymentStatus === 0
                          ? 'BELUM LUNAS'
                          : purchase.paymentStatus}
                  </CBadge>
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Pemasok:{' '}
                  {canReadSupplier ? (
                    <NavLink to={`/suppliers/${purchase.supplier.supplierId}/detail`}>
                      {purchase.supplier.name}
                    </NavLink>
                  ) : (
                    purchase.supplier.name
                  )}
                </CListGroupItem>
                <CListGroupItem>
                  Total Keseluruhan: {formatRupiah(purchase.grandTotal)}
                </CListGroupItem>
                <CListGroupItem>
                  Tanggal Pembelian: {moment(purchase.purchaseDate).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
                {!!purchase.description && (
                  <CListGroupItem>Deskripsi: {purchase.description}</CListGroupItem>
                )}
                <CListGroupItem>Jumlah Dibayar: {formatRupiah(purchase.totalPaid)}</CListGroupItem>
                {purchase.remainingBalance > 0 && (
                  <CListGroupItem>
                    Sisa Pembayaran: {formatRupiah(purchase.remainingBalance)}
                  </CListGroupItem>
                )}
              </CListGroup>
              {(purchase.deliveryStatus === 0 || purchase.remainingBalance > 0) && (
                <CCardFooter>
                  {purchase.deliveryStatus === 0 && canUpdatePurchaseInventories && (
                    <CButton
                      color="success"
                      className="me-2"
                      variant="outline"
                      onClick={() => setVisibileModalArrived(!visibileModalArrived)}
                    >
                      Konfirmasi Penerimaan
                    </CButton>
                  )}
                  {purchase.remainingBalance > 0 && canCreatePurchasePayment && (
                    <CButton
                      color="warning"
                      variant="outline"
                      onClick={() => setVisibileModalPayment(!visibileModalPayment)}
                    >
                      Pembayaran
                    </CButton>
                  )}
                </CCardFooter>
              )}
            </CCard>
          </CCol>

          {canReadPurchaseInventories && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Rincian Penerimaan Barang</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Total Harga</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Harga Satuan</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas Diterima</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Tanggal Diterima</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {purchaseInventories.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>
                              {canReadInventory ? (
                                <NavLink to={`/inventory/${item.inventory.inventoryId}/detail`}>
                                  {item.inventory.name}
                                </NavLink>
                              ) : (
                                item.inventory.name
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {item.inventory.condition === 1 ? (
                                <CBadge color="primary">BARU</CBadge>
                              ) : item.inventory.condition === 0 ? (
                                <CBadge color="warning">BEKAS</CBadge>
                              ) : (
                                <span>{item.inventory.condition}</span> // Fallback for any other condition
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{item.quantity}</CTableDataCell>
                            <CTableDataCell>{formatRupiah(item.totalPrice)}</CTableDataCell>
                            <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                            <CTableDataCell>{item.arrivedQuantity}</CTableDataCell>
                            <CTableDataCell>
                              {!!item.lastArrivalDate
                                ? moment(item.lastArrivalDate).format('MMMM D, YYYY h:mm A')
                                : '-'}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {canReadPurchasePayments && (
            <CCol md={12}>
              <CCard className="mb-4">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Rincian Pembelian Pembayaran</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell
                            scope="col"
                            rowSpan={3}
                            className="text-center align-middle"
                          >
                            Jumlah Yang Dibayarkan
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            scope="col"
                            rowSpan={3}
                            className="text-center align-middle"
                          >
                            Sisa Pembayaran
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            scope="col"
                            rowSpan={3}
                            className="text-center align-middle"
                          >
                            Tanggal Pembayaran
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            scope="col"
                            colSpan={3}
                            className="text-center align-middle"
                          >
                            Metode Pembayaran
                          </CTableHeaderCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell
                            scope="col"
                            rowSpan={2}
                            className="text-center align-middle"
                          >
                            Penerima Uang Tunai
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            scope="col"
                            colSpan={2}
                            className="text-center align-middle"
                          >
                            Transfer
                          </CTableHeaderCell>
                        </CTableRow>

                        <CTableRow>
                          <CTableHeaderCell scope="col">Nomor Rekening</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Bank</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {purchasePayments.map((payment, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{formatRupiah(payment.amountPaid)}</CTableDataCell>
                            <CTableDataCell>
                              {formatRupiah(payment.remainingBalance)}
                            </CTableDataCell>
                            <CTableDataCell>
                              {moment(payment.paymentDate).format('MMMM D, YYYY h:mm A')}
                            </CTableDataCell>
                            <CTableDataCell>
                              {payment.cashRecipent ? payment.cashRecipent : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {payment.accountNumber ? payment.accountNumber : '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {payment.bankName ? payment.bankName : '-'}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {canReadPurchaseLog && (
            <CCol md={12} xs={12}>
              <TablePurchaseLog
                title={'Data Log Pembelian'}
                error={purchaseLogError}
                handleSearch={purchaseLogHandleSearch}
                typeOptions={typeOptions}
                searchTypeValue={purchaseLogSearchTypeValue}
                setSearchTypeValue={setPurchaseLogSearchTypeValue}
                searchStartDateValue={purchaseLogSearchStartDateValue}
                setSearchStartDateValue={setPurchaseLogSearchStartDateValue}
                searchEndDateValue={purchaseLogSearchEndDateValue}
                setSearchEndDateValue={setPurchaseLogSearchEndDateValue}
                searchLoading={purchaseLogSearchLoading}
                purchasesLogs={purchaseLogs}
                page={purchaseLogPage}
                totalPages={purchaseLogTotalPages}
                handlePageChange={handlePurchaseLogPageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}

          {canUpdatePurchaseInventories && (
            <CModal
              visible={visibileModalArrived}
              onClose={() => setVisibileModalArrived(false)}
              aria-labelledby="LiveDemoExampleLabel"
            >
              <CModalHeader>
                <CModalTitle id="LiveDemoExampleLabel">Konfirmasi Penerimaan Barang</CModalTitle>
              </CModalHeader>
              <CForm noValidate onSubmit={handleReceivedQuantitySubmit}>
                <CModalBody>
                  {arrivedError && <CAlert color="danger">{arrivedError}</CAlert>}

                  {receivedPurchaseInventories.map((item, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol lg={4} className="mb-2">
                        <CFormLabel className="fw-bold">Nama Barang</CFormLabel>
                        <CFormInput
                          type="text"
                          readOnly
                          value={`${item.inventory.name} | ${item.inventory.condition === 1 ? 'BARU' : 'BEKAS'}`}
                          required
                          disabled
                        />
                      </CCol>
                      <CCol lg={4} className="mb-2">
                        <CFormLabel className="fw-bold">Qty Pembelian</CFormLabel>
                        <CFormInput type="text" readOnly value={item.quantity} disabled />
                      </CCol>
                      <CCol lg={4} className="mb-2">
                        <CFormLabel className="fw-bold">Qty Diterima</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Arrived Qty"
                          value={item.receivedQuantity}
                          disabled={arrivedLoading}
                          onChange={(e) => handleArrivedQuantityChange(index, e.target.value)}
                        />
                      </CCol>
                    </CRow>
                  ))}
                </CModalBody>
                <CModalFooter>
                  <CLoadingButton
                    type="submit"
                    color="primary"
                    loading={arrivedLoading}
                    disabled={arrivedLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>

                  <CButton color="secondary" onClick={() => setVisibileModalArrived(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>
          )}

          {canCreatePurchasePayment && (
            <CModal
              visible={visibileModalPayment}
              onClose={() => setVisibileModalPayment(false)}
              aria-labelledby="LiveDemoExampleLabel"
            >
              <CForm onSubmit={handlePaymentSubmit} noValidate>
                <CModalHeader>
                  <CModalTitle id="LiveDemoExampleLabel">Pembayaran</CModalTitle>
                </CModalHeader>
                <CModalBody>
                  {paymentError && <CAlert color="danger">{paymentError}</CAlert>}
                  {paymentSuccess && <CAlert color="success">{paymentSuccess}</CAlert>}

                  <div className="mt-3 mb-3">
                    <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>

                    <CFormRange
                      id="customRange1"
                      min={0}
                      max={purchase.remainingBalance}
                      onChange={(e) => setAmountPaidValue(e.target.value)}
                      disabled={paymentLoading}
                      value={amountPaidValue}
                    />

                    <CFormInput
                      type="text"
                      value={formatRupiah(amountPaidValue)}
                      onChange={(e) => handlePaymentAmount(e.target.value)}
                      disabled={paymentLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="paymentMethod" className="fw-bold d-block">
                      Metode Pembayaran
                    </CFormLabel>
                    <CFormCheck
                      inline
                      type="radio"
                      name="paymentMethod"
                      id="transfer"
                      label="Transfer"
                      value="transfer"
                      checked={checkedPaymentMethodOptions === 'transfer'}
                      onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                      disabled={paymentLoading}
                    />

                    <CFormCheck
                      inline
                      type="radio"
                      name="paymentMethod"
                      id="cash"
                      label="Tunai"
                      value="cash"
                      checked={checkedPaymentMethodOptions === 'cash'}
                      onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                      className="me-3"
                      disabled={paymentLoading}
                    />
                  </div>

                  {checkedPaymentMethodOptions === 'cash' && (
                    <div className="mb-3">
                      <CFormLabel className="fw-bold">Penerima uang tunai</CFormLabel>
                      <CFormInput
                        type="text"
                        value={cashRecipentValue}
                        onChange={(e) => setCashRecipentValue(e.target.value)}
                        placeholder="Masukkan penerima uang tunai"
                        disabled={paymentLoading}
                      />
                    </div>
                  )}

                  {checkedPaymentMethodOptions === 'transfer' && (
                    <div>
                      <div className="mb-3">
                        <CFormLabel className="fw-bold">Bank</CFormLabel>
                        <CMultiSelect
                          options={bankOptions.map((option) => ({
                            ...option,
                            selected: option.value === bankValue.value,
                          }))}
                          onChange={(e) => {
                            if (e.length < 1) return
                            if (e[0].value === bankValue.value) return

                            setBankValue(e[0])
                          }}
                          multiple={false}
                          virtualScroller
                          visibleItems={5}
                          placeholder="Pilih bank"
                          cleaner={false}
                          disabled={paymentLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <CFormLabel className="fw-bold">Nomor Rekening</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            placeholder="Masukkan nomor rekening"
                            value={accountNumberValue}
                            onChange={(e) => setAccountNumberValue(e.target.value)}
                            disabled={paymentLoading}
                          />

                          <CButton
                            type="button"
                            color="primary"
                            variant="outline"
                            id="button-addon1"
                            onClick={handleCheckAccountNumber}
                            disabled={!!paymentError || paymentLoading}
                          >
                            Cek
                          </CButton>
                        </CInputGroup>
                      </div>

                      <div className="mb-3">
                        <CFormLabel className="fw-bold">Nama Rekening</CFormLabel>
                        <CFormInput type="text" readOnly value={accountNameValue} disabled />
                      </div>
                    </div>
                  )}
                </CModalBody>

                <CModalFooter>
                  <CLoadingButton
                    color="primary"
                    type="submit"
                    disabled={validatePaymentForm() !== null || paymentLoading}
                    loading={paymentLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>

                  <CButton color="secondary" onClick={() => setVisibileModalPayment(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailPurchase
