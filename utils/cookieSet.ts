'use server'

import { cookies } from "next/headers"

export async function cookieSet(data: string) {
  const cookieStore = await cookies()
 
  cookieStore.set({
    name: 'token',
    value: data,
    httpOnly: true,
    path: '/',
  })
}
