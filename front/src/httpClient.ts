export interface HttpResponse<D = undefined, E = undefined> {
  ok: boolean;
  data?: D;
  error?: E;
}

const parseBody = (response: Response): Promise<unknown> => {
  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const request = async <R, D, E = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body: R | undefined,
  options: Omit<RequestInit, "method" | "body"> = {},
): Promise<HttpResponse<D, E>> => {
  // HeadersInit is a Headers instance, an array of pairs or a plain object.
  // Spreading it only worked for the last of the three, so go through Headers
  // and let caller-supplied values win over the JSON default.
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const [key, value] of new Headers(options.headers)) {
    headers.set(key, value);
  }

  try {
    const response = await window.fetch(endpoint, {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers,
      credentials: "include",
    });
    const payload = await parseBody(response);

    if (!response.ok) {
      return {
        ok: false,
        error: payload as E,
        data: undefined,
      };
    }
    return {
      ok: true,
      error: undefined,
      data: payload as D,
    };
  } catch (error) {
    return {
      ok: false,
      data: undefined,
      error: (error as Error).message as E,
    };
  }
};

const httpClient = {
  request,

  get: <D, E = unknown>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> =>
    request<undefined, D, E>("GET", endpoint, undefined, options),

  // Body optional: the admin maintenance endpoints POST without one.
  post: <R, D, E = unknown>(
    endpoint: string,
    data?: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> =>
    request<R, D, E>("POST", endpoint, data, options),

  put: <R, D, E = unknown>(
    endpoint: string,
    data: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> =>
    request<R, D, E>("PUT", endpoint, data, options),

  patch: <R, D, E = unknown>(
    endpoint: string,
    data: R,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> =>
    request<R, D, E>("PATCH", endpoint, data, options),

  delete: <D, E = unknown>(
    endpoint: string,
    options: Omit<RequestInit, "method" | "body"> = {},
  ): Promise<HttpResponse<D, E>> =>
    request<undefined, D, E>("DELETE", endpoint, undefined, options),
};

export default httpClient;
