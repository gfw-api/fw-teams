const logger = require('logger');
const assert = require('assert');
const request = require('superagent').agent();
const nock = require('nock');

require('should');
let instance = null;
let BASE_URL = null;

const dataset = {
    data: {
        id: '00c47f6d-13e6-4a45-8690-897bdaa2c723',
        attributes: {
            connectorUrl: 'https://wri-01.carto.com/tables/wdpa_protected_areas/table',
            table_name: 'wdpa_protected_areas'
        }
    }
};

const fields = [{
    field1: {
        type: 'number'
    },
    the_geom: {
        type: 'geometry'
    }
}];

describe('E2E test', () => {
    before(() => {
        const app = require('app');
        BASE_URL = `http://localhost:${app.address().port}`;

        nock(`https://wri-01.carto.com`)
            .get(encodeURI(`/api/v2/sql?q=select * from ${dataset.data.attributes.table_name} limit 0`))
            .reply(200, {
                rows: [],
                fields
            });
        nock(`${process.env.CT_URL}`)
            .get(encodeURI(`/convert/sql2SQL?sql=update table`))
            .reply(400, {
                status: 400,
                detail: 'Malformed query'
            });
    });

    it('Get fields correctly', async() => {
        let response = null;
        try {
            response = await request.post(`${BASE_URL}/api/v1/carto/fields/${dataset.data.id}`).send({
                dataset,
                loggedUser: null
            });
        } catch (e) {
            logger.error(e);
            assert(false, 'Exception throwed');
        }
        response.status.should.equal(200);
        response.body.should.have.property('tableName');
        response.body.tableName.should.equal(dataset.data.attributes.table_name);
        response.body.should.have.property('fields');
        response.body.fields.should.deepEqual(fields);
    });

    it('Do query with query invalid', async() => {
        let response = null;
        try {
            response = await request.post(`${BASE_URL}/api/v1/carto/query/${dataset.data.id}?sql=update table`).send({
                dataset,
                loggedUser: null
            });
            assert(false, 'Exception NOT throwed');
        } catch (e) {
            e.status.should.equal(400);
            e.response.body.should.have.property('status');
            e.response.body.status.should.equal(400);
            e.response.body.should.have.property('detail');
            e.response.body.detail.should.equal('Malformed query');
        }

    });

    after(() => {
        if (instance) {
            instance.close();
        }
    });
});
