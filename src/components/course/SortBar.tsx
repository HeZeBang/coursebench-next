"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import type { SortKey, SortOrder } from "@/types";

interface SortBarProps {
  sortKey: SortKey;
  order: SortOrder;
  onSortKeyChange: (key: SortKey) => void;
  onOrderChange: (order: SortOrder) => void;
  includeDataInsufficient: boolean;
  onIncludeDataInsufficientChange: (value: boolean) => void;
}

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "综合评分", value: "score" },
  { label: "评价总数", value: "count" },
  { label: "学分", value: "credit" },
];

export default function SortBar({
  sortKey,
  order,
  onSortKeyChange,
  onOrderChange,
  includeDataInsufficient,
  onIncludeDataInsufficientChange,
}: SortBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>排序方式</InputLabel>
        <Select
          value={sortKey}
          label="排序方式"
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={order}
        exclusive
        onChange={(_, val) => val && onOrderChange(val)}
        size="small"
      >
        <ToggleButton value="desc">
          <ArrowDownwardIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="asc">
          <ArrowUpwardIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControlLabel
        control={
          <Checkbox
            checked={!includeDataInsufficient}
            onChange={(e) => onIncludeDataInsufficientChange(!e.target.checked)}
            size="small"
          />
        }
        label="延后数据不足"
      />
    </Box>
  );
}
