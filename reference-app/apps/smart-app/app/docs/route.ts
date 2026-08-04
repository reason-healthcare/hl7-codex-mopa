function swaggerHtml(title: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title} — API</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"><style>body{margin:0}.topbar{display:none!important}</style></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>window.onload=()=>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true,tryItOutEnabled:true,presets:[SwaggerUIBundle.presets.apis,SwaggerUIBundle.SwaggerUIStandalonePreset],layout:'BaseLayout'})</script></body></html>`;
}
export function GET() {
  return new Response(swaggerHtml("MOPA CDS SMART App"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
