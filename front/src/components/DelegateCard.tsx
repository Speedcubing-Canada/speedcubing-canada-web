import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PersonCard } from "./PersonCard";
import { Delegate } from "../helpers/fetchDelegates";

// WCA delegate ranks, most senior first. Encoded on the card as a chip whose weight
// climbs with seniority; red (primary) is reserved for the top rank:
// primary/filled (top) -> neutral/filled -> neutral/outlined -> neutral/dashed.
const STATUS_STYLE: Record<
  string,
  {
    key: string;
    color: "primary" | "default";
    variant: "filled" | "outlined";
    dashed?: boolean;
  }
> = {
  regional_delegate: { key: "regional", color: "primary", variant: "filled" },
  senior_delegate: { key: "senior", color: "primary", variant: "filled" },
  delegate: { key: "delegate", color: "default", variant: "filled" },
  junior_delegate: { key: "junior", color: "default", variant: "outlined" },
  trainee_delegate: {
    key: "trainee",
    color: "default",
    variant: "outlined",
    dashed: true,
  },
};

// Maps the raw WCA delegate-region group name to a locale key.
const REGION_GROUP_KEY: Record<string, string> = {
  "Canada (East)": "east",
  "Canada (West)": "west",
};

// Wraps the presentational PersonCard with delegate-specific concerns: the rank chip
// (color/variant/label + gendered French wording) and a subtitle. Regional delegates
// (showRegionGroup) show the region they cover; everyone else shows their province.
export const DelegateCard = ({
  delegate,
  showRegionGroup,
}: {
  delegate: Delegate;
  showRegionGroup?: boolean;
}) => {
  const { t } = useTranslation();
  const style = STATUS_STYLE[delegate.status];

  const regionGroupKey = delegate.region_group
    ? REGION_GROUP_KEY[delegate.region_group]
    : undefined;
  const subtitle =
    showRegionGroup && regionGroupKey
      ? t(`delegates.regionGroup.${regionGroupKey}`)
      : delegate.province
      ? t(`provinces.${delegate.province}`)
      : undefined;

  return (
    <PersonCard
      wcaId={delegate.wca_id}
      name={delegate.name}
      avatarUrl={delegate.avatar_thumb_url}
      subtitle={subtitle}
      chip={
        style && (
          <Chip
            size="small"
            color={style.color}
            variant={style.variant}
            sx={style.dashed ? { borderStyle: "dashed" } : undefined}
            label={t(`delegates.status.${style.key}`, {
              context: delegate.gender === "f" ? "female" : undefined,
            })}
          />
        )
      }
    />
  );
};
