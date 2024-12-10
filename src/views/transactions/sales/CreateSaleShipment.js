import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CButton,
  CSpinner,
  CAlert,
  CFormRange,
  CBadge,
  CInputGroup,
  CMultiSelect,
  CLoadingButton,
  useDebouncedCallback,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react-pro'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef, useState } from 'react'
import { formatRupiah, handlePriceInput } from '../../../utils/CurrencyUtils'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../../hooks/useLogout'
import Swal from 'sweetalert2'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'

function CreateSaleShipment() {
  const { transactionSaleId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [items, setItems] = useState([])

  const [truckValue, setTruckValue] = useState('')
  const [truckOptions, setTruckOptions] = useState([])
  const [inventoryOptions, setInventoryOptions] = useState([])
  const inventoryOptionsRef = useRef([])
  const [inventoryValue, setInventoryValue] = useState('')
  const [quantityValue, setQuantityValue] = useState()
  const [multiSelectKey, setMultiSelectKey] = useState(0)
  const [internalNoteValue, setInternalNoteValue] = useState('')
  const [addressValue, setAddressValue] = useState('')

  useEffect(() => {
    setError('')
  }, [inventoryValue, quantityValue, items, truckValue, internalNoteValue, addressValue])

  useEffect(() => {
    setLoading(true)

    Promise.all([fetchTransactionSaleInventories(transactionSaleId), fetchTruckOptions()]).finally(
      () => setLoading(false),
    )
  }, [])

  async function fetchTruckOptions() {
    try {
      const response = await axiosPrivate.get('/api/trucks')

      const options = response.data.data.map((truck) => ({
        value: truck.truckId,
        label: ` ${truck.model} | ${truck.licensePlate} | ${truck.color.name} `,
      }))

      setTruckOptions(options)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setPaymentError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchTransactionSaleInventories(transactionSaleId) {
    try {
      const response = await axiosPrivate.get(
        `/api/transactions/sales/${transactionSaleId}/inventories`,
      )

      inventoryOptionsRef.current = response.data.data.map((item) => ({
        value: item.transactionSaleHasInventoryId,
        label: `${item.inventory.name} | ${item.inventory.condition === 0 ? 'BARU' : 'BEKAS'} | Belum Dikirim: ${item.unprocessedQuantity.toLocaleString()}`,
        arrivedQuantity: item.arrivedQuantity,
        quantity: item.quantity,
        inventory: item.inventory,
      }))

      setInventoryOptions(inventoryOptionsRef.current)
      setMultiSelectKey((prevKey) => prevKey + 1)
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

  function handleAddItem(e) {
    e.preventDefault()

    function resetForm() {
      const newOptions = [...inventoryOptionsRef.current]
      setInventoryOptions(newOptions)
      setMultiSelectKey((prevKey) => prevKey + 1)
      setInventoryValue('')
      setQuantityValue('')
      setError('')
    }

    if (!inventoryValue?.value || isNaN(parseInt(quantityValue)) || parseInt(quantityValue) < 0) {
      setError(
        'Pastikan setiap barang memiliki inventaris yang valid dan kuantitas adalah angka lebih dari 0.',
      )

      return
    }

    const undeliveredQuantity =
      Number(inventoryValue.quantity) - Number(inventoryValue.arrivedQuantity)

    if (undeliveredQuantity < Number(quantityValue)) {
      setError('Jumlah barang yang ingin dikirim melebihi kuantitas yang dipesan')
      return
    }

    setItems((prev) => {
      return [
        ...prev,
        {
          transactionSaleHasInventoryId: inventoryValue.value,
          inventory: inventoryValue.inventory,
          quantity: quantityValue,
        },
      ]
    })

    resetForm()
  }

  function handleRemoveItem(index) {
    if (index < 0 || index >= items.length) return

    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  function validateForm() {
    // Check if items array is empty
    if (items.length === 0) {
      return 'Harap tambahkan setidaknya satu barang ke daftar.'
    }

    // Check if each item has a valid inventory and quantity
    if (items.some((item) => !item.inventory || isNaN(parseInt(item.quantity)))) {
      return 'Pastikan setiap barang memiliki inventaris yang valid dan kuantitasnya adalah angka.'
    }

    // Check if quantity is greater than 0 for each item
    if (items.some((item) => parseInt(item.quantity) <= 0)) {
      return 'Kuantitas barang harus lebih besar dari 0.'
    }

    if (!internalNoteValue || internalNoteValue.length <= 3 || internalNoteValue.length >= 60000) {
      return 'Catatan internal harus diisi dan memiliki panjang lebih dari 3 karakter dan kurang dari 60000 karakter.'
    }

    if (addressValue && (addressValue.length <= 3 || internalNoteValue.length >= 60000)) {
      return 'Alamat harus diisi dan memiliki panjang lebih dari 3 karakter dan kurang dari 60000 karakter.'
    }

    return null // No validation errors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSubmitLoading(true)

    try {
      const errorMessage = validateForm()

      if (errorMessage) {
        return setError(errorMessage)
      }

      const request = {
        items: items.map((item) => ({
          transactionSaleHasInventoryId: item.transactionSaleHasInventoryId,
          quantity: item.quantity,
        })),
        internalNote: internalNoteValue,
      }

      if (addressValue) {
        request.address = addressValue
      }

      if (truckValue) {
        request.truckId = truckValue.value
      }

      await axiosPrivate.post(`/api/transactions/sales/${transactionSaleId}/shipments`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proses Pengiriman Transaksi pembelian berhasil dibuat.',
        confirmButtonText: 'OK',
      })
      clearInput()
      navigate(`/transactions/sales/${transactionSaleId}/detail`)
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
      setSubmitLoading(false)
    }
  }

  async function clearInput() {
    setTruckValue('')
    setItems([])
    setInternalNoteValue('')
    setInventoryValue('')
    setQuantityValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow className="mb-3">
          <CCol>
            <CCard>
              <CCardHeader>
                <strong>Tambah Transaksi Penjualan Pengiriman</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}

                  <div className="mb-3">
                    <CFormLabel className="fw-bold me-2">Barang Pembelian</CFormLabel>

                    <CRow className="align-items-center mb-2">
                      <CCol lg={6} className="mb-2">
                        <CMultiSelect
                          key={multiSelectKey}
                          options={inventoryOptions}
                          onChange={(e) => {
                            const itemExists = items.some((item) => {
                              return item?.transactionSaleShipmentId === e[0]?.value
                            })

                            if (itemExists) {
                              const newOptions = [...inventoryOptionsRef.current]
                              setInventoryOptions(newOptions)
                              setMultiSelectKey((prevKey) => prevKey + 1)
                              setInventoryValue('')

                              setError('Barang ini sudah ada dalam daftar.')

                              return
                            }

                            setInventoryValue(e[0])
                          }}
                          multiple={false}
                          virtualScroller
                          visibleItems={5}
                          placeholder="Pilih inventaris"
                          cleaner={false}
                          disabled={submitLoading}
                          resetSelectionOnOptionsChange
                        />{' '}
                      </CCol>

                      <CCol lg={5} className="mb-2">
                        <CFormInput
                          type="text"
                          placeholder="Kuantitas"
                          min={1}
                          disabled={submitLoading}
                          value={quantityValue || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            // Prevent leading zeros unless the value is "0"
                            if (
                              value === '0' ||
                              (!isNaN(value) && Number(value) >= 0 && !/^0\d+/.test(value))
                            ) {
                              setQuantityValue(value)
                            }
                          }}
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CButton color="primary" onClick={handleAddItem} disabled={submitLoading}>
                          <FontAwesomeIcon icon={faPlus} />
                        </CButton>
                      </CCol>
                    </CRow>
                  </div>

                  <div className="mb-3">
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {items.map((item, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{item.inventory.name}</CTableDataCell>
                              <CTableDataCell>
                                {item.inventory.condition === 0 ? (
                                  <CBadge color="primary">BARU</CBadge>
                                ) : item.inventory.condition === 1 ? (
                                  <CBadge color="warning">BEKAS</CBadge>
                                ) : (
                                  <span>{item.inventory.condition}</span> // Fallback for any other condition
                                )}{' '}
                              </CTableDataCell>
                              <CTableDataCell>{item.quantity}</CTableDataCell>
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
                  </div>

                  <div className="mb-3">
                    <CFormLabel className="fw-bold">
                      Truk <CBadge color="info">Optional</CBadge>
                    </CFormLabel>
                    <CMultiSelect
                      options={truckOptions.map((option) => ({
                        ...option,
                        selected: option.value === truckValue.value,
                      }))}
                      onChange={(e) => {
                        if (e.length < 1) return
                        if (e[0].value === truckValue.value) return

                        setTruckValue(e[0])
                      }}
                      multiple={false}
                      virtualScroller
                      visibleItems={5}
                      placeholder="Pilih truk"
                      cleaner={false}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel className="fw-bold">
                      Alamat Pengiriman <CBadge color="info">Optional</CBadge>
                    </CFormLabel>
                    <CFormTextarea
                      rows={3}
                      placeholder="Masukkan alamat pengiriman"
                      value={addressValue}
                      onChange={(e) => setAddressValue(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel className="fw-bold">Catatan Internal</CFormLabel>
                    <CFormTextarea
                      rows={3}
                      placeholder="Masukkan catatan internal"
                      value={internalNoteValue}
                      onChange={(e) => setInternalNoteValue(e.target.value)}
                    />
                  </div>
                </CCardBody>

                <CCardFooter className="text-start">
                  <CLoadingButton
                    color="primary"
                    className="me-2"
                    disabled={submitLoading || validateForm() !== null}
                    loading={submitLoading}
                    type="submit"
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>
                  <CButton color="danger" disabled={submitLoading} onClick={clearInput}>
                    <FontAwesomeIcon icon={faTimes} />
                  </CButton>
                </CCardFooter>
              </CForm>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default CreateSaleShipment
