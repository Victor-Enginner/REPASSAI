import http from 'http';

const TARGET = 'http://127.0.0.1:5500';
const PORT = parseInt(process.env.PORT || '5501', 10);

const server = http.createServer((req, res) => {
  const proxy = http.request(TARGET + req.url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'nr1ztfcj-5500.brs.devtunnels.ms'
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    res.writeHead(502);
    res.end('Proxy error: ' + err.message);
  });

  req.pipe(proxy);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy iniciado: http://0.0.0.0:${PORT} -> ${TARGET}`);
});