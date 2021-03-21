require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
const Movie = require('./models/Movie');
const MovieCast = require('./models/MovieCast');
const _ = require('lodash');
const BrandCar = require('./models/BrandCar');
const DetailCarBrand = require('./models/DetailCarBrand');

const neo4j = window.neo4j;
const neo4jUri = process.env.NEO4J_URI;
const neo4jVersion = process.env.NEO4J_VERSION;
let database = process.env.NEO4J_DATABASE;
if (!neo4jVersion.startsWith("4")) {
  database = null;
}
const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

console.log(`Database running at ${neo4jUri}`)

function searchMovies(queryString) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run('MATCH (b:Brand) \
      WHERE toLower(b.title) CONTAINS toLower($queryString) \
      WITH {name: b.title, publish: b.released, type:"Brand", price:"", image: b.img} AS brandCar \
      RETURN brandCar \
      UNION ALL \
      MATCH (c:Car) \
      WHERE toLower(c.name) CONTAINS toLower($queryString) \
      WITH {name: c.name, publish: c.born, type:"Car", price:c.price, image: c.img} AS brandCar \
      RETURN brandCar',
      {queryString})
    )
    .then(result => {
      return result.records.map(record => {
        return new BrandCar(record.get('brandCar'));
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getMovie(title) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run('MATCH (b:Brand {title:$title}) OPTIONAL MATCH (b)<-[r]-(c:Car) \
      OPTIONAL MATCH (b)<-[r1]-(a:Agency) \
      RETURN b.title AS name, b.img as Image, \
      collect(DISTINCT {name:c.name, image:c.img }) AS cars, \
      [] AS agents, \
      [] AS types,  \
      collect(DISTINCT {name:a.title }) AS agencys,  \
      true AS type \
      LIMIT 1  \
      Union all  \
      MATCH (c:Car {name:$title}) OPTIONAL MATCH (c)<-[r]-(p:Person) \
      OPTIONAL MATCH (b)<-[r1]-(a:Agency) \
      OPTIONAL MATCH (c)<-[r2]-(t:Type) \
      RETURN c.name AS name, c.img as Image, \
      [] as cars, \
      collect(DISTINCT {name:p.name, email: p.email, phone:p.phone }) AS agents, \
      collect(DISTINCT {name:t.title, doors: t.doors }) AS types, \
      collect(DISTINCT {name:a.title }) AS agencys,  \
      false AS type \
      LIMIT 1', {title}))
    .then(result => {
      if (_.isEmpty(result.records))
        return null;
      const record = result.records[0];
      return new DetailCarBrand(record._fields);
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getGraph() {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
    tx.run('MATCH (p:Car)-[:BUILT_BY]->(a:Brand) \
    RETURN p.name AS movie, collect(a.title) AS cast \
    LIMIT $limit', {limit: neo4j.int(100)}))
    .then(results => {
      const nodes = [], rels = [];
      let i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('movie'), label: 'movie'});
        const target = i;
        i++;

        res.get('cast').forEach(name => {
          const actor = {title: name, label: 'actor'};
          let source = _.findIndex(nodes, actor);
          if (source === -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;

