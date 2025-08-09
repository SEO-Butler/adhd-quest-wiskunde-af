export class LazybirdClient {
  constructor({ apiKey, baseUrl } = {}) {
    if (!apiKey) throw new Error('LazybirdClient: apiKey is required');
    this.apiKey = apiKey;
    
    // Use proxy in development to avoid CORS issues
    if (!baseUrl) {
      baseUrl = import.meta.env.DEV 
        ? '/api/lazybird/v1'  // Use Vite proxy in development
        : 'https://api.lazybird.app/v1';  // Direct API in production
    }
    
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }
  _headers(extra = {}) {
    return { 'X-API-Key': this.apiKey, 'Content-Type': 'application/json', ...extra };
  }
  async listVoices() {
    const res = await fetch(`${this.baseUrl}/voices`, { headers: this._headers() });
    if (!res.ok) throw new Error(`Voices failed: ${res.status}`);
    return res.json();
  }
  async synthesize({ text, voiceId, ssml = false }) {
    const body = ssml ? { ssml: text, voiceId } : { text, voiceId };
    
    console.log('Lazybird TTS Request:', {
      url: `${this.baseUrl}/generate-speech`,
      headers: this._headers(),
      body: body
    });
    
    const res = await fetch(`${this.baseUrl}/generate-speech`, { method: 'POST', headers: this._headers(), body: JSON.stringify(body) });
    
    console.log('Lazybird TTS Response:', {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });
    
    if (!res.ok) {
      // Try to get error details
      let errorBody;
      try {
        errorBody = await res.text();
        console.error('Lazybird API Error:', errorBody);
      } catch (e) {
        console.error('Could not read error response');
      }
      throw new Error(`TTS failed: ${res.status} ${res.statusText}${errorBody ? ` - ${errorBody}` : ''}`);
    }
    
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('audio/')) return await res.blob();
    const json = await res.json();
    if (json.url) { const r = await fetch(json.url); if (!r.ok) throw new Error('Download failed'); return await r.blob(); }
    throw new Error('Unexpected TTS response');
  }
}
