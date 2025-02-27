import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CLoadingButton,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { useEffect, useState } from 'react'
import FormCardLayout from '../../components/FormCardLayout'
import SelectDeliveryOrder from '../../components/delivery-orders/SelectDeliveryOrder'
import { faPlus, faRefresh, faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const shipmentDeliveryOrderTypeOptions = [
  { label: 'Pilih Tipe', value: '' },
  { label: 'Rumah', value: 'RUMAH' },
  { label: 'Kantor', value: 'KANTOR' },
  { label: 'Gudang', value: 'GUDANG' },
  { label: 'Ekspedisi', value: 'EKSPEDISI' },
  { label: 'Lainnya', value: 'LAINNYA' },
]

const matchingShipmentDeliveryOrderType = shipmentDeliveryOrderTypeOptions
  .filter((option) => option.value)
  .map((option) => option.value)

const NUM_REGEX = /^[1-9][0-9]*$/
const TEXT_REGEX = /^.{3,60000}$/

export default function CreateDeliveryOrder({
  deliveryOrders,
  setDeliveryOrders,
  loading,
  navigate,
  logout,
  axiosPrivate,
}) {
  const [deliveryOrderValue, setDeliveryOrderValue] = useState('')
  const [shipmentDeliveryOrderTypeValue, setShipmentDeliveryOrderTypeValue] = useState('')
  const [deliveryOrder, setDeliveryOrder] = useState()
  const [useDOAddress, setUseDOAddress] = useState(false) // Track checkbox state
  const [addressValue, setAddressValue] = useState('')

  const [deliveryOrderValid, setDeliveryOrderValid] = useState(false)
  const [shipmentDeliveryOrderTypeValid, setShipmentDeliveryOrderTypeValid] = useState('')
  const [addressValid, setAddressValid] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [
    deliveryOrderValue,
    shipmentDeliveryOrderTypeValue,
    deliveryOrder,
    useDOAddress,
    addressValue,
  ])

  useEffect(() => {
    setDeliveryOrderValid(NUM_REGEX.test(deliveryOrderValue?.value))

    if (NUM_REGEX.test(deliveryOrderValue?.value)) {
      fetchDeliveryOrder(deliveryOrderValue.value)
    }
  }, [deliveryOrderValid, deliveryOrderValue])

  useEffect(() => {
    setAddressValid(TEXT_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    if (addressValue !== deliveryOrder?.address) {
      setUseDOAddress(false)
    }
  }, [addressValue, deliveryOrder?.address])

  useEffect(() => {
    setShipmentDeliveryOrderTypeValid(
      matchingShipmentDeliveryOrderType.includes(shipmentDeliveryOrderTypeValue),
    )
  }, [shipmentDeliveryOrderTypeValue])

  useEffect(() => {
    if (deliveryOrders.length < 1) {
      clearInput()
    }
  }, [deliveryOrders])

  async function fetchDeliveryOrder(deliveryOrderId) {
    try {
      const response = await axiosPrivate.get(`/api/delivery-orders/${deliveryOrderId}`)

      setDeliveryOrder(response.data.data)
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

  function isFormValid() {
    const isCustomerValid = deliveryOrderValid
    const isAddressValid = addressValue === '' || addressValid
    const hasDOItem = deliveryOrder?.deliveryOrderItems.some(
      (item) => item.quantitySend > 0 && item.quantitySend <= item.pendingQuantity,
    )
    const isShipmentDeliveryOrderType = shipmentDeliveryOrderTypeValid

    return isCustomerValid && isAddressValid && hasDOItem && isShipmentDeliveryOrderType && !error
  }

  function handleAddDOItem(e) {
    if (!isFormValid())
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')

    const isDuplicate = deliveryOrders.some(
      (order) => order.deliveryOrderId === deliveryOrder.deliveryOrderId,
    )

    if (isDuplicate) {
      return setError('Delivery Order dengan ID ini sudah ada dalam daftar.')
    }

    setDeliveryOrders((prev) => [
      ...prev,
      {
        deliveryOrderId: deliveryOrder.deliveryOrderId,
        customer: {
          customerId: deliveryOrder.customer.customerId,
          name: deliveryOrder.customer.name,
        },
        address: addressValue,
        shipmentDeliveryOrderType: shipmentDeliveryOrderTypeValue,
        deliveryOrderItems: deliveryOrder.deliveryOrderItems.filter(
          (item) => item.quantitySend > 0,
        ),
      },
    ])

    clearInput()
  }

  function handleQuantityChange(index, value) {
    if (deliveryOrder.deliveryOrderItems[index].pendingQuantity < value) {
      return setError('Kuantitas tidak bisa lebih besar dari kuantitas pending.')
    }

    setDeliveryOrder((prev) => {
      return {
        ...prev,
        deliveryOrderItems: prev.deliveryOrderItems.map((item, i) =>
          i === index ? { ...item, quantitySend: value } : item,
        ),
      }
    })
  }

  function clearInput() {
    setDeliveryOrderValue('')
    setShipmentDeliveryOrderTypeValue('')
    setDeliveryOrder()
    setUseDOAddress(false)
    setAddressValue('')
    setError('')
  }

  function handleRemoveItem(index) {
    setDeliveryOrders(deliveryOrders.filter((_, i) => i !== index))
  }

  return (
    <CRow>
      <CCol lg={12} className="mb-3">
        <CCard>
          <CCardHeader>
            <CRow className="align-items-center justify-content-between">
              <CCol xs="auto">
                <strong>Tambah DO</strong>
              </CCol>
              <CCol xs="auto">
                <CButton color="warning" type="button" disabled={loading} onClick={clearInput}>
                  <FontAwesomeIcon icon={faRefresh} />
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody>
            {' '}
            <CRow>
              {!!error && <CAlert color="danger">{error}</CAlert>}

              <CCol lg={6} className="mb-2">
                <SelectDeliveryOrder
                  placeholder="Cari DO berdasarkan Nama Kustomer atau ID DO"
                  formLoading={loading}
                  navigate={navigate}
                  deliveryOrderValue={deliveryOrderValue}
                  setDeliveryOrderValue={setDeliveryOrderValue}
                  axiosPrivate={axiosPrivate}
                  className={
                    deliveryOrderValue && deliveryOrderValid
                      ? 'is-valid'
                      : deliveryOrderValue && !deliveryOrderValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {deliveryOrderValid && deliveryOrderValue && (
                  <div className="valid-feedback">DO valid.</div>
                )}
                {!deliveryOrderValid && deliveryOrderValue && (
                  <div className="invalid-feedback">DO tidak valid.</div>
                )}
              </CCol>

              <CCol lg={6} className="mb-2">
                <CFormSelect
                  value={shipmentDeliveryOrderTypeValue}
                  onChange={(e) => setShipmentDeliveryOrderTypeValue(e.target.value)}
                  options={shipmentDeliveryOrderTypeOptions}
                  disabled={loading}
                  className={
                    shipmentDeliveryOrderTypeValue && shipmentDeliveryOrderTypeValid
                      ? 'is-valid'
                      : shipmentDeliveryOrderTypeValue && !shipmentDeliveryOrderTypeValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {!!shipmentDeliveryOrderTypeValid && !!shipmentDeliveryOrderTypeValue && (
                  <div className="valid-feedback">Tipe Pengiriman DO valid.</div>
                )}
                {!shipmentDeliveryOrderTypeValid && !!shipmentDeliveryOrderTypeValue && (
                  <div className="invalid-feedback">Tipe Pengiriman DO tidak valid.</div>
                )}
              </CCol>

              {deliveryOrder && (
                <>
                  <CCol lg={12} className="mb-1">
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableDataCell>
                              <CBadge color="danger">{`Kuantitas Pending`}</CBadge>
                            </CTableDataCell>
                            <CTableHeaderCell scope="col">
                              Kuantitas Yang Ingin Dikirim
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {deliveryOrder['deliveryOrderItems'].map((doi, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>DOI{doi.deliveryOrderItemId}</CTableDataCell>
                              <CTableDataCell>{doi.item.name}</CTableDataCell>
                              <CTableDataCell>
                                {Number(doi.pendingQuantity).toLocaleString()}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  inputMode="numeric"
                                  min={0}
                                  max={doi.pendingQuantity.toLocaleString()}
                                  value={Number(doi.quantitySend || 0).toLocaleString()}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.-]+/g, '') // Clean the input
                                    const numberValue = Number(value) // Convert to number

                                    if (!isNaN(numberValue)) {
                                      handleQuantityChange(index, numberValue)
                                    }
                                  }}
                                />
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  </CCol>

                  {deliveryOrder.address && (
                    <CCol className="mb-1" lg={12}>
                      <CFormCheck
                        reverse
                        id="reverseCheckbox1"
                        value="ALAMAT-DO"
                        checked={useDOAddress}
                        label="Memakai Alamat Dari DO"
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setUseDOAddress(isChecked)
                          setAddressValue(isChecked ? deliveryOrder.address || '' : '') // Use DO address or reset
                        }}
                      />
                    </CCol>
                  )}

                  <CCol className="mb-2">
                    <CFormLabel className="fw-bold">
                      Alamat <CBadge color="warning">Opsional</CBadge>
                    </CFormLabel>
                    <CFormTextarea
                      rows={2}
                      placeholder="Masukkan alamat"
                      disabled={loading}
                      value={addressValue}
                      onChange={(e) => setAddressValue(e.target.value)}
                      className={
                        addressValue && addressValid
                          ? 'is-valid'
                          : addressValue && !addressValid
                            ? 'is-invalid'
                            : ''
                      }
                    />
                    {addressValid && addressValue && (
                      <div className="valid-feedback">Alamat valid.</div>
                    )}
                    {!addressValid && addressValue && (
                      <div className="invalid-feedback">
                        Alamat harus berupa alfanumerik dan panjangnya antara 3 hingga 60.000
                        karakter.
                      </div>
                    )}
                  </CCol>
                </>
              )}
            </CRow>
          </CCardBody>

          <CCardFooter>
            <CLoadingButton
              color="primary"
              type="submit"
              disabled={loading || !isFormValid()}
              loading={loading}
              onClick={handleAddDOItem}
            >
              <FontAwesomeIcon icon={faSave} />
            </CLoadingButton>
          </CCardFooter>
        </CCard>
      </CCol>

      <CCol lg={12} className="mb-3">
        <CAccordion>
          {deliveryOrders.map((doItem, index) => (
            <CAccordionItem key={index} itemKey={index + 1}>
              <CAccordionHeader>
                <CRow className="align-items-center justify-content-between">
                  <CCol xs="auto">
                    <strong>
                      DO{doItem.deliveryOrderId} | {doItem.customer.name}
                    </strong>
                  </CCol>
                  <CCol xs="auto">
                    <CButton
                      color="danger"
                      className="me-2"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </CButton>
                  </CCol>
                </CRow>
              </CAccordionHeader>
              <CAccordionBody>
                <CListGroup flush>
                  <CListGroupItem>Tipe : {doItem.shipmentDeliveryOrderType}</CListGroupItem>
                  <CListGroupItem>
                    Alamat : {doItem.address || 'Alamat tidak dicantumkan.'}
                  </CListGroupItem>
                </CListGroup>
                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                        <CTableHeaderCell scope="col">
                          Kuantitas Yang Ingin Dikirim
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {doItem.deliveryOrderItems.map((doi, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>DOI{doi.deliveryOrderItemId}</CTableDataCell>
                          <CTableDataCell>{doi.item.name}</CTableDataCell>
                          <CTableDataCell>
                            {Number(doi.quantitySend).toLocaleString()}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CAccordionBody>
            </CAccordionItem>
          ))}
        </CAccordion>
      </CCol>
    </CRow>
  )
}
