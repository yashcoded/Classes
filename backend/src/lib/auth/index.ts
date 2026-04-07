export { IAuthProvider, AuthPayload } from './authProvider';
export { JwtProvider } from './jwtProvider';

import { JwtProvider } from './jwtProvider';
export const authProvider = new JwtProvider();
