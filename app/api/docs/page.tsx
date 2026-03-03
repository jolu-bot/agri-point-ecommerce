/**
 * SWAGGER UI PAGE
 * URL: GET /api/docs
 * Displays API documentation using Swagger UI
 */

'use client';

import { useEffect } from 'react';

export default function SwaggerUI() {
  useEffect(() => {
    // Initialize Swagger UI on client side
    const initSwagger = async () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (typeof SwaggerUIBundle !== 'undefined') {
          // @ts-ignore
          SwaggerUIBundle({
            url: '/api/docs/openapi.json',
            dom_id: '#swagger-ui',
            // @ts-ignore
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: 'BaseLayout',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
          });
        }
      };
      document.head.appendChild(script);
    };

    initSwagger();
  }, []);

  return (
    <>
      <style>{`
        html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: sans-serif;
          background: #fafafa;
        }
      `}</style>
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css"
      />
      <div id="swagger-ui"></div>
    </>
  );
}
