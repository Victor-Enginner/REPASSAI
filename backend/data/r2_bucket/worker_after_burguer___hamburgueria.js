
// CLOUDFLARE WORKER ROUTER // ZERO-COST CNAME PROXY
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  // Mapeia o domínio customizado site.afterburguerhamburgueria.com.br para o bucket R2
  const targetUrl = 'https://cdn.repass.ai/after_burguer___hamburgueria.html'
  
  const response = await fetch(targetUrl, request)
  return new Response(response.body, response)
}
        