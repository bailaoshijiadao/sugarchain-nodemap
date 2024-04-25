async function setupChai() {
  const chai = await import('chai');
  const chaiHttp = await import('chai-http');
  chai.default.use(chaiHttp.default);
  return chai;
}

describe('Node Map API', function () {
  let chai;
  let expect;

  before(async function () {
    chai = await setupChai();
    expect = chai.default.expect;
  });

  it('should GET /peer-locations successfully', function (done) {
    chai.default.request(require('../app'))
      .get('/peer-locations')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
async function setupChai() {
  const chaiModule = await import('chai');
  const chaiHttpModule = await import('chai-http');
  const chai = chaiModule.default;
  const chaiHttp = chaiHttpModule.default;
  
  chai.use(chaiHttp);
  return chai;
}

describe('Node Map API', function () {
  let chai;
  let expect;

  before(async function () {
    chai = await setupChai();
    expect = chai.expect;
  });

  it('should GET /peer-locations successfully', function (done) {
    chai.request(app)
      .get('/peer-locations')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
