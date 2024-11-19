import React, { useEffect, useRef, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CCardBody,
  CCard,
  CCardHeader,
  CCardFooter,
  CRow,
  CCol,
  CLoadingButton,
  CMultiSelect,
  CSpinner,
  CFormCheck,
  CAlert,
} from '@coreui/react-pro'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import Swal from 'sweetalert2'

const LICENSE_PLATE_REGEX = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/
const MODEL_REGEX = /^.{3,255}$/

function CreateTruck() {
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const logout = useLogout()

  const [licensePlateValid, setLicensePlateValid] = useState(false)
  const [brandValid, setBrandValid] = useState(false)
  const [colorValid, setColorValid] = useState(false)
  const [modelValid, setModelValid] = useState(false)

  const [licensePlateValue, setLicensePLateValue] = useState('')
  const [brandValue, setBrandValue] = useState('')
  const [colorValue, setColorValue] = useState('')
  const [modelValue, setModelValue] = useState('')

  const [brandOptions, setBrandOptions] = useState([])
  const [colorOptions, setColorOptions] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchBrandOptions() {
    try {
      const response = await axiosPrivate.get('/api/trucks/brands')

      const options = response.data.data.map((brand) => ({
        value: brand.brandId,
        label: brand.name,
      }))

      setBrandOptions(options)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchColorOptions() {
    try {
      const response = await axiosPrivate.get('/api/trucks/colors')

      const options = response.data.data.map((color) => ({
        value: color.colorId,
        label: color.name,
        rgb: color.rgb, //rgb(255, 0, 0)
      }))

      setColorOptions(options)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response?.data.error)
      } else {
        console.log(e)
        navigate('/500')
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Silakan isi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      const request = {
        licensePlate: licensePlateValue,
        brandId: brandValue?.value,
        colorId: colorValue?.value,
        model: modelValue,
      }

      await axiosPrivate.post('/api/trucks', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Truk berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()
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
      setLoading(false)
    }
  }

  function clearInput() {
    setError('')
    setLicensePLateValue('')
    setModelValue('')
    setColorValue('')
    setBrandValue('')
    setBrandOptions([])
    setColorOptions([])
  }
  useEffect(() => {
    setError('')
  }, [licensePlateValue, brandValue, colorValue, modelValue])

  function isFormValid() {
    if (error || !licensePlateValid || !brandValid || !colorValid || !modelValid) {
      return false
    }

    return true
  }

  useEffect(() => {
    setLicensePlateValid(LICENSE_PLATE_REGEX.test(licensePlateValue))
  }, [licensePlateValue])

  useEffect(() => {
    setModelValid(MODEL_REGEX.test(modelValue))
  }, [modelValue])

  useEffect(() => {
    setBrandValid(
      typeof brandValue?.value === 'number' &&
        !Number.isNaN(brandValue?.value) &&
        Number.isFinite(brandValue?.value),
    )
  }, [brandValue])

  useEffect(() => {
    setColorValid(
      typeof colorValue?.value === 'number' &&
        !Number.isNaN(colorValue?.value) &&
        Number.isFinite(colorValue?.value),
    )
  }, [colorValue])

  useEffect(() => {
    setLoading(true)

    Promise.all([fetchBrandOptions(), fetchColorOptions()]).finally(() => setLoading(false))
  }, [])

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
                <strong>Tambah Truk</strong>
              </CCardHeader>
              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {!!error && <CAlert color="danger">{error}</CAlert>}

                  <div className="mb-3">
                    <CFormInput
                      id="licensePlate"
                      type="text"
                      placeholder="Masukkan nomor plat truk"
                      label="Nomor Plat"
                      value={licensePlateValue}
                      onChange={(e) => setLicensePLateValue(e.target.value)}
                      className={
                        licensePlateValue && licensePlateValid
                          ? 'is-valid'
                          : licensePlateValue && !licensePlateValid
                            ? 'is-invalid'
                            : ''
                      }
                    />

                    {licensePlateValid && licensePlateValue && (
                      <div className="valid-feedback">Plat nomor valid.</div>
                    )}
                    {!licensePlateValid && licensePlateValue && (
                      <div className="invalid-feedback">
                        Plat nomor harus mengikuti format: AA 1234 BBB (misalnya, AB 1234 CD)
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      label="Model"
                      type="text"
                      placeholder="Masukkan nama model"
                      onChange={(e) => setModelValue(e.target.value)}
                      value={modelValue}
                      className={
                        modelValue && modelValid
                          ? 'is-valid'
                          : modelValue && !modelValid
                            ? 'is-invalid'
                            : ''
                      }
                    />

                    {modelValid && modelValue && (
                      <div className="valid-feedback">Model Truk valid.</div>
                    )}
                    {!modelValid && modelValue && (
                      <div className="invalid-feedback">
                        Model Truk harus memiliki panjang 3-255 karakter
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel className="fw-bold">Merek</CFormLabel>
                    <CMultiSelect
                      options={brandOptions}
                      onChange={(e) => {
                        if (e.length < 1) return
                        if (e[0].value === brandValue.value) return

                        setBrandValue(e[0])
                      }}
                      multiple={false}
                      virtualScroller
                      visibleItems={5}
                      placeholder="Pilih merek"
                      cleaner={false}
                      className={
                        brandValue && brandValid
                          ? 'is-valid'
                          : brandValue && !brandValid
                            ? 'is-invalid'
                            : ''
                      }
                      resetSelectionOnOptionsChange={true}
                    />

                    {brandValid && brandValue && (
                      <div className="valid-feedback">Merek Truk valid.</div>
                    )}
                    {!brandValid && brandValue && (
                      <div className="invalid-feedback">Silahkan memilih merek truk.</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel className="fw-bold">Warna</CFormLabel>
                    <CMultiSelect
                      options={colorOptions}
                      onChange={(e) => {
                        if (e.length < 1) return
                        if (e[0].value === colorValue.value) return
                        setColorValue(e[0])
                      }}
                      multiple={false}
                      virtualScroller
                      visibleItems={5}
                      placeholder="Pilih Warna"
                      cleaner={false}
                      optionsTemplate={(option) => (
                        <div className="d-flex align-items-center">
                          <div
                            className="me-2"
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: option.rgb,
                              borderRadius: '50%',
                            }}
                          />
                          {option.label}
                        </div>
                      )}
                      className={
                        colorValue && colorValid
                          ? 'is-valid'
                          : colorValue && !colorValid
                            ? 'is-invalid'
                            : ''
                      }
                      resetSelectionOnOptionsChange={true}
                    />

                    {colorValid && colorValue && (
                      <div className="valid-feedback">Warna truk valid.</div>
                    )}
                    {!colorValid && colorValue && (
                      <div className="invalid-feedback">Silahkan memilih warna truk.</div>
                    )}
                  </div>
                </CCardBody>

                <CCardFooter>
                  <CLoadingButton
                    color="primary"
                    type="submit"
                    disabled={loading || !isFormValid()}
                    loading={loading}
                  >
                    <FontAwesomeIcon icon={faSave} />
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

export default CreateTruck
