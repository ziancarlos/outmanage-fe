import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import { CFormInput, CFormSelect, CSpinner, CRow } from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'

import FormCardLayout from '../../components/FormCardLayout'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

function UpdateUser() {
  const { userId } = useParams()

  const [initialUser, setInitialUser] = useState({})
  const [roles, setRoles] = useState([])

  const [usernameValue, setUsernameValue] = useState('')
  const [roleIdValue, setRoleIdValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [usernameValid, setUsernameValid] = useState(true)
  const [roleIdValid, setRoleIdValid] = useState(true)
  const [passwordValid, setPasswordValid] = useState(true)

  const [roleTouched, setRoleTouched] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateFormLoading, setUpdateFormLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    Promise.all([fetchRoles(), fetchUser()]).finally(() => {
      setLoading(false)
    })
  }, [userId])

  useEffect(() => {
    setError('')
  }, [usernameValue, passwordValue, roleIdValue])

  useEffect(() => {
    setUsernameValid(USERNAME_REGEX.test(usernameValue))
    setRoleIdValid(roleIdValue !== '')
    setPasswordValid(PASSWORD_REGEX.test(passwordValue))
  }, [usernameValue, roleIdValue, passwordValue])

  const isFormChanged =
    usernameValue !== initialUser.username ||
    roleIdValue !== initialUser.role.roleId ||
    passwordValue !== (initialUser.password || '')

  function isFormValid() {
    return !(error || !usernameValid || (!passwordValid && passwordValue !== '') || !isFormChanged)
  }

  async function fetchUser() {
    try {
      const response = await axiosPrivate.get(`/api/users/${userId}`)
      const data = response.data.data

      setInitialUser(data)
      setUsernameValue(data.username)
      setRoleIdValue(data.role.roleId)
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
      const response = await axiosPrivate.get('/api/roles')

      setRoles([
        { label: 'Pilih Peran', value: '' },
        ...response.data.data.map((role) => ({
          label: role.name,
          value: role.roleId,
        })),
      ])
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
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    if (!isFormChanged) {
      return setError('Silakan mengubah kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.patch(`/api/users/${userId}`, {
        username: usernameValue,
        password: passwordValue || null,
        roleId: roleIdValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/users/data', { replace: true })
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
                id="username"
                type="text"
                autoComplete="new-username"
                placeholder="Masukkan username"
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
                label="Username"
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
              <CFormSelect
                id="role"
                value={roleIdValue}
                onChange={(e) => setRoleIdValue(e.target.value)}
                onBlur={() => setRoleTouched(true)}
                options={roles}
                disabled={loading}
                className={
                  roleTouched && (roleIdValue === '' || !roleIdValid)
                    ? 'is-invalid'
                    : roleIdValid
                      ? 'is-valid'
                      : ''
                }
                label="Peran"
              />
              {roleTouched && (
                <div className={`feedback ${roleIdValid ? 'valid-feedback' : 'invalid-feedback'}`}>
                  {roleIdValid ? 'Peran telah dipilih.' : 'Silahkan memilih peran.'}
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
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}

export default UpdateUser
