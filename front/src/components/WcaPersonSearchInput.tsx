import { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useInput, useTranslate } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { searchWcaPersons, WcaSearchResult } from "../helpers/searchWcaPersons";

interface Props {
  // The wca_id field path (relative; react-admin scopes it inside an ArrayInput).
  source: string;
  helperText?: string;
}

// A react-admin input that searches the WCA persons index by name and stores the chosen
// person's WCA ID. Selecting a result also fills the sibling `name` field, so an admin can
// add a team member / director just by searching for them. Falls back gracefully (empty
// results) if the WCA API is unreachable.
export const WcaPersonSearchInput = ({ source, helperText }: Props) => {
  const t = useTranslate();
  const { field } = useInput({ source });
  const { setValue } = useFormContext();

  // field.name is the fully-qualified form path (e.g. "members.2.wca_id"); derive the
  // sibling name path from it so this works both standalone and inside the array iterator.
  const nameSource = field.name.replace(/wca_id$/, "name");
  const currentName = useWatch({ name: nameSource });

  const [query, setQuery] = useState("");
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["wca-search", query.trim()],
    queryFn: () => searchWcaPersons(query),
    enabled: query.trim().length >= 3,
    staleTime: 1000 * 60,
  });

  // Represent the current field value as an option so the box shows the selection when
  // editing an existing record, and merge it into the option list to avoid MUI's
  // "value not in options" warning.
  const selected: WcaSearchResult | null = field.value
    ? { wca_id: field.value, name: currentName || field.value, location: null }
    : null;
  const options = selected
    ? [selected, ...results.filter((r) => r.wca_id !== selected.wca_id)]
    : results;

  return (
    <Autocomplete
      sx={{ minWidth: 260 }}
      options={options}
      value={selected}
      filterOptions={(x) => x} // server-side search; don't re-filter locally
      isOptionEqualToValue={(o, v) => o.wca_id === v.wca_id}
      getOptionLabel={(o) => (o ? `${o.name} (${o.wca_id})` : "")}
      onInputChange={(_, value, reason) => {
        if (reason === "input") {
          setQuery(value);
        }
      }}
      onChange={(_, value) => {
        field.onChange(value ? value.wca_id : "");
        if (value) {
          setValue(nameSource, value.name, { shouldDirty: true });
        }
      }}
      loading={isFetching}
      renderOption={(props, o) => (
        <li {...props} key={o.wca_id}>
          {o.name} ({o.wca_id}){o.location ? ` — ${o.location}` : ""}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("resources.person.wca_search")}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
