module.exports = {
  devServer: {
    proxy: {
      '/gapi': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        pathRewrite: { '^/gapi': '' },
        secure: false,
      },
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://www.gstatic.com https://apis.google.com https://accounts.google.com https://content.googleapis.com https://www.google.com;",
        "connect-src 'self' https://www.googleapis.com https://accounts.google.com ws://192.168.0.14:8080 http://192.168.0.14:8080 https://accounts.google.com/_/IdpIFrameHttp/cspreport;",
        "img-src 'self' https://www.gstatic.com https://apis.google.com https://content.googleapis.com;",
        "frame-src 'self' https://accounts.google.com https://content.googleapis.com https://content-tasks.googleapis.com https://accounts.google.com/_/IdpIFrameHttp/cspreport/fine-allowlist https://accounts.google.com/_/IdpIFrameHttp;",
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com;",
        "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css;",
        "object-src 'none';",
        "base-uri 'self';",
        "report-to csp-reports;",
      ].join(' '),
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Report-To': JSON.stringify({
      "group": "csp-reports",
      "max_age": 31536000,
      "endpoints": [
      {
        "url": "https://accounts.google.com/_/IdpIFrameHttp/cspreport/fine-allowlist"
      }
    ]
    }),
  },
}
};