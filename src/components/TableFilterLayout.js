import { CCol, CForm, CLoadingButton, CRow } from '@coreui/react-pro'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function TableFilterLayout({ handleSearch, loading, children }) {
  return (
    <CForm onSubmit={handleSearch} noValidate>
      <CRow className="mb-3">
        {children}

        <CCol md={4} xs={12} className="d-flex align-items-center mt-2 mt-md-0">
          <CLoadingButton color="light" type="submit" loading={loading} disabled={loading}>
            <FontAwesomeIcon icon={faSearch} className="me-2" />
            Saring
          </CLoadingButton>
        </CCol>
      </CRow>
    </CForm>
  )
}
