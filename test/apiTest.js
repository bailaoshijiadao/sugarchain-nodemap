const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Node Map API Tests', () => {
    describe('GET /peer-locations', () => {
        it('should return all peer locations with a status of 200', (done) => {
            chai.request(app)
                .get('/peer-locations')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });
});
