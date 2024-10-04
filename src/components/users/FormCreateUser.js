/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CAlert,
  CCardBody,
  CCard,
  CCardHeader,
  CCardFooter,
  CLoadingButton,
} from '@coreui/react-pro'
import Swal from 'sweetalert2'
import useLogout from '../../hooks/useLogout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/
const EMAIL_REGEX = /^(?=.{1,256}$)(?=.{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

function CreateUserForm({ roles, fetchData }) {
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const logout = useLogout()

  const [usernameValue, setUsernameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [usernameValid, setUsernameValid] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const [roleValid, setRoleValid] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)

  const [roleTouched, setRoleTouched] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUsernameValid(USERNAME_REGEX.test(usernameValue))
  }, [usernameValue])

  useEffect(() => {
    setEmailValid(EMAIL_REGEX.test(emailValue))
  }, [emailValue])

  useEffect(() => {
    setRoleValid(roleValue !== '')
  }, [roleValue])

  useEffect(() => {
    setPasswordValid(PASSWORD_REGEX.test(passwordValue))
  }, [passwordValue])

  function isFormValid() {
    if (error || !usernameValid || !passwordValid || !emailValid || !roleValid) {
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
      await axiosPrivate.post('/api/users', {
        username: usernameValue,
        email: emailValue,
        password: passwordValue,
        roleId: roleValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()
        fetchData()
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([404, 400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/505')
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setUsernameValue('')
    setEmailValue('')
    setPasswordValue('')
    setRoleValue('')
    setRoleTouched(false)
    setError('')
  }

  useEffect(() => {
    setError('')
  }, [usernameValue, roleValue, emailValue, passwordValue])

  const roleOptions = [
    { label: 'Pilih Peran', value: '' },
    ...roles.map((role) => ({
      label: role.name,
      value: role.roleId,
    })),
  ]

  return (
    <CCard>
      <CCardHeader>
        <strong>Buat Pengguna</strong>
      </CCardHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CCardBody>
          {!!error && <CAlert color="danger">{error}</CAlert>}
          <div className="mb-3">
            <CFormInput
              id="username"
              type="text"
              autoComplete="new-email"
              placeholder="Masukkan nama pengguna"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              disabled={loading}
              className={
                usernameValue && usernameValid
                  ? 'is-valid'
                  : usernameValue && !usernameValid
                    ? 'is-invalid'
                    : ''
              }
              label="Nama Pengguna"
            />

            {usernameValid && usernameValue && (
              <div className="valid-feedback">Nama pengguna valid.</div>
            )}
            {!usernameValid && usernameValue && (
              <div className="invalid-feedback">
                Nama pengguna harus berupa alfanumerik dan panjangnya antara 3 hingga 50 karakter.
              </div>
            )}
          </div>
          <div className="mb-3">
            <CFormInput
              id="email"
              type="email"
              placeholder="Masukkan alamat email"
              autoComplete="new-email"
              value={emailValue}
              disabled={loading}
              onChange={(e) => setEmailValue(e.target.value)}
              className={
                emailValue && emailValid
                  ? 'is-valid'
                  : emailValue && !emailValid
                    ? 'is-invalid'
                    : ''
              }
              label="Alamat Email"
            />

            {emailValid && emailValue && <div className="valid-feedback">Alamat email valid.</div>}
            {!emailValid && emailValue && (
              <div className="invalid-feedback">
                Alamat email yang valid dalam format example@example.com.
              </div>
            )}
          </div>
          <div className="mb-3">
            <CFormSelect
              id="role"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
              onBlur={() => setRoleTouched(true)}
              options={roleOptions}
              disabled={loading}
              className={
                roleTouched && (roleValue === '' || !roleValid)
                  ? 'is-invalid'
                  : roleValid
                    ? 'is-valid'
                    : ''
              }
              label="Peran"
            />
            {roleTouched && (
              <div className={`feedback ${roleValid ? 'valid-feedback' : 'invalid-feedback'}`}>
                {roleValid ? 'Peran telah dipilih.' : 'Silahkan memilih peran.'}
              </div>
            )}
          </div>

          <div className="mb-3">
            <CFormInput
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Masukkan kata sandi"
              disabled={loading}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className={
                passwordValue && passwordValid
                  ? 'is-valid'
                  : passwordValue && !passwordValid
                    ? 'is-invalid'
                    : ''
              }
              label="Kata Sandi"
            />
            {passwordValid && passwordValue && (
              <div className="valid-feedback">Kata sandi valid.</div>
            )}
            {!passwordValid && passwordValue && (
              <div className="invalid-feedback">
                Kata sandi harus menyertakan huruf besar dan kecil, angka, dan karakter khusus.
              </div>
            )}
          </div>
        </CCardBody>

        <CCardFooter>
          <CLoadingButton
            color="info"
            type="submit"
            loading={loading}
            disabled={!isFormValid() || loading}
          >
            <FontAwesomeIcon icon={faSave} />
          </CLoadingButton>
        </CCardFooter>
      </CForm>
    </CCard>
  )
}

export default CreateUserForm
