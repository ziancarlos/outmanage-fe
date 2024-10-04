// import React, { Suspense } from 'react'
// import { Navigate, Route, Routes } from 'react-router-dom'
// import { CContainer, CSpinner } from '@coreui/react-pro'

// // routes config
// import routes from '../routes'
// import AppBreadcrumb from './AppBreadcrumb'

// const AppContent = () => {
//   return (
//     <CContainer lg className="px-4">
//       <AppBreadcrumb />
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {routes.map((route, idx) => {
//             return (
//               route.element && (
//                 <Route
//                   key={idx}
//                   path={route.path}
//                   exact={route.exact}
//                   name={route.name}
//                   element={<route.element />}
//                 />
//               )
//             )
//           })}
//           <Route path="/" element={<Navigate to="dashboard" replace />} />
//         </Routes>
//       </Suspense>
//     </CContainer>
//   )
// }

// export default React.memo(AppContent)

// import React, { Suspense } from 'react'
// import { Navigate, Route, Routes } from 'react-router-dom'
// import { CContainer, CSpinner } from '@coreui/react'

// // routes config
// import routes from '../routes'

// const AppContent = () => {
//   return (
//     <CContainer className="px-4" fluid>
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {routes.map((route, idx) => {
//             return (
//               route.element && (
//                 <Route
//                   key={idx}
//                   path={route.path}
//                   exact={route.exact}
//                   name={route.name}
//                   element={<route.element />}
//                 />
//               )
//             )
//           })}
//           <Route path="/" element={<Navigate to="dashboard" replace />} />
//         </Routes>
//       </Suspense>
//     </CContainer>
//   )
// }

// export default React.memo(AppContent)

import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react-pro'
import routes from '../routes'
import PrivateRoute from '../middlewares/PrivateRoute'

const AppContent = () => {
  return (
    <CContainer className="px-4" fluid>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            if (route.permissions) {
              return (
                <Route key={idx} element={<PrivateRoute permissions={route.permissions} />}>
                  <Route
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                </Route>
              )
            }

            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
