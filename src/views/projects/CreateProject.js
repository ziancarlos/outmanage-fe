import React, { useEffect, useRef, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CCardBody,
  CCard,
  CCardHeader,
  CCardFooter,
  CAlert,
  CSpinner,
  CFormTextarea,
  CRow,
  CCol,
  CBadge,
  CMultiSelect,
  useDebouncedCallback,
  CLoadingButton,
} from '@coreui/react-pro'
import Swal from 'sweetalert2'
import useLogout from '../../hooks/useLogout'
import { useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const NAME_REGEX = /^.{3,100}$/
const DESCRIPTION_REGEX = /^.{3,60000}$/
const ADDRESS_REGEX = /^.{3,60000}$/

function CreateProject() {
  const nameRef = useRef()
  const navigate = useNavigate()

  const [nameValue, setNameValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')
  const [addressValue, setAddressValue] = useState('')
  const [clientValue, setClientValue] = useState('')

  const [nameValid, setNameValid] = useState(false)
  const [descriptionValid, setDescriptionValid] = useState(true)
  const [addressValid, setAddressValid] = useState(false)
  const [clientValid, setClientValid] = useState(false)

  const [clientOptions, setClientOptions] = useState([])
  const [clientOptionsLoading, setClientOptionsLoading] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  useEffect(() => {
    if (descriptionValue) {
      setDescriptionValid(DESCRIPTION_REGEX.test(descriptionValue))
    } else {
      setDescriptionValid(true)
    }
  }, [descriptionValue])

  useEffect(() => {
    setAddressValid(ADDRESS_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    setClientValid(
      typeof clientValue[0]?.value === 'number' &&
        !Number.isNaN(clientValue[0]?.value) &&
        Number.isFinite(clientValue[0]?.value),
    )
  }, [clientValue])

  useEffect(() => {
    setError('')
  }, [nameValue, descriptionValue, addressValue])

  const fetchClients = async (value) => {
    if (!value) return

    try {
      setClientOptionsLoading(true)

      const params = value
        ? { name: value, phoneNumber: value, page: 1, size: 5 }
        : { page: 1, size: 5 }

      const response = await axiosPrivate.get('/api/clients', { params })
      const options = response.data.data.map((client) => ({
        value: client.clientId,
        label: `${client.name} | ${client.phoneNumber}`,
      }))

      setClientOptions(options)
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response?.data.e)
      } else {
        navigate('/500')
      }
    } finally {
      setClientOptionsLoading(false)
    }
  }

  const debouncedFetchClients = useDebouncedCallback((value) => {
    fetchClients(value)
  }, 300)

  useEffect(() => {
    nameRef.current.focus()
  }, [])

  function isFormValid() {
    if (
      error ||
      !nameValid ||
      (!descriptionValid && descriptionValue !== '') ||
      !addressValid ||
      !clientValid
    ) {
      return false
    }

    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isFormValid) {
      return setError('Silakan isi semua kolom yang diperlukan dengan benar.')
    }

    setLoading(true)

    try {
      const request = descriptionValue
        ? {
            name: nameValue,
            description: descriptionValue,
            address: addressValue,
            clientId: clientValue[0].value,
          }
        : {
            name: nameValue,
            address: addressValue,
            clientId: clientValue[0].value,
          }

      await axiosPrivate.post('/api/projects', request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proyek berhasil dibuat.',
        confirmButtonText: 'OK',
      }).then(() => {
        clearInput()
      })
    } catch (e) {
      console.log(e)
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
    setNameValue('')
    setClientOptions([])
    setClientValue('')
    setDescriptionValue('')
    setAddressValue('')
    setError('')
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <strong>Tambah Proyek</strong>
            </CCardHeader>

            <CForm onSubmit={handleSubmit}>
              <CCardBody>
                {!!error && <CAlert color="danger">{error}</CAlert>}

                <div className="mb-3">
                  <CFormInput
                    id="name"
                    type="text"
                    placeholder="Masukkan nama proyek"
                    label={'Nama'}
                    ref={nameRef}
                    value={nameValue}
                    disabled={loading}
                    onChange={(e) => setNameValue(e.target.value)}
                    autoComplete="off"
                    className={
                      nameValue && nameValid
                        ? 'is-valid'
                        : nameValue && !nameValid
                          ? 'is-invalid'
                          : ''
                    }
                  />
                  {nameValid && nameValue && (
                    <div className="valid-feedback">Nama proyek valid.</div>
                  )}
                  {!nameValid && nameValue && (
                    <div className="invalid-feedback">
                      Nama harus memiliki panjang 3-100 karakter
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <CFormTextarea
                    id="address"
                    rows={2}
                    placeholder="Masukkan alamat proyek"
                    label={'Alamat'}
                    disabled={loading}
                    value={addressValue}
                    autoComplete="off"
                    onChange={(e) => setAddressValue(e.target.value)}
                    className={
                      addressValue && addressValid
                        ? 'is-valid'
                        : addressValue && !addressValid
                          ? 'is-invalid'
                          : ''
                    }
                  ></CFormTextarea>

                  {addressValid && addressValue && (
                    <div className="valid-feedback">Alamat proyek valid.</div>
                  )}
                  {!addressValid && addressValue && (
                    <div className="invalid-feedback">
                      Alamat harus memiliki panjang 3-600000 karakter
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <CMultiSelect
                    options={clientOptions}
                    onFilterChange={debouncedFetchClients}
                    onShow={fetchClients}
                    disabled={loading}
                    multiple={false}
                    onChange={(e) => {
                      if (e.length < 1) return

                      setClientValue(e || '')
                    }}
                    className={
                      clientValue && clientValid
                        ? 'is-valid'
                        : clientValue && !clientValid
                          ? 'is-invalid'
                          : ''
                    }
                    placeholder="Pilih klien"
                    label={'Klien'}
                    search="external"
                    virtualScroller
                    loading={clientOptionsLoading}
                    resetSelectionOnOptionsChange={true}
                    cleaner={false}
                  />
                  {clientValue && clientValid && <div className="valid-feedback">Klien valid.</div>}
                  {!clientValue && clientValid && (
                    <div className="invalid-feedback">Silahkan memilih klien.</div>
                  )}
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="description">
                    Deskripsi <CBadge color="info">Optional</CBadge>
                  </CFormLabel>
                  <CFormTextarea
                    id="description"
                    rows={3}
                    placeholder="Masukkan deskripsi proyek"
                    disabled={loading}
                    value={descriptionValue}
                    autoComplete="off"
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    className={
                      descriptionValue && descriptionValid
                        ? 'is-valid'
                        : descriptionValue && !descriptionValid
                          ? 'is-invalid'
                          : ''
                    }
                  />
                  {descriptionValid && descriptionValue && (
                    <div className="valid-feedback">Deskripsi valid</div>
                  )}
                  {!descriptionValid && descriptionValue && (
                    <div className="invalid-feedback">
                      Deskripsi harus memiliki panjang 3-60000 karakter
                    </div>
                  )}
                </div>
              </CCardBody>

              <CCardFooter>
                <CLoadingButton
                  color="primary"
                  type="submit"
                  disabled={!isFormValid() || loading}
                  loading={loading}
                >
                  <FontAwesomeIcon icon={faSave} />
                </CLoadingButton>
              </CCardFooter>
            </CForm>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CreateProject
