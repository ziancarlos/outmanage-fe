import { CFormInput, CFormSelect, CRow, CSpinner } from '@coreui/react-pro'

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^.{3,100}$/
const INITIAL_REGEX = /^[A-z][A-z0-9-_]{1,50}$/

export default function CreateUser() {
  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [nameValue, setNameValue] = useState('')
  const [initialsValue, setInitialsValue] = useState('')

  const [nameValid, setNameValid] = useState(false)
  const [initialsValid, setInitialsValid] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [nameValue, initialsValue])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
    setInitialsValid(INITIAL_REGEX.test(initialsValue))
  }, [nameValue, initialsValue])

  function isFormValid() {
    return !(error || !nameValid || !initialsValid)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.post('/api/customers', {
        name: nameValue,
        initials: initialsValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kustomer berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/customers/data')
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

  function clearInput() {
    setNameValue('')
    setInitialsValue('')
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
            title="Tambah Kustomer"
            handleSubmit={handleSubmit}
            error={error}
            isFormValid={isFormValid}
          >
            <div className="mb-3">
              <CFormInput
                id="name"
                type="text"
                autoComplete="new-name"
                placeholder="Masukkan nama"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value.toUpperCase())}
                disabled={loading}
                className={
                  nameValue && nameValid ? 'is-valid' : nameValue && !nameValid ? 'is-invalid' : ''
                }
                label="Nama"
              />

              {nameValid && nameValue && <div className="valid-feedback">Nama kustomer valid.</div>}
              {!nameValid && nameValue && (
                <div className="invalid-feedback">
                  Nama kustomer harus berupa alfanumerik dan panjangnya antara 3 hingga 100
                  karakter.
                </div>
              )}
            </div>
            <div className="mb-3">
              <CFormInput
                id="initials"
                type="text"
                autoComplete="new-initials"
                placeholder="Masukkan inisial"
                value={initialsValue}
                onChange={(e) => setInitialsValue(e.target.value.toUpperCase())}
                disabled={loading}
                className={
                  initialsValue && initialsValid
                    ? 'is-valid'
                    : initialsValue && !initialsValid
                      ? 'is-invalid'
                      : ''
                }
                label="Inisial"
              />

              {initialsValid && initialsValue && (
                <div className="valid-feedback">Inisial kustomer valid.</div>
              )}
              {!initialsValid && initialsValue && (
                <div className="invalid-feedback">
                  Inisial kustomer harus berupa alfanumerik dan panjangnya antara 2 hingga 50
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
