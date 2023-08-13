import {Province} from "./Types";

const provinces: Province[] = [
        {label: 'Alberta', id: 'ab', region: 'Prairies', region_id: 'pr'},
        {label: 'British Columbia', id: 'bc', region: 'British Columbia', region_id: 'bc'},
        {label: 'Manitoba', id: 'mb', region: 'Prairies', region_id: 'pr'},
        {label: 'New Brunswick', id: 'nb', region: 'Atlantic', region_id: 'at'},
        {label: 'Newfoundland and Labrador', id: 'nl', region: 'Atlantic', region_id: 'at'},
        {label: 'Northwest Territories', id: 'nt', region: 'Territories', region_id: 'te'},
        {label: 'Nova Scotia', id: 'ns', region: 'Atlantic', region_id: 'at'},
        {label: 'Nunavut', id: 'nu', region: 'Territories', region_id: 'te'},
        {label: 'Ontario', id: 'on', region: 'Ontario', region_id: 'on'},
        {label: 'Prince Edward Island', id: 'pe', region: 'Atlantic', region_id: 'at'},
        {label: 'Quebec', id: 'qc', region: 'Quebec', region_id: 'qc'},
        {label: 'Saskatchewan', id: 'sk', region: 'Prairies', region_id: 'pr'},
        {label: 'Yukon', id: 'yt', region: 'Territories', region_id: 'te'},

    ];

export const getProvincesWithNA: () => Province[]= () => {
    return provinces.concat({label: 'N/A', id: 'na', region: 'N/A', region_id: 'na'});
}

export const getProvinces = () => {
    return provinces;
}