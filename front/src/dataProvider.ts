import { fetchUtils } from "react-admin";
import { stringify } from "query-string";
import { API_BASE_URL } from "./components/api";
import { DataProvider } from "ra-core/dist/cjs/types";

const apiUrl = API_BASE_URL;
const httpClient = (url: string, options: RequestInit = {}) => {
  if (!options.headers) {
    options.headers = new Headers({
      Accept: "application/json",
    });
  }
  options.credentials = "include";
  return fetchUtils.fetchJson(url, options);
};

const convertResponseToDataProviderFormat = (response: any) => {
  return {
    data: response.data,
    pageInfo: {
      hasPreviousPage: response.pageInfo.hasPreviousPage,
      hasNextPage: response.pageInfo.hasNextPage,
    },
  };
};

const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    if (resource === "ChampionshipsAdmin") {
      const query = {
        page,
        per_page: perPage,
        sort_field: field,
        sort_order: order,
        q: params.filter?.q ?? "",
      };
      const url = `${apiUrl}/admin/get_championships?${stringify(query)}`;
      return httpClient(url).then(({ json }) => ({
        data: json.data,
        total: json.total,
      }));
    }

    const query = {
      sort_field: JSON.stringify(field),
      sort_order: JSON.stringify(order),
      page: JSON.stringify(page),
      per_page: JSON.stringify(perPage),
      filter: JSON.stringify(params.filter),
      cursor: page === 1 ? null : localStorage.getItem("cursor"),
    };
    const url = `${apiUrl}/admin/get_users?${stringify(query)}`;

    return httpClient(url).then(({ json }) => {
      localStorage.setItem("cursor", json.cursor);
      return convertResponseToDataProviderFormat(json);
    });
  },

  getOne: (resource, params) => {
    if (resource === "ChampionshipsAdmin") {
      return httpClient(`${apiUrl}/admin/championship/${params.id}`).then(
        ({ json }) => ({
          data: json,
        }),
      );
    }
    return httpClient(`${apiUrl}/user_info/${params.id}`).then(({ json }) => ({
      data: json,
    }));
  },

  getMany: (resource, params) => {
    if (resource === "ChampionshipsAdmin") {
      const query = { ids: JSON.stringify(params.ids) };
      const url = `${apiUrl}/admin/get_championships_by_id?${stringify(query)}`;
      return httpClient(url).then(({ json }) => ({ data: json.data }));
    }
    const query = {
      filter: JSON.stringify({ ids: params.ids }),
    };
    const url = `${apiUrl}/admin/get_users_by_id?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (
    resource: any,
    params: {
      //not setup
      pagination: { page: any; perPage: any };
      sort: { field: any; order: any };
      filter: any;
      target: any;
      id: any;
    },
  ) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ json }) =>
      Promise.resolve(convertResponseToDataProviderFormat(json)),
    );
  },

  create: (
    resource: any,
    params: { data: any }, //not setup
  ) => {
    if (resource === "ChampionshipsAdmin") {
      return httpClient(`${apiUrl}/admin/championships`, {
        method: "POST",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json }));
    }
    return httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    }));
  },

  update: (resource, params) => {
    if (resource === "ChampionshipsAdmin") {
      return httpClient(`${apiUrl}/admin/championships/${params.id}`, {
        method: "POST",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json }));
    }
    return httpClient(`${apiUrl}/edit/${params.id}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: (resource: any, params: { ids: any; data: any }) => {
    //not setup
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) => {
    if (resource === "ChampionshipsAdmin") {
      return httpClient(`${apiUrl}/admin/championships/${params.id}`, {
        method: "DELETE",
      }).then(({ json }) => ({ data: json.data ?? { id: params.id } }));
    }
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({ data: json }));
  },

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "DELETE",
      body: JSON.stringify(params),
    }).then(({ json }) => ({ data: json }));
  },
};

export default dataProvider;
