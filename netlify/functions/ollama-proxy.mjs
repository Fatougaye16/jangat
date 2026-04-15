export async function handler(event) {
  const apiKey = process.env.OLLAMA_API_KEY

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OLLAMA_API_KEY not configured' }),
    }
  }

  // Extract the path after /ollama-api from the original request
  const rawPath = event.rawUrl
    ? new URL(event.rawUrl).pathname
    : event.path
  const ollamaPath = rawPath.replace(/^\/ollama-api/, '') || '/'
  const targetUrl = `https://ollama.com${ollamaPath}`

  try {
    const fetchOptions = {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }

    if (event.httpMethod !== 'GET' && event.body) {
      fetchOptions.body = event.body
    }

    const response = await fetch(targetUrl, fetchOptions)
    const responseBody = await response.text()

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: responseBody,
    }
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to proxy request to Ollama' }),
    }
  }
}
