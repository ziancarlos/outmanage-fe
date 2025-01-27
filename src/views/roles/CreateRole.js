import { CFormInput, CFormSelect, CRow, CSpinner } from '@coreui/react-pro'

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/

export default function CreateRole() {
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [nameValue, setNameValue] = useState('')

  const [nameValid, setUsernameValid] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [nameValue])

  useEffect(() => {
    setUsernameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  function isFormValid() {
    return !(error || !nameValid)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.post('/api/roles', {
        name: nameValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Peran berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/roles/data')
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
            title="Tambah Peran"
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
                onChange={(e) => setNameValue(e.target.value)}
                disabled={loading}
                className={
                  nameValue && nameValid ? 'is-valid' : nameValue && !nameValid ? 'is-invalid' : ''
                }
                label="Nama"
              />

              {nameValid && nameValue && <div className="valid-feedback">Nama peran valid.</div>}
              {!nameValid && nameValue && (
                <div className="invalid-feedback">
                  Nama peran harus berupa alfanumerik dan panjangnya antara 3 hingga 50 karakter.
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
