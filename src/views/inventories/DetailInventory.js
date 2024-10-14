import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CRow,
  CCol,
  CBadge,
  CCardFooter,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormSelect,
  CFormInput,
  CFooter,
  CLoadingButton,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CAlert,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSmartPagination,
  CDateRangePicker,
} from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import {
  faMinusCircle,
  faPlusCircle,
  faSave,
  faSearch,
  faTicket,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Swal from 'sweetalert2'
import moment from 'moment'
import { formatToISODate } from '../../utils/DateUtils'
import TableInventoryLog from '../../components/inventories/TableInventoryLog'

const DESCRIPTION_REGEX = /^.{3,60000}$/

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]

const DetailInventory = () => {
  const { authorizePermissions } = useAuth()

  const canCreateInventoryImport = authorizePermissions.some(
    (perm) => perm.name === 'create-inventory-import',
  )

  const canCreateInventoryDepreciation = authorizePermissions.some(
    (perm) => perm.name === 'create-inventory-depreciation',
  )

  const canReadInventoryDepreciations = authorizePermissions.some(
    (perm) => perm.name === 'read-inventory-depreciations',
  )
  const canReadInventoryImports = authorizePermissions.some(
    (perm) => perm.name === 'read-inventory-imports',
  )
  const canReadInventoryQuantityLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-inventory-quantity-logs',
  )

  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')
  const canReadInventoryLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-inventory-logs',
  )

  const { inventoryId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [inventory, setInventory] = useState({})

  const [inventoryLogs, setInventoryLogs] = useState([])
  const [inventoryLogsPage, setInventoryLogsPage] = useState(1)
  const [inventoryLogsTotalPage, setInventoryLogsTotalPage] = useState(1)
  const [inventoryLogsTypeValue, setInventoryLogsTypeValue] = useState('')
  const [inventoryLogsStartDateValue, setInventoryLogsStartDateValue] = useState('')
  const [inventoryLogsEndDateValue, setInventoryLogsEndDateValue] = useState('')
  const [inventoryLogsLoading, setInventoryLogsLoading] = useState(false)
  const [inventoryLogsError, setInventoryLogsError] = useState('')
  const inventoryLogsSearchRef = useRef()

  const [inventoryDepreciation, setInventoryDepreciation] = useState([])
  const [inventoryDepreciationPage, setInventoryDepreciationPage] = useState(1)
  const [inventoryDepreciationTotalPage, setInventoryDepreciationTotalPage] = useState(1)
  const [inventoryDepreciationReasonOptions, setInventoryDepreciationReasonOptions] = useState([])
  const [inventoryDepreciationReasonValue, setInventoryDepreciationReasonValue] = useState({})
  const [inventoryDepreciationStartDateValue, setInventoryDepreciationStartDateValue] = useState('')
  const [inventoryDepreciationEndDateValue, setInventoryDepreciationEndDateValue] = useState('')
  const [inventoryDepreciationLoading, setInventoryDepreciationLoading] = useState(false)
  const [inventoryDepreciationError, setInventoryDepreciationError] = useState('')
  const inventoryDepreciationSearchRef = useRef()

  const [inventoryImport, setInventoryImport] = useState([])
  const [inventoryImportPage, setInventoryImportPage] = useState(1)
  const [inventoryImportTotalPage, setInventoryImportTotalPage] = useState(1)
  const [inventoryImportReasonOptions, setInventoryImportReasonOptions] = useState([])
  const [inventoryImportReasonValue, setInventoryImportReasonValue] = useState({})
  const [inventoryImportStartDateValue, setInventoryImportStartDateValue] = useState('')
  const [inventoryImportEndDateValue, setInventoryImportEndDateValue] = useState('')
  const [inventoryImportLoading, setInventoryImportLoading] = useState(false)
  const [inventoryImportError, setInventoryImportError] = useState('')
  const inventoryImportSearchRef = useRef()

  const [inventoryQuantityLogs, setInventoryQuantityLogs] = useState([])
  const [inventoryQuantityLogsPage, setInventoryQuantityLogsPage] = useState(1)
  const [inventoryQuantityLogsTotalPage, setInventoryQuantityLogsTotalPage] = useState(1)
  const [inventoryQuantityLogsStartDateValue, setInventoryQuantityLogsStartDateValue] = useState('')
  const [inventoryQuantityLogsDetailValue, setInventoryQuantityLogsDetailValue] = useState('')
  const [inventoryQuantityLogsEndDateValue, setInventoryQuantityLogsEndDateValue] = useState('')
  const [inventoryQuantityLogsLoading, setInventoryQuantityLogsLoading] = useState(false)
  const [inventoryQuantityLogsError, setInventoryQuantityLogsError] = useState('')
  const inventoryQuantityLogsSearchRef = useRef()

  const [depreciationReasonOptions, setDepreciationReasonOptions] = useState([])
  const [visibileModalDepreciation, setVisibileModalDepreciation] = useState(false)
  const [depreciationQuantityValue, setDepreciationQuantityValue] = useState('')
  const [depreciationReasonValue, setDepreciationReasonValue] = useState('')
  const [depreciationDescriptionValue, setDepreciationDescriptionValue] = useState('')
  const [depreciationLoading, setDepreciationLoading] = useState(false)
  const [depreciationError, setDepreciationError] = useState('')

  const [importReasonOptions, setImportReasonOptions] = useState([])
  const [visibileModalImport, setVisibileModalImport] = useState(false)
  const [importQuantityValue, setImportQuantityValue] = useState('')
  const [importReasonValue, setImportReasonValue] = useState('')
  const [importDescriptionValue, setImportDescriptionValue] = useState('')
  const [importError, setImportError] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [
      fetchInventory(inventoryId),
      fetchDepreciationReason(),
      fetchImportReason(),
    ]

    const searchParams = new URLSearchParams(location.search)

    if (canReadInventoryDepreciations) {
      const inventoryDepreciationParam = searchParams.get('inventoryDepreciation')

      if (!!inventoryDepreciationParam) {
        try {
          const parsedParams = JSON.parse(inventoryDepreciationParam)
          inventoryDepreciationSearchRef.current = {}

          if (parsedParams.inventoryDepreciationReasonId) {
            inventoryDepreciationSearchRef.current.inventoryDepreciationReasonId =
              parsedParams.inventoryDepreciationReasonId
          }
          if (parsedParams.startDate) {
            inventoryDepreciationSearchRef.current.startDate = formatToISODate(
              parsedParams.startDate,
            )
          }
          if (parsedParams.endDate) {
            inventoryDepreciationSearchRef.current.endDate = formatToISODate(parsedParams.endDate)
          }
        } finally {
          clearInventoryDepreciationInput()
        }
      }

      fetchPromises.push(
        fetchInventoryDepreciation(inventoryId, 1, inventoryDepreciationSearchRef.current),
      )
    }

    if (canReadInventoryImports) {
      const inventoryImportParam = searchParams.get('inventoryImport')

      if (!!inventoryImportParam) {
        try {
          const parsedParams = JSON.parse(inventoryImportParam)
          inventoryImportSearchRef.current = {}

          if (parsedParams.inventoryImportReasonId) {
            inventoryImportSearchRef.current.inventoryImportReasonId =
              parsedParams.inventoryImportReasonId
          }
          if (parsedParams.startDate) {
            inventoryImportSearchRef.current.startDate = formatToISODate(parsedParams.startDate)
          }
          if (parsedParams.endDate) {
            inventoryImportSearchRef.current.endDate = formatToISODate(parsedParams.endDate)
          }
        } finally {
          clearInventoryDepreciationInput()
        }
      }
      fetchPromises.push(fetchInventoryImport(inventoryId, 1, inventoryImportSearchRef.current))
    }

    if (canReadInventoryQuantityLogs) {
      const inventoryQuantityLogsParam = searchParams.get('inventoryQuantityLogs')

      if (!!inventoryQuantityLogsParam) {
        try {
          const parsedParams = JSON.parse(inventoryQuantityLogsParam)
          inventoryQuantityLogsSearchRef.current = {}

          if (parsedParams.details) {
            inventoryQuantityLogsSearchRef.current.details = parsedParams.details
          }
          if (parsedParams.startDate) {
            inventoryQuantityLogsSearchRef.current.startDate = formatToISODate(
              parsedParams.startDate,
            )
          }
          if (parsedParams.endDate) {
            inventoryQuantityLogsSearchRef.current.endDate = formatToISODate(parsedParams.endDate)
          }
        } finally {
          clearQuantityLogsInput()
        }
      }

      fetchPromises.push(
        fetchInventoryQuantityLogs(inventoryId, 1, inventoryQuantityLogsSearchRef.current),
      )
    }

    if (canReadInventoryLogs) {
      const inventoryLogsParam = searchParams.get('inventoryLogs')

      if (!!inventoryLogsParam) {
        try {
          const parsedParams = JSON.parse(inventoryLogsParam)
          inventoryLogsSearchRef.current = {}

          if (parsedParams.type) {
            inventoryLogsSearchRef.current.type = parsedParams.type
          }
          if (parsedParams.startDate) {
            inventoryLogsSearchRef.current.startDate = formatToISODate(parsedParams.startDate)
          }
          if (parsedParams.endDate) {
            inventoryLogsSearchRef.current.endDate = formatToISODate(parsedParams.endDate)
          }
        } finally {
          clearInventoryLogsInput()
        }
      }

      fetchPromises.push(fetchInventoryLogs(inventoryId, 1, inventoryLogsSearchRef.current))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [refetch])

  useEffect(() => {
    setDepreciationQuantityValue('')
    setDepreciationReasonValue('')
    setDepreciationDescriptionValue('')
    setDepreciationError('')
  }, [visibileModalDepreciation])

  useEffect(() => {
    setDepreciationError('')
  }, [depreciationDescriptionValue, depreciationQuantityValue, depreciationQuantityValue])

  useEffect(() => {
    setImportError('')
    setImportQuantityValue('')
    setImportReasonValue('')
    setImportDescriptionValue('')
  }, [visibileModalImport])

  useEffect(() => {
    setImportError('')
  }, [importDescriptionValue, importQuantityValue, importQuantityValue])

  useEffect(() => {
    setInventoryLogsError('')
  }, [inventoryLogsTypeValue, inventoryLogsStartDateValue, inventoryLogsEndDateValue])

  useEffect(() => {
    setInventoryImportError('')
  }, [inventoryImportReasonValue, inventoryImportStartDateValue, inventoryImportEndDateValue])

  useEffect(() => {
    setInventoryDepreciationError('')
  }, [
    inventoryDepreciationReasonValue,
    inventoryDepreciationStartDateValue,
    inventoryDepreciationEndDateValue,
  ])

  useEffect(() => {
    setInventoryQuantityLogsError('')
  }, [
    inventoryQuantityLogsDetailValue,
    inventoryQuantityLogsStartDateValue,
    inventoryQuantityLogsEndDateValue,
  ])

  function clearInventoryLogsInput() {
    setInventoryLogsTypeValue('')
    setInventoryLogsStartDateValue('')
    setInventoryLogsEndDateValue('')
  }

  function clearQuantityLogsInput() {
    setInventoryQuantityLogsDetailValue('')
    setInventoryQuantityLogsStartDateValue('')
    setInventoryQuantityLogsEndDateValue('')
  }

  function clearInventoryDepreciationInput() {
    setInventoryDepreciationReasonValue('')
    setInventoryDepreciationStartDateValue('')
    setInventoryDepreciationEndDateValue('')
  }

  function clearInventoryImportInput() {
    setInventoryImportReasonValue('')
    setInventoryImportStartDateValue('')
    setInventoryImportEndDateValue('')
  }

  function handleInventoryLogsSearch(e) {
    e.preventDefault()

    setInventoryLogsLoading(true)

    setInventoryLogsPage(1)

    const searchParams = {}

    const validReasons = typeOptions.map((option) => option.value.toString()).filter(Boolean)

    if (inventoryLogsTypeValue && validReasons.includes(inventoryLogsTypeValue)) {
      searchParams.type = inventoryLogsTypeValue
    }

    if (inventoryLogsStartDateValue) {
      searchParams.startDate = formatToISODate(inventoryLogsStartDateValue)
    }

    if (inventoryLogsEndDateValue) {
      searchParams.endDate = formatToISODate(inventoryLogsEndDateValue)
    }

    inventoryLogsSearchRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(location.search)

      newParams.set('inventoryLogs', JSON.stringify(searchParams))

      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/inventories/${inventoryId}/detail`)
    }

    fetchInventoryLogs(inventoryId, 1, inventoryLogsSearchRef.current).finally(() =>
      setInventoryLogsLoading(false),
    )
  }

  function handleInventoryImportSearch(e) {
    e.preventDefault()

    setInventoryImportLoading(true)

    setInventoryImportPage(1)

    const searchParams = {}

    const validReasons = inventoryImportReasonOptions
      .map((option) => option.value.toString())
      .filter(Boolean)

    if (inventoryImportReasonValue && validReasons.includes(inventoryImportReasonValue)) {
      searchParams.inventoryImportReasonId = inventoryImportReasonValue
    }
    if (inventoryImportStartDateValue) {
      searchParams.startDate = formatToISODate(inventoryImportStartDateValue)
    }

    if (inventoryImportEndDateValue) {
      searchParams.endDate = formatToISODate(inventoryImportEndDateValue)
    }

    inventoryImportSearchRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(location.search)

      newParams.set('inventoryImport', JSON.stringify(searchParams))

      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/inventories/${inventoryId}/detail`)
    }

    fetchInventoryImport(inventoryId, 1, inventoryImportSearchRef.current).finally(() =>
      setInventoryImportLoading(false),
    )
  }

  function handleInventoryDepreciationSearch(e) {
    e.preventDefault()

    setInventoryDepreciationLoading(true)

    setInventoryDepreciationPage(1)

    const searchParams = {}

    const validReasons = inventoryDepreciationReasonOptions
      .map((option) => option.value.toString())
      .filter(Boolean)

    if (
      inventoryDepreciationReasonValue &&
      validReasons.includes(inventoryDepreciationReasonValue)
    ) {
      searchParams.inventoryDepreciationReasonId = inventoryDepreciationReasonValue
    }
    if (inventoryDepreciationStartDateValue) {
      searchParams.startDate = formatToISODate(inventoryDepreciationStartDateValue)
    }

    if (inventoryDepreciationEndDateValue) {
      searchParams.endDate = formatToISODate(inventoryDepreciationEndDateValue)
    }

    inventoryDepreciationSearchRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(location.search)

      newParams.set('inventoryDepreciation', JSON.stringify(searchParams))

      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/inventories/${inventoryId}/detail`)
    }

    fetchInventoryDepreciation(inventoryId, 1, inventoryDepreciationSearchRef.current).finally(() =>
      setInventoryDepreciationLoading(false),
    )
  }

  function handleInventoryQuantityLogsSearch(e) {
    e.preventDefault()

    setInventoryQuantityLogsLoading(true)

    setInventoryQuantityLogsPage(1)

    const searchParams = {}

    if (inventoryQuantityLogsDetailValue) {
      searchParams.details = inventoryQuantityLogsDetailValue
    }

    if (inventoryQuantityLogsStartDateValue) {
      searchParams.startDate = formatToISODate(inventoryQuantityLogsStartDateValue)
    }

    if (inventoryQuantityLogsEndDateValue) {
      searchParams.endDate = formatToISODate(inventoryQuantityLogsEndDateValue)
    }

    inventoryQuantityLogsSearchRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(location.search)

      newParams.set('inventoryQuantityLogs', JSON.stringify(searchParams))

      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/inventories/${inventoryId}/detail`)
    }

    fetchInventoryQuantityLogs(inventoryId, 1, inventoryQuantityLogsSearchRef.current).finally(() =>
      setInventoryQuantityLogsLoading(false),
    )
  }

  const handlePageChangeInventoryLogs = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setInventoryLogsLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setInventoryLogsLoading(false))
    }
  }

  const handlePageChangeInventoryDepreciation = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= inventoryDepreciationTotalPage &&
      newPage !== inventoryDepreciationPage
    ) {
      setInventoryDepreciationPage(newPage)

      setInventoryDepreciationLoading(true)

      fetchInventoryDepreciation(
        inventoryId,
        newPage,
        inventoryDepreciationSearchRef.current,
      ).finally(() => setInventoryDepreciationLoading(false))
    }
  }

  const handlePageChangeInventoryImport = (newPage) => {
    if (newPage >= 1 && newPage <= inventoryImportTotalPage && newPage !== inventoryImportPage) {
      setInventoryImportPage(newPage)

      setInventoryImportLoading(true)

      fetchInventoryImport(inventoryId, newPage, inventoryImportSearchRef.current).finally(() =>
        setInventoryImportLoading(false),
      )
    }
  }

  const handlePageChangeInventoryQuantityLogs = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= inventoryQuantityLogsTotalPage &&
      newPage !== inventoryQuantityLogsPage
    ) {
      setInventoryQuantityLogsPage(newPage)

      setInventoryQuantityLogsLoading(true)

      fetchInventoryQuantityLogs(inventoryId, newPage).finally(() =>
        setInventoryQuantityLogsLoading(false),
      )
    }
  }

  async function fetchInventoryQuantityLogs(inventoryId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/${inventoryId}/quantity-logs`, {
        params: { page, size: 5, ...searchParams },
      })

      setInventoryQuantityLogs(response.data.data)
      setInventoryQuantityLogsTotalPage(response.data.paging.totalPage)
      setInventoryQuantityLogsPage(response.data.paging.page)

      clearQuantityLogsInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400].includes(e.response?.status)) {
        setInventoryQuantityLogsError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchInventoryLogs(inventoryId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/${inventoryId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setInventoryLogs(response.data.data)
      setInventoryLogsTotalPage(response.data.paging.totalPage)
      setInventoryLogsPage(response.data.paging.page)

      clearInventoryLogsInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setInventoryLogsError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchImportReason() {
    try {
      const response = await axiosPrivate.get(`/api/inventories/import-reasons`)

      setImportReasonOptions([
        {
          value: '',
          label: 'Pilih alasan impor',
        },
        ...response.data.data.map((res) => ({
          value: res.inventoryImportReasonId,
          label: res.reason,
        })),
      ])
      setInventoryImportReasonOptions([
        {
          value: '',
          label: 'Pilih alasan impor',
        },
        ...response.data.data.map((res) => ({
          value: res.inventoryImportReasonId,
          label: res.reason,
        })),
      ])
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchDepreciationReason() {
    try {
      const response = await axiosPrivate.get(`/api/inventories/depreciation-reasons`)

      setDepreciationReasonOptions([
        {
          value: '',
          label: 'Pilih alasan penyusutan',
        },
        ...response.data.data.map((res) => ({
          value: res.inventoryDepreciationReasonId,
          label: res.reason,
        })),
      ])
      setInventoryDepreciationReasonOptions([
        {
          value: '',
          label: 'Pilih alasan penyusutan',
        },
        ...response.data.data.map((res) => ({
          value: res.inventoryDepreciationReasonId,
          label: res.reason,
        })),
      ])
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchInventory(inventoryId) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/${inventoryId}`)

      setInventory(response.data.data)
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

  async function fetchInventoryDepreciation(inventoryId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/${inventoryId}/depreciations`, {
        params: { page, size: 5, ...searchParams },
      })

      setInventoryDepreciation(response.data.data)
      setInventoryDepreciationTotalPage(response.data.paging.totalPage)
      setInventoryDepreciationPage(response.data.paging.page)

      clearInventoryDepreciationInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400].includes(e.response?.status)) {
        setInventoryDepreciationError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchInventoryImport(inventoryId, page, searchParams = {}) {
    try {
      const response = await axiosPrivate.get(`/api/inventories/${inventoryId}/imports`, {
        params: { page, size: 5, ...searchParams },
      })

      setInventoryImport(response.data.data)
      setInventoryImportTotalPage(response.data.paging.totalPage)
      setInventoryImportPage(response.data.paging.page)

      clearInventoryImportInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if ([400].includes(e.response?.status)) {
        setInventoryImportError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function depreciationValidateForm() {
    const validReasons = depreciationReasonOptions
      .map((option) => option.value.toString())
      .filter(Boolean) // Filtering out empty value

    if (!depreciationReasonValue || !validReasons.includes(depreciationReasonValue)) {
      return 'Harap pilih alasan penyusutan.'
    }

    if (!depreciationQuantityValue || isNaN(depreciationQuantityValue)) {
      return 'Kuantitas penyusutan harus berupa angka yang valid.'
    }

    if (Number(depreciationQuantityValue) <= 0) {
      return 'Kuantitas penyusutan harus lebih besar dari 0.'
    }

    if (depreciationDescriptionValue && !DESCRIPTION_REGEX.test(depreciationDescriptionValue)) {
      return 'Deskripsi harus memiliki panjang 3-255 karakter'
    }

    return null
  }

  async function handleDepreciationSubmit(e) {
    e.preventDefault()

    const errorMessage = depreciationValidateForm()
    if (errorMessage !== null) {
      setDepreciationError(errorMessage)
    }

    try {
      setDepreciationLoading(true)

      const request = depreciationDescriptionValue
        ? {
            quantity: depreciationQuantityValue,
            description: depreciationDescriptionValue,
            inventoryDepreciationReasonId: depreciationReasonValue,
          }
        : {
            quantity: depreciationQuantityValue,
            inventoryDepreciationReasonId: depreciationReasonValue,
          }

      await axiosPrivate.post(`/api/inventories/${inventoryId}/depreciations`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Depresiasi inventaris berhasil diproses.',
        confirmButtonText: 'OK',
      })

      setVisibileModalDepreciation(false)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        setDepreciationError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setRefetch(!refetch)

      setDepreciationLoading(false)
    }
  }

  function importValidateForm() {
    const validReasons = importReasonOptions
      .map((option) => option.value.toString())
      .filter(Boolean)

    if (!importReasonValue || !validReasons.includes(importReasonValue)) {
      return 'Harap pilih alasan impor.'
    }

    if (!importQuantityValue || isNaN(importQuantityValue)) {
      return 'Kuantitas impor harus berupa angka yang valid.'
    }

    if (Number(importQuantityValue) <= 0) {
      return 'Kuantitas impor harus lebih besar dari 0.'
    }

    if (importDescriptionValue && !DESCRIPTION_REGEX.test(importDescriptionValue)) {
      return 'Deskripsi harus memiliki panjang 3-255 karakter'
    }

    return null
  }

  async function handleImportSubmit(e) {
    e.preventDefault()

    const errorMessage = importValidateForm()
    if (errorMessage !== null) {
      setImportError(errorMessage)
    }

    try {
      setImportLoading(true)

      const request = importDescriptionValue
        ? {
            quantity: importQuantityValue,
            description: importDescriptionValue,
            inventoryImportReasonId: importReasonValue,
          }
        : {
            quantity: importQuantityValue,
            inventoryImportReasonId: importReasonValue,
          }

      await axiosPrivate.post(`/api/inventories/${inventoryId}/imports`, request)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Impor inventaris berhasil diproses.',
        confirmButtonText: 'OK',
      })

      setVisibileModalImport(false)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400, 404, 409].includes(e.response?.status)) {
        setImportError(e.response.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setImportLoading(false)

      setRefetch(!refetch)
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
          <CCol md={12} xs={12} className="mb-4">
            <CCard>
              <CCardBody>
                <CCardTitle>
                  {'#' + inventory.inventoryId + ' ' + inventory.name}{' '}
                  {inventory.condition === 0 ? (
                    <CBadge color="primary">BARU</CBadge>
                  ) : inventory.condition === 1 ? (
                    <CBadge color="warning">BEKAS</CBadge>
                  ) : (
                    <span>{inventory.condition}</span> // Fallback for any other condition
                  )}
                </CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>Kuantitas: {inventory.quantity.toLocaleString()}</CListGroupItem>
              </CListGroup>
              {(canCreateInventoryImport || canCreateInventoryDepreciation) && (
                <CCardFooter>
                  {canCreateInventoryImport && (
                    <CButton
                      color="primary"
                      variant="outline"
                      className="me-2"
                      onClick={() => setVisibileModalImport(true)}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} className="me-1" />
                      {/* Add margin to the end */}
                      Stok impor
                    </CButton>
                  )}

                  {canCreateInventoryDepreciation && (
                    <CButton
                      color="warning"
                      variant="outline"
                      onClick={() => setVisibileModalDepreciation(true)}
                      aria-label="Penyusutan" // Button label for screen readers
                    >
                      <FontAwesomeIcon
                        icon={faMinusCircle}
                        className="me-1"
                        aria-hidden="true" // Hide the icon from assistive technologies
                      />
                      Penyusutan
                    </CButton>
                  )}
                </CCardFooter>
              )}
            </CCard>
          </CCol>

          {canReadInventoryDepreciations && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Data Depresiasi Inventaris</strong>
                </CCardHeader>
                <CCardBody>
                  {!!inventoryDepreciationError && (
                    <CRow className="mb-3">
                      <CCol>
                        <CAlert color="danger">{inventoryDepreciationError}</CAlert>
                      </CCol>
                    </CRow>
                  )}

                  <CForm noValidate onSubmit={handleInventoryDepreciationSearch}>
                    <CRow className="mb-4">
                      <CCol className="mb-3" md={4}>
                        <CFormSelect
                          options={inventoryDepreciationReasonOptions}
                          onChange={(e) => setInventoryDepreciationReasonValue(e.target.value)}
                          label="Alasan Impor"
                          value={inventoryDepreciationReasonValue}
                          disabled={inventoryDepreciationLoading}
                        />
                      </CCol>

                      <CCol xs={12} md={8} className="mb-3">
                        <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
                        <CDateRangePicker
                          placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                          startDate={inventoryDepreciationStartDateValue}
                          endDate={inventoryDepreciationEndDateValue}
                          disabled={inventoryDepreciationLoading}
                          onStartDateChange={(date) => setInventoryDepreciationStartDateValue(date)}
                          onEndDateChange={(date) => setInventoryDepreciationEndDateValue(date)}
                        />
                      </CCol>

                      <CCol className="d-flex align-items-center mt-2 mt-md-0" xs={12}>
                        <CLoadingButton
                          color="primary"
                          type="submit"
                          loading={inventoryDepreciationLoading}
                          disabled={inventoryDepreciationLoading}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </CLoadingButton>
                      </CCol>
                    </CRow>
                  </CForm>

                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Id Depresiasi Inventaris</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Alasan</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Deskripsi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {inventoryDepreciation.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{'#' + item.inventoryDepreciationId}</CTableDataCell>

                            <CTableDataCell>
                              {canReadInventory ? (
                                <NavLink to={`/inventories/${item.inventory.inventoryId}/detail`}>
                                  {item.inventory.name}
                                </NavLink>
                              ) : (
                                item.inventory.name
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {item.inventory.condition === 0 ? (
                                <CBadge color="primary">BARU</CBadge>
                              ) : item.inventory.condition === 1 ? (
                                <CBadge color="warning">BEKAS</CBadge>
                              ) : (
                                <span>{item.inventory.condition}</span> // Fallback for any other condition
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{item.reason}</CTableDataCell>
                            <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                            <CTableDataCell>{item.description || '-'}</CTableDataCell>
                            <CTableDataCell>
                              {moment(item.createdAt).format('MMMM D, YYYY h:mm A')}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>

                  <CSmartPagination
                    size="sm"
                    activePage={inventoryDepreciationPage}
                    pages={inventoryDepreciationTotalPage} // Set the total number of pages
                    onActivePageChange={handlePageChangeInventoryDepreciation} // Handle page change
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {canReadInventoryImports && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Data Impor Inventaris</strong>
                </CCardHeader>
                <CCardBody>
                  {!!inventoryImportError && (
                    <CRow className="mb-3">
                      <CCol>
                        <CAlert color="danger">{inventoryImportError}</CAlert>
                      </CCol>
                    </CRow>
                  )}

                  <CForm noValidate onSubmit={handleInventoryImportSearch}>
                    <CRow className="mb-4">
                      <CCol className="mb-3" md={4}>
                        <CFormSelect
                          options={inventoryImportReasonOptions}
                          onChange={(e) => setInventoryImportReasonValue(e.target.value)}
                          label="Alasan Impor"
                          value={inventoryImportReasonValue}
                          disabled={inventoryImportLoading}
                        />
                      </CCol>

                      <CCol xs={12} md={8} className="mb-3">
                        <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
                        <CDateRangePicker
                          placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                          startDate={inventoryImportStartDateValue}
                          endDate={inventoryImportEndDateValue}
                          disabled={inventoryImportLoading}
                          onStartDateChange={(date) => setInventoryImportStartDateValue(date)}
                          onEndDateChange={(date) => setInventoryImportEndDateValue(date)}
                        />
                      </CCol>

                      <CCol className="d-flex align-items-center mt-2 mt-md-0" xs={12}>
                        <CLoadingButton
                          color="primary"
                          type="submit"
                          loading={inventoryImportLoading}
                          disabled={inventoryImportLoading}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </CLoadingButton>
                      </CCol>
                    </CRow>
                  </CForm>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Id Impor Inventaris</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Alasan</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Deskripsi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {inventoryImport.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{'#' + item.inventoryImportId}</CTableDataCell>

                            <CTableDataCell>
                              {canReadInventory ? (
                                <NavLink to={`/inventories/${item.inventory.inventoryId}/detail`}>
                                  {item.inventory.name}
                                </NavLink>
                              ) : (
                                item.inventory.name
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {item.inventory.condition === 0 ? (
                                <CBadge color="primary">BARU</CBadge>
                              ) : item.inventory.condition === 1 ? (
                                <CBadge color="warning">BEKAS</CBadge>
                              ) : (
                                <span>{item.inventory.condition}</span> // Fallback for any other condition
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{item.reason}</CTableDataCell>
                            <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                            <CTableDataCell>{item.description || '-'}</CTableDataCell>
                            <CTableDataCell>
                              {moment(item.createdAt).format('MMMM D, YYYY h:mm A')}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>

                  <CSmartPagination
                    size="sm"
                    activePage={inventoryImportPage}
                    pages={inventoryImportTotalPage} // Set the total number of pages
                    onActivePageChange={handlePageChangeInventoryImport} // Handle page change
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {canReadInventoryQuantityLogs && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>Data Inventaris Kuantitas Log</strong>
                </CCardHeader>
                <CCardBody>
                  {!!inventoryQuantityLogsError && (
                    <CRow className="mb-3">
                      <CCol>
                        <CAlert color="danger">{inventoryQuantityLogsError}</CAlert>
                      </CCol>
                    </CRow>
                  )}

                  <CForm noValidate onSubmit={handleInventoryQuantityLogsSearch}>
                    <CRow className="mb-4">
                      <CCol className="mb-3" md={4}>
                        <CFormInput
                          label={'Detil Perubahaan'}
                          placeholder="Cari..."
                          onChange={(e) => setInventoryQuantityLogsDetailValue(e.target.value)}
                          disabled={inventoryQuantityLogsLoading}
                          value={inventoryQuantityLogsDetailValue}
                        />
                      </CCol>

                      <CCol xs={12} md={8} className="mb-3">
                        <CFormLabel htmlFor="starDateInput">Tanggal</CFormLabel>
                        <CDateRangePicker
                          placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
                          startDate={inventoryQuantityLogsStartDateValue}
                          endDate={inventoryQuantityLogsEndDateValue}
                          disabled={inventoryQuantityLogsLoading}
                          onStartDateChange={(date) => setInventoryQuantityLogsStartDateValue(date)}
                          onEndDateChange={(date) => setInventoryQuantityLogsEndDateValue(date)}
                        />
                      </CCol>

                      <CCol className="d-flex align-items-center mt-2 mt-md-0" xs={12}>
                        <CLoadingButton
                          color="primary"
                          type="submit"
                          loading={inventoryQuantityLogsLoading}
                          disabled={inventoryQuantityLogsLoading}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </CLoadingButton>
                      </CCol>
                    </CRow>
                  </CForm>

                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Id Kuantitas Log</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Penanggung Jawab</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas Awal</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas Baru</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kuantitas Dirubah</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Perubahaan</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Dibuat Pada</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {inventoryQuantityLogs.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{'#' + item.inventoryQuantityLog}</CTableDataCell>
                            <CTableDataCell>
                              {canReadUser ? (
                                <NavLink to={`/users/${item.user.userId}/detail`}>
                                  {item.user.username}
                                </NavLink>
                              ) : (
                                item.user.username
                              )}
                            </CTableDataCell>

                            <CTableDataCell>
                              {canReadInventory ? (
                                <NavLink to={`/inventories/${item.inventory.inventoryId}/detail`}>
                                  {item.inventory.name}
                                </NavLink>
                              ) : (
                                item.inventory.name
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {item.inventory.condition === 0 ? (
                                <CBadge color="primary">BARU</CBadge>
                              ) : item.inventory.condition === 1 ? (
                                <CBadge color="warning">BEKAS</CBadge>
                              ) : (
                                <span>{item.inventory.condition}</span> // Fallback for any other condition
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{item.oldQuantity.toLocaleString()}</CTableDataCell>
                            <CTableDataCell>{item.newQuantity.toLocaleString()}</CTableDataCell>
                            <CTableDataCell>{item.quantity.toLocaleString()}</CTableDataCell>
                            <CTableDataCell>{item.details}</CTableDataCell>
                            <CTableDataCell>
                              {moment(item.createdAt).format('MMMM D, YYYY h:mm A')}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>

                  <CSmartPagination
                    size="sm"
                    activePage={inventoryQuantityLogsPage}
                    pages={inventoryQuantityLogsTotalPage} // Set the total number of pages
                    onActivePageChange={handlePageChangeInventoryQuantityLogs} // Handle page change
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {canReadInventoryLogs && (
            <CRow>
              <CCol>
                <TableInventoryLog
                  title={'Data Log Inventaris'}
                  error={inventoryLogsError}
                  handleSearch={handleInventoryLogsSearch}
                  typeOptions={typeOptions}
                  searchTypeValue={inventoryLogsTypeValue}
                  setSearchTypeValue={setInventoryLogsTypeValue}
                  searchStartDateValue={inventoryLogsStartDateValue}
                  setSearchStartDateValue={setInventoryLogsStartDateValue}
                  searchEndDateValue={inventoryLogsEndDateValue}
                  setSearchEndDateValue={setInventoryLogsEndDateValue}
                  searchLoading={inventoryLogsLoading}
                  inventoriesLogs={inventoryLogs}
                  page={inventoryLogsPage}
                  totalPages={inventoryLogsTotalPage}
                  handlePageChange={handlePageChangeInventoryLogs}
                  authorizePermissions={authorizePermissions}
                />
              </CCol>
            </CRow>
          )}

          <CModal visible={visibileModalImport} onClose={() => setVisibileModalImport(false)}>
            <CModalHeader>
              <CModalTitle id="LiveDemoExampleLabel">Impor Stok Inventaris</CModalTitle>
            </CModalHeader>

            <CForm onSubmit={handleImportSubmit}>
              {importLoading ? (
                <div className="pt-3 text-center">
                  <CSpinner color="primary" variant="grow" />
                </div>
              ) : (
                <CModalBody>
                  {!!importError && <CAlert color="danger">{importError}</CAlert>}

                  <div className="mb-3">
                    <CFormSelect
                      options={importReasonOptions}
                      onChange={(e) => setImportReasonValue(e.target.value)}
                      label="Alasan Impor"
                      value={importReasonValue}
                      disabled={importLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      id="role"
                      label="Kuantitas Impor"
                      placeholder="Masukkan kuantitas impor"
                      value={importQuantityValue.toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.-]+/g, '')
                        const numberValue = Number(value)

                        if (!isNaN(numberValue)) {
                          setImportQuantityValue(numberValue)
                        }
                      }}
                      disabled={importLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="description">
                      Deskripsi <CBadge color="info">Optional</CBadge>
                    </CFormLabel>
                    <CFormTextarea
                      id="description"
                      rows={3}
                      placeholder="Masukkan deskripsi"
                      value={importDescriptionValue}
                      onChange={(e) => setImportDescriptionValue(e.target.value)}
                      disabled={importLoading}
                    />
                  </div>
                </CModalBody>
              )}

              <CModalFooter>
                <CLoadingButton
                  color="primary"
                  type="submit"
                  disabled={importValidateForm() !== null || importLoading}
                >
                  <FontAwesomeIcon icon={faSave} />
                </CLoadingButton>

                <CButton color="secondary" onClick={() => setVisibileModalImport(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CButton>
              </CModalFooter>
            </CForm>
          </CModal>

          <CModal
            visible={visibileModalDepreciation}
            onClose={() => setVisibileModalDepreciation(false)}
            aria-labelledby="LiveDemoExampleLabel"
          >
            <CModalHeader>
              <CModalTitle id="LiveDemoExampleLabel">Penyusutan Stok Inventaris</CModalTitle>
            </CModalHeader>

            <CForm onSubmit={handleDepreciationSubmit}>
              {depreciationLoading ? (
                <div className="pt-3 text-center">
                  <CSpinner color="primary" variant="grow" />
                </div>
              ) : (
                <CModalBody>
                  {!!depreciationError && <CAlert color="danger">{depreciationError}</CAlert>}

                  <div className="mb-3">
                    <CFormSelect
                      options={depreciationReasonOptions}
                      onChange={(e) => {
                        setDepreciationReasonValue(e.target.value)
                      }}
                      label="Alasan Penyusutan"
                      value={depreciationReasonValue}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      id="role"
                      label="Kuantitas Penyusutan"
                      placeholder="Masukkan kuantitas penyusutan"
                      value={depreciationQuantityValue.toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.-]+/g, '')
                        const numberValue = Number(value)

                        if (!isNaN(numberValue)) {
                          setDepreciationQuantityValue(numberValue)
                        }
                      }}
                      disabled={depreciationLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="description">
                      Deskripsi <CBadge color="info">Optional</CBadge>
                    </CFormLabel>
                    <CFormTextarea
                      id="description"
                      rows={3}
                      placeholder="Masukkan deskripsi"
                      value={depreciationDescriptionValue}
                      onChange={(e) => setDepreciationDescriptionValue(e.target.value)}
                      disabled={depreciationLoading}
                    />
                  </div>
                </CModalBody>
              )}

              <CModalFooter>
                <CLoadingButton
                  color="primary"
                  type="submit"
                  disabled={depreciationValidateForm() !== null || depreciationLoading}
                >
                  <FontAwesomeIcon icon={faSave} />
                </CLoadingButton>

                <CButton color="secondary" onClick={() => setVisibileModalDepreciation(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CButton>
              </CModalFooter>
            </CForm>
          </CModal>
        </CRow>
      )}
    </>
  )
}

export default DetailInventory
