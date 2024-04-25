import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import http from 'http';

chai.use(chaiHttp);
const { expect } = chai;
let server;

describe('Node Map API', () => {
    before(done => {
        server = app.listen(3000, () => {
            console.log('Server running on port 3000');
            done();
        });
    });

    after(done => {
        server.close(done);
    });

    it('should GET /peer-locations successfully', done => {
        chai.request(server)
            .get('/peer-locations')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});
