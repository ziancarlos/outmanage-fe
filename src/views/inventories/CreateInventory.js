import React, { useEffect, useRef, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCardBody,
  CCard,
  CCardHeader,
  CCardFooter,
  CAlert,
  CSpinner,
  CFormTextarea,
  CRow,
  CCol,
  CBadge,
  CFormSelect,
  CLoadingButton,
} from '@coreui/react-pro'

import Swal from 'sweetalert2'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const NAME_REGEX = /^.{3,100}$/

function CreateInventory() {
  const nameRef = useRef()

  const [nameValue, setNameValue] = useState('')
  const [nameValid, setNameValid] = useState(false)

  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    nameRef.current.focus()
  }, [])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  useEffect(() => {
    setError('')
  }, [nameValue])

  function isFormValid() {
    if (error || !nameValid) {
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
      const request = {
        name: nameValue,
      }

      await axiosPrivate.post('/api/inventories', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Inventaris berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/505')
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setNameValue('')
    setError('')
  }
  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Create Item</strong>
          </CCardHeader>
          <CForm onSubmit={handleSubmit}>
            <CCardBody>
              {!!error && <CAlert color="danger">{error}</CAlert>}

              <div className="mb-3">
                <CFormInput
                  id="name"
                  type="text"
                  placeholder="Masukkan Nama Inventaris"
                  label={'Nama'}
                  ref={nameRef}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  autoComplete="off"
                  className={
                    nameValue && nameValid
                      ? 'is-valid'
                      : nameValue && !nameValid
                        ? 'is-invalid'
                        : ''
                  }
                />
                {nameValid && nameValue && <div className="valid-feedback">Name valid.</div>}
                {!nameValid && nameValue && (
                  <div className="invalid-feedback">Nama harus memiliki panjang 3-50 karakter</div>
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

export default CreateInventory
