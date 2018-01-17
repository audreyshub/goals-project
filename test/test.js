'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('../config');

const should = chai.should();

const goal = require('../models/goals-model');
const { closeServer, runServer, app } = require('../server');
const TEST_DATABASE_URL = config.TEST_DATABASE_URL;

chai.use(chaiHttp);

let token;
let userId;

function tearDownDb(TEST_DATABASE_URL) {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

function seedGoalData() {
    console.info('seeding goal data');
    const goalData = [];
    for (let i = 1; i <= 10; i++) {
        goalData.push({
            name: faker.lorem.words(),
            startDate: faker.date.recent(),
            endDate: faker.date.future(),
            actions: faker.lorem.words(),
            user: mongoose.Types.ObjectId()
        });
    }
    // this will return a promise
    return goal.insertMany(goalData);
}

describe('goal API resource', function() {
    before(function() {
        console.log('running the server');
        runServer();
        seedGoalData();
        return

    });

    beforeEach(function() {
        //return seedGoalData();
    });

    afterEach(function() {
        // tear down database so we ensure no state from this test
        // effects any coming after.

    });

    after(function() {
        tearDownDb(TEST_DATABASE_URL);
        closeServer();
        return

    });

    /*it('should return 200 status code with html', function() {
        return chai.request(app)
            .get('/index.html')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.html;

            });
    });*/

    it('should register and return user', function() {
        let res;
        return chai.request(app)
            .post('/auth/register')
            .send({
                name: 'test',
                email: 'test@test.com',
                password: 'password'
            })
            .then(_res => {
                res = _res;
                res.should.have.status(200);


            })
    });

    it('should log in and return token', function() {
        let res;
        return chai.request(app)
            .post('/auth/login')
            .send({
                email: 'test@test.com',
                password: 'password'
            })
            .then(_res => {
                res = _res;
                res.should.have.status(200);

                token = res.body.data.token;
                userId = res.body.data.userId;
                console.log(userId);
            })
    });



    it('should create a goal', function() {
        let res;
        const newGoal = {
            name: 'see a panda',
            startDate: faker.date.recent(),
            endDate: faker.date.future(),
            user: userId
          };

        return chai.request(app)


            .post('/goal/create')
            .set('Authorization', token)
            .send(newGoal)
            .then(_res => {
                res = _res;
                res.should.have.status(200);

                console.log(newGoal);

            })
    });

    it('should return all existing goals', function() {
        // strategy:
        //    1. get back all posts returned by by GET request to `/posts`
        //    2. prove res has right status, data type
        //    3. prove the number of posts we got back is equal to number
        //       in db.
        let res;
        console.log('something');
        return chai.request(app)
            .get('/goal/all/' + userId)
            .set('Authorization', token)
            .then(_res => {
                res = _res;
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                console.log(res.body);
                // otherwise our db seeding didn't work
                //res.body.data.should.have.length.of.at.least(1);

                //return goal.count();

            })
        /*.then(count => {
            // the number of returned posts should be same
            // as number of posts in DB
            res.body.should.have.length.of(count);
        });*/
    });





});