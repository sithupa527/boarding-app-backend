import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export function signBoardingToken(payload: { boardingId: string; boardingName?: string }) {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyBoardingToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as {
            boardingId: string;
            boardingName?: string;
            iat?: number;
            exp?: number;
        };
    } catch (e) {
        return null;
    }
}

/** helper to read Authorization header "Bearer <token>" and verify */
export async function getBoardingFromReq(req: Request) {
    const auth = req.headers.get("authorization") ?? "";
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return null;
    const token = m[1];
    return verifyBoardingToken(token);
}
