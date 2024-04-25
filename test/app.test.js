import * as chai from 'chai';
const expect = chai.expect;
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import app from '../app.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Node Map API', () => {
    it('should GET /peer-locations successfully', done => {
        chai.request(app)
            .get('/peer-locations')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});
