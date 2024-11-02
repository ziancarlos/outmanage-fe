import React, { useEffect, useRef, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CCardBody,
  CCard,
  CCardHeader,
  CCardFooter,
  CAlert,
  CFormTextarea,
  CRow,
  CCol,
  CLoadingButton,
  CFormSelect,
  CBadge,
  CSpinner,
  CFormRange,
  CFormCheck,
  CMultiSelect,
  CInputGroup,
  CButton,
} from '@coreui/react-pro'
import Swal from 'sweetalert2'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { formatRupiah, handlePriceInput } from '../../utils/CurrencyUtils'
import useLogout from '../../hooks/useLogout'
import { useNavigate } from 'react-router-dom'

const DESCRIPTION_REGEX = /^.{3,60000}$/
const CASH_RECIPIENT_REGEX = /^.{2,200}$/

function CreateOperationalExpense() {
  const logout = useLogout()
  const navigate = useNavigate()

  const [typeOptions, setTypeOptions] = useState([])
  const [typeValue, setTypeValue] = useState('')
  const [grandTotalValue, setGrandTotalValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')

  const [amountPaidValue, setAmountPaidValue] = useState(0)

  const [bankError, setBankError] = useState('')
  const [bankSuccess, setBankSuccess] = useState('')

  const [checkedPaymentMethodOptions, setCheckedPaymentMethodOptions] = useState('transfer')
  const [cashRecipentValue, setCashRecipentValue] = useState('')
  const [accountNumberValue, setAccountNumberValue] = useState('')
  const [accountNameValue, setAccountNameValue] = useState('')

  const [bankValue, setBankValue] = useState('')
  const [bankOptions, setBankOptions] = useState([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchBankOptions(), fetchType()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setError('')
  }, [typeValue, grandTotalValue, descriptionValue])

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
      } else if ([400, 404].includes(e.response?.status)) {
        setBankError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

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

  function handlePaymentAmount(value) {
    setAmountPaidValue(Math.max(0, Math.min(Number(value.replace(/[^0-9]/g, '')), grandTotalValue)))
  }

  async function fetchType() {
    try {
      const response = await axiosPrivate.get('/api/operational-expenses/types')
      setTypeOptions([
        { label: 'Pilih tipe pengeluaran', value: '' },
        ...response.data.data.map((type) => ({
          label: type.type,
          value: type.operationalExpenseTypeId,
        })),
      ])
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function validateForm() {
    if (!typeValue) {
      return 'Pilih tipe pengeluaran operasional yang valid.'
    }

    if (Number(grandTotalValue) <= 0) {
      return 'Jumlah pembayaran harus lebih dari 0.'
    }

    if (descriptionValue && !DESCRIPTION_REGEX.test(descriptionValue)) {
      return 'Deskripsi harus memiliki minimal 3 karakter dan maksimal 60.000 karakter.'
    }

    if (amountPaidValue > 0) {
      if (
        checkedPaymentMethodOptions === 'transfer' &&
        (!bankValue || !accountNumberValue || !accountNameValue)
      ) {
        return 'Harap berikan rincian bank dan rekening yang valid untuk transfer.'
      }

      if (checkedPaymentMethodOptions === 'cash') {
        if (!CASH_RECIPIENT_REGEX.test(cashRecipentValue)) {
          return 'Nama penerima uang tunai harus memiliki minimal 2 karakter dan tidak boleh lebih dari 200 karakter.'
        }
      }
    }

    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSubmitLoading(true)

    try {
      const message = validateForm()

      if (message !== null) {
        return setError(message)
      }

      const request = {
        operationalExpenseTypeId: typeValue,
        grandTotal: grandTotalValue,
      }

      if (descriptionValue) {
        request.description = descriptionValue
      }

      if (Number(amountPaidValue) > 0) {
        if (checkedPaymentMethodOptions === 'transfer') {
          request.paymentDetails = {
            bankCode: bankValue.value,
            accountNumber: accountNumberValue,
            amountPaid: amountPaidValue,
          }
        }

        if (checkedPaymentMethodOptions === 'cash') {
          request.paymentDetails = {
            cashRecipent: cashRecipentValue,
            amountPaid: amountPaidValue,
          }
        }
      }

      await axiosPrivate.post('/api/operational-expenses', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengeluaran operasional berhasil dibuat.',
        confirmButtonText: 'OK',
      })

      clearInput()

      navigate('/operational-expenses/data')
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

  function clearInput() {
    setTypeValue('')
    setGrandTotalValue('')
    setDescriptionValue('')
    setCheckedPaymentMethodOptions('transfer')
    setCashRecipentValue('')
    setBankOptions([])
    setBankValue('')
    setAccountNumberValue('')
    setAccountNameValue('')
    setAmountPaidValue(0)
    setBankError('')
    setBankSuccess('')
    setError('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader>
                <strong>Tambah Biaya Operasional</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {!!error && <CAlert color="danger">{error}</CAlert>}

                  <div className="mb-3">
                    <CFormLabel htmlFor="type">Tipe Pengeluaran</CFormLabel>
                    <CFormSelect
                      id="type"
                      value={typeValue}
                      onChange={(e) => setTypeValue(e.target.value)}
                      disabled={submitLoading}
                      options={typeOptions}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      label="Jumlah Pengeluaran"
                      id="amount"
                      type="text"
                      placeholder="Masukkan jumlah pengeluaran"
                      disabled={submitLoading}
                      value={grandTotalValue ? formatRupiah(grandTotalValue) : formatRupiah(0)}
                      onChange={(e) => {
                        const value = handlePriceInput(e.target.value)

                        if (!isNaN(value) && Number(value) >= 0) {
                          setGrandTotalValue(value)
                        }
                      }}
                    />
                  </div>

                  {grandTotalValue > 0 && (
                    <div className="mb-3">
                      <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>
                      <CFormRange
                        id="customRange1"
                        min={0}
                        max={parseInt(grandTotalValue)}
                        disabled={submitLoading}
                        onChange={(e) => setAmountPaidValue(e.target.value)}
                        value={amountPaidValue}
                      />

                      <CFormInput
                        type="text"
                        value={formatRupiah(amountPaidValue)}
                        disabled={submitLoading}
                        onChange={(e) => {
                          const value = e.target.value
                          handlePaymentAmount(value)
                        }}
                      />
                    </div>
                  )}

                  {grandTotalValue > 0 && amountPaidValue > 0 && (
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
                              <CFormInput type="text" readOnly value={accountNameValue} disabled />
                            </CCol>
                          </CRow>
                        </div>
                      )}
                    </>
                  )}

                  <div className="mb-3">
                    <CFormLabel htmlFor="description">
                      Deskripsi <CBadge color="info">Optional</CBadge>
                    </CFormLabel>
                    <CFormTextarea
                      id="description"
                      rows={3}
                      placeholder="Masukkan deskripsi pengeluaran"
                      disabled={submitLoading}
                      value={descriptionValue}
                      onChange={(e) => setDescriptionValue(e.target.value)}
                    />
                  </div>
                </CCardBody>

                <CCardFooter>
                  <CLoadingButton
                    color="primary"
                    type="submit"
                    disabled={submitLoading || validateForm() !== null}
                    loading={submitLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </CLoadingButton>
                </CCardFooter>
              </CForm>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default CreateOperationalExpense
