import jwtDecode from 'jwt-decode';
import { DecodedPayload } from '../models/DecodedPayload';

export function DecodeToken(token: string): DecodedPayload {
  const result = jwtDecode<DecodedPayload>(token);
  return result;
}

export function isTokenExpired(payload: DecodedPayload): boolean {
  const expirationTimeMilli = payload.exp * 1000;
  return Date.now() > expirationTimeMilli;
}
