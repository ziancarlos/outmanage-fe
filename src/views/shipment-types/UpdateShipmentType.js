import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import { CFormInput, CFormSelect, CSpinner, CRow } from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'

import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^.{3,100}$/
function UpdateShipmentType() {
  const { shipmentTypeId } = useParams()

  const [initialCustomer, setInitialShipmentType] = useState({})

  const [nameValue, setNameValue] = useState('')

  const [nameValid, setNameValid] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    fetchShipmentType().finally(() => {
      setLoading(false)
    })
  }, [shipmentTypeId])

  useEffect(() => {
    setError('')
  }, [nameValue])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  const isFormChanged = nameValue !== initialCustomer.name
  function isFormValid() {
    return !(error || !nameValid || !isFormChanged)
  }

  async function fetchShipmentType() {
    try {
      const response = await axiosPrivate.get(`/api/shipment-types/${shipmentTypeId}`)
      const data = response.data.data

      setInitialShipmentType(data)
      setNameValue(data.name)
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
      await axiosPrivate.patch(`/api/shipment-types/${shipmentTypeId}`, {
        name: nameValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Tipe pengiriman berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/shipment-types/data', { replace: true })
      })
    } catch (e) {
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
                  Nama tipe pengiriman harus berupa panjang antara 3 hingga 100 karakter.
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}

export default UpdateShipmentType
