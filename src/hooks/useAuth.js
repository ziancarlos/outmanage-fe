import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

export default function useAuth() {
  const {
    currentUser,
    setCurrentUser,
    persist,
    setPersist,
    authorizePermissions,
    setAuthorizePermissions,
    authLoading,
    setAuthLoading,
  } = useContext(AuthContext)

  return {
    currentUser,
    setCurrentUser,
    persist,
    setPersist,
    authorizePermissions,
    setAuthorizePermissions,
    authLoading,
    setAuthLoading,
  }
}
