require('dotenv').config({ path: '.env.test' });

const { testApiHandler } = require('next-test-api-route-handler');
const handler = require('../../pages/api/tasks/index');
const { generateToken } = require('../../lib/auth');

describe('/api/tasks', () => {
  const token = generateToken({ id: 'user-1' });

  it('should return a list of tasks', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toHaveProperty('tasks');
        expect(Array.isArray(json.tasks)).toBe(true);
      },
    });
  });
});
