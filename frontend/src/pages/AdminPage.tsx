import {Admin, ListGuesser, Resource} from "react-admin";
import * as React from "react";
import simpleRestProvider from "ra-data-simple-rest";
import {useTranslation} from "react-i18next";
import {RankList2} from "../components/List";
import dataProvider from "../dataProvider";



export const AdminPage = () => {
    const {t} = useTranslation();

    return (
        <Admin dataProvider={dataProvider}>
            <Resource name="get_users" list={ListGuesser} options={{ dataPath: '/admin/get_users' }}/>

        </Admin>
    );
}