const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Node Map API', () => {
    it('should GET /peer-locations successfully', (done) => {
        chai.request(app)
            .get('/peer-locations')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});
