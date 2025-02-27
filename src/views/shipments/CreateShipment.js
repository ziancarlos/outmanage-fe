import {
  CBadge,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react-pro'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

import Swal from 'sweetalert2'
import FormCardLayout from '../../components/FormCardLayout'

import SelectFleet from '../../components/fleets/SelectFleet'
import CreateDeliveryOrder from './CreateShipmentDeliveryOrder'
const NUM_REGEX = /^[1-9][0-9]*$/
const TEXT_REGEX = /^.{3,60000}$/
const LICENSE_PLATE_REGEX = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/

export default function CreateShipment() {
  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [shipmentType, setShipmentType] = useState('ANTAR')
  const [fleetValue, setFleetValue] = useState('')
  const [licensePlateValue, setLicensePlateValue] = useState('')
  const [internalNotesValue, setInternalNotesValue] = useState('')

  const [deliveryOrders, setDeliveryOrders] = useState([])

  const [fleetValid, setFleetValid] = useState(false)
  const [licensePlateValid, setLicensePlateValid] = useState(false)
  const [internalNotesValid, setInternalNotesValid] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFleetValue('')
    setLicensePlateValue('')
  }, [shipmentType])

  useEffect(() => {
    setError('')
  }, [fleetValue, shipmentType, licensePlateValue, internalNotesValue, deliveryOrders])

  useEffect(() => {
    setLicensePlateValid(LICENSE_PLATE_REGEX.test(licensePlateValue))
  }, [licensePlateValue])

  useEffect(() => {
    setFleetValid(NUM_REGEX.test(fleetValue?.value))
  }, [fleetValue])

  useEffect(() => {
    setInternalNotesValid(TEXT_REGEX.test(internalNotesValue))
  }, [internalNotesValue])

  function isFormValid() {
    if (shipmentType === 'ANTAR' && !fleetValid) return false
    if (shipmentType === 'JEMPUT' && !licensePlateValid) return false
    if (deliveryOrders.length === 0) return false
    if (internalNotesValue && !internalNotesValid) return false
    if (error) return false

    return true
  }

  function clearInput() {
    setShipmentType('ANTAR')
    setFleetValue('')
    setLicensePlateValue('')
    setDeliveryOrders([])
    setInternalNotesValue('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid()) {
      return setError('Silakan lengkapi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      const request = {
        deliveryOrders: deliveryOrders.map(
          ({ deliveryOrderId, address, shipmentDeliveryOrderType, deliveryOrderItems }) => ({
            deliveryOrderId,
            ...(address && { address }), // Only include address if it's truthy
            shipmentDeliveryOrderType,
            items: deliveryOrderItems.map(({ deliveryOrderItemId, quantitySend }) => ({
              deliveryOrderItemId,
              quantity: quantitySend,
            })),
          }),
        ),
      }

      if (shipmentType === 'ANTAR') {
        request.fleetId = fleetValue.value
      } else if (shipmentType === 'JEMPUT') {
        request.licensePlate = licensePlateValue
      }

      if (internalNotesValue) {
        request.internalNotes = internalNotesValue
      }

      await axiosPrivate.post('/api/shipments', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengiriman berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()

        navigate('/shipments/data')
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

  return (
    <>
      <FormCardLayout
        title="Tambah Pengiriman"
        handleSubmit={handleSubmit}
        error={error}
        isFormValid={isFormValid}
      >
        <CRow>
          <CCol lg={12} className="mb-3">
            <CFormCheck
              inline
              type="radio"
              defaultChecked
              label="Antar"
              value="ANTAR"
              checked={shipmentType === 'ANTAR'}
              onChange={() => setShipmentType('ANTAR')}
              disabled={loading}
            />
            <CFormCheck
              inline
              type="radio"
              label="Jemput"
              value="JEMPUT"
              checked={shipmentType === 'JEMPUT'}
              onChange={() => setShipmentType('JEMPUT')}
              disabled={loading}
            />
          </CCol>

          {shipmentType === 'JEMPUT' && (
            <CCol lg={12} className="mb-3">
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
            </CCol>
          )}

          {shipmentType === 'ANTAR' && (
            <div lg={12} className="mb-3">
              <SelectFleet
                label={'Armada'}
                formLoading={loading}
                navigate={navigate}
                fleetValue={fleetValue}
                setFleetValue={setFleetValue}
                axiosPrivate={axiosPrivate}
                resetSelectionOnOptionsChange={false}
                className={
                  fleetValue && fleetValid
                    ? 'is-valid'
                    : fleetValue && !fleetValid
                      ? 'is-invalid'
                      : ''
                }
              />

              {fleetValid && fleetValue && <div className="valid-feedback">Armada valid.</div>}
              {!fleetValid && fleetValue && (
                <div className="invalid-feedback">Armada tidak valid.</div>
              )}
            </div>
          )}
          <CCol lg={12} className="mb-3">
            <CreateDeliveryOrder
              deliveryOrders={deliveryOrders}
              setDeliveryOrders={setDeliveryOrders}
              loading={loading}
              navigate={navigate}
              logout={logout}
              axiosPrivate={axiosPrivate}
            />
          </CCol>

          <CCol lg={12} className="mb-3">
            <CFormLabel className="fw-bold">
              Catatan Internal <CBadge color="warning">Opsional</CBadge>
            </CFormLabel>
            <CFormTextarea
              rows={2}
              placeholder="Masukkan catatan internal"
              disabled={loading}
              value={internalNotesValue}
              onChange={(e) => setInternalNotesValue(e.target.value)}
              className={
                internalNotesValue && internalNotesValid
                  ? 'is-valid'
                  : internalNotesValue && !internalNotesValid
                    ? 'is-invalid'
                    : ''
              }
            />
            {internalNotesValid && internalNotesValue && (
              <div className="valid-feedback">Catatan internal valid.</div>
            )}
            {!internalNotesValid && internalNotesValue && (
              <div className="invalid-feedback">
                Catatan internal harus berupa alfanumerik dan panjangnya antara 3 hingga 60.000
                karakter.
              </div>
            )}
          </CCol>
        </CRow>
      </FormCardLayout>
    </>
  )
}
;``
