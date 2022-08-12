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
    url: "/search",
    schema: {
      querystring: {
        type: "object",
        properties: {
          q: { type: "string", minLength: 1 },
        },
      },
    },
    handler: async (request) => {
      const query = {};
      let offset = 0,
        sort = [];
      query.name = new RegExp(request.query.q, "i");
      if (request.query.cuisine) query.cuisine = request.query.cuisine;
      if (request.query.keywords) query.keywords = request.query.keywords;
      if (request.query.mealtypes) query.category = request.query.mealtypes;
      if (request.query.dietType) query.diet.display = request.query.dietType;
      if (request.query.skillLevel) query.skillLevel = request.query.skillLevel;
      if (request.query.yield) {
        if (request.query.yield === "9+") query.yield = { $gt: 8 };
        else query.yield = request.query.yield;
      }
      if (request.query.totalTime) {
        if (request.query.totalTime === "lte10")
          query["time.totalTime"] = { $lte: 10 };
        else if (request.query.totalTime === "lte30")
          query["time.totalTime"] = { $lte: 30 };
        else if (request.query.totalTime === "lte60")
          query["time.totalTime"] = { $lte: 60 };
        else if (request.query.totalTime === "gt60")
          query["time.totalTime"] = { $gt: 60 }; 
      }

      if (request.query.kcal) {
        query["nutritionalInfo"] = { $elemMatch: { label: "kcal" } };
        if (request.query.kcal === "lte250")
          query["nutritionalInfo"].$elemMatch.value = { $lte: 250 };
        else if (request.query.kcal === "lte500")
          query["nutritionalInfo"].$elemMatch.value = { $lte: 500 };
        else if (request.query.kcal === "lte750")
          query["nutritionalInfo"].$elemMatch.value = { $lte: 750 };
        else if (request.query.kcal === "lte1000")
          query["nutritionalInfo"].$elemMatch.value = { $lte: 1000 };
        else if (request.query.kcal === "lte1500")
          query["nutritionalInfo"].$elemMatch.value = { $lte: 1500 };
        else if (request.query.kcal === "gt1500")
          query["nutritionalInfo"].$elemMatch.value = { $gt: 1500 };
      }

      if (request.query.rating) {
        if (request.query.rating === "gte1") query["rating.avg"] = { $gte: 1 };
        else if (request.query.rating === "gte2")
          query["rating.avg"] = { $gte: 2 };
        else if (request.query.rating === "gte3")
          query["rating.avg"] = { $gte: 3 };
        else if (request.query.rating === "gte4")
          query["rating.avg"] = { $gte: 4 };
        else if (request.query.rating === "eq5") query["rating.avg"] = 5;
      }
      if (request.query.offset) offset = request.query.offset;
      if (request.query.sortBy && request.query.sortOrder)
        sort = [[request.query.sortBy, parseInt(request.query.sortOrder)]];
      console.log(query.nutritionalInfo);
      return await Recipe.find(query, "_id name slug image rating date description", {
        limit: 20,
        skip: offset,
      }).sort(sort);
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
