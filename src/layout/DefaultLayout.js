import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { Route, Routes } from 'react-router-dom'
import PersistLogin from '../middlewares/PersistLogin'
import Authenticate from '../middlewares/Authenticate'
import AuthorizePermissions from '../middlewares/AuthorizePermissions'

const DefaultLayout = () => {
  return (
    <Routes>
      <Route element={<PersistLogin />}>
        <Route element={<Authenticate />}>
          <Route element={<AuthorizePermissions />}>
            <Route
              path="*"
              element={
                <div>
                  <AppSidebar />
                  <div className="wrapper d-flex flex-column min-vh-100">
                    <AppHeader />
                    <div className="body flex-grow-1">
                      <AppContent />
                    </div>
                    <AppFooter />
                  </div>
                </div>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default DefaultLayout
