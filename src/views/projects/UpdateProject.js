import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Swal from 'sweetalert2'
import {
  CCard,
  CCardBody,
  CCardFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCardHeader,
  CBadge,
  CFormLabel,
  useDebouncedCallback,
  CMultiSelect,
  CLoadingButton,
} from '@coreui/react-pro'
import useLogout from '../../hooks/useLogout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

const NAME_REGEX = /^.{3,100}$/
const DESCRIPTION_REGEX = /^.{3,60000}$/
const ADDRESS_REGEX = /^.{3,60000}$/

function UpdateProject() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const nameRef = useRef()

  const [initialProject, setInitialProject] = useState({})
  const [nameValue, setNameValue] = useState('')
  const [clientValue, setClientValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')
  const [addressValue, setAddressValue] = useState('')

  const [nameValid, setNameValid] = useState(true)
  const [clientValid, setClientValid] = useState(true)
  const [addressValid, setAddressValid] = useState(true)
  const [descriptionValid, setDescriptionValid] = useState(true)

  const [clientOptions, setClientOptions] = useState([])
  const [clientOptionsLoading, setClientOptionsLoading] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [updateFormLoading, setUpdateFormLoading] = useState(false)

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()

  useEffect(() => {
    setLoading(true)

    fetchProjectData().finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    setNameValid(NAME_REGEX.test(nameValue))
  }, [nameValue])

  useEffect(() => {
    setAddressValid(ADDRESS_REGEX.test(addressValue))
  }, [addressValue])

  useEffect(() => {
    setDescriptionValid(DESCRIPTION_REGEX.test(descriptionValue))
  }, [descriptionValue])

  useEffect(() => {
    setClientValid(
      typeof clientValue[0]?.value === 'number' &&
        !Number.isNaN(clientValue[0]?.value) &&
        Number.isFinite(clientValue[0]?.value),
    )
  }, [clientValue])

  useEffect(() => {
    setError('')
  }, [nameValue, descriptionValue, clientValue, addressValue])

  const isFormChanged =
    nameValue !== initialProject.name ||
    descriptionValue !== (initialProject.description || '') ||
    clientValue[0].value !== initialProject.client?.clientId ||
    addressValue !== initialProject.address

  const isFormValid =
    nameValid && clientValid && (descriptionValue === '' || descriptionValid) && addressValid

  const fetchClients = async (value) => {
    try {
      setClientOptionsLoading(true)

      const params = value
        ? { name: value, phoneNumber: value, page: 1, size: 5 }
        : { page: 1, size: 5 }

      const response = await axiosPrivate.get('/api/clients', { params })
      const options = response.data.data.map((client) => ({
        value: client.clientId,
        label: `${client.name} | ${client.phoneNumber}`,
        ...(client.clientId === clientValue[0]?.value && { selected: true }), // Conditionally add `selected` property
      }))

      setClientOptions(options)
    } catch (e) {
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

  async function fetchProjectData() {
    try {
      const response = await axiosPrivate.get(`/api/projects/${projectId}`)
      const data = response.data.data
      setInitialProject(data)

      setNameValue(data.name)
      setClientValue([
        {
          value: data.client.clientId,
        },
      ])
      setClientOptions([
        {
          value: data.client.clientId,
          label: `${data.client.name} | ${data.client.phoneNumber}`,
          selected: true,
        },
      ])

      setDescriptionValue(data.description ? data.description : '')
      setAddressValue(data.address)
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
      return setError('Input yang dimasukkan tidak valid. Mohon periksa kembali.')
    }
    if (!isFormChanged) {
      return setError('Tidak melakukan perubahaan.')
    }

    setUpdateFormLoading(true)

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

      await axiosPrivate.patch(`/api/projects/${projectId}`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proyek berhasil diubah.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/projects/data')
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400, 409].includes(e.response?.status)) {
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
                <strong>Ubah Proyek</strong>
              </CCardHeader>

              <CForm onSubmit={handleSubmit}>
                <CCardBody>
                  {!!error && <CAlert color="danger">{error}</CAlert>}

                  <div className="mb-3">
                    <CFormInput
                      id="name"
                      type="text"
                      placeholder="Masukkan nama proyek"
                      ref={nameRef}
                      disabled={updateFormLoading}
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      autoComplete="off"
                      label="Nama"
                      className={
                        nameValue && nameValid
                          ? 'is-valid'
                          : nameValue && !nameValid
                            ? 'is-invalid'
                            : ''
                      }
                    />
                    {nameValid && nameValue && <div className="valid-feedback">Name is valid.</div>}
                    {!nameValid && nameValue && (
                      <div className="invalid-feedback">
                        Name must be between 3 and 100 characters long.
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormTextarea
                      id="address"
                      rows={2}
                      placeholder="Masukkan alamat proyek"
                      value={addressValue}
                      disabled={updateFormLoading}
                      autoComplete="off"
                      onChange={(e) => setAddressValue(e.target.value)}
                      label="Alamat"
                      className={
                        addressValue && addressValid
                          ? 'is-valid'
                          : addressValue && !addressValid
                            ? 'is-invalid'
                            : ''
                      }
                    ></CFormTextarea>

                    {addressValid && addressValue && (
                      <div className="valid-feedback">Address is valid.</div>
                    )}
                    {!addressValid && addressValue && (
                      <div className="invalid-feedback">
                        Address must be between 3 and 60000 characters long.
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CMultiSelect
                      options={clientOptions}
                      onFilterChange={debouncedFetchClients}
                      placeholder="Pilih klien"
                      onShow={fetchClients}
                      disabled={updateFormLoading}
                      multiple={false}
                      onChange={(e) => {
                        setClientValue(e)
                      }}
                      className={
                        clientValue && clientValid
                          ? 'is-valid'
                          : clientValue && !clientValid
                            ? 'is-invalid'
                            : ''
                      }
                      label={'Klien'}
                      search="external"
                      virtualScroller
                      loading={clientOptionsLoading}
                      cleaner={false}
                    />
                    {clientValue && clientValid && (
                      <div className="valid-feedback">Klien valid.</div>
                    )}
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
                      disabled={updateFormLoading}
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
                      <div className="valid-feedback">Description is valid.</div>
                    )}
                    {!descriptionValid && descriptionValue && (
                      <div className="invalid-feedback">
                        Description must be between 3 and 60000 characters long.
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

export default UpdateProject
