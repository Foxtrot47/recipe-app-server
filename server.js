import Fastify from "fastify";
import mongoose from "mongoose";
import "dotenv/config";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

// Intialize connection to database
const initDb = async () => {
  await mongoose.connect(process.env.DATABSE_URL);
};
initDb().catch((err) => {
  console.log(err);
  process.exit(1);
});
const recipeSchema = new mongoose.Schema(
  { _id: "number" },
  { collection: "recipedata" }
);
const Recipe = mongoose.model("Recipe", recipeSchema);

// Declare routes
fastify.route({
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
  }
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: process.env.SERVER_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
