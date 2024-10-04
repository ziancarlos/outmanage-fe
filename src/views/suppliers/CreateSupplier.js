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
  CLoadingButton,
} from '@coreui/react-pro'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const PHONE_REGEX = /^\+62\d{8,12}$/
const EMAIL_REGEX = /^(?=.{1,256}$)(?=.{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const NAME_REGEX = /^.{3,50}$/

const ADDRESS_REGEX = /^.{5,60000}$/

function CreateSupplier() {
  const nameRef = useRef()

  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [addressValue, setAddressValue] = useState('')

  const [nameValid, setNameValid] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(false)
  const [addressValid, setAddressValid] = useState(false)

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
    if (emailValue) {
      setEmailValid(EMAIL_REGEX.test(emailValue))
    } else {
      setEmailValid(true)
    }
  }, [emailValue])

  useEffect(() => {
    setPhoneValid(PHONE_REGEX.test(phoneValue))
  }, [phoneValue])

  useEffect(() => {
    setAddressValid(ADDRESS_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    setError('')
  }, [nameValue, phoneValue, emailValue, addressValue])

  function isFormValid() {
    if (
      error ||
      !nameValid ||
      !phoneValid ||
      !emailValid ||
      (!addressValid && addressValue !== '')
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
      const request = emailValue
        ? {
            name: nameValue,
            email: emailValue,
            phoneNumber: phoneValue,
            address: addressValue,
          }
        : {
            name: nameValue,
            phoneNumber: phoneValue,
            address: addressValue,
          }

      await axiosPrivate.post('/api/suppliers', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pemasok berhasil dibuat.',
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
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setNameValue('')
    setEmailValue('')
    setPhoneValue('')
    setAddressValue('')
    setError('')
  }
  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Tambah Pemasok</strong>
          </CCardHeader>
          <CForm onSubmit={handleSubmit}>
            <CCardBody>
              {!!error && <CAlert color="danger">{error}</CAlert>}

              <div className="mb-3">
                <CFormInput
                  id="name"
                  type="text"
                  placeholder="Masukkan nama pemasok"
                  ref={nameRef}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  autoComplete="off"
                  label={'Nama'}
                  disabled={loading}
                  className={
                    nameValue && nameValid
                      ? 'is-valid'
                      : nameValue && !nameValid
                        ? 'is-invalid'
                        : ''
                  }
                />
                {nameValid && nameValue && <div className="valid-feedback">Nama valid.</div>}
                {!nameValid && nameValue && (
                  <div className="invalid-feedback">Nama harus memiliki panjang 3-50 karakter</div>
                )}
              </div>

              <div className="mb-3">
                <CFormInput
                  id="phone"
                  type="tel"
                  placeholder="Masukkan nomor handphone pemasok"
                  value={phoneValue}
                  autoComplete="off"
                  onChange={(e) => setPhoneValue(e.target.value)}
                  label="No. Hp"
                  disabled={loading}
                  className={
                    phoneValue && phoneValid
                      ? 'is-valid'
                      : phoneValue && !phoneValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {phoneValid && phoneValue && (
                  <div className="valid-feedback">No. Hp pemasok valid.</div>
                )}
                {!phoneValid && phoneValue && (
                  <div className="invalid-feedback">
                    Nomor telepon harus nomor telepon Indonesia yang valid, dimulai dengan +62,
                    diikuti sebanyak 8 hingga 12 digit.
                  </div>
                )}
              </div>
              <div className="mb-3">
                <CFormTextarea
                  id="exampleFormControlTextarea1"
                  rows={2}
                  value={addressValue}
                  placeholder="Masukkan alamat pemasok"
                  label={'Alamat'}
                  disabled={loading}
                  autoComplete="off"
                  onChange={(e) => setAddressValue(e.target.value)}
                  className={
                    addressValue && addressValid
                      ? 'is-valid'
                      : addressValue && !addressValid
                        ? 'is-invalid'
                        : ''
                  }
                ></CFormTextarea>

                {addressValid && addressValue && (
                  <div className="valid-feedback">Alamat pemasok valid.</div>
                )}
                {!addressValid && addressValue && (
                  <div className="invalid-feedback">
                    Alamat harus memiliki panjang 3-50 karakter
                  </div>
                )}
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="email">
                  Email <CBadge color="success">Optional</CBadge>
                </CFormLabel>
                <CFormInput
                  id="email"
                  type="email"
                  placeholder="Masukkan email pemasok"
                  autoComplete="off"
                  disabled={loading}
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className={
                    emailValue && emailValid
                      ? 'is-valid'
                      : emailValue && !emailValid
                        ? 'is-invalid'
                        : ''
                  }
                />

                {emailValid && emailValue && (
                  <div className="valid-feedback">Alamat email valid.</div>
                )}
                {!emailValid && emailValue && (
                  <div className="invalid-feedback">
                    Alamat email yang valid berupa format example@example.com
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

export default CreateSupplier
