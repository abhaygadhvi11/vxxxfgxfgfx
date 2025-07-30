// tests/api/comments.test.js
const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('../../lib/auth');

const token = generateToken({ id: 'user-1' });

describe('/api/tasks/:id/comments', () => {
  it('should fetch comments', async () => {
    const res = await request(app)
      .get('/api/tasks/task-1/comments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('should add a comment', async () => {
    const res = await request(app)
      .post('/api/tasks/task-1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'This is a test comment' });

    expect(res.statusCode).toBe(201);
  });
});