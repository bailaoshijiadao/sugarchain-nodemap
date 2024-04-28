import * as chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp.default || chaiHttp);
const expect = chai.expect;

import app from '../app.js';

describe('API tests', () => {
  it('should respond with HTTP status 200', async () => {
    const res = await chai.request(app).get('/peer-locations');
    expect(res).to.have.status(200);
  });
});
