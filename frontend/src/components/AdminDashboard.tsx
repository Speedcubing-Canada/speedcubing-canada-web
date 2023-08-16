import { Card, CardContent, CardHeader } from "@mui/material";
import {useTranslation} from "react-i18next";

export const AdminDashboard = () => {
    const {t} = useTranslation();
    return (
        <Card>
            <CardHeader title="Welcome to the Admin Section" />
            <CardContent>Please note that you can filter users using the start of their first name. If you want to use the family name, you must write the first name first. You may also use exact WCAID to filter.</CardContent>
        </Card>
    );
}