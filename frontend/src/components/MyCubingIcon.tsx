import '../cubingicon.css'
import React from 'react'
import {Icon, Tooltip} from "@mui/material";
import {useTranslation} from "react-i18next";
import {eventID, IconSize} from "./Types";

export const MyCubingIcon: React.FC<{ event: eventID, selected: boolean, size?: IconSize}> = (data) => {
    const {t} = useTranslation();

    const {event, selected, size = 'medium'} = data;

    return (
        <Tooltip title={t('events._' + event)} arrow>
            <Icon baseClassName={`icon cubing-icon event-${event} cubing-icon-${size} ${
                selected ? 'cubing-icon-selected' : 'cubing-icon-unselected'
            }`}
            sx={{
                height: 40,
            }}/>
        </Tooltip>
    )
}