import React from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { loginSmartHosp } from '../api/Auth'
import { toast } from 'react-toastify'
// import { listHospital } from '../api/Report'

const globalStore = (set, get) => ({
    user: null,
    token: null,
    logout: () => {
        set({
            user: null,
            token: null,
        })
    },
    actionLogin: async (values) => {
        try {
            const res = await loginSmartHosp(values)
            set({
                user: res.data.payload.user,
                token: res.data.token
            })
        } catch (err) {
            console.log(err.response.data)
            toast.warning(err.response.data.message)
        }
    },
})

const usePersist = {
    name: 'global-store',
    storage: createJSONStorage(() => localStorage)
}

const useGlobalStore = create(persist(globalStore, usePersist))

export default useGlobalStore