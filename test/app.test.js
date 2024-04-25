const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js').default;

chai.use(chaiHttp);
const { expect } = chai;

describe('Node Map API', () => {
    before(async function() {
    });

    after(async function() {
    });

    it('should GET /peer-locations successfully', done => {
        chai.request(app)
            .get('/peer-locations')
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                expect(res).to.have.status(200);
                done();
            });
    });
});
