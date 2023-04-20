import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import { inject } from '@vercel/analytics';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});
await fastify.register(cors).register(import("./routes.js"));

inject();

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
