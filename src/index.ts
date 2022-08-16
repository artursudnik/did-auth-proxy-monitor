import axios, { Axios } from 'axios';
import { logger } from './logger';

const IDENTITY_TOKEN = process.env.IDENTITY_TOKEN;

if (IDENTITY_TOKEN == undefined) {
  throw new Error('IDENTITY_TOKEN is undefined');
}

const axiosInstance: Axios = axios.create({
  baseURL: 'http://localhost:8080',
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
  const start: number = Date.now();

  try {
    const result = await axiosInstance.post('auth/login', {
      identityToken: IDENTITY_TOKEN,
    });
    const elapsed: number = Date.now() - start;

    logger.log(`[OK] ${result.status} ${elapsed}ms`);
  } catch (err) {
    const elapsed: number = Date.now() - start;

    if (axios.isAxiosError(err)) {
      if (err?.response?.status) {
        logger.log(`[HTTP_ERROR] ${err.response.status} ${elapsed}ms`);
      } else {
        logger.log(`[HTTP_ERROR] ${err} ${elapsed}ms`);
      }
    } else {
      logger.log(`[ERROR] ${err} ${elapsed}ms`);
    }
  }
}
