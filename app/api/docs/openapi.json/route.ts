import { NextRequest, NextResponse } from 'next/server';

/**
 * OPENAPI/SWAGGER ENDPOINT
 * URL: GET /api/docs
 * Returns OpenAPI 3.0 specification for API documentation
 */

export async function GET(req: NextRequest) {
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'AGRI POINT E-Commerce API',
      version: '1.0.0',
      description: 'API documentation for AGRI POINT agricultural e-commerce platform',
      contact: {
        name: 'AGRI POINT Support',
        email: 'infos@agri-ps.com',
        url: 'https://agri-ps.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://agri-ps.com',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token in HTTP-only cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'integer' },
          },
          required: ['error'],
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'integer' },
            category: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            published: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'price'],
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            total: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
            paymentMethod: { type: 'string' },
            shippingAddress: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'items', 'total'],
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['client', 'admin', 'manager', 'redacteur', 'assistant_ia'] },
            verified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['email'],
        },
        Health: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'integer' },
            appVersion: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                mongodb: { type: 'object' },
                memory: { type: 'object' },
              },
            },
          },
        },
        Metrics: {
          type: 'object',
          properties: {
            period: { type: 'string' },
            summary: {
              type: 'object',
              properties: {
                totalOrders24h: { type: 'integer' },
                totalOrders7d: { type: 'integer' },
                totalOrders30d: { type: 'integer' },
                totalRevenue24h: { type: 'number' },
                totalRevenue7d: { type: 'number' },
                totalRevenue30d: { type: 'number' },
                avgOrderValue24h: { type: 'number' },
                conversionRate: { type: 'number' },
              },
            },
            topProducts: { type: 'array' },
            ordersTrend: { type: 'array' },
            generatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health check endpoint',
          description: 'Check system health, database connectivity, and uptime',
          operationId: 'getHealth',
          responses: {
            '200': {
              description: 'System is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Health' },
                },
              },
            },
            '503': {
              description: 'System is degraded or unhealthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Health' },
                },
              },
            },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          description: 'Get paginated list of published products with optional filtering and searching',
          operationId: 'getProducts',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Page number for pagination',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
              description: 'Items per page',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search term for product name/description',
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by category',
            },
          ],
          responses: {
            '200': {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          pages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/products/{slug}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by slug',
          operationId: 'getProductBySlug',
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Product URL slug',
            },
          ],
          responses: {
            '200': {
              description: 'Product details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '404': {
              description: 'Product not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          operationId: 'login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register new user',
          operationId: 'register',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                  },
                  required: ['email', 'password', 'firstName', 'lastName'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Create new order',
          operationId: 'createOrder',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string' },
                          quantity: { type: 'integer', minimum: 1 },
                        },
                        required: ['productId', 'quantity'],
                      },
                    },
                    shippingAddress: { type: 'object' },
                    paymentMethod: { type: 'string', enum: ['stripe', 'paypal', 'mobile_money'] },
                  },
                  required: ['items', 'paymentMethod'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Order created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Order' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
            '400': {
              description: 'Invalid request',
            },
          },
        },
      },
      '/api/admin/metrics': {
        get: {
          tags: ['Admin'],
          summary: 'Get business metrics',
          operationId: 'getMetrics',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          description: 'Requires admin/superadmin role. Returns KPIs for last 30 days',
          responses: {
            '200': {
              description: 'Business metrics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Metrics' },
                },
              },
            },
            '401': {
              description: 'Unauthorized - JWT required',
            },
            '403': {
              description: 'Forbidden - Admin role required',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Admin',
        description: 'Admin only endpoints',
      },
      {
        name: 'System',
        description: 'System health and status endpoints',
      },
    ],
  };

  return NextResponse.json(openApiSpec);
}
