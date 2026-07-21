import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PersonCard } from "./PersonCard";
import { Delegate } from "../helpers/fetchDelegates";

// WCA delegate ranks, most senior first. Encoded on the card as a colored chip:
// primary/filled (top) -> neutral/filled -> primary/outlined -> neutral/outlined.
const STATUS_STYLE: Record<
  string,
  { key: string; color: "primary" | "default"; variant: "filled" | "outlined" }
> = {
  regional_delegate: { key: "regional", color: "primary", variant: "filled" },
  senior_delegate: { key: "senior", color: "primary", variant: "filled" },
  delegate: { key: "delegate", color: "default", variant: "filled" },
  junior_delegate: { key: "junior", color: "primary", variant: "outlined" },
  trainee_delegate: { key: "trainee", color: "default", variant: "outlined" },
};

// Wraps the presentational PersonCard with delegate-specific concerns: the rank
// chip (color/variant/label + gendered French wording) and the province subtitle.
export const DelegateCard = ({ delegate }: { delegate: Delegate }) => {
  const { t } = useTranslation();
  const style = STATUS_STYLE[delegate.status];

  return (
    <PersonCard
      wcaId={delegate.wca_id}
      name={delegate.name}
      avatarUrl={delegate.avatar_thumb_url}
      subtitle={
        delegate.province ? t(`provinces.${delegate.province}`) : undefined
      }
      chip={
        style && (
          <Chip
            size="small"
            color={style.color}
            variant={style.variant}
            label={t(`delegates.status.${style.key}`, {
              context: delegate.gender === "f" ? "female" : undefined,
            })}
          />
        )
      }
    />
  );
};
