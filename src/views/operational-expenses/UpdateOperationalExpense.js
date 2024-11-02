import React, { useEffect, useState } from 'react'
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
import { useNavigate, useParams } from 'react-router-dom'

const DESCRIPTION_REGEX = /^.{3,60000}$/

function UpdateOperationalExpense() {
  const { operationalExpenseId } = useParams()
  const logout = useLogout()
  const navigate = useNavigate()

  const [initialOperationalExpense, setInitialOperationalExpense] = useState([])
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
    setLoading(true)

    Promise.all([fetchType(), fetchExpenseDetails()]).finally(() => {
      setLoading(false)
    })
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

  async function fetchExpenseDetails() {
    try {
      const response = await axiosPrivate.get(`/api/operational-expenses/${operationalExpenseId}`)

      setInitialOperationalExpense(response.data.data)
      setTypeValue(response.data.data.operationalExpenseType.operationalExpenseTypeId)
      setAmountValue(response.data.data.grandTotal)
      setDescriptionValue(response.data.data.description || '')
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

  const isFormChanged =
    typeValue !== initialOperationalExpense.operationalExpenseType?.operationalExpenseTypeId ||
    amountValue !== initialOperationalExpense.amount ||
    descriptionValue !== (initialOperationalExpense.description || '')

  const isFormValid = typeValid && amountValid && (descriptionValue === '' || descriptionValid)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Input yang dimasukkan tidak valid. Mohon periksa kembali.')
    }
    if (!isFormChanged) {
      return setError('Tidak melakukan perubahaan.')
    }

    setLoading(true)

    try {
      await axiosPrivate.patch(`/api/operational-expenses/${operationalExpenseId}`, {
        operationalExpenseTypeId: typeValue,
        grandTotal: amountValue,
        description: descriptionValue || null,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengeluaran operasional berhasil diperbarui.',
        confirmButtonText: 'OK',
      })

      navigate('/operational-expenses/data')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Update Biaya Operasional</strong>
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
                disabled={loading || !isFormValid || !isFormChanged}
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

export default UpdateOperationalExpense
