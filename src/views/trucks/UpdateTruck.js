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
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCardHeader,
  CLoadingButton,
} from '@coreui/react-pro'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useLogout from '../../hooks/useLogout'

const MODEL_REGEX = /^.{3,100}$/

function UpdateTruck() {
  const { truckId } = useParams()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()

  const [initialTruck, setInitialTruck] = useState({})
  const [modelValue, setModelValue] = useState('')
  const [modelValid, setModelValid] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateFormLoading, setUpdateFormLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchTruckData().finally(() => setLoading(false))
  }, [truckId])

  useEffect(() => {
    setError('')
  }, [modelValue])

  useEffect(() => {
    setModelValid(MODEL_REGEX.test(modelValue))
  }, [modelValue])

  const isFormChanged = modelValue !== initialTruck.model
  const isFormValid = modelValid

  async function fetchTruckData() {
    try {
      const response = await axiosPrivate.get(`/api/trucks/${truckId}`)
      const data = response.data.data

      setInitialTruck(data)
      setModelValue(data.model)
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
      return setError('Input tidak valid. Mohon periksa kembali.')
    }
    if (!isFormChanged) {
      return setError('Tidak ada perubahan pada model.')
    }

    setUpdateFormLoading(true)

    try {
      await axiosPrivate.patch(`/api/trucks/${truckId}`, { model: modelValue })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Model truk berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/trucks/data')
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404].includes(e.response?.status)) {
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
          <CCol>
            <CCard>
              <CCardHeader>
                <strong>Ubah Truk</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {!!error && <CAlert color="danger">{error}</CAlert>}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Masukkan model truk"
                      value={modelValue}
                      onChange={(e) => setModelValue(e.target.value)}
                      autoComplete="off"
                      label="Model"
                      className={
                        modelValue && modelValid
                          ? 'is-valid'
                          : modelValue && !modelValid
                            ? 'is-invalid'
                            : ''
                      }
                    />
                    {modelValid && modelValue && <div className="valid-feedback">Model valid.</div>}
                    {!modelValid && modelValue && (
                      <div className="invalid-feedback">Model harus antara 3 dan 100 karakter.</div>
                    )}
                  </div>
                  {/* Other fields can be shown as disabled here */}
                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Owner"
                      value={initialTruck.licensePlate}
                      label="Plat Nomor"
                      disabled
                    />
                  </div>
                  {/* Add more disabled fields if needed */}

                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Owner"
                      value={initialTruck.brand.name}
                      label="Merek"
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      placeholder="Warna"
                      value={initialTruck.color?.name}
                      label="Warna"
                      disabled
                      className="mb-1" // Optional: adds some space between the input and the color block
                    />
                    {initialTruck.color?.rgb && (
                      <div
                        style={{
                          display: 'inline-block',
                          width: '50px', // Make the color block smaller
                          height: '30px',
                          backgroundColor: `${initialTruck.color.rgb}`,
                          marginTop: '5px',
                          borderRadius: '4px',
                          border: `1px solid ${initialTruck.color.rgb}`,
                          boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', // Adding a slight shadow to make it pop
                          cursor: 'pointer', // Optional: cursor pointer to show it's a color block
                        }}
                        title={`RGB: ${initialTruck.color.rgb}`} // Show RGB value on hover
                      />
                    )}
                  </div>
                </CCardBody>
                <CCardFooter>
                  <CLoadingButton
                    color="info"
                    type="submit"
                    loading={updateFormLoading || loading}
                    disabled={
                      loading || updateFormLoading || !!error || !isFormValid || !isFormChanged
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

export default UpdateTruck
