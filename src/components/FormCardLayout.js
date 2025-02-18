import {
  CAlert,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CLoadingButton,
} from '@coreui/react-pro'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function FormCardLayout({
  title = 'Tambah',
  handleSubmit = null,
  error,
  loading,
  isFormValid,
  children,
  ...props
}) {
  return (
    <CCol {...props}>
      <CCard>
        <CCardHeader>
          <strong>{title}</strong>
        </CCardHeader>
        <CForm onSubmit={handleSubmit}>
          <CCardBody>
            {!!error && <CAlert color="danger">{error}</CAlert>}

            {children}
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
  )
}
