import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fjwt, { JWT } from "fastify-jwt";
import swagger from "fastify-swagger";
import { withRefResolver } from "fastify-zod";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import { version } from "../package.json";
import keycloak, { KeycloakOptions } from "fastify-keycloak-adapter";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

function buildServer() {
  const server = Fastify();
  const opts: KeycloakOptions = {
    appOrigin: "http://localhost:3000",
    keycloakSubdomain: "localhost:8081/auth/realms/auth-keycloak",
    clientId: "auth-keycloak",
    clientSecret: "AYTTCEhd9ybqZQhmfFTPuXXEkPh32FGJ",
    useHttps: false,
    // logoutEndpoint: "/logout",
  };
  server.register(keycloak, opts);

  server.get("/healthcheck", async function () {
    return { status: "OK" };
  });

  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(
    swagger,
    withRefResolver({
      routePrefix: "/docs",
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: "Fastify API",
          description: "API for some products",
          version,
        },
      },
    })
  );

  server.get("/users/me", async (request, reply) => {
    const user = request.session.user;
    return reply.status(200).send({ user });
  });

  // server.register(userRoutes, { prefix: "api/users" });
  // server.register(productRoutes, { prefix: "api/products" });

  return server;
}

export default buildServer;
function next(err?: Error | undefined): void {
  throw new Error("Function not implemented.");
}
