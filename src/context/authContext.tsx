import { createContext, useEffect, useState, ReactNode } from 'react'
import { AuthValuesType, CallbackType, LoginParams, UserDataType } from "./types-auth";

import http from '../utils/http';
import { useRouter } from 'next/router';
import { DataRule } from "@/pages/rule"
import {DataGroupRule} from '@/pages/group/components/view'
import { DataGroup } from '@/pages/group';

const defaultProvider: AuthValuesType = {
  user: null,
  setUser: () => null,

  errorMessage: null,
  setErrorMessage: () => null,

  sucessMessage: null,
  setSucessMessage: () => null,

  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),

  rules: [],
  groupAdmin: undefined
}

const AuthContext = createContext(defaultProvider)

type Props = {
    children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserDataType | null >(defaultProvider.user)
    const [errorMessage, setErrorMessage] = useState<string | null>(defaultProvider.errorMessage)
    const [sucessMessage, setSucessMessage] = useState<string | null>(defaultProvider.sucessMessage)

    const [rules, setRules] = useState<(DataRule | undefined)[]>(defaultProvider.rules)
    const [groupAdmin, setGroupAdmin] = useState< DataGroup | undefined>(defaultProvider.groupAdmin)


    const router = useRouter()

    useEffect(() => {
      const initAuth = async (): Promise<void> => {

        const storedToken = window.localStorage.getItem('storageTokenKeyName')!
        if (storedToken) {

          const storedData =window.localStorage.getItem('userData')!
          setUser(JSON.parse(storedData))

          const userData:UserDataType =JSON.parse(storedData)
          const groups = userData.groupStaffs.flatMap(group => group.idGroup2)
  
          setGroupAdmin(groups.find(gr => gr?.isAdmin))
        
          setRules(groups?.flatMap(groupRule => groupRule?.groupRules?.flatMap(rule => rule.idRule2))) 
          /*await http
            .get(authConfig.meEndpoint, {
              headers: {
                Authorization: storedToken
              }
            })
            .then(async () => {

              const storedData =window.localStorage.getItem('userData')!
              setUser(JSON.parse(storedData))
 
            })
            .catch(() => {
              localStorage.removeItem('userData')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              setUser(null)

            })*/
        } else {
          logout()
        }
      }

      initAuth()
    }, [])

    const login = (params: LoginParams, errorCallback?: CallbackType) =>{
        http
        .post('service-user/staff/signin', params)
        .then(async res => {
          window.localStorage.setItem('storageTokenKeyName', res.data.accessToken)
          window.localStorage.setItem('storageTokenRefreshKeyName', res.data.refreshToken)
          const userData: UserDataType = res.data.user
          setUser({ ...userData })
          await window.localStorage.setItem('userData', JSON.stringify(userData))  

          const groups = userData.groupStaffs.flatMap(group => group.idGroup2)
  
          setGroupAdmin(groups.find(gr => gr?.isAdmin))
        
          setRules(groups?.flatMap(groupRule => groupRule?.groupRules?.flatMap(rule => rule.idRule2))) 
        })
        .then(() => {
         /* http
            .get(authConfig.meEndpoint, {
              headers: {
                Authorization: window.localStorage.getItem(authConfig.storageTokenKeyName)!
              }
            })
            .then(async response => {
              const returnUrl = router.query.returnUrl
  
              const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
  
              router.replace(redirectURL as string)
            })*/

            const returnUrl = router.query.returnUrl
  
            const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

            router.replace(redirectURL as string)
        })
        .catch(err => {
          if (errorCallback) errorCallback()
        })
    }

    const logout = () =>{
      setUser(null)
      window.localStorage.removeItem('userData')
      window.localStorage.removeItem('storageTokenKeyName')
      window.localStorage.removeItem('storageTokenRefreshKeyName')
      router.replace('/login')
    }

    const values = {
      user,
      setUser,
      errorMessage,
      setErrorMessage,
      sucessMessage,
      setSucessMessage,
      login: login,
      logout: logout,
      rules: rules,
      groupAdmin: groupAdmin,
    }
  
    return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
  }
  
  export { AuthContext, AuthProvider }