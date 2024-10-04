import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import { cilSettings, cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import useLogout from '../../hooks/useLogout'
import { NavLink, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const AppHeaderDropdown = () => {
  const logout = useLogout()
  const navigate = useNavigate()

  async function signOut() {
    await logout().finally(() => {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil Logout.',
        confirmButtonText: 'OK',
      })

      navigate('/login')
    })
  }

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0" caret={false}>
        <CAvatar src={avatar8} size="md" status="success" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
          Account
        </CDropdownHeader>
        <CDropdownItem as={NavLink} to="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem as={NavLink} to="/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem href="#" onClick={signOut}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
