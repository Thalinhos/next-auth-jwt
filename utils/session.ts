import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession(){
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    let decodedToken;
    if (token !== null) {
        try {
            const secretKey = process.env.JWT_SECRET; 
            if (!secretKey) {
                throw new Error('Secret key is missing');
            }

            decodedToken = await jwtVerify(token.value, new TextEncoder().encode(secretKey));
            console.log(decodedToken.payload.userId);
        } catch (error) {
            console.error('Token verification failed', error);
        }
    }

    const user = await prisma.user.findUnique({where: {id: decodedToken.payload.userId }, select: {email: true, role: true}});
    return user
}
