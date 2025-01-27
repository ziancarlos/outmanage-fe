import { CFormInput, CFormSelect, CRow, CSpinner } from '@coreui/react-pro'

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,50}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

export default function CreateUser() {
  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const { authorizePermissions } = useAuth()
  const canReadRoles = authorizePermissions.some((perm) => perm.name === 'read-roles')

  const [usernameValue, setUsernameValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordConfirmationValue, setPasswordConfirmationValue] = useState('')
  const [roleIdValue, setRoleIdValue] = useState('')

  const [usernameValid, setUsernameValid] = useState('')
  const [passwordValid, setPasswordValid] = useState('')
  const [passwordConfirmationValid, setPasswordConfirmationValid] = useState('')
  const [roleIdValid, setRoleIdValid] = useState('')

  const [roleTouched, setRoleTouched] = useState(false)

  const [roles, setRoles] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    if (canReadRoles) {
      fetchRole().finally(() => {
        setLoading(false)
      })
    }
  }, [])

  async function fetchRole() {
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
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  useEffect(() => {
    setUsernameValid(USERNAME_REGEX.test(usernameValue))
  }, [usernameValue])

  useEffect(() => {
    setPasswordValid(PASSWORD_REGEX.test(passwordValue))
  }, [passwordValue])

  useEffect(() => {
    setPasswordConfirmationValid(passwordValue === passwordConfirmationValue)
  }, [passwordValue, passwordConfirmationValue])

  useEffect(() => {
    setRoleIdValid(roleIdValue !== '')
  }, [roleIdValue])

  function isFormValid() {
    return !(error || !usernameValid || !passwordValid || !passwordConfirmationValid)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.post('/api/users', {
        username: usernameValue,
        password: passwordValue,
        roleId: roleIdValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/users/data')
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([404, 400, 409].includes(e.response?.status)) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  function clearInput() {
    setUsernameValue('')
    setPasswordValue('')
    setPasswordConfirmationValue('')
    setRoleIdValue('')
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
            title="Tambah Pengguna"
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

            <div className="mb-3">
              <CFormInput
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Masukkan kata sandi konfirmasi"
                disabled={loading}
                value={passwordConfirmationValue}
                onChange={(e) => setPasswordConfirmationValue(e.target.value)}
                className={
                  passwordConfirmationValue && passwordConfirmationValid
                    ? 'is-valid'
                    : passwordConfirmationValue && !passwordConfirmationValid
                      ? 'is-invalid'
                      : ''
                }
                label="Kata Sandi Konfirmasi"
              />
              {passwordConfirmationValid && passwordConfirmationValue && (
                <div className="valid-feedback">Kata sandi konfirmasi valid.</div>
              )}
              {!passwordConfirmationValid && passwordConfirmationValue && (
                <div className="invalid-feedback">
                  Kata sandi konfirmasi tidak sama dengan kata sandi yang diberikan.
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
