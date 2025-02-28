import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';


export const generateToken = (userId: number, role: string) => {
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime("15min")
    .sign(secretKey);
};

export const verifyToken = async (token: string) => {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
};