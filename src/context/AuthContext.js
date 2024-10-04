import { createContext, useState } from 'react'
import React from 'react'

const AuthContext = createContext({})

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({})
  const [authorizePermissions, setAuthorizePermissions] = useState([])
  const [persist, setPersist] = useState(JSON.parse(localStorage.getItem('persist')) || false)
  const [authLoading, setAuthLoading] = useState(true)

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        persist,
        setPersist,
        authorizePermissions,
        setAuthorizePermissions,
        authLoading,
        setAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
