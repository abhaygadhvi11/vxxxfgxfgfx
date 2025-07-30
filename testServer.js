import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import supertest from 'supertest';

export function testApiHandler(handler) {
  return supertest(
    createServer((req, res) => {
      return apiResolver(req, res, undefined, handler, {}, () => {}, () => {});
    })
  );
}