const { ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Brand {
    title: String
    released: String
    img: String
    models: [Model]
    agencies: [Agency]
  }

  type Car {
    name: String
    price: Int
    img: String
    model: Model
    category: Category
    features: Feature
    agencies: [Agency]
  }

  type Model {
    name: String
    born: String
    cars: [Car]
    agencies: [Agency]
  }

  type Agency {
    title: String
    released: String
    models: [Model]
    agents: [Agent]
  } 

  type Agent {
    name: String
    email: String
    phone: String
    agencies: [Agency]
    cars: [Car]
  }

  type Feature {
    doors: Int
    wheels: Int
    weight: Int
    color: String
    engeine: Engeine
    fuel: Fuel
    Cars: [Car]
  }

  type Engeine{
    name: String
    power: Int
  }

  type Fuel{
    name: String
    price: Int
  }

  type Category {
    name: String
    cars: [Car]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    brands: [Brand]
  }
`;

const brands = [
    {
      title: 'Alfa Romeo',
      released: '1789',
    },
    {
      title: 'Ford',
      released: '1896',
    },
  ];

  // Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      brands: () => brands,
    },
  };
  

  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  cors: {
		origin: 'http://localhost:3000',			// <- allow request from all domains
		credentials: true}	// <- enable CORS response for requests with credentials (cookies, http authentication) 
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

