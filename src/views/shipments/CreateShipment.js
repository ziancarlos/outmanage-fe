import {
  CRow,
  CCol,
  CFormInput,
  CFormTextarea,
  CSpinner,
  CButton,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableDataCell,
  CTableHeaderCell,
  CTableBody,
  CAlert,
  useDebouncedCallback,
  CBadge,
} from '@coreui/react-pro'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { CMultiSelect } from '@coreui/react-pro'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

const LICENSE_PLATE_REGEX = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/
const ADDRESS_REGEX = /^.{3,60000}$/
const INTERNAL_NOTES_REGEX = /^.{3,60000}$/

export default function CreateShipment() {
  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [loading, setLoading] = useState(false)
  const [fetchShipmentTypesLoading, setFetchShipmentTypesLoading] = useState(false)
  const [fetchCustomerLoading, setFetchCustomerLoading] = useState(false)
  const [fetchItemsLoading, setFetchItemsLoading] = useState(false)
  const [error, setError] = useState('')

  const [customerOptions, setCustomerOptions] = useState([])
  const [shipmentTypesOptions, setShipmentTypesOptions] = useState([])
  const [itemsOptions, setItemsOptions] = useState([])

  const [customerValue, setCustomerValue] = useState('')
  const [shipmentTypeValue, setShipmentTypeValue] = useState('')
  const [licensePlateValue, setLicensePlateValue] = useState('')
  const [addressValue, setAddressValue] = useState('')
  const [internalNotesValue, setInternalNotesValue] = useState('')

  const [customerValid, setCustomerValid] = useState(false)
  const [shipmentTypeValid, setShipmentTypeValid] = useState(false)
  const [licensePlateValid, setLicensePlateValid] = useState(false)
  const [addressValid, setAddressValid] = useState(false)
  const [internalNotesValid, setInternalNotesValid] = useState(false)

  const [itemValue, setItemValue] = useState('')
  const [quantityValue, setQuantityValue] = useState('')

  const [itemValid, setItemValid] = useState('')
  const [quantityValid, setQuantityValid] = useState('')

  const [items, setItems] = useState([])

  const fetchItems = async (value) => {
    if (!value) return

    setFetchItemsLoading(true)

    try {
      try {
        const params = value
          ? { name: value, stockKeepingUnit: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/items', { params })
        const options = response.data.data.map((item) => ({
          value: item.itemId,
          label: `${item.name} | ${item.stockKeepingUnit}`,
        }))

        setItemsOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchItemsLoading(false)
    }
  }

  const debouncedFetchItems = useDebouncedCallback((value) => {
    fetchItems(value)
  }, 300)

  const fetchShipmentType = async (value) => {
    if (!value) return

    setFetchShipmentTypesLoading(true)

    try {
      try {
        const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/shipment-types', { params })
        const options = response.data.data.map((shipmentType) => ({
          value: shipmentType.shipmentTypeId,
          label: `${shipmentType.name}`,
        }))

        setShipmentTypesOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchShipmentTypesLoading(false)
    }
  }

  const debouncedFetchShipmentType = useDebouncedCallback((value) => {
    fetchShipmentType(value)
  }, 300)

  const fetchCustomer = async (value) => {
    if (!value) return

    setFetchCustomerLoading(true)

    try {
      try {
        const params = value
          ? { name: value, initials: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/customers', { params })
        const options = response.data.data.map((customer) => ({
          value: customer.customerId,
          label: `${customer.name} | ${customer.initials}`,
        }))

        setCustomerOptions(options)
      } catch (e) {
        if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
          await logout()
        } else if (e.response?.status === 401) {
          navigate('/404', { replace: true })
        } else if ([400].includes(e.response?.status)) {
          setError(e.response?.data.error)
        } else {
          navigate('/500')
        }
      }
    } finally {
      setFetchCustomerLoading(false)
    }
  }

  const debouncedFetchCustomer = useDebouncedCallback((value) => {
    fetchCustomer(value)
  }, 300)

  useEffect(() => {
    setError('')
  }, [shipmentTypeValue, licensePlateValue, addressValue, internalNotesValue, customerValue])

  useEffect(() => {
    setShipmentTypeValid(
      typeof shipmentTypeValue?.value === 'number' &&
        !Number.isNaN(shipmentTypeValue?.value) &&
        Number.isFinite(shipmentTypeValue?.value),
    )
  }, [shipmentTypeValue])

  useEffect(() => {
    setCustomerValid(
      typeof customerValue?.value === 'number' &&
        !Number.isNaN(customerValue?.value) &&
        Number.isFinite(customerValue?.value),
    )
  }, [customerValue])

  useEffect(() => {
    setLicensePlateValid(LICENSE_PLATE_REGEX.test(licensePlateValue))
  }, [licensePlateValue])

  useEffect(() => {
    setAddressValid(ADDRESS_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    setInternalNotesValid(INTERNAL_NOTES_REGEX.test(internalNotesValue))
  }, [internalNotesValue])

  useEffect(() => {
    setItemValid(
      typeof itemValue?.value === 'number' &&
        !Number.isNaN(itemValue?.value) &&
        Number.isFinite(itemValue?.value),
    )
  }, [itemValue])

  useEffect(() => {
    const isValidNumber = !isNaN(quantityValue) && Number(quantityValue) > 0

    setQuantityValid(isValidNumber)
  }, [quantityValue])

  function isFormValid() {
    const isLicensePlateValid = licensePlateValue.trim() === '' || licensePlateValid
    const isAddressValid = addressValue.trim() === '' || addressValid
    const isinternalNotesValid = internalNotesValue.trim() === '' || internalNotesValid

    return !(
      error ||
      !customerValid ||
      !shipmentTypeValid ||
      !isLicensePlateValid ||
      !isAddressValid ||
      !isinternalNotesValid ||
      items.length < 1
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    const request = {
      customerId: customerValue.value,
      shipmentTypeId: shipmentTypeValue.value,
      items: items.map((item) => {
        return {
          itemId: item.item.value,
          quantity: item.quantity,
        }
      }),
    }

    if (licensePlateValue) {
      request.licensePlate = licensePlateValue
    }
    if (addressValue) {
      request.address = addressValue
    }

    if (internalNotesValue) {
      request.internalNotes = internalNotesValue
    }

    try {
      await axiosPrivate.post('/api/shipments', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengiriman berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/shipments/data')
      })

      clearInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setShipmentTypeValue('')
    setShipmentTypesOptions([])
    setLicensePlateValue('')
    setAddressValue('')
    setInternalNotesValue('')
    clearAddItemInput()
    setItems([])
  }

  function clearAddItemInput() {
    setItemValue('')
    setQuantityValue('')
    setItemsOptions([])
  }

  function handleAddItem(e) {
    e.preventDefault()

    clearAddItemInput()

    if (!itemValid && !quantityValid) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menambahkan Item!',
        text: 'Silakan lengkapi data barang dan kuantitas sebelum melanjutkan.',
        confirmButtonText: 'OK',
      })

      return
    }

    setItems((prev) => {
      return [
        ...prev,
        {
          item: itemValue,
          quantity: quantityValue,
        },
      ]
    })
  }

  function handleRemoveItem(index) {
    if (index < 0 || index >= items.length) return

    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
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
            title="Tambah Pengiriman"
            handleSubmit={handleSubmit}
            error={error}
            isFormValid={isFormValid}
          >
            <CRow>
              <CCol md={12} className="mb-3">
                <CMultiSelect
                  options={customerOptions}
                  loading={fetchCustomerLoading}
                  onFilterChange={debouncedFetchCustomer}
                  onShow={fetchCustomer}
                  disabled={loading}
                  multiple={false}
                  resetSelectionOnOptionsChange={true}
                  cleaner={false}
                  label={'Kustomer'}
                  placeholder="Silahkan memilih kustomer"
                  onChange={(e) => {
                    setCustomerValue(e[0])
                  }}
                  className={
                    customerValue && customerValid
                      ? 'is-valid'
                      : customerValue && !customerValid
                        ? 'is-invalid'
                        : ''
                  }
                />
                {customerValue && customerValid && (
                  <div className="valid-feedback">Kustomer valid.</div>
                )}
                {!customerValue && customerValid && (
                  <div className="invalid-feedback">Silahkan memilih Kustomer.</div>
                )}
              </CCol>

              <CCol md={12} className="mb-3">
                <CMultiSelect
                  options={shipmentTypesOptions}
                  loading={fetchShipmentTypesLoading}
                  onFilterChange={debouncedFetchShipmentType}
                  onShow={fetchShipmentType}
                  disabled={loading}
                  multiple={false}
                  resetSelectionOnOptionsChange={true}
                  cleaner={false}
                  label={'Tipe Pengiriman'}
                  placeholder="Silahkan memilih tipe pengiriman"
                  onChange={(e) => {
                    setShipmentTypeValue(e[0])
                  }}
                  className={
                    shipmentTypeValue && shipmentTypeValid
                      ? 'is-valid'
                      : shipmentTypeValue && !shipmentTypeValid
                        ? 'is-invalid'
                        : ''
                  }
                />
                {shipmentTypeValue && shipmentTypeValid && (
                  <div className="valid-feedback">Tipe pengiriman valid.</div>
                )}
                {!shipmentTypeValue && shipmentTypeValid && (
                  <div className="invalid-feedback">Silahkan memilih tipe pengiriman.</div>
                )}
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel>
                  Plat Nomor <CBadge color="warning">Optional</CBadge>
                </CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Masukkan Plat Nomor"
                  value={licensePlateValue}
                  disabled={loading}
                  onChange={(e) => setLicensePlateValue(e.target.value)}
                  className={
                    licensePlateValue && licensePlateValid
                      ? 'is-valid'
                      : licensePlateValue && !licensePlateValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {licensePlateValid && licensePlateValue && (
                  <div className="valid-feedback">Plat nomor valid.</div>
                )}
                {!licensePlateValid && licensePlateValue && (
                  <div className="invalid-feedback">
                    Plat nomor harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)
                  </div>
                )}
              </CCol>

              <CCol md={6} className="mb-3">
                <CFormLabel>
                  Alamat <CBadge color="warning">Optional</CBadge>
                </CFormLabel>
                <CFormTextarea
                  rows={3}
                  placeholder="Masukkan Alamat"
                  onChange={(e) => setAddressValue(e.target.value)}
                  disabled={loading}
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
                    Alamat harus memiliki panjang 3-60.000 karakter
                  </div>
                )}
              </CCol>

              <CCol md={6} className="mb-3">
                <CFormLabel>
                  Catatan Internal <CBadge color="warning">Optional</CBadge>
                </CFormLabel>
                <CFormTextarea
                  rows={3}
                  disabled={loading}
                  placeholder="Masukkan Catatan Internal"
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
                  <div className="valid-feedback">Catatan Internal valid.</div>
                )}
                {!internalNotesValid && internalNotesValue && (
                  <div className="invalid-feedback">
                    Catatan Internal harus memiliki panjang 3-60.000 karakter
                  </div>
                )}
              </CCol>
            </CRow>

            <CCol xs={12}>
              {items.length === 0 && (
                <CAlert color="warning">Barang Dikirim harus lebih dari 1 barang.</CAlert>
              )}

              <CFormLabel className="fw-bold me-2">Barang Dikirim</CFormLabel>
              <CRow className="align-items-center mb-2">
                <CCol lg={7} className="mb-2">
                  <CMultiSelect
                    options={itemsOptions}
                    loading={fetchItemsLoading}
                    onFilterChange={debouncedFetchItems}
                    onShow={fetchItems}
                    disabled={loading}
                    multiple={false}
                    resetSelectionOnOptionsChange={true}
                    placeholder="Silahkan memilih barang..."
                    cleaner={false}
                    onChange={(e) => {
                      const itemExists = items.some((item) => item?.item?.value === e[0]?.value)

                      if (itemExists) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Gagal!',
                          text: 'Barang ini sudah ada dalam daftar pengiriman.',
                          confirmButtonText: 'OK',
                        })

                        clearAddItemInput()

                        return
                      }

                      setItemValue(e[0])
                    }}
                    className={
                      itemValue && itemValid
                        ? 'is-valid'
                        : itemValue && !itemValid
                          ? 'is-invalid'
                          : ''
                    }
                  />
                </CCol>
                <CCol lg={4} className="mb-2">
                  <CFormInput
                    type="text"
                    inputMode="numeric"
                    disabled={loading}
                    placeholder="Kuantitas"
                    value={quantityValue.toLocaleString() || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.-]+/g, '')
                      const numberValue = Number(value)

                      if (!isNaN(numberValue)) {
                        setQuantityValue(numberValue)
                      }
                    }}
                    className={
                      quantityValue !== '' && quantityValid
                        ? 'is-valid'
                        : quantityValue !== '' && !quantityValid
                          ? 'is-invalid'
                          : ''
                    }
                  />
                </CCol>

                <CCol lg={1}>
                  <CButton color="primary" onClick={handleAddItem}>
                    <FontAwesomeIcon icon={faPlus} />
                  </CButton>
                </CCol>

                <CCol xs={12} className="mt-1">
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Nama | SKU</CTableHeaderCell>
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
                                onClick={(e) => handleRemoveItem(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
