import { fetchUtils, DataProvider } from "react-admin";
import { stringify } from "query-string";
import { API_BASE_URL } from "./components/api";

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

// Curated admin resources served by the hand-written backend CRUD
// (edit_championships.py, edit_teams.py, _person_crud.py). Each maps to a singular getOne
// segment and a plural collection segment, and they all share the same URL contract:
// get_<plural>, get_<plural>_by_id, <singular>/<id>, <plural>[/<id>].
const ADMIN_RESOURCES: Record<string, { singular: string; plural: string }> = {
  ChampionshipsAdmin: { singular: "championship", plural: "championships" },
  TeamsAdmin: { singular: "team", plural: "teams" },
  DirectorsAdmin: { singular: "director", plural: "directors" },
  FeaturedMembersAdmin: {
    singular: "featured_member",
    plural: "featured_members",
  },
};

// Undefined for anything not in the map (the legacy user resource), which is what the
// `if (adminResource)` branches below key off of.
const getAdminResource = (resource: string) => ADMIN_RESOURCES[resource];

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
    // react-admin 5 made both optional; these defaults mirror
    // paginate_records() in back/backend/handlers/admin/_list_utils.py.
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
    const { field, order } = params.sort ?? { field: "id", order: "ASC" };

    const adminResource = getAdminResource(resource);
    if (adminResource) {
      const query = {
        page,
        per_page: perPage,
        sort_field: field,
        sort_order: order,
        q: params.filter?.q ?? "",
      };
      const url = `${apiUrl}/admin/get_${adminResource.plural}?${stringify(
        query,
      )}`;
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
    const adminResource = getAdminResource(resource);
    if (adminResource) {
      return httpClient(
        `${apiUrl}/admin/${adminResource.singular}/${params.id}`,
      ).then(({ json }) => ({
        data: json,
      }));
    }
    return httpClient(`${apiUrl}/user_info/${params.id}`).then(({ json }) => ({
      data: json,
    }));
  },

  getMany: (resource, params) => {
    const adminResource = getAdminResource(resource);
    if (adminResource) {
      const query = { ids: JSON.stringify(params.ids) };
      const url = `${apiUrl}/admin/get_${
        adminResource.plural
      }_by_id?${stringify(query)}`;
      return httpClient(url).then(({ json }) => ({ data: json.data }));
    }
    const query = {
      filter: JSON.stringify({ ids: params.ids }),
    };
    const url = `${apiUrl}/admin/get_users_by_id?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
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
      convertResponseToDataProviderFormat(json),
    );
  },

  create: (resource, params) => {
    const adminResource = getAdminResource(resource);
    if (adminResource) {
      return httpClient(`${apiUrl}/admin/${adminResource.plural}`, {
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
    const adminResource = getAdminResource(resource);
    if (adminResource) {
      return httpClient(
        `${apiUrl}/admin/${adminResource.plural}/${params.id}`,
        {
          method: "POST",
          body: JSON.stringify(params.data),
        },
      ).then(({ json }) => ({ data: json }));
    }
    return httpClient(`${apiUrl}/edit/${params.id}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) => {
    const adminResource = getAdminResource(resource);
    if (adminResource) {
      return httpClient(
        `${apiUrl}/admin/${adminResource.plural}/${params.id}`,
        {
          method: "DELETE",
        },
      ).then(({ json }) => ({ data: json.data ?? { id: params.id } }));
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
