import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams } from "react-router-dom";
import { ConstructionOutlined, KeyTwoTone } from "@mui/icons-material";
import { compileFunction } from "vm";
import { useState, useEffect } from "react";

export const Competitions = () => {
  const { t } = useTranslation();
  const { compid } = useParams();

  return (
    <div>Work in progress...</div>
  );
};
