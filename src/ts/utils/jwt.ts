import * as jose from 'jose';

const secret = new TextEncoder().encode(
    'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2',
  )
const alg = 'HS256';

export async function createToken(payload: any): Promise<string> {
    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
    return jwt;
}

export async function verifyToken(token: string): Promise<any> {
    try {
        const { payload } = await jose.jwtVerify(token, secret);
        return payload;
    } 
    catch (error) {
        throw new Error('Invalid token');
    }
} 