import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import { CFormInput, CSpinner, CRow } from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'
import FormCardLayout from '../../components/FormCardLayout'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/

export default function UpdateRole() {
  const { roleId } = useParams()

  const [initialRole, setInitialRole] = useState({})

  const [nameValue, setNameValue] = useState('')

  const [nameValid, setNameValid] = useState(true)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    fetchRole().finally(() => {
      setLoading(false)
    })
  }, [roleId])

  useEffect(() => {
    setError('')
  }, [nameValue])

  useEffect(() => {
    setNameValid(USERNAME_REGEX.test(nameValue))
  }, [nameValue])

  const isFormChanged = nameValue !== initialRole.name

  function isFormValid() {
    return !(error || !nameValid || !isFormChanged)
  }

  async function fetchRole() {
    try {
      const response = await axiosPrivate.get(`/api/roles/${roleId}`)
      const data = response.data.data

      setInitialRole(data)
      setNameValue(data.name)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404, 400].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    if (!isFormChanged) {
      return setError('Silakan mengubah kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.patch(`/api/roles/${roleId}`, {
        name: nameValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Peran berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/roles/data', { replace: true })
      })
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        setError('Terjadi kesalahan, Silahkan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
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
            title="Ubah Peran"
            handleSubmit={handleSubmit}
            error={error}
            isFormValid={isFormValid}
          >
            <div className="mb-3">
              <CFormInput
                id="username"
                type="text"
                autoComplete="new-username"
                placeholder="Masukkan nama peran"
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
