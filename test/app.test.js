import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';

chai.use(chaiHttp);
const { expect } = chai; // chaiからexpectを抽出

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
