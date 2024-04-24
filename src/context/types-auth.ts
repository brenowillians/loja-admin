import {DataGroupStaff} from '../pages/group/components/view'
import { DataRule } from "@/pages/rule"
import { DataGroup } from '@/pages/group';

export type CallbackType = () => void

export type AuthValuesType ={
    login: (params: LoginParams, errorCallback?: CallbackType) => void
    logout: () => void
    
    user: UserDataType | null
    setUser: (value: UserDataType | null) => void

    errorMessage: string | null
    setErrorMessage: (value: string | null) => void

    sucessMessage: string | null
    setSucessMessage: (value: string | null) => void

    rules:(DataRule | undefined)[]

    groupAdmin: DataGroup | undefined
}

export type LoginParams = {
    login: string
    password: string
}

export type UserDataType = {

    idStaff: number
    name: string
    login: string
    active: boolean
    locked: boolean
    sector: string
    role: string
    id_number: string
    cpf: string
    ctps: string
    phone: string
    mobile: string
    groupStaffs: DataGroupStaff[];
}