/*
backend/src/types/fastify.d.ts

This file extends TypeScript definitions for Fastify and its plugins.

- **"Fastify Instance"**:
  Adds an "authenticate" method to the Fastify server instance, used for validating JWT tokens in requests.
  This method needs to be added, because Fastify does not have native functionality to verify JWT tokens.

- **"@fastify/jwt" Module**:
  Extends the "FastifyJWT" interface to include a "user" object with fields like "id", "username", and "email".
  This allows TypeScript to recognize the structure of the authenticated user's data within the application.
  Operations such as user.id, user.username, and user.email can now be used safely.

These definitions enable type safety and better developer experience when working with Fastify and JWT authentication.
*/


import { FastifyRequest } from "fastify";


declare module "fastify"
{
    interface FastifyInstance
    {
        authenticate: (request: FastifyRequest, reply: any, done: Function) => void;
    }
}


declare module "@fastify/jwt"
{
    interface FastifyJWT
    {
        user:
        {
            id: number;
            username: string;
            email: string;
            [key: string]: any;
        }
    }
}
