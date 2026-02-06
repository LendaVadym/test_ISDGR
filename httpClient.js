// HTTP client and request builder

class HttpClient {
  constructor(baseURL = '', defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
    this.timeout = defaultOptions.timeout || 30000;
  }

  /**
   * Performs GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Performs POST request
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: this._serializeBody(data)
    });
  }

  /**
   * Performs PUT request
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: this._serializeBody(data)
    });
  }

  /**
   * Performs PATCH request
   */
  async patch(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: this._serializeBody(data)
    });
  }

  /**
   * Performs DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Performs generic request
   */
  async request(url, options = {}) {
    const requestConfig = {
      ...this.defaultOptions,
      ...options,
      url: this._getFullURL(url),
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    // Apply request interceptors
    let config = requestConfig;
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    try {
      const response = await this._fetchRequest(config);

      // Apply response interceptors
      let result = response;
      for (const interceptor of this.interceptors.response) {
        result = await interceptor(result);
      }

      return result;
    } catch (error) {
      // Apply error interceptors
      let handledError = error;
      for (const interceptor of this.interceptors.error) {
        handledError = await interceptor(handledError);
      }

      throw handledError;
    }
  }

  /**
   * Adds request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
    return this;
  }

  /**
   * Adds response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
    return this;
  }

  /**
   * Adds error interceptor
   */
  addErrorInterceptor(interceptor) {
    this.interceptors.error.push(interceptor);
    return this;
  }

  /**
   * Creates request builder
   */
  builder() {
    return new RequestBuilder(this);
  }

  /**
   * Performs batch requests
   */
  async batch(requests) {
    return Promise.all(
      requests.map(({ method, url, data, options }) => {
        const methodLower = method.toLowerCase();
        if (methodLower === 'get' || methodLower === 'delete') {
          return this[methodLower](url, options);
        }
        return this[methodLower](url, data, options);
      })
    );
  }

  /**
   * Serializes body based on content type
   */
  _serializeBody(data) {
    if (!data) return null;
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }

  /**
   * Gets full URL
   */
  _getFullURL(url) {
    if (url.startsWith('http')) return url;
    return this.baseURL + url;
  }

  /**
   * Fetches request (mock - in real use, would use fetch API)
   */
  async _fetchRequest(config) {
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      config
    };
  }
}

/**
 * Request builder with fluent API
 */
class RequestBuilder {
  constructor(client) {
    this.client = client;
    this.config = {
      method: 'GET',
      headers: {},
      params: {},
      data: null
    };
  }

  /**
   * Sets URL
   */
  url(url) {
    this.config.url = url;
    return this;
  }

  /**
   * Sets method
   */
  method(method) {
    this.config.method = method.toUpperCase();
    return this;
  }

  /**
   * Sets GET method
   */
  get() {
    return this.method('GET');
  }

  /**
   * Sets POST method
   */
  post() {
    return this.method('POST');
  }

  /**
   * Sets PUT method
   */
  put() {
    return this.method('PUT');
  }

  /**
   * Sets PATCH method
   */
  patch() {
    return this.method('PATCH');
  }

  /**
   * Sets DELETE method
   */
  delete() {
    return this.method('DELETE');
  }

  /**
   * Sets header
   */
  header(name, value) {
    this.config.headers[name] = value;
    return this;
  }

  /**
   * Sets headers
   */
  headers(headers) {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  /**
   * Sets content type
   */
  contentType(type) {
    return this.header('Content-Type', type);
  }

  /**
   * Sets authorization
   */
  auth(token) {
    return this.header('Authorization', `Bearer ${token}`);
  }

  /**
   * Sets request body
   */
  body(data) {
    this.config.data = data;
    return this;
  }

  /**
   * Sets JSON body
   */
  json(data) {
    this.contentType('application/json');
    return this.body(data);
  }

  /**
   * Sets query parameter
   */
  param(name, value) {
    this.config.params[name] = value;
    return this;
  }

  /**
   * Sets query parameters
   */
  params(params) {
    this.config.params = { ...this.config.params, ...params };
    return this;
  }

  /**
   * Sets timeout
   */
  timeout(ms) {
    this.config.timeout = ms;
    return this;
  }

  /**
   * Builds query string
   */
  _buildQueryString() {
    const params = Object.entries(this.config.params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return params ? `?${params}` : '';
  }

  /**
   * Sends request
   */
  async send() {
    const url = this.config.url + this._buildQueryString();
    return this.client.request(url, this.config);
  }

  /**
   * Gets config
   */
  getConfig() {
    return { ...this.config };
  }
}

/**
 * Response wrapper
 */
class HttpResponse {
  constructor(status, statusText, headers, data) {
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.data = data;
  }

  /**
   * Checks if successful
   */
  isSuccess() {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * Checks if error
   */
  isError() {
    return this.status >= 400;
  }

  /**
   * Checks if redirect
   */
  isRedirect() {
    return this.status >= 300 && this.status < 400;
  }

  /**
   * Gets JSON data
   */
  json() {
    try {
      return typeof this.data === 'string' ? JSON.parse(this.data) : this.data;
    } catch {
      return null;
    }
  }

  /**
   * Gets text
   */
  text() {
    return String(this.data);
  }

  /**
   * Gets header
   */
  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }
}

module.exports = {
  HttpClient,
  RequestBuilder,
  HttpResponse
};
