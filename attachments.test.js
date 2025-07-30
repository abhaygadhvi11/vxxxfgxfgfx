// tests/api/attachments.test.js
const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { generateToken } = require('../../lib/auth');

const token = generateToken({ id: 'user-1' });

describe('/api/tasks/:id/attachments', () => {
  it('should upload a file', async () => {
    const res = await request(app)
      .post('/api/tasks/task-1/attachments')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', path.resolve(__dirname, '../fixtures/testfile.txt'));

    expect(res.statusCode).toBe(200);
  });
});