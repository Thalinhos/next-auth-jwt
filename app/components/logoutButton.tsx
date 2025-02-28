'use client'

import { useRouter } from "next/navigation"
export default function LogoutButton(){

    const router = useRouter()

    const logout = () => {
        router.push('/api/logout')
    }

    return (
        <>
            <button onClick={logout}>Logout</button>
        </>
    )
}