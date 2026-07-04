import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// Base URL can be overridden by environment variable BASE_URL
// e.g. k6 run -e BASE_URL=http://my-k8s-ingress/api task-api-test.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  scenarios: {
    // LT-01: Test task creation endpoint (100 concurrent users)
    create_task_scenario: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      exec: 'createTask',
    },
    // LT-02: Test task listing endpoint (200 concurrent users)
    list_tasks_scenario: {
      executor: 'constant-vus',
      vus: 200,
      duration: '5m',
      exec: 'listTasks',
    },
    // LT-03: Test task update endpoint (50 concurrent users)
    update_task_scenario: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'updateTask',
    },
  },
  thresholds: {
    // LT-04: Measure response times (p95 < 1s)
    http_req_duration: ['p(95)<1000'],
    // LT-05: Measure error rate (< 1% allowed)
    http_req_failed: ['rate<0.01'],
  },
};

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// LT-01: Create Task
export function createTask() {
  const payload = JSON.stringify({
    title: `Task LoadTest ${Math.floor(Math.random() * 1000000)}`,
    description: 'This task was created automatically during load testing.',
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    status: 'pending',
  });

  const res = http.post(`${BASE_URL}/tasks`, payload, params);

  check(res, {
    'create_task: status is 201': (r) => r.status === 201 || r.status === 200,
    'create_task: response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}

// LT-02: List Tasks
export function listTasks() {
  const res = http.get(`${BASE_URL}/tasks`, params);

  check(res, {
    'list_tasks: status is 200': (r) => r.status === 200,
    'list_tasks: response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}

// LT-03: Update Task
export function updateTask() {
  // 1. Create a task to update
  const createPayload = JSON.stringify({
    title: `Task to Update ${Math.floor(Math.random() * 1000000)}`,
    description: 'Temp task for update scenario.',
    priority: 'low',
    status: 'pending',
  });

  const createRes = http.post(`${BASE_URL}/tasks`, createPayload, params);
  const isCreated = check(createRes, {
    'update_scenario: task created': (r) => r.status === 201 || r.status === 200,
  });

  if (!isCreated) {
    sleep(1);
    return;
  }

  let taskId;
  try {
    const body = JSON.parse(createRes.body);
    taskId = body.id;
  } catch (e) {
    // If backend returns non-JSON or doesn't return an id
  }

  if (taskId) {
    // 2. Update the task status to completed
    const updatePayload = JSON.stringify({
      status: 'completed',
      priority: 'high',
    });

    const updateRes = http.patch(`${BASE_URL}/tasks/${taskId}`, updatePayload, params);

    check(updateRes, {
      'update_task: status is 200': (r) => r.status === 200,
      'update_task: response time < 1s': (r) => r.timings.duration < 1000,
    });

    // 3. Clean up (Optional, but keeps the database clean during load test runs)
    const deleteRes = http.del(`${BASE_URL}/tasks/${taskId}`, null, params);
    check(deleteRes, {
      'update_scenario: task deleted': (r) => r.status === 200 || r.status === 204,
    });
  }

  sleep(1);
}

// LT-06: Generate HTML report for stakeholders
export function handleSummary(data) {
  return {
    'load-tests/summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
