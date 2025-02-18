// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './utils/JWT';

export async function middleware(request: NextRequest) {
  
  const token = request.cookies.get('token');
  if(!token){
    console.log('sem token')
    return NextResponse.rewrite(new URL('/', request.url))
  }

  const decodedToken = await verifyToken(token.value);
  if(!decodedToken){
    console.log("sem token decodificado")
    return NextResponse.rewrite(new URL('/', request.url))
  }

  if(decodedToken && decodedToken.role === 'ADMIN'){
    return NextResponse.rewrite(new URL('/protected', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/protected') && decodedToken.role !== "ADMIN") {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)','/protected/', 
    ],
  }

