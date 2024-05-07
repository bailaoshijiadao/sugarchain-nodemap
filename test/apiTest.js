const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp.default || chaiHttp);
const expect = chai.expect;

const app = require('../app.js');

describe('API tests', () => {
  it('should respond with HTTP status 200', async () => {
    const res = await chai.request(app).get('/peer-locations');
    expect(res).to.have.status(200);
  });
});
