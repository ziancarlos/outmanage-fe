import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import { CFormInput, CSpinner, CRow } from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'

import FormCardLayout from '../../components/FormCardLayout'

const NAME_REGEX = /^.{3,100}$/
const SKU_REGEX = /^[A-z][A-z0-9-_]{1,30}$/
export default function UpdateItem() {
  const { itemId } = useParams()

  const [initialItem, setInitialItem] = useState({})

  const [nameValue, setNameValue] = useState('')

  const [nameValid, setNameValid] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    fetchItem().finally(() => {
      setLoading(false)
    })
  }, [itemId])

  useEffect(() => {
    setError('')
  }, [nameValue])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  const isFormChanged = nameValue !== initialItem.name
  function isFormValid() {
    return !(error || !nameValid || !isFormChanged)
  }

  async function fetchItem() {
    try {
      const response = await axiosPrivate.get(`/api/items/${itemId}`)
      const data = response.data.data

      setInitialItem(data)
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
      await axiosPrivate.patch(`/api/items/${itemId}`, {
        name: nameValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Item berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/items/data', { replace: true })
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
            title="Ubah Barang"
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

              {nameValid && nameValue && <div className="valid-feedback">Nama valid.</div>}
              {!nameValid && nameValue && (
                <div className="invalid-feedback">
                  Nama harus berupa panjang antara 3 hingga 100 karakter.
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
