import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '5s', target: 5 },
  ],
  thresholds: {
    errors: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = 'https://cursotesting.com.ar:3000';

export default function () {
  const payload = JSON.stringify({
    username: 'institutoweb',
    password: 'cursoperformance',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/token`, payload, params);

  const ok = check(res, {
    'status is 500': (r) => r.status === 500,
    'token is present': (r) => JSON.parse(r.body).token !== undefined,
  });

  errorRate.add(!ok);

  sleep(1);
}
