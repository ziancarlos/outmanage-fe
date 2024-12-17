import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CButton,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CMultiSelect,
  useDebouncedCallback,
  CLoadingButton,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import useLogout from '../../../hooks/useLogout'
import { useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import { formatRupiah, handlePriceInput } from '../../../utils/CurrencyUtils'
import Swal from 'sweetalert2'
const INTERNAL_NOTE_REGEX = /^.{3,60000}$/

const CreateRent = () => {
  const [selectedType, setSelectedType] = useState('project') // 'client' or 'proyek'

  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [error, setError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const [clientsOptions, setClientsOptions] = useState([])
  const [fetchClientsLoading, setFetchClientsLoading] = useState(false)

  const [projectsOptions, setProjectsOptions] = useState([])
  const [fetchProjectsLoading, setFetchProjectsLoading] = useState(false)

  const [inventoriesOptions, setInventoryOptions] = useState([])
  const [fetchInventoriesLoading, setFetchInventoriesLoading] = useState(false)

  const [clientValue, setClientValue] = useState('')
  const [projectValue, setProjectValue] = useState('')
  const [deliveryFeeValue, setDeliveryFeeValue] = useState('0')
  const [returnFeeValue, setReturnFeeValue] = useState('0')
  const [securityDepositValue, setSecurityDepositValue] = useState('0')
  const [internalNoteValue, setInternalNoteValue] = useState('')

  const [inventoryValue, setInventoryValue] = useState('')
  const [quantityValue, setQuantityValue] = useState()
  const [pricePerUnitValue, setPricePerUnitValue] = useState()

  const [items, setItems] = useState([])

  function clearInput() {
    setSelectedType('project')
    setError('')
    setClientsOptions([])
    setProjectsOptions([])
    setInventoryOptions([])
    setClientValue('')
    setProjectValue('')
    setDeliveryFeeValue('0')
    setReturnFeeValue('0')
    setSecurityDepositValue('0')
    setInternalNoteValue('')
    setInventoryValue('')
    setQuantityValue('')
    setPricePerUnitValue('')
    setItems([])
  }

  const fetchClients = async (value) => {
    if (!value) return

    setFetchClientsLoading(true)

    try {
      try {
        const params = value
          ? { name: value, phoneNumber: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/clients', { params })
        const options = response.data.data.map((client) => ({
          value: client.clientId,
          label: `${client.name} | ${client.phoneNumber}`,
        }))

        setClientsOptions(options)
      } catch (e) {
        console.log(e)
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
      setFetchClientsLoading(false)
    }
  }

  const debouncedFetchClients = useDebouncedCallback((value) => {
    fetchClients(value)
  }, 300)

  const fetchProjects = async (value) => {
    if (!value) return

    setFetchProjectsLoading(true)

    try {
      try {
        const params = value
          ? { name: value, phoneNumber: value, page: 1, size: 5 }
          : { page: 1, size: 5 }
        const response = await axiosPrivate.get('/api/projects', { params })
        const options = response.data.data.map((project) => ({
          value: project.projectId,
          label: `${project.name} | ${project.client.name}`,
        }))

        setProjectsOptions(options)
      } catch (e) {
        console.log(e)
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
      setFetchProjectsLoading(false)
    }
  }

  const debouncedFetchProjects = useDebouncedCallback((value) => {
    fetchProjects(value)
  }, 300)

  const fetchInventories = async (value) => {
    if (!value) return

    setFetchInventoriesLoading(true)
    try {
      const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/inventories', { params })

      const options = response.data.data.map((inventory) => ({
        value: inventory.inventoryId,
        label: `${inventory.name} | ${inventory.condition === 0 ? 'BARU' : 'BEKAS'}`,
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

  function handleRemoveItem(index) {
    if (index < 0 || index >= items.length) return

    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
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
        'Pastikan semua barang memiliki inventaris, kuantitas, dan harga per satuan adalah angka.',
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

  function calculateTotalPrice() {
    return (
      items.reduce((total, item) => total + (item.pricePerUnit || 0) * (item.quantity || 0), 0) +
      Number(deliveryFeeValue) +
      Number(returnFeeValue)
    )
  }

  function validateForm() {
    if (selectedType === 'client' && clientValue === '') {
      return 'Harap pilih klien.'
    }

    if (selectedType === 'project' && projectValue === '') {
      return 'Harap pilih proyek.'
    }

    if (items.length < 1) {
      return 'Harap tambahkan setidaknya satu barang.'
    }

    if (
      items.some(
        (item) =>
          !item.inventory || isNaN(parseInt(item.quantity)) || isNaN(parseInt(item.pricePerUnit)),
      )
    ) {
      return 'Harap pastikan semua barang memiliki inventaris, kuantitas, dan harga. Kuantitas dan harga harus berupa angka.'
    }

    if (items.some((item) => item.quantity < 1 || item.pricePerUnit < 1)) {
      return 'Kuantitas dan harga barang harus lebih besar dari 0.'
    }

    if (internalNoteValue && !INTERNAL_NOTE_REGEX.test(internalNoteValue)) {
      return 'Catatan internal harus memiliki minimal 3 karakter dan maksimal 60.000 karakter.'
    }

    return null
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
        items: items.map((item) => {
          return {
            inventoryId: item.inventory.value,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          }
        }),
      }

      if (projectValue && selectedType === 'project') {
        request.projectId = projectValue.value
      } else {
        request.clientId = clientValue.value
      }

      if (internalNoteValue) {
        request.internalNote = internalNoteValue
      }

      if (Number(deliveryFeeValue) > 0) {
        request.deliveryShipmentFee = deliveryFeeValue
      }

      if (Number(returnFeeValue) > 0) {
        request.deliveryReturnFee = returnFeeValue
      }
      if (Number(securityDepositValue) > 0) {
        request.depositAmount = securityDepositValue
      }

      await axiosPrivate.post('/api/transactions/rents', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi penyewaan berhasil dibuat.',
        confirmButtonText: 'OK',
      })

      clearInput()
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
    <CRow className="mb-3">
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Tambah Transaksi Penyewaan</strong>
          </CCardHeader>
          <CForm onSubmit={handleSubmit}>
            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}

              {/* Radio buttons for selecting Klien or Proyek */}
              <div className="mb-3">
                <CFormLabel className="fw-bold d-block">Pilih Tipe</CFormLabel>
                <CFormCheck
                  inline
                  type="radio"
                  name="transactionType"
                  id="project"
                  label="Proyek"
                  value="project"
                  checked={selectedType === 'project'}
                  onChange={() => setSelectedType('project')}
                />

                <CFormCheck
                  inline
                  type="radio"
                  name="transactionType"
                  id="client"
                  label="Klien"
                  value="client"
                  checked={selectedType === 'client'}
                  onChange={() => setSelectedType('client')}
                />
              </div>

              {/* Conditionally rendered fields based on selected type */}

              {selectedType === 'project' && (
                <div className="mb-3">
                  <CMultiSelect
                    label={'Proyek'}
                    multiple={false}
                    onFilterChange={debouncedFetchProjects}
                    options={projectsOptions}
                    loading={fetchProjectsLoading}
                    disabled={submitLoading}
                    onChange={(e) => {
                      if (e.length < 1) return

                      setProjectValue(e[0] || null)
                    }}
                    onShow={fetchProjects}
                    resetSelectionOnOptionsChange={true}
                    cleaner={false}
                  />
                </div>
              )}

              {selectedType === 'client' && (
                <div className="mb-3">
                  <CMultiSelect
                    label={'Klien'}
                    multiple={false}
                    onFilterChange={debouncedFetchClients}
                    options={clientsOptions}
                    loading={fetchClientsLoading}
                    disabled={submitLoading}
                    onChange={(e) => {
                      if (e.length < 1) return

                      setClientValue(e[0] || null)
                    }}
                    onShow={fetchClients}
                    resetSelectionOnOptionsChange={true}
                    cleaner={false}
                  />
                </div>
              )}

              <div className="mb-3">
                <CFormLabel className="fw-bold me-2">Barang Penyewaan</CFormLabel>
                <CRow className="align-items-center mb-2">
                  <CCol lg={5} className="mb-2">
                    <CMultiSelect
                      options={inventoriesOptions}
                      multiple={false}
                      onShow={fetchInventories}
                      onFilterChange={debouncedFetchInventories}
                      disabled={submitLoading}
                      onChange={(e) => {
                        if (e.length < 1) return

                        const itemExists = items.some(
                          (item) => item?.inventory?.value === e[0]?.value,
                        )

                        if (itemExists) {
                          setInventoryOptions([])

                          setError('Barang ini sudah ada dalam daftar.')

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
                      type="text"
                      placeholder="Kuantitas"
                      min={1}
                      disabled={submitLoading}
                      value={quantityValue || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (
                          value === '0' ||
                          (!isNaN(value) && Number(value) >= 0 && !/^0\d+/.test(value))
                        ) {
                          setQuantityValue(value)
                        }
                      }}
                    />
                  </CCol>
                  <CCol lg={4} className="mb-2">
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
                  <CCol lg={1}>
                    <CButton color="primary" onClick={handleAddItem}>
                      <FontAwesomeIcon icon={faPlus} />
                    </CButton>
                  </CCol>
                </CRow>
              </div>

              {/* Table for added items */}
              <div className="mb-3">
                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Biaya Satuan Bulanan</CTableHeaderCell>
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
                          <CTableDataCell>{formatRupiah(item.pricePerUnit)}</CTableDataCell>
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
                <CRow>
                  <CCol md={6}>
                    <CFormLabel className="fw-bold">Ongkos Antar</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Ongkos Antar"
                      disabled={submitLoading}
                      value={formatRupiah(deliveryFeeValue || '0')}
                      onChange={(e) => {
                        const value = handlePriceInput(e.target.value)
                        if (!isNaN(value) && Number(value) >= 0) {
                          setDeliveryFeeValue(value)
                        }
                      }}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-bold">Ongkos Jemput</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Ongkos Jemput"
                      disabled={submitLoading}
                      value={formatRupiah(returnFeeValue || '0')}
                      onChange={(e) => {
                        const value = handlePriceInput(e.target.value)
                        if (!isNaN(value) && Number(value) >= 0) {
                          setReturnFeeValue(value)
                        }
                      }}
                    />
                  </CCol>
                </CRow>
              </div>
              <div className="mb-3">
                <CFormLabel className="fw-bold">Estimasi Total Harga</CFormLabel>
                <CFormInput
                  type="text"
                  readOnly
                  disabled={submitLoading}
                  value={formatRupiah(calculateTotalPrice())}
                />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-bold">Deposit Keamanan</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Deposit Keamanan"
                  disabled={submitLoading}
                  value={formatRupiah(securityDepositValue || '0')}
                  onChange={(e) => {
                    const value = handlePriceInput(e.target.value)
                    if (!isNaN(value) && Number(value) >= 0) {
                      setSecurityDepositValue(value)
                    }
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-bold">Catatan Internal</CFormLabel>
                <CFormTextarea
                  rows={3}
                  placeholder="Masukkan catatan internal"
                  disabled={submitLoading}
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
              <CButton color="danger" onClick={clearInput}>
                <FontAwesomeIcon icon={faTimes} />
              </CButton>
            </CCardFooter>
          </CForm>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateRent
