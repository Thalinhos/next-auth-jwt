import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'


export async function GET(req: NextRequest){

  const cookieStore = await cookies()

  cookieStore.set({
    name: 'token',            
    value: '',            
    expires: new Date(0),  
    path: '/',           
  })

  redirect('/');
}

