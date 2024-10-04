import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Swal from 'sweetalert2'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCardHeader,
  CBadge,
  CFormLabel,
  CLoadingButton,
} from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

const PHONE_REGEX = /^\+62\d{8,12}$/
const EMAIL_REGEX = /^(?=.{1,256}$)(?=.{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const NAME_REGEX = /^.{3,50}$/
const ADDRESS_REGEX = /^.{5,60000}$/

function UpdateClient() {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const [initialClient, setInitialClient] = useState({})
  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [addressValue, setAddressValue] = useState('')

  const [nameValid, setNameValid] = useState(true)
  const [emailValid, setEmailValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [addressValid, setAddressValid] = useState(true)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateFormLoading, setUpdateFormLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()

  useEffect(() => {
    setLoading(true)
    fetchClient().finally(() => setLoading(false))
  }, [clientId])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  useEffect(() => {
    setEmailValid(!emailValue || EMAIL_REGEX.test(emailValue))
  }, [emailValue])

  useEffect(() => {
    setPhoneValid(PHONE_REGEX.test(phoneValue))
  }, [phoneValue])

  useEffect(() => {
    setAddressValid(ADDRESS_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    setError('')
  }, [nameValue, emailValue, phoneValue, addressValue])

  const isFormChanged =
    nameValue !== initialClient.name ||
    emailValue !== (initialClient.email || '') ||
    phoneValue !== initialClient.phoneNumber ||
    addressValue !== initialClient.address

  const isFormValid = nameValid && phoneValid && (emailValue === '' || emailValid) && addressValid

  async function fetchClient() {
    try {
      const response = await axiosPrivate.get(`/api/clients/${clientId}`)
      const data = response.data.data
      setInitialClient(data)

      setNameValue(data.name)
      setEmailValue(data.email || '')
      setPhoneValue(data.phoneNumber)
      setAddressValue(data.address)
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

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Input tidak valid.')
    }
    if (!isFormChanged) {
      return setError('Tidak melakukan perubahaan.')
    }

    setUpdateFormLoading(true)

    try {
      const request = {
        name: nameValue,
        email: emailValue || null,
        phoneNumber: phoneValue,
        address: addressValue,
      }

      const response = await axiosPrivate.patch(`/api/clients/${clientId}`, request)
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Klien berhasil diubah.',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/clients/data')
        })
      }
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setUpdateFormLoading(false)
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
          <CCol md={8} sm={7} xs={12}>
            <CCard>
              <CCardHeader>
                <strong>Ubah Klien</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}

                  {/* Name field */}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      label="Nama"
                      id="name"
                      placeholder="Masukkan nama klien"
                      autoComplete="off"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className={`${
                        nameValid && nameValue ? 'is-valid' : ''
                      } ${nameValid || !nameValue ? '' : 'is-invalid'}`}
                    />
                    {nameValid && nameValue && <div className="valid-feedback">Nama valid.</div>}
                    {!nameValid && nameValue && (
                      <div className="invalid-feedback">
                        Nama harus memiliki panjang 3-50 karakter
                      </div>
                    )}
                  </div>

                  {/* Phone field */}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      label="No. Hp"
                      id="phone"
                      placeholder="Masukkan nomor handphone klien"
                      autoComplete="off"
                      disabled={updateFormLoading}
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className={`${
                        phoneValid && phoneValue ? 'is-valid' : ''
                      } ${phoneValid || !phoneValue ? '' : 'is-invalid'}`}
                    />
                    {phoneValid && phoneValue && (
                      <div className="valid-feedback">No. Hp klien valid.</div>
                    )}
                    {!phoneValid && phoneValue && (
                      <div className="invalid-feedback">
                        Nomor telepon harus nomor telepon Indonesia yang valid, dimulai dengan +62,
                        diikuti sebanyak 8 hingga 12 digit.
                      </div>
                    )}
                  </div>

                  {/* Address field */}
                  <div className="mb-3">
                    <CFormTextarea
                      label="Alamat"
                      placeholder="Masukkan alamat klien"
                      id="address"
                      rows={2}
                      autoComplete="off"
                      disabled={updateFormLoading}
                      value={addressValue}
                      onChange={(e) => setAddressValue(e.target.value)}
                      className={`${
                        addressValid && addressValue ? 'is-valid' : ''
                      } ${addressValid || !addressValue ? '' : 'is-invalid'}`}
                    ></CFormTextarea>
                    {addressValid && addressValue && (
                      <div className="valid-feedback">Alamat klien valid.</div>
                    )}
                    {!addressValid && addressValue && (
                      <div className="invalid-feedback">
                        Alamat harus memiliki panjang 3-50 karakter
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="email">
                      Alamat Email <CBadge color="success">Optional</CBadge>
                    </CFormLabel>
                    <CFormInput
                      id="email"
                      type="email"
                      placeholder="Masukkan alamat email klien"
                      autoComplete="off"
                      disabled={updateFormLoading}
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className={`${
                        emailValid && emailValue ? 'is-valid' : ''
                      } ${emailValid || !emailValue ? '' : 'is-invalid'}`}
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
                    color="info"
                    type="submit"
                    loading={updateFormLoading}
                    disabled={
                      !!error || loading || updateFormLoading || !isFormValid || !isFormChanged
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </CLoadingButton>
                </CCardFooter>
              </CForm>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default UpdateClient
