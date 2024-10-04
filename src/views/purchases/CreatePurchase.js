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
import { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { formatRupiah, handlePriceInput } from '../../utils/CurrencyUtils'
import { useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import Swal from 'sweetalert2'

const CreatePurchase = () => {
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [suppliersOptions, setSuppliersOptions] = useState([])
  const [supplierValue, setSupplierValue] = useState('')
  const [fetchSuppliersLoading, setFetchSuppliersLoading] = useState(false)

  const [inventoriesOptions, setInventoryOptions] = useState([])
  const [fetchInventoriesLoading, setFetchInventoriesLoading] = useState(false)

  const [items, setItems] = useState([])

  const [inventoryValue, setInventoryValue] = useState('')
  const [quantityValue, setQuantityValue] = useState()
  const [pricePerUnitValue, setPricePerUnitValue] = useState()

  const [amountPaid, setAmountPaid] = useState(0)

  const [bankValue, setBankValue] = useState('')
  const [bankOptions, setBankOptions] = useState([])

  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')

  const [cashRecipentValue, setCashRecipentValue] = useState('')

  const [descriptionValue, setDescriptionValue] = useState('')

  const [bankError, setBankError] = useState('')
  const [bankSuccess, setBankSuccess] = useState('')

  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')

  useEffect(() => {
    setError('')
  }, [inventoryValue, quantityValue, pricePerUnitValue])

  useEffect(() => {
    fetchBankOptions()
  }, [])

  useEffect(() => {
    setBankError('')
    setBankSuccess('')
  }, [bankValue, accountNumberValue])

  function calculateTotalPrice() {
    return items.reduce((total, item) => total + (item.pricePerUnit || 0) * (item.quantity || 0), 0)
  }

  function handlePaymentAmount(value) {
    setAmountPaid(
      Math.max(0, Math.min(Number(value.replace(/[^0-9]/g, '')), calculateTotalPrice())),
    )
  }

  function handleRemoveItem(index) {
    if (index < 0 || index >= items.length) return

    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)

    const newTotalPrice = newItems.reduce((total, item) => {
      const price = Number(item.pricePerUnit) || 0
      const quantity = Number(item.quantity) || 0
      return total + price * quantity
    }, 0)

    if (amountPaid > newTotalPrice) {
      setAmountPaid(newTotalPrice)
    }
  }

  function handleAddItem(e) {
    e.preventDefault()

    function resetForm() {
      setInventoryOptions([])
      setInventoryValue('')
      setQuantityValue('')
      setPricePerUnitValue('')
    }

    if (
      !inventoryValue?.value ||
      isNaN(parseInt(quantityValue)) ||
      isNaN(parseInt(pricePerUnitValue))
    ) {
      setError(
        'Pastikan semua item memiliki inventaris, kuantitas, dan harga per satuan adalah angka.',
      )

      return
    }

    setItems((prev) => {
      return [
        ...prev,
        {
          inventory: inventoryValue,
          quantity: quantityValue,
          pricePerUnit: pricePerUnitValue,
        },
      ]
    })

    resetForm()
  }

  const fetchSuppliers = async (value) => {
    setFetchSuppliersLoading(true)

    try {
      try {
        const params = value
          ? { name: value, phoneNumber: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/suppliers', { params })
        const options = response.data.data.map((supplier) => ({
          value: supplier.supplierId,
          label: `${supplier.name} | ${supplier.phoneNumber}`,
        }))

        setSuppliersOptions(options)
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
      setFetchSuppliersLoading(false)
    }
  }

  const debouncedFetchSuppliers = useDebouncedCallback((value) => {
    fetchSuppliers(value)
  }, 300)

  const fetchInventories = async (value) => {
    if (!value) return

    setFetchInventoriesLoading(true)
    try {
      const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/inventories', { params })

      const options = response.data.data.map((inventory) => ({
        value: inventory.inventoryId,
        label: `${inventory.name} | ${inventory.condition === 'NEW' ? 'BARU' : 'BEKAS'}`,
        name: inventory.name,
        condition: inventory.condition,
      }))

      setInventoryOptions(options)
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
    } finally {
      setFetchInventoriesLoading(false)
    }
  }

  const debouncedFetchInventories = useDebouncedCallback((value, index) => {
    fetchInventories(value, index)
  }, 300)

  async function fetchBankOptions() {
    setLoading(true)

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
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()

    console.log(items)
  }

  async function handleCheckAccountNumber() {
    setBankError('')
    setAccountNameValue('')

    try {
      setLoading(true)

      const response = await axiosPrivate.post('/api/bank', {
        bankCode: bankValue.value,
        accountNumber: accountNumberValue,
      })

      setAccountNameValue(response.data.data.accountName)

      setBankSuccess('Bank dan nomor rekening ditemukkan')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if (
        e.response?.status === 404 ||
        e.response?.status === 500 ||
        e.response?.status === 400
      ) {
        setBankError(e.response?.data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setSuppliersOptions([])
    setSupplierValue('')
    setInventoryOptions([])
    setInventoryValue('')
    setQuantityValue('')
    setPricePerUnitValue('')
    setItems([])
    setCheckedPaymentMethodOptions('transfer')
    setAmountPaid(0)
    setBankValue('')
    setAccountNameValue('')
    setAccountNumberValue('')
    setDescriptionValue('')
    setError('')
    setBankError('')
    setBankSuccess('')
    setCashRecipentValue('')
  }

  function validateForm() {
    if (supplierValue === '') {
      return 'Supplier must be selected'
    }

    if (items.length < 1) {
      return '.....'
    }

    if (
      items.some(
        (item) =>
          !item.inventory || isNaN(parseInt(item.quantity)) || isNaN(parseInt(item.pricePerUnit)),
      )
    ) {
      return 'Please ensure all items have inventory, quantity, and price, and both quantity and price are numbers.'
    }

    if (items.some((item) => item.quantity < 1 || item.pricePerUnit < 1)) {
      return 'Please ensure all items quantity and price is required and bigger than 0'
    }

    if (amountPaid > 0) {
      if (
        checkedPaymentMethodOptions === 'transfer' &&
        (!bankValue || !accountNumberValue || !accountNameValue)
      ) {
        return 'Please provide valid bank and account details for transfer.'
      }

      if (checkedPaymentMethodOptions === 'cash' && !cashRecipentValue) {
        return 'Please provide the cash recipient for cash payment.'
      }
      if (checkedPaymentMethodOptions === 'cash' && cashRecipentValue) {
        if (cashRecipentValue.length < 2) {
          return 'Cash recipent cannot be smaller than 3'
        }

        if (cashRecipentValue > 200) {
          return 'Cash recipent cannot be smaller than 200'
        }
      }
    }

    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSubmitLoading(true)

    try {
      const errorMessage = validateForm()
      if (errorMessage) {
        setError(errorMessage)
        return
      }

      let request = {
        supplierId: supplierValue.value,
        items: items.map((item) => {
          return {
            inventoryId: item.inventory.value,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          }
        }),
      }

      if (descriptionValue) {
        request = { ...request, description: descriptionValue }
      }

      if (amountPaid > 0) {
        if (checkedPaymentMethodOptions === 'transfer') {
          request = {
            ...request,
            paymentDetails: {
              bankCode: bankValue.value,
              accountNumber: accountNumberValue,
              amountPaid: amountPaid,
            },
          }
        }

        if (checkedPaymentMethodOptions === 'cash') {
          request = {
            ...request,
            paymentDetails: {
              cashRecipent: cashRecipentValue,
              amountPaid: amountPaid,
            },
          }
        }
      }

      await axiosPrivate.post('/api/purchases', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proyek berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()
      })
    } catch (e) {
      console.log(e)
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
                <strong>Tambah Pembelian</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}
                  {/* Supplier Selection */}
                  <div className="mb-3">
                    <CMultiSelect
                      onFilterChange={debouncedFetchSuppliers}
                      options={suppliersOptions}
                      loading={fetchSuppliersLoading}
                      disabled={submitLoading}
                      onChange={(e) => {
                        if (e.length < 1) return

                        setSupplierValue(e[0])
                      }}
                      onShow={fetchSuppliers}
                      label={'Pemasok'}
                      multiple={false}
                      resetSelectionOnOptionsChange={true}
                      cleaner={false}
                    />
                  </div>

                  {/* Inventory Items */}
                  <div className="mb-3">
                    <CFormLabel className="fw-bold me-2">Item Pembelian</CFormLabel>

                    <CRow className="align-items-center mb-2">
                      <CCol lg={3} className="mb-2">
                        <CMultiSelect
                          options={inventoriesOptions}
                          multiple={false}
                          onShow={fetchInventories}
                          onFilterChange={debouncedFetchInventories}
                          disabled={submitLoading}
                          onChange={(e) => {
                            if (e.length < 1) return

                            const itemExists = items.some(
                              (item) => item?.inventory?.value === e[0].value,
                            )

                            if (itemExists) {
                              setInventoryOptions([])

                              setError('Item ini sudah ada dalam daftar.')

                              return
                            }

                            setInventoryValue(e[0] || null)
                          }}
                          resetSelectionOnOptionsChange={true}
                          loading={fetchInventoriesLoading}
                          cleaner={false}
                        />
                      </CCol>
                      <CCol lg={2} className="mb-2">
                        <CFormInput
                          type="number"
                          placeholder="Kuantitas"
                          min={1}
                          disabled={submitLoading}
                          value={quantityValue || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (!isNaN(value) && Number(value) > 0) {
                              setQuantityValue(value)
                            }
                          }}
                        />
                      </CCol>
                      <CCol lg={3} className="mb-2">
                        <CFormInput
                          type="text"
                          placeholder="Harga Satuan"
                          disabled={submitLoading}
                          value={pricePerUnitValue ? formatRupiah(pricePerUnitValue) : ''}
                          onChange={(e) => {
                            const value = handlePriceInput(e.target.value)
                            if (!isNaN(value) && Number(value) >= 0) {
                              setPricePerUnitValue(value)
                            }
                          }}
                        />
                      </CCol>
                      <CCol lg={3} className="mb-2">
                        <CFormInput
                          type="text"
                          placeholder="Total Harga"
                          value={
                            pricePerUnitValue && quantityValue
                              ? formatRupiah(pricePerUnitValue * quantityValue)
                              : ''
                          }
                          readOnly
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
                            <CTableHeaderCell scope="col">Harga Satuan</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Total Harga</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {items.map((item, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{item.inventory.name}</CTableDataCell>
                              <CTableDataCell>
                                {item.inventory.condition === 'NEW' ? (
                                  <CBadge color="primary">BARU</CBadge>
                                ) : item.inventory.condition === 'USED' ? (
                                  <CBadge color="warning">BEKAS</CBadge>
                                ) : (
                                  <span>{item.inventory.condition}</span> // Fallback for any other condition
                                )}{' '}
                              </CTableDataCell>
                              <CTableDataCell>{item.quantity}</CTableDataCell>
                              <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
                              <CTableDataCell>
                                {formatRupiah(item.quantity * item.pricePerUnit)}
                              </CTableDataCell>
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

                  {/* Total Price */}
                  <div className="mb-3">
                    <CFormLabel className="fw-bold">Total Harga</CFormLabel>
                    <CFormInput
                      type="text"
                      readOnly
                      disabled={submitLoading}
                      value={formatRupiah(calculateTotalPrice())}
                    />
                  </div>

                  {/* Payment Options */}
                  <div>
                    <div className="mb-3">
                      <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>
                      <CFormRange
                        id="customRange1"
                        min={0}
                        max={calculateTotalPrice()}
                        disabled={submitLoading}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        value={amountPaid}
                      />
                      <CFormInput
                        type="text"
                        value={formatRupiah(amountPaid)}
                        disabled={submitLoading}
                        onChange={(e) => {
                          const value = e.target.value

                          handlePaymentAmount(value)
                        }}
                      />
                    </div>

                    {amountPaid > 0 && (
                      <>
                        {bankError && <CAlert color="danger">{bankError}</CAlert>}

                        {bankSuccess && <CAlert color="success">{bankSuccess}</CAlert>}
                        {/* Payment Method */}
                        <div className="mb-3">
                          <CFormLabel htmlFor="paymentMethod" className="fw-bold d-block">
                            Metode Pembayaran
                          </CFormLabel>
                          <CFormCheck
                            inline
                            type="radio"
                            name="paymentMethod"
                            id="transfer"
                            disabled={submitLoading}
                            label="Transfer"
                            value={'transfer'}
                            checked={checkedPaymentMethodOptions === 'transfer'}
                            onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                          />
                          <CFormCheck
                            inline
                            type="radio"
                            name="paymentMethod"
                            id="cash"
                            disabled={submitLoading}
                            label="Tunai"
                            className="me-3"
                            value={'cash'}
                            checked={checkedPaymentMethodOptions === 'cash'}
                            onChange={(e) => setCheckedPaymentMethodOptions(e.target.value)}
                          />
                        </div>

                        {checkedPaymentMethodOptions === 'cash' && (
                          <div className="mb-3">
                            <CFormLabel className="fw-bold">Penerima Uang Tunai</CFormLabel>
                            <CFormInput
                              type="text"
                              disabled={submitLoading}
                              placeholder="Masukkan penerima uang tunai"
                              value={cashRecipentValue}
                              onChange={(e) => setCashRecipentValue(e.target.value)}
                            />
                          </div>
                        )}

                        {checkedPaymentMethodOptions === 'transfer' && (
                          <div className="mb-3">
                            <CRow>
                              <CCol lg={4} className="mb-3">
                                <CFormLabel className="fw-bold">Bank</CFormLabel>
                                <CMultiSelect
                                  options={bankOptions.map((option) => ({
                                    ...option,
                                    selected: option.value === bankValue.value, // Set selected property based on the current value
                                  }))}
                                  disabled={submitLoading}
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
                                />
                              </CCol>
                              <CCol lg={4} className="mb-3">
                                <CFormLabel className="fw-bold">Nomor Rekening</CFormLabel>
                                <CInputGroup>
                                  <CFormInput
                                    placeholder="Masukkan nomor rekening"
                                    value={accountNumberValue}
                                    disabled={submitLoading}
                                    onChange={(e) => setAccountNumberValue(e.target.value)}
                                  />
                                  <CButton
                                    type="button"
                                    color="primary"
                                    variant="outline"
                                    disabled={submitLoading}
                                    onClick={handleCheckAccountNumber}
                                  >
                                    Cek
                                  </CButton>
                                </CInputGroup>
                              </CCol>
                              <CCol lg={4} className="mb-3">
                                <CFormLabel className="fw-bold">Nama Rekening</CFormLabel>
                                <CFormInput
                                  type="text"
                                  readOnly
                                  value={accountNameValue}
                                  disabled
                                />
                              </CCol>
                            </CRow>
                          </div>
                        )}
                      </>
                    )}
                    {/* Description */}
                    <div className="mb-3">
                      <CFormLabel className="fw-bold">
                        Deskripsi <CBadge color="info">Optional</CBadge>
                      </CFormLabel>
                      <CFormTextarea
                        rows={3}
                        placeholder="Masukkan deskripsi"
                        value={descriptionValue}
                        onChange={(e) => setDescriptionValue(e.target.value)}
                        disabled={submitLoading}
                      />
                    </div>
                  </div>
                </CCardBody>

                <CCardFooter className="text-start">
                  <CLoadingButton
                    color="primary"
                    className="me-2"
                    type="submit"
                    disabled={submitLoading || validateForm() !== null}
                    loading={submitLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>
                  <CButton
                    color="danger"
                    type="button"
                    onClick={clearInput}
                    disabled={submitLoading}
                  >
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

export default CreatePurchase
