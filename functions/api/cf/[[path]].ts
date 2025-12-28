/// <reference types="@cloudflare/workers-types" />

export const onRequest: PagesFunction<{ CF_API_TOKEN?: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const targetPath = url.pathname.replace(/^\/api\/cf/, '');
  const targetUrl = `https://api.cloudflare.com${targetPath}${url.search}`;

  const newHeaders = new Headers(request.headers);
  
  if (env.CF_API_TOKEN) {
    newHeaders.set('Authorization', `Bearer ${env.CF_API_TOKEN}`);
  }

  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: 'follow'
  });

  try {
    const response = await fetch(newRequest);
    return response;
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
