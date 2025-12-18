# Tracing Guide

## Overview
OpenTelemetry tracing has been added to this Next.js application to help monitor performance and debug issues.

## Setup

### 1. Install Dependencies
```bash
npm install
```

The following packages have been added:
- `@opentelemetry/api`: Core OpenTelemetry API
- `@vercel/otel`: Vercel's OpenTelemetry integration for Next.js

### 2. Configuration
The tracing is configured in:
- `instrumentation.ts`: Main instrumentation file (automatically loaded by Next.js)
- `next.config.js`: Enabled `instrumentationHook: true`
- `lib/telemetry.ts`: Helper utilities for custom tracing

## Usage

### Automatic Tracing
Next.js automatically traces:
- Page renders
- API routes
- Server components
- Data fetching

### Custom Tracing

Import the telemetry helpers:
```typescript
import { createSpan, addSpanAttributes, addSpanEvent } from '@/lib/telemetry';
```

#### Create Custom Spans
```typescript
// Wrap async operations
await createSpan('database-query', async () => {
  return await db.collection.find();
});
```

#### Add Attributes
```typescript
addSpanAttributes({
  userId: user.id,
  productCount: products.length,
  cachehit: true
});
```

#### Add Events
```typescript
addSpanEvent('cache-miss', {
  key: cacheKey,
  reason: 'expired'
});
```

## Viewing Traces

### Local Development
By default, traces are sent to the console in development mode.

### Production (Vercel)
If deployed on Vercel, traces are automatically sent to Vercel's monitoring dashboard:
1. Go to your project on Vercel
2. Navigate to the "Speed Insights" or "Analytics" tab
3. View traces and performance metrics

### Custom Backend
To send traces to a custom backend (e.g., Jaeger, Zipkin, Datadog):

1. Install additional exporters:
```bash
npm install @opentelemetry/exporter-trace-otlp-http
```

2. Update `instrumentation.ts`:
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export function register() {
  const sdk = new NodeSDK({
    serviceName: 'agri-point-ecommerce',
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),
  });
  
  sdk.start();
}
```

## Environment Variables

Optional environment variables:
```env
# OpenTelemetry endpoint (if using custom backend)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Service name override
OTEL_SERVICE_NAME=agri-point-ecommerce

# Enable/disable tracing
NEXT_PUBLIC_OTEL_ENABLED=true
```

## Best Practices

1. **Name spans descriptively**: Use clear, hierarchical names like `database.products.fetch`
2. **Add context**: Use attributes to add relevant metadata (user IDs, product IDs, etc.)
3. **Trace critical paths**: Focus on slow operations (database queries, API calls, image processing)
4. **Avoid over-tracing**: Don't trace every function; focus on meaningful operations
5. **Use events for milestones**: Mark important events within long operations

## Examples

### Trace Database Operations
```typescript
import { createSpan, addSpanAttributes } from '@/lib/telemetry';

export async function getProducts() {
  return createSpan('database.products.fetch', async () => {
    const products = await Product.find();
    addSpanAttributes({
      'db.collection': 'products',
      'result.count': products.length
    });
    return products;
  });
}
```

### Trace API Routes
```typescript
import { createSpan } from '@/lib/telemetry';

export async function POST(request: Request) {
  return createSpan('api.orders.create', async () => {
    const body = await request.json();
    // ... process order
    return NextResponse.json({ success: true });
  });
}
```

## Troubleshooting

- **No traces appearing**: Ensure `instrumentationHook: true` is in `next.config.js`
- **Missing custom spans**: Check that `instrumentation.ts` is properly loaded
- **Performance impact**: Tracing has minimal overhead but can be disabled in production if needed

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
