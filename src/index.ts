import axios, { Axios } from 'axios';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

const IDENTITY_TOKEN = process.env.IDENTITY_TOKEN;
const AUTH_PROXY_URL = process.env.AUTH_PROXY_URL || 'http://localhost:8080';

if (IDENTITY_TOKEN == undefined) {
  throw new Error('IDENTITY_TOKEN is undefined');
}

const axiosInstance: Axios = axios.create({
  baseURL: AUTH_PROXY_URL,
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  timeout: 0,
});

logger.log('starting');

(async () => {
  runTestOnce();
  setInterval(runTestOnce, 10000);
})();

async function runTestOnce() {
  const requestId = uuidv4();
  const start: number = Date.now();

  try {
    logger.log(`[${requestId}] starting`);

    const result = await axiosInstance.post(
      'auth/login',
      {
        identityToken: IDENTITY_TOKEN,
      },
      {
        headers: {
          'x-requestid': requestId,
        },
      },
    );
    const elapsed: number = Date.now() - start;

    logger.log(`[${requestId}] [OK] ${result.status} ${elapsed}ms`);
  } catch (err) {
    const elapsed: number = Date.now() - start;

    if (axios.isAxiosError(err)) {
      if (err?.response?.status) {
        logger.log(
          `[${requestId}] [HTTP_ERROR] ${err.response.status} ${elapsed}ms`,
        );
      } else {
        logger.log(`[${requestId}] [HTTP_ERROR] ${err} ${elapsed}ms`);
      }
    } else {
      logger.log(`[${requestId}] [ERROR] ${err} ${elapsed}ms`);
    }
  }
}
