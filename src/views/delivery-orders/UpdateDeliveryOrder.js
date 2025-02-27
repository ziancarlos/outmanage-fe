import {
  CBadge,
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CFormTextarea,
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
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'
import SelectCustomer from '../../components/customers/SelectCustomer'
import SelectItem from '../../components/items/SelectItem'
import { faL, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const NUM_REGEX = /^[1-9][0-9]*$/

const TEXT_REGEX = /^.{3,60000}$/

export default function CreateDeliveryOrder() {
  const { deliveryOrderId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [initialDeliveryOrder, setInitialDeliveryOrder] = useState({})

  const [customerValue, setCustomerValue] = useState('')
  const [addressValue, setAddressValue] = useState('')
  const [internalNotesValue, setInternalNotesValue] = useState('')

  const [itemValue, setItemValue] = useState('')
  const [quantityValue, setQuantityValue] = useState('')
  const [items, setItems] = useState([])

  const [customerValid, setCustomerValid] = useState(false)
  const [addressValid, setAddressValid] = useState(false)
  const [internalNotesValid, setInternalNotesValid] = useState(false)
  const [itemValid, setItemValid] = useState(false)
  const [quantityValid, setQuantityValid] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    getDeliveryOrder().finally(() => {
      setLoading(false)
    })
  }, [])

  async function getDeliveryOrder() {
    try {
      const response = await axiosPrivate.get(`/api/delivery-orders/${deliveryOrderId}`)
      const data = response.data.data

      setInitialDeliveryOrder(data)
      setCustomerValue({ value: data.customer.customerId, label: data.customer.name })
      setAddressValue(data.address || '')
      setInternalNotesValue(data.internalNotes || '')
      setItems(
        data.deliveryOrderItems.map(({ item, orderedQuantity }) => {
          return {
            item: {
              value: item.itemId,
              label: item.name,
            },
            quantity: orderedQuantity,
          }
        }),
      )
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404, 400].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  useEffect(() => {
    setError('')
  }, [addressValue, internalNotesValue, items])
  useEffect(() => {
    setCustomerValid(NUM_REGEX.test(customerValue.value))
  }, [customerValue])
  useEffect(() => {
    setAddressValid(TEXT_REGEX.test(addressValue))
  }, [addressValue])
  useEffect(() => {
    setInternalNotesValid(TEXT_REGEX.test(internalNotesValue))
  }, [internalNotesValue])
  useEffect(() => {
    setItemValid(NUM_REGEX.test(itemValue.value))
  }, [itemValue])
  useEffect(() => {
    setQuantityValid(NUM_REGEX.test(quantityValue))
  }, [quantityValue])

  function isFormValid() {
    const isCustomerValid = customerValid
    const hasItems = items.length > 0
    const isAddressValid = addressValue === '' || addressValid
    const isInternalNotesValid = internalNotesValue === '' || internalNotesValid

    return isCustomerValid && hasItems && isAddressValid && isInternalNotesValid && isFormChanged()
  }

  function isFormChanged() {
    if (!initialDeliveryOrder) return false

    const isCustomerChanged = customerValue.value !== initialDeliveryOrder.customer.customerId
    const isAddressChanged = addressValue !== initialDeliveryOrder.address
    const isInternalNotesChanged = internalNotesValue !== initialDeliveryOrder.internalNotes

    const isItemsChanged =
      items.length !== initialDeliveryOrder.deliveryOrderItems.length ||
      items.some((item, index) => {
        const initialItem = initialDeliveryOrder.deliveryOrderItems[index]
        return (
          item.item.value !== initialItem.item.itemId ||
          item.quantity !== initialItem.orderedQuantity
        )
      })

    return isCustomerChanged || isAddressChanged || isInternalNotesChanged || isItemsChanged
  }

  function clearInput() {
    setCustomerValue('')
    setAddressValue('')
    setInternalNotesValue('')

    clearItemInput()

    setItems([])
  }

  function clearItemInput() {
    setItemValue('')
    setQuantityValue('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    if (!isFormChanged()) {
      return setError('Tidak ada perubahan yang terdeteksi pada formulir.')
    }

    setLoading(true)

    try {
      const request = {
        customerId: customerValue.value,
        items: items.map(({ item, quantity }) => {
          return { itemId: item.value, quantity }
        }),
      }

      if (internalNotesValue) {
        request.internalNotes = internalNotesValue
      }
      if (addressValue) {
        request.address = addressValue
      }
      await axiosPrivate.patch(`/api/delivery-orders/${deliveryOrderId}`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'DO berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/delivery-orders/data')
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([404, 400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function isItemFormValid() {
    if (!itemValid) {
      setError('Barang tidak valid.')
      clearItemInput()
      return false
    }
    if (!quantityValid) {
      setError('Kuantitas tidak valid.')
      clearItemInput()
      return false
    }
    return true
  }

  function isItemDuplicate() {
    // Check for duplicate itemValue
    const isDuplicate = items.some((item) => item.item.value === itemValue.value)

    if (isDuplicate) {
      setError('Barang sudah ada dalam daftar.')
      clearItemInput()
      return true
    }

    return false
  }

  function handleAddItem(e) {
    e.preventDefault()

    if (!isItemFormValid()) return

    if (isItemDuplicate()) return

    setItems([...items, { item: itemValue, quantity: quantityValue }])

    clearItemInput()
  }

  function handleRemoveItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <FormCardLayout
            title="Tambah DO"
            handleSubmit={handleSubmit}
            error={error}
            isFormValid={isFormValid}
          >
            <div className="mb-3">
              <SelectCustomer
                label={'Kustomer'}
                formLoading={loading}
                navigate={navigate}
                customerValue={customerValue}
                setCustomerValue={setCustomerValue}
                resetSelectionOnOptionsChange={false}
                axiosPrivate={axiosPrivate}
                className={
                  customerValue && customerValid
                    ? 'is-valid'
                    : customerValue && !customerValid
                      ? 'is-invalid'
                      : ''
                }
                defaultValue={customerValue}
              />

              {customerValid && customerValue && (
                <div className="valid-feedback">Kustomer valid.</div>
              )}
              {!customerValid && customerValue && (
                <div className="invalid-feedback">Kustomer tidak valid.</div>
              )}
            </div>

            <div className="mb-3">
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
              {addressValid && addressValue && <div className="valid-feedback">Alamat valid.</div>}
              {!addressValid && addressValue && (
                <div className="invalid-feedback">
                  Alamat harus berupa alfanumerik dan panjangnya antara 3 hingga 60.000 karakter.
                </div>
              )}
            </div>

            <CRow className="mb-2">
              <CFormLabel>Tambah Barang DO</CFormLabel>
              <CCol lg={6} className="mb-2">
                <SelectItem
                  formLoading={loading}
                  navigate={navigate}
                  itemValue={itemValue}
                  setItemValue={setItemValue}
                  axiosPrivate={axiosPrivate}
                  className={
                    itemValue && itemValid
                      ? 'is-valid'
                      : itemValue && !itemValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {itemValid && itemValue && <div className="valid-feedback">Barang valid.</div>}
                {!itemValid && itemValue && (
                  <div className="invalid-feedback">Barang tidak valid.</div>
                )}
              </CCol>

              <CCol lg={4} className="mb-2">
                <CFormInput
                  inputMode="numeric"
                  placeholder="Kuantitas"
                  min={1}
                  disabled={loading}
                  value={quantityValue.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.-]+/g, '') // Clean the input
                    const numberValue = Number(value) // Convert to number

                    if (!isNaN(numberValue)) {
                      setQuantityValue(numberValue) // Update the state with the number
                    }
                  }}
                  className={
                    quantityValue && quantityValid
                      ? 'is-valid'
                      : quantityValue && !quantityValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {!!quantityValid && !!quantityValue && (
                  <div className="valid-feedback">Kustomer valid.</div>
                )}
                {!quantityValid && !!quantityValue && (
                  <div className="invalid-feedback">Kustomer tidak valid.</div>
                )}
              </CCol>

              <CCol lg={2}>
                <CButton color="primary" onClick={handleAddItem}>
                  <FontAwesomeIcon icon={faPlus} />
                </CButton>
              </CCol>
            </CRow>

            <div className="mb-3">
              <div className="table-responsive">
                <CTable striped bordered responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {items.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{item.item.label}</CTableDataCell>
                        <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            className="me-2"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-bold">
                Catatan Internal <CBadge color="warning">Opsional</CBadge>
              </CFormLabel>
              <CFormTextarea
                rows={2}
                placeholder="Masukkan catatan internal"
                disabled={loading}
                value={internalNotesValue}
                onChange={(e) => setInternalNotesValue(e.target.value)}
                className={
                  internalNotesValue && internalNotesValid
                    ? 'is-valid'
                    : internalNotesValue && !internalNotesValid
                      ? 'is-invalid'
                      : ''
                }
              />
              {internalNotesValid && internalNotesValue && (
                <div className="valid-feedback">Catatan internal valid.</div>
              )}
              {!internalNotesValid && internalNotesValue && (
                <div className="invalid-feedback">
                  Catatan internal harus berupa alfanumerik dan panjangnya antara 3 hingga 60.000
                  karakter.
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
