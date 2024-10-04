// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import PropTypes from 'prop-types'

// import SimpleBar from 'simplebar-react'
// import 'simplebar-react/dist/simplebar.min.css'

// import { CBadge, CNavLink, CSidebarNav } from '@coreui/react-pro'

// export const AppSidebarNav = ({ items }) => {
//   const navLink = (name, icon, badge, indent = false) => {
//     return (
//       <>
//         {icon
//           ? icon
//           : indent && (
//               <span className="nav-icon">
//                 <span className="nav-icon-bullet"></span>
//               </span>
//             )}
//         {name && name}
//         {badge && (
//           <CBadge color={badge.color} className="ms-auto">
//             {badge.text}
//           </CBadge>
//         )}
//       </>
//     )
//   }

//   const navItem = (item, index, indent = false) => {
//     const { component, name, badge, icon, ...rest } = item
//     const Component = component
//     return (
//       <Component as="div" key={index}>
//         {rest.to || rest.href ? (
//           <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
//             {navLink(name, icon, badge, indent)}
//           </CNavLink>
//         ) : (
//           navLink(name, icon, badge, indent)
//         )}
//       </Component>
//     )
//   }

//   const navGroup = (item, index) => {
//     const { component, name, icon, items, to, ...rest } = item
//     const Component = component
//     return (
//       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
//         {item.items?.map((item, index) =>
//           item.items ? navGroup(item, index) : navItem(item, index, true),
//         )}
//       </Component>
//     )
//   }

//   return (
//     <CSidebarNav as={SimpleBar}>
//       {items &&
//         items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
//     </CSidebarNav>
//   )
// }

// AppSidebarNav.propTypes = {
//   items: PropTypes.arrayOf(PropTypes.any).isRequired,
// }

// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import PropTypes from 'prop-types'

// import SimpleBar from 'simplebar-react'
// import 'simplebar-react/dist/simplebar.min.css'

// import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
// import useAuth from '../hooks/useAuth'

// export const AppSidebarNav = ({ items }) => {
//   const { currentUser, authorizePermissions } = useAuth()

//   const hasPermission = (requiredPermissions) => {
//     // If no permissions are required, allow access
//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return true
//     }

//     // Check if the current user has all the required permissions
//     const authorizedPermissionNames = authorizePermissions.map((permission) => permission.name)
//     return requiredPermissions.every((permissionName) =>
//       authorizedPermissionNames.includes(permissionName),
//     )
//   }

//   const navLink = (name, icon, badge, indent = false) => {
//     return (
//       <>
//         {icon
//           ? icon
//           : indent && (
//               <span className="nav-icon">
//                 <span className="nav-icon-bullet"></span>
//               </span>
//             )}
//         {name && name}
//         {badge && (
//           <CBadge color={badge.color} className="ms-auto">
//             {badge.text}
//           </CBadge>
//         )}
//       </>
//     )
//   }

//   const navItem = (item, index, indent = false) => {
//     const { component, name, badge, icon, permissions, ...rest } = item
//     const Component = component

//     // Check permissions before rendering
//     if (!hasPermission(permissions)) {
//       return null
//     }

//     return (
//       <Component as="div" key={index}>
//         {rest.to || rest.href ? (
//           <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
//             {navLink(name, icon, badge, indent)}
//           </CNavLink>
//         ) : (
//           navLink(name, icon, badge, indent)
//         )}
//       </Component>
//     )
//   }

//   const navGroup = (item, index) => {
//     const { component, name, icon, items, to, permissions, ...rest } = item
//     const Component = component

//     // Check permissions before rendering
//     if (!hasPermission(permissions)) {
//       return null
//     }

//     return (
//       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
//         {item.items?.map((item, index) =>
//           item.items ? navGroup(item, index) : navItem(item, index, true),
//         )}
//       </Component>
//     )
//   }

//   return (
//     <CSidebarNav as={SimpleBar}>
//       {items &&
//         items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
//     </CSidebarNav>
//   )
// }

// AppSidebarNav.propTypes = {
//   items: PropTypes.arrayOf(PropTypes.any).isRequired,
// }

import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react-pro'
import useAuth from '../hooks/useAuth'

export const AppSidebarNav = ({ items }) => {
  const { authorizePermissions } = useAuth()

  // Check if the user has at least one of the required permissions
  const hasAnyPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }
    const authorizedPermissionNames = authorizePermissions.map((permission) => permission.name)
    return requiredPermissions.some((permissionName) =>
      authorizedPermissionNames.includes(permissionName),
    )
  }

  // Check if the user has all of the required permissions
  const hasAllPermissions = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }
    const authorizedPermissionNames = authorizePermissions.map((permission) => permission.name)
    return requiredPermissions.every((permissionName) =>
      authorizedPermissionNames.includes(permissionName),
    )
  }

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, permissions, ...rest } = item
    const Component = component

    // Check permissions before rendering (requires all permissions)
    if (!hasAllPermissions(permissions)) {
      return null
    }

    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, permissions, ...rest } = item
    const Component = component

    // Check permissions before rendering the group (requires at least one permission)
    if (!hasAnyPermission(permissions)) {
      return null
    }

    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {item.items?.map((subItem, subIndex) =>
          subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
