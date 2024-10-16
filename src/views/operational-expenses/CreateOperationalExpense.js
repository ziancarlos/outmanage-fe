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
} from '@coreui/react-pro'
import Swal from 'sweetalert2'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { formatRupiah, handlePriceInput } from '../../utils/CurrencyUtils'
import useLogout from '../../hooks/useLogout'
import { useNavigate } from 'react-router-dom'

const DESCRIPTION_REGEX = /^.{3,60000}$/

function CreateOperationalExpense() {
  const logout = useLogout()
  const navigate = useNavigate()

  const [typeOptions, setTypeOptions] = useState([])
  const [typeValue, setTypeValue] = useState('')
  const [amountValue, setAmountValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')

  const [typeValid, setTypeValid] = useState(false)
  const [amountValid, setAmountValid] = useState(false)
  const [descriptionValid, setDescriptionValid] = useState(false)

  const [amountTouched, setAmountTouched] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    fetchType()
  }, [])

  useEffect(() => {
    setTypeValid(typeValue !== '')
  }, [typeValue])

  useEffect(() => {
    setAmountValid(Number(amountValue) > 0)
  }, [amountValue])

  useEffect(() => {
    if (descriptionValue) {
      setDescriptionValid(DESCRIPTION_REGEX.test(descriptionValue))
    } else {
      setDescriptionValid(true)
    }
  }, [descriptionValue])

  useEffect(() => {
    setError('')
  }, [typeValue, amountValue, descriptionValue])

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

  function isFormValid() {
    if (
      error ||
      !typeValid ||
      (!descriptionValid && descriptionValue !== '') ||
      (!amountValid && amountTouched)
    ) {
      return false
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan isi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      const request = descriptionValue
        ? {
            operationalExpenseTypeId: typeValue,
            amount: amountValue,
            description: descriptionValue,
          }
        : {
            operationalExpenseTypeId: typeValue,
            amount: amountValue,
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
      setLoading(false)
    }
  }

  function clearInput() {
    setTypeValue('')
    setAmountTouched(false)
    setAmountValue('')
    setDescriptionValue('')
    setError('')
  }

  return (
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
                  disabled={loading}
                  className={
                    typeValue && typeValid
                      ? 'is-valid'
                      : typeValue && !typeValid
                        ? 'is-invalid'
                        : ''
                  }
                  options={typeOptions}
                />
                {!typeValid && typeValue && (
                  <div className="invalid-feedback">Pilih tipe pengeluaran yang valid.</div>
                )}
                {typeValid && typeValue && (
                  <div className="valid-feedback">Tipe pengeluaran valid.</div>
                )}
              </div>

              <div className="mb-3">
                <CFormInput
                  label="Jumlah Pengeluaran"
                  id="amount"
                  type="text"
                  placeholder="Masukkan jumlah pengeluaran"
                  disabled={loading}
                  onBlur={() => setAmountTouched(true)}
                  value={amountValue ? formatRupiah(amountValue) : formatRupiah(0)}
                  onChange={(e) => {
                    const value = handlePriceInput(e.target.value)

                    if (!isNaN(value) && Number(value) >= 0) {
                      setAmountValue(value)
                    }
                  }}
                  className={
                    amountValue && amountValid
                      ? 'is-valid'
                      : !amountValid && amountTouched
                        ? 'is-invalid'
                        : ''
                  }
                />
                {amountValid && amountValue && (
                  <div className="valid-feedback">Jumlah pengeluaran valid.</div>
                )}
                {!amountValid && amountTouched && (
                  <div className="invalid-feedback">Jumlah pengeluaran tidak valid.</div>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="description">
                  Deskripsi <CBadge color="info">Optional</CBadge>
                </CFormLabel>
                <CFormTextarea
                  id="description"
                  rows={3}
                  placeholder="Masukkan deskripsi pengeluaran"
                  disabled={loading}
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  className={
                    descriptionValue && descriptionValid
                      ? 'is-valid'
                      : descriptionValue
                        ? 'is-invalid'
                        : ''
                  }
                />
                {descriptionValid && descriptionValue && (
                  <div className="valid-feedback">Deskripsi valid</div>
                )}
                {!descriptionValid && descriptionValue && (
                  <div className="invalid-feedback">
                    Deskripsi harus memiliki panjang 3-60000 karakter
                  </div>
                )}
              </div>
            </CCardBody>

            <CCardFooter>
              <CLoadingButton
                color="primary"
                type="submit"
                disabled={!isFormValid() || loading}
                loading={loading}
              >
                <FontAwesomeIcon icon={faSave} />
              </CLoadingButton>
            </CCardFooter>
          </CForm>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateOperationalExpense
