import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Swal from 'sweetalert2'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CForm,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCardHeader,
  CLoadingButton,
} from '@coreui/react-pro'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/
const EMAIL_REGEX = /^(?=.{1,256}$)(?=.{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

function Settings() {
  const logout = useLogout()

  const [user, setUser] = useState({})
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [usernameValue, setUsernameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [usernameValid, setUsernameValid] = useState(true)
  const [emailValid, setEmailValid] = useState(true)
  const [passwordValid, setPasswordValid] = useState(true)

  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [usernameValue, emailValue, passwordValue])

  useEffect(() => {
    setLoading(true)
    getUser().finally(() => {
      setLoading(false)
    })
  }, [axiosPrivate, navigate])

  useEffect(() => {
    setUsernameValid(USERNAME_REGEX.test(usernameValue))
    setEmailValid(EMAIL_REGEX.test(emailValue))
    setPasswordValid(PASSWORD_REGEX.test(passwordValue))
  }, [usernameValue, emailValue, passwordValue])

  const isFormChanged =
    usernameValue !== user.username || emailValue !== user.email || passwordValue !== ''

  const isFormValid = usernameValid && emailValid && (passwordValue === '' || passwordValid)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Input tidak valid.')
    }
    if (!isFormChanged) {
      return setError('Tidak melakukan perubahaan.')
    }

    setLoading(true)

    try {
      await axiosPrivate.patch(`/api/users/my`, {
        username: usernameValue !== user.username ? usernameValue : undefined,
        email: emailValue !== user.email ? emailValue : undefined,
        password: passwordValue ? passwordValue : undefined,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Akun anda berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/users', { replace: true })
      })
    } catch (e) {
      if (
        (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) ||
        e.response?.status === 401
      ) {
        await logout()
      } else if ([404, 400, 409].includes(e.response?.status)) {
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

  async function getUser() {
    try {
      const userResponse = await axiosPrivate.get(`/api/users/my`)

      const userData = userResponse.data.data
      setUser(userData)
      setUsernameValue(userData.username)
      setEmailValue(userData.email)
    } catch (e) {
      if (
        (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) ||
        e.response?.status === 401
      ) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
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
                <strong>Settings</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}

                  {/* Username field */}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      label="Username"
                      id="exampleInputUsername"
                      placeholder="Enter Username"
                      disabled={loading}
                      autoComplete="off"
                      value={usernameValue}
                      onChange={(e) => setUsernameValue(e.target.value)}
                      className={`${
                        usernameValid && usernameValue ? 'is-valid' : ''
                      } ${usernameValid || !usernameValue ? '' : 'is-invalid'}`}
                    />
                    {usernameValid && usernameValue && (
                      <div className="valid-feedback">Nama pengguna valid.</div>
                    )}
                    {!usernameValid && usernameValue && (
                      <div className="invalid-feedback">
                        Nama pengguna harus berupa alfanumerik dan panjangnya antara 3 hingga 50
                        karakter.
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="mb-3">
                    <CFormInput
                      type="email"
                      label="Email address"
                      id="exampleInputEmail"
                      placeholder="Enter email"
                      disabled={loading}
                      autoComplete="off"
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
                        Alamat email yang valid dalam format example@example.com.
                      </div>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="mb-3">
                    <CFormInput
                      type="password"
                      label="Password"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      autoComplete="off"
                      disabled={loading}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      className={`${
                        passwordValid && passwordValue ? 'is-valid' : ''
                      } ${passwordValid || !passwordValue ? '' : 'is-invalid'}`}
                    />
                    {passwordValid && passwordValue && (
                      <div className="valid-feedback">Kata sandi valid.</div>
                    )}
                    {!passwordValid && passwordValue && (
                      <div className="invalid-feedback">
                        Kata sandi harus menyertakan huruf besar dan kecil, angka, dan karakter
                        khusus.
                      </div>
                    )}
                  </div>
                </CCardBody>

                <CCardFooter>
                  <CLoadingButton
                    color="info"
                    type="submit"
                    loading={loading}
                    disabled={!isFormValid || !isFormChanged || !!error || loading}
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

export default Settings
