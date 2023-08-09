import {Admin, ListGuesser, Resource} from "react-admin";
import * as React from "react";
import simpleRestProvider from "ra-data-simple-rest";
import {useTranslation} from "react-i18next";
import {RankList2} from "../components/List";


const dataProvider = simpleRestProvider('http://localhost:8083/');

export const AdminPage = () => {
    const {t} = useTranslation();

    return (
        <div></div>/*<Admin dataProvider={dataProvider}>
            <Resource name="test_rankings" list={RankList2}/>

        </Admin>*/
    );
}