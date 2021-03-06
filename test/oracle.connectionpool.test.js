process.env.NODE_ENV = 'test';
require('should');

var async = require('async');

var DataSource = require('loopback-datasource-juggler').DataSource;
var db, config;

before(function () {
  config = require('rc')('loopback', {dev: {oracle: {}}}).dev.oracle;
});

describe('Oracle connector', function () {
  it('should create connection pool', function (done) {
    db = new DataSource(require('../'), config);
    db.connect(function () {
      var info = db.connector.pool.getInfo();
      info.should.have.property('openConnections', 1);
      info.should.have.property('busyConnections', 0);
      info.should.have.property('maxConnections', 10);
      info.should.have.property('minConnections', 1);
      info.should.have.property('incrConnections', 1);
      info.should.have.property('busyOption', 0);
      info.should.have.property('timeout', 10);
      db.disconnect();
      done();
    });
  });

  it('should create connection pool', function (done) {
    config.minConn = 2;
    config.maxConn = 4;
    config.incrConn = 2;
    config.timeout = 5;
    db = new DataSource(require('../'), config);
    db.connect(function () {
      var info = db.connector.pool.getInfo();
      info.should.have.property('openConnections', 2);
      info.should.have.property('busyConnections', 0);
      info.should.have.property('maxConnections', 4);
      info.should.have.property('minConnections', 2);
      info.should.have.property('incrConnections', 2);
      info.should.have.property('busyOption', 0);
      info.should.have.property('timeout', 5);

      var tasks = [];
      for (var i = 0; i < 3; i++) {
        tasks.push(db.connector.pool.getConnection.bind(db.connector.pool));
      }
      async.parallel(tasks, function (err, connections) {
        connections.should.have.property('length', 3);
        // var info = db.connector.pool.getInfo();
        // console.log(info);
        done();
      });
      /*
       db.connector.pool.getConnection(function (err, connection1) {
       var info = db.connector.pool.getInfo();
       info.should.have.property('openConnections', 1);
       info.should.have.property('busyConnections', 1);
       db.connector.pool.getConnection(function (err, connection2) {
       var info = db.connector.pool.getInfo();
       // console.log(info);
       info.should.have.property('openConnections', 2);
       info.should.have.property('busyConnections', 2);
       connection1.close();
       info = db.connector.pool.getInfo();
       info.should.have.property('busyConnections', 1);
       // console.log(info);
       connection2.close();
       info = db.connector.pool.getInfo();
       // console.log(info);
       info.should.have.property('busyConnections', 0);
       done();
       });
       });
       */
    });
  });
});
