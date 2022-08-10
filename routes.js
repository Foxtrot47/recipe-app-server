import Recipe from "./db.js";

// Declare routes
const routes = async (server) => {
  server.route({
    method: "GET",
    url: "/recipebyid",
    schema: {
      querystring: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "number", minimum: 1 },
        },
      },
    },
    handler: async (request, response) => {
      const result = await Recipe.findById(request.query.id).exec();
      if (!result || result.length < 1) {
        response.code(404).send("Invalid id");
      }
      return result;
    },
  });

  server.route({
    method: "GET",
    url: "/recipebyslug",
    schema: {
      querystring: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", minLength: 1 },
        },
      },
    },
    handler: async (request, response) => {
      const result = await Recipe.find(
        {
          slug: request.query.slug,
        },
        null,
        {
          limit: 1,
        }
      ).exec();
      if (!result || result.length < 1) {
        response.code(404).send("Invalid slug");
      }
      return result;
    },
  });

  server.route({
    method: "GET",
    url: "/random",
    schema: {
      querystring: {
        type: "object",
        required: ["limit"],
        properties: {
          limit: { type: "number", minimum: 1 },
        },
      },
    },
    handler: async (request) => {
      let recipes = [];
      const count = await Recipe.estimatedDocumentCount().exec();
      for (let i = 0; i < request.query.limit; i++) {
        let random = Math.floor(Math.random() * count);
        recipes.push(await Recipe.findOne().skip(random).exec());
      }
      return recipes;
    },
  });

  server.route({
    method: "GET",
    url: "/autocomplete",
    schema: {
      querystring: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string", minLength: 1 },
        },
      },
    },
    handler: async (request) => {
      const regex = new RegExp(request.query.q, "i");
      return await Recipe.find(
        {
          name: regex,
        },
        "_id name slug image rating",
        {
          limit: 5,
        }
      ).exec();
    },
  });
};

export default routes;
