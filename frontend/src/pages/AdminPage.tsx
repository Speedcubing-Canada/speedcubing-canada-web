import {Admin, ListGuesser, Resource} from "react-admin";
import * as React from "react";
import simpleRestProvider from "ra-data-simple-rest";
import {useTranslation} from "react-i18next";
import {RankList2} from "../components/List";


const dataProvider = simpleRestProvider('http://localhost:8083/');

export const AdminPage = () => {
    const {t} = useTranslation();

    return (
        <Admin dataProvider={dataProvider}>
            <Resource name="/admin/get_users" list={ListGuesser}/>

        </Admin>
    );
}