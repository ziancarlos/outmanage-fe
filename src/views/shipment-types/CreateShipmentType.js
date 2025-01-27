import { CFormInput, CFormSelect, CRow, CSpinner } from '@coreui/react-pro'

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^.{3,100}$/

export default function CreateShipmentType() {
  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [nameValue, setNameValue] = useState('')

  const [nameValid, setNameValid] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  useEffect(() => {
    setError('')
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
      await axiosPrivate.post('/api/shipment-types', {
        name: nameValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Tipe pengiriman berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/shipment-types/data')
      })
    } catch (e) {
      console.log(e)
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
            title="Tambah Tipe Pengiriman"
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

              {nameValid && nameValue && (
                <div className="valid-feedback">Nama tipe pengiriman valid.</div>
              )}
              {!nameValid && nameValue && (
                <div className="invalid-feedback">
                  Nama tipe pengiriman harus berupa alfanumerik dan panjangnya antara 3 hingga 100
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
