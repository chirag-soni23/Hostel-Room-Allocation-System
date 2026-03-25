import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],

    tags: [
      { name: "User", description: "User APIs" },
      { name: "Room", description: "Room APIs" },
      { name: "Hostel", description: "Hostel APIs" },
      { name: "Contact", description: "Contact APIs" },
      { name: "Payment", description: "Payment APIs" },
      { name: "Booking", description: "Booking APIs" },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: [path.join(__dirname, "../routes/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
