import {Admin, ListGuesser, Resource} from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import {useTranslation} from "react-i18next";
//import {UserList} from "../components/List";
import dataProvider from "../dataProvider";

//const dataProvider = simpleRestProvider('https://localhost:8083/');

export const AdminPage = () => {
    const {t} = useTranslation();

    return (
        <Admin basename="/admin" dataProvider={dataProvider}>
            <Resource name="get_users" list={ListGuesser}/>

        </Admin>
    );
}