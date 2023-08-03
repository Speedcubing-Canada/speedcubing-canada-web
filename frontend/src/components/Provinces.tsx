import {Province} from "./Types";

const provinces: Province[] = [
        {label: 'Alberta', id: 'ab', region: 'Prairies'},
        {label: 'British Columbia', id: 'bc', region: 'British Columbia'},
        {label: 'Manitoba', id: 'mb', region: 'Prairies'},
        {label: 'New Brunswick', id: 'nb', region: 'Atlantic'},
        {label: 'Newfoundland and Labrador', id: 'nl', region: 'Atlantic'},
        {label: 'Northwest Territories', id: 'nt', region: 'Territories'},
        {label: 'Nova Scotia', id: 'ns', region: 'Atlantic'},
        {label: 'Nunavut', id: 'nu', region: 'Territories'},
        {label: 'Ontario', id: 'on', region: 'Ontario'},
        {label: 'Prince Edward Island', id: 'pe', region: 'Atlantic'},
        {label: 'Quebec', id: 'qc', region: 'Quebec'},
        {label: 'Saskatchewan', id: 'sk', region: 'Prairies'},
        {label: 'Yukon', id: 'yt', region: 'Territories'},

    ];// TODO: have translations for provinces

export const GetProvincesWithNA: () => Province[]= () => {
    return provinces.concat({label: 'N/A', id: 'na', region: 'N/A'});
}

export const GetProvinces = () => {
    return provinces;
}