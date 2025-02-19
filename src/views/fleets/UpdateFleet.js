import { CFormInput, CRow, CSpinner } from '@coreui/react-pro'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

const MODEL_REGEX = /^.{3,150}$/
const LICENSE_PLATE_REGEX = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/

export default function UpdateFleet() {
  const { fleetId } = useParams()

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [initialFleet, setInitialFleet] = useState({})

  const [modelValue, setModelValue] = useState('')
  const [licensePlateValue, setLicensePlateValue] = useState('')

  const [modelValid, setModelValid] = useState(false)
  const [licensePlateValid, setLicensePlateValid] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    fetchFleet().finally(() => {
      setLoading(false)
    })
  }, [fleetId])

  async function fetchFleet() {
    try {
      const response = await axiosPrivate.get(`/api/fleets/${fleetId}`)
      const data = response.data.data

      setInitialFleet(data)
      setModelValue(data.model)
      setLicensePlateValue(data.licensePlate)
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

  useEffect(() => {
    setError('')
  }, [modelValue, licensePlateValue])

  useEffect(() => {
    setModelValid(MODEL_REGEX.test(modelValue))
  }, [modelValue])
  useEffect(() => {
    setLicensePlateValid(LICENSE_PLATE_REGEX.test(licensePlateValue))
  }, [licensePlateValue])

  const isFormChanged =
    modelValue !== initialFleet.model || licensePlateValue !== initialFleet.licensePlate

  function isFormValid() {
    return !(error || !modelValid || !licensePlateValid) // SKU can be empty, but if provided, it must be valid
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      await axiosPrivate.patch(`/api/fleets/${fleetId}`, {
        model: modelValue,
        licensePlate: licensePlateValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Armada berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/fleets/data')
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
    setModelValue('')
    setLicensePlateValue('')
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
            title="Tambah Barang"
            handleSubmit={handleSubmit}
            error={error}
            isFormValid={isFormValid}
          >
            <div className="mb-3">
              <CFormInput
                id="model"
                type="text"
                autoComplete="new-model"
                placeholder="Masukkan model"
                value={modelValue}
                onChange={(e) => setModelValue(e.target.value.toUpperCase())}
                disabled={loading}
                className={
                  modelValue && modelValid
                    ? 'is-valid'
                    : modelValue && !modelValid
                      ? 'is-invalid'
                      : ''
                }
                label="Model"
              />

              {modelValid && modelValue && (
                <div className="valid-feedback">Model armada valid.</div>
              )}
              {!modelValid && modelValue && (
                <div className="invalid-feedback">
                  Model armada harus berupa alfanumerik dan panjangnya antara 3 hingga 100 karakter.
                </div>
              )}
            </div>

            <div className="mb-3">
              <CFormInput
                id="model"
                type="text"
                autoComplete="new-model"
                placeholder="Masukkan nomor polisi"
                value={licensePlateValue}
                onChange={(e) => setLicensePlateValue(e.target.value.toUpperCase())}
                disabled={loading}
                className={
                  licensePlateValue && licensePlateValid
                    ? 'is-valid'
                    : licensePlateValue && !licensePlateValid
                      ? 'is-invalid'
                      : ''
                }
                label="Nomor Polisi"
              />

              {licensePlateValid && licensePlateValue && (
                <div className="valid-feedback">Nomor polisi armada valid.</div>
              )}
              {!licensePlateValid && licensePlateValue && (
                <div className="invalid-feedback">
                  Nomor polisi Nomor polisi harus mengikuti format: AA 1234 BBB (misalnya, AB 1234
                  CD)
                </div>
              )}
            </div>
          </FormCardLayout>
        </CRow>
      )}
    </>
  )
}
