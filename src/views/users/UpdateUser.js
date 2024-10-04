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
  CFormSelect,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCardHeader,
  CFormLabel,
  CBadge,
  CLoadingButton,
} from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/
const EMAIL_REGEX = /^(?=.{1,256}$)(?=.{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

function UpdateUser() {
  const { userId } = useParams()

  const [initialUser, setInitialUser] = useState({})
  const [roles, setRoles] = useState([])

  const [usernameValue, setUsernameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [usernameValid, setUsernameValid] = useState(true)
  const [emailValid, setEmailValid] = useState(true)
  const [roleValid, setRoleValid] = useState(true)
  const [passwordValid, setPasswordValid] = useState(true)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateFormLoading, setUpdateFormLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchRoles(), fetchUser(userId)]).finally(() => {
      setLoading(false)
    })
  }, [userId, axiosPrivate, navigate])

  useEffect(() => {
    setError('')
  }, [usernameValue, emailValue, passwordValue, roleValue])

  useEffect(() => {
    setUsernameValid(USERNAME_REGEX.test(usernameValue))
    setEmailValid(EMAIL_REGEX.test(emailValue))
    setRoleValid(roleValue !== '')
    setPasswordValid(PASSWORD_REGEX.test(passwordValue))
  }, [usernameValue, emailValue, roleValue, passwordValue])

  const isFormChanged =
    usernameValue !== initialUser.username ||
    emailValue !== initialUser.email ||
    roleValue !== initialUser.role.roleId ||
    passwordValue !== (initialUser.password || '')

  const isFormValid =
    usernameValid && emailValid && (passwordValue === '' || passwordValid) && roleValid

  async function fetchUser(userId) {
    try {
      const userResponse = await axiosPrivate.get(`/api/users/${userId}`)
      const userData = userResponse.data.data

      setInitialUser(userData)

      setUsernameValue(userData.username)
      setEmailValue(userData.email)
      setRoleValue(userData.role.roleId)
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

  async function fetchRoles() {
    try {
      const rolesResponse = await axiosPrivate.get('/api/roles')

      setRoles(rolesResponse.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/400', { replace: true })
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
      await axiosPrivate.patch(`/api/users/${userId}`, {
        username: usernameValue,
        email: emailValue,
        password: passwordValue || null,
        roleId: roleValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/users', { replace: true })
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
                <strong>Ubah Pengguna</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {error && <CAlert color="danger">{error}</CAlert>}

                  {/* Username field */}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      label="Nama Pengguna"
                      id="exampleInputUsername"
                      placeholder="Masukkan nama pengguna"
                      autoComplete="off"
                      disabled={updateFormLoading}
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
                      label="Alamat Email"
                      id="exampleInputEmail"
                      placeholder="Enter email"
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
                        Alamat email yang valid dalam format example@example.com.
                      </div>
                    )}
                  </div>

                  {/* Role field */}
                  <div className="mb-3">
                    <CFormSelect
                      label="Peran"
                      id="roleSelect"
                      autoComplete="off"
                      value={roleValue}
                      disabled={updateFormLoading}
                      onChange={(e) => setRoleValue(e.target.value)}
                      className={`${
                        roleValid && roleValue ? 'is-valid' : ''
                      } ${roleValid || !roleValue ? '' : 'is-invalid'}`}
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {roleValid && roleValue && (
                      <div className="valid-feedback">Peran telah dipilih.</div>
                    )}
                    {!roleValid && roleValue === '' && (
                      <div className="invalid-feedback">Silahkan memilih peran.</div>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="password">
                      Password <CBadge color="success">Optional</CBadge>
                    </CFormLabel>
                    <CFormInput
                      type="password"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      autoComplete="off"
                      disabled={updateFormLoading}
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
                    loading={updateFormLoading}
                    disabled={
                      !isFormValid || !isFormChanged || !!error || updateFormLoading || loading
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

export default UpdateUser
