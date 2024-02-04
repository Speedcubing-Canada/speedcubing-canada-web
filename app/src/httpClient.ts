class httpClient {
  static async request(
    method: string,
    endpoint: string,
    data: any,
    customConfig = {},
  ) {
    const credentials: RequestCredentials = "include";
    const headers = { "Content-Type": "application/json" };
    const config = {
      method: method,
      body: data ? JSON.stringify(data) : undefined,
      ...customConfig,
      headers: {
        ...headers,
      },
      credentials: credentials,
    };

    return window
      .fetch(endpoint, config)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        const errorMessage = error.text();
        return Promise.reject(new Error(errorMessage));
      });
  }

  static get(endpoint: string, customConfig = {}) {
    return this.request("GET", endpoint, undefined, customConfig);
  }

  static post(endpoint: string, data: any, customConfig = {}) {
    return this.request("POST", endpoint, data, customConfig);
  }
}

export default httpClient;
