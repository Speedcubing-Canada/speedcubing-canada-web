import httpClient from "./httpClient";

const respond = (
  body: unknown,
  { ok = true, contentType = "application/json" } = {},
) =>
  vi.fn().mockResolvedValue({
    ok,
    headers: new Headers({ "Content-Type": contentType }),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(body),
  });

const stubFetch = (fetchMock: ReturnType<typeof respond>) => {
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("httpClient", () => {
  it("parses a JSON body on success", async () => {
    stubFetch(respond({ id: 7 }));

    const res = await httpClient.get<{ id: number }>("/user_info");

    expect(res).toEqual({ ok: true, error: undefined, data: { id: 7 } });
  });

  it("falls back to text when the response is not JSON", async () => {
    stubFetch(respond("pong", { contentType: "text/plain" }));

    const res = await httpClient.get<string>("/ping");

    expect(res.data).toBe("pong");
  });

  it("reports a non-ok response as an error, not data", async () => {
    stubFetch(respond({ message: "forbidden" }, { ok: false }));

    const res = await httpClient.get("/admin/get_users");

    expect(res).toEqual({
      ok: false,
      data: undefined,
      error: { message: "forbidden" },
    });
  });

  it("turns a network failure into an error result", async () => {
    stubFetch(vi.fn().mockRejectedValue(new Error("offline")));

    const res = await httpClient.get("/user_info");

    expect(res).toEqual({ ok: false, data: undefined, error: "offline" });
  });

  it("sends credentials and a JSON content type by default", async () => {
    const fetchMock = stubFetch(respond({}));

    await httpClient.post("/edit/1", { name: "x" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify({ name: "x" }));
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("lets a caller override the default headers", async () => {
    const fetchMock = stubFetch(respond({}));

    await httpClient.put("/edit/1", undefined, {
      headers: { "Content-Type": "text/plain" },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("Content-Type")).toBe("text/plain");
  });

  it("omits a body when there is nothing to send", async () => {
    const fetchMock = stubFetch(respond({}));

    await httpClient.delete("/admin/users/1");
    await httpClient.patch("/edit/1", null);

    for (const [, init] of fetchMock.mock.calls as [string, RequestInit][]) {
      expect(init.body).toBeUndefined();
    }
    expect(
      fetchMock.mock.calls.map(([, i]) => (i as RequestInit).method),
    ).toEqual(["DELETE", "PATCH"]);
  });
});
