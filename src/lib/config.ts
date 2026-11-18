/** URL backend NestJS. Dipakai oleh browser, route handler, dan proxy. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://school-rent.vercel.app';

/** Cookie HttpOnly yang dibaca proxy untuk memeriksa sesi di server. */
export const SESSION_COOKIE = 'schoolrent_session';
