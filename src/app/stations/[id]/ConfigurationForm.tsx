"use client";

import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import React from "react";

interface Option {
  label: string;
  id: string;
}

interface ConfigurationFormProps {
  currentStation?: string;
  stations: Option[];
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ currentStation, stations }) => {
  const router = useRouter();

  return (
    <Stack direction="row" spacing={2} m={1}>
      <Autocomplete
        options={stations}
        value={stations.find((s) => s.id === currentStation)}
        filterOptions={(o, s) => (s.inputValue.length < 3 ? [] : createFilterOptions<Option>()(o, s))}
        onChange={(e, o) => o && router.push(`/stations/${o.id}`)}
        noOptionsText="Bitte einen validen Bahnhof eingeben"
        fullWidth
        sx={{ maxWidth: { md: "33%" } }}
        renderInput={(params) => <TextField {...params} label="Bahnhof" />}
      />
    </Stack>
  );
};
