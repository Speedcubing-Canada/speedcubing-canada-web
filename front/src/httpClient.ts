export interface HttpResponse<D = undefined, E = undefined> {
  ok: boolean;
  data?: D;
  error?: E;
}

class httpClient {
  private static parseBody(response: Response): Promise<unknown> {
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  static async request<R, D, E = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    body: R | undefined,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return window
      .fetch(endpoint, {
        method: method,
        body: body ? JSON.stringify(body) : undefined,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
      })
      .then(async (response) => {
        const body = await this.parseBody(response);

        if (!response.ok) {
          return {
            ok: false,
            error: body as E,
            data: undefined,
          };
        }
        return {
          ok: true,
          error: undefined,
          data: body as D,
        };
      })
      .catch((error) => {
        return {
          ok: false,
          data: undefined,
          error: error.message as E,
        };
      });
  }

  static get<D, E = unknown>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return this.request<undefined, D, E>("GET", endpoint, undefined, options);
  }

  static post<R, D, E = unknown>(
    endpoint: string,
    data: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return this.request<R, D, E>("POST", endpoint, data, options);
  }

  static put<R, D, E = unknown>(
    endpoint: string,
    data: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return this.request<R, D, E>("PUT", endpoint, data, options);
  }

  static patch<R, D, E = unknown>(
    endpoint: string,
    data: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return this.request<R, D, E>("PATCH", endpoint, data, options);
  }

  static delete<D, E = unknown>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> {
    return this.request<undefined, D, E>(
      "DELETE",
      endpoint,
      undefined,
      options,
    );
  }
}

export default httpClient;
