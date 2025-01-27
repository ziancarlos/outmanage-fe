import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import { CFormInput, CFormSelect, CSpinner, CRow } from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'

import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^.{3,100}$/
const INITIAL_REGEX = /^[A-z][A-z0-9-_]{1,50}$/
function UpdateUser() {
  const { customerId } = useParams()

  const [initialCustomer, setInitialCustomer] = useState({})

  const [nameValue, setNameValue] = useState('')
  const [initialsValue, setInitialsValue] = useState('')

  const [nameValid, setNameValid] = useState(false)
  const [initialsValid, setInitialsValid] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    fetchCustomer().finally(() => {
      setLoading(false)
    })
  }, [customerId])

  useEffect(() => {
    setError('')
  }, [nameValue, initialsValue])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
    setInitialsValid(INITIAL_REGEX.test(initialsValue))
  }, [nameValue, initialsValue])

  const isFormChanged =
    nameValue !== initialCustomer.name || initialsValue !== initialCustomer.initials
  function isFormValid() {
    return !(error || !nameValid || !initialsValid || !isFormChanged)
  }

  async function fetchCustomer() {
    try {
      const response = await axiosPrivate.get(`/api/customers/${customerId}`)
      const data = response.data.data

      setInitialCustomer(data)
      setNameValue(data.name)
      setInitialsValue(data.initials)
    } catch (e) {
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
      await axiosPrivate.patch(`/api/customers/${customerId}`, {
        name: nameValue,
        initials: initialsValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kustomer berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/customers/data', { replace: true })
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
            title="Ubah Pengguna"
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
                  Nama kustomer harus berupa panjang antara 3 hingga 100 karakter.
                </div>
              )}
            </div>
            <div className="mb-3">
              <CFormInput
                id="initial"
                type="text"
                autoComplete="new-initial"
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
                <div className="valid-feedback">inisial kustomer valid.</div>
              )}
              {!initialsValid && initialsValue && (
                <div className="invalid-feedback">
                  inisial kustomer harus berupa alfanumerik dan panjangnya antara 2 hingga 50
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

export default UpdateUser
