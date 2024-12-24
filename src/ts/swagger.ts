import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the OpenAPI specification
const swaggerDocument = YAML.load(join(__dirname, '../../openapi.yaml'));

// Setup Swagger UI as its own route
export const setupSwagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}; 