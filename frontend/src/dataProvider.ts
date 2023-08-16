import {fetchUtils} from 'react-admin';
import {stringify} from 'query-string';
import {API_BASE_URL} from "./components/Api";
import {DataProvider} from "ra-core/dist/cjs/types";

const apiUrl = API_BASE_URL
const httpClient = (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({
            Accept: 'application/json'
        });
    }
    options.credentials = 'include';
    return fetchUtils.fetchJson(url, options);
}

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
    getList: (resource: any, params: {
        pagination: { page: any; perPage: any; };
        sort: { field: any; order: any; };
        filter: any;
    }) => {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/admin/get_users?${stringify(query)}`;

        return httpClient(url).then(({headers, json}) => (
            Promise.resolve(convertResponseToDataProviderFormat(json))
        ));
    },

    getOne: (resource: any, params: { id: any; }) =>
        httpClient(`${apiUrl}/user_info/${params.id}`).then(({json}) => ({
            data: json,
        })),

    getMany: (resource: any, params: { ids: any; }) => {
        const query = {
            filter: JSON.stringify({ids: params.ids}),
        };
        const url = `${apiUrl}/admin/get_users_by_id?${stringify(query)}`;
        return httpClient(url).then(({json}) => ({data: json}));
    },

    getManyReference: (resource: any, params: {
        pagination: { page: any; perPage: any; };
        sort: { field: any; order: any; };
        filter: any;
        target: any;
        id: any;
    }) => {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({headers, json}) => (
            Promise.resolve(convertResponseToDataProviderFormat(json))
        ));
    },

    create: (resource: any, params: { data: any; }) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({
            data: {...params.data, id: json.id},
        })),

    update: (resource: any, params: { id: any; data: any; }) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json})),

    updateMany: (resource: any, params: { ids: any; data: any; }) => {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}));
    },

    delete: (resource: any, params: { id: any; }) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json})),

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'DELETE',
            body: JSON.stringify(params),
        }).then(({json}) => ({data: json}));
    },
};

export default dataProvider;
