import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import useAuth from '../../hooks/useAuth'
import publicAxios from '../../api/axios'
const LOGIN_URL = '/api/auth/login'

const Login = () => {
  const navigate = useNavigate()

  const { setCurrentUser, persist, setPersist } = useAuth()

  const usernameRef = useRef()

  const [usernameValue, setUsernameValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorValue, setErrorValue] = useState('')

  useEffect(() => {
    usernameRef.current.focus()
  }, [])

  useEffect(() => {
    localStorage.setItem('persist', persist)
  }, [persist])

  useEffect(() => {
    setErrorValue('')
  }, [usernameValue, passwordValue])

  async function handleSubmit(e) {
    e.preventDefault()

    if (usernameValue && passwordValue && !errorValue) {
      setLoading(true)

      try {
        const response = await publicAxios.post(
          LOGIN_URL,
          {
            username: usernameValue,
            password: passwordValue,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          },
        )

        setCurrentUser(response.data.data)

        navigate('/users')

        clearInput()
      } catch (e) {
        if (e.response?.status === 400) {
          setErrorValue('Nama pengguna atau kata sandi tidak valid.')
        } else {
          setErrorValue('Terjadi kesalahan. Silahkan coba lagi.')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  function togglePersist() {
    setPersist((prev) => !prev)
  }

  function clearInput() {
    setUsernameValue('')
    setPasswordValue('')
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  {!!errorValue && <CAlert color="danger">{errorValue}</CAlert>}

                  <CForm onSubmit={handleSubmit} noValidate>
                    <h1>Login</h1>
                    <p className="text-body-secondary">
                      Sistem Informasi Mengelola Pengeluaran Barang
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Nama pengguna"
                        onChange={(e) => setUsernameValue(e.target.value)}
                        autoComplete="off"
                        disabled={loading}
                        value={usernameValue}
                        ref={usernameRef}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-2">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Kata sandi"
                        autoComplete="off"
                        disabled={loading}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        value={passwordValue}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CFormCheck
                        id="flexCheckDefault"
                        label="Ingat saya"
                        onChange={togglePersist}
                        checked={persist}
                        value={persist}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          type="submit"
                          disabled={loading || !usernameValue || !passwordValue || !!errorValue}
                        >
                          {!!loading && <CSpinner as="span" size="sm" />} Masuk
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
