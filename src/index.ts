import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
// Import routes
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import morganMiddleware from '@middlewares/morgan-middleware';
import indexRouter from '@routes/index-router';
import apiV2Routes from '@routes/v2';
import { errorHandler } from '@middlewares/error-middleware';
import { authenticateJWT } from '@middlewares/auth-middleware';
import { env } from '@libs/configs';
import { contextMiddleware } from '@middlewares/context-middleware';

const app = express();
app.use(contextMiddleware);

const port = env.APP_PORT;

// Add JSON middleware to parse incoming requests
app.use(express.json());
// Use Helmet to secure Express app by setting various HTTP headers
app.use(helmet());
// Enable CORS with various options
app.use(cors());
// Use Morgan middleware for logging requests
app.use(morganMiddleware);
// Use routes
app.use('/', indexRouter);
app.use('/api/v2', authenticateJWT, apiV2Routes);

const swaggerDocs = YAML.load('./docs/swagger.yaml');
// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(errorHandler);

// Start the server and export the server instance
const server = app.listen(port, () => {
  if (env.NODE_ENV === 'development') {
    console.log(`Server is running on http://localhost:${port}`);
  } else {
    console.log(`Server is running on ${env.BASE_URL}`);
  }
});

// Export both the app and the server for testing later
export { app, server };
