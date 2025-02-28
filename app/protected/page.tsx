import { getSession } from "@/utils/session"
import LogoutButton from "../components/logoutButton"

export default async function Protected() {

    const userSession = await getSession()

    return (
        <>
            <p>protected pageee</p>
            <p>fala {userSession?.email} safado</p>
            <LogoutButton/>
            
        </>
    )
}