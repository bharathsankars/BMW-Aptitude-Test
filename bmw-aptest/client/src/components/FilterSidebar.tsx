import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  TextField,
  Button,
  Divider,
  IconButton,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { getUniqueValues } from "../api/cars";
import type { Field } from "../types/query";

export type SidebarFilter = {
  field: Field;
  op: "contains" | "equals" | "startsWith" | "endsWith" | "isEmpty" | "greaterThan" | "lessThan";
  value?: string | number;
};

type FilterSidebarProps = {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: SidebarFilter[]) => void;
  onClearFilters: () => void;
  currentFilters: SidebarFilter[];
};

const DRAWER_WIDTH = 350;

export default function FilterSidebar({
  open,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<SidebarFilter[]>(currentFilters);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [powerTrainOptions, setPowerTrainOptions] = useState<string[]>([]);
  const [plugTypeOptions, setPlugTypeOptions] = useState<string[]>([]);
  const [bodyStyleOptions, setBodyStyleOptions] = useState<string[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [brands, models, powerTrains, plugTypes, bodyStyles, segments] = await Promise.all([
          getUniqueValues("Brand"),
          getUniqueValues("Model"),
          getUniqueValues("PowerTrain"),
          getUniqueValues("PlugType"),
          getUniqueValues("BodyStyle"),
          getUniqueValues("Segment"),
        ]);
        setBrandOptions(brands);
        setModelOptions(models);
        setPowerTrainOptions(powerTrains);
        setPlugTypeOptions(plugTypes);
        setBodyStyleOptions(bodyStyles);
        setSegmentOptions(segments);
      } catch (error) {
        console.error("Failed to fetch unique values:", error);
        
        
        setBrandOptions(["Tesla", "BMW", "Audi", "Mercedes", "Nissan", "Volkswagen"]);
        setModelOptions(["Model 3", "i3", "e-tron", "EQC", "Leaf", "ID.3"]);
        setPowerTrainOptions(["AWD", "RWD", "FWD"]);
        setPlugTypeOptions(["Type 2", "CCS", "CHAdeMO"]);
        setBodyStyleOptions(["Hatchback", "SUV", "Sedan", "Coupe"]);
        setSegmentOptions(["B", "C", "D", "E"]);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const updateFilter = (field: Field, op: SidebarFilter["op"], value?: string | number) => {
    setFilters((prev) => {
      if (op === "isEmpty") {
        const existing = prev.find((f) => f.field === field && f.op === "isEmpty");
        if (existing) {
          return prev; // already exists, keep
        } else {
          // remove any other filter for this field
          const without = prev.filter((f) => f.field !== field);
          return [...without, { field, op: "isEmpty" }];
        }
      } else {
        // remove isEmpty if exists
        const withoutIsEmpty = prev.filter((f) => !(f.field === field && f.op === "isEmpty"));
        const existing = withoutIsEmpty.find((f) => f.field === field && f.op === op);
        if (existing) {
          if (value === undefined || value === "") {
            return withoutIsEmpty.filter((f) => !(f.field === field && f.op === op));
          } else {
            return withoutIsEmpty.map((f) =>
              f.field === field && f.op === op ? { ...f, value } : f
            );
          }
        } else if (value !== undefined && value !== "") {
          return [...withoutIsEmpty, { field, op, value }];
        }
        return withoutIsEmpty;
      }
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters([]);
    onClearFilters();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        {/* Performance */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Performance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography>Range (km)</Typography>
              <Slider
                value={[
                  filters.find((f) => f.field === "Range_Km" && f.op === "greaterThan")?.value as number || 0,
                  filters.find((f) => f.field === "Range_Km" && f.op === "lessThan")?.value as number || 1000,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter("Range_Km", "greaterThan", min);
                  updateFilter("Range_Km", "lessThan", max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Acceleration (0-100 s)</Typography>
              <Slider
                value={[
                  filters.find((f) => f.field === "AccelSec" && f.op === "greaterThan")?.value as number || 0,
                  filters.find((f) => f.field === "AccelSec" && f.op === "lessThan")?.value as number || 20,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter("AccelSec", "greaterThan", min);
                  updateFilter("AccelSec", "lessThan", max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                step={0.1}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Top Speed (km/h)</Typography>
              <Slider
                value={[
                  filters.find((f) => f.field === "TopSpeed_KmH" && f.op === "greaterThan")?.value as number || 0,
                  filters.find((f) => f.field === "TopSpeed_KmH" && f.op === "lessThan")?.value as number || 300,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter("TopSpeed_KmH", "greaterThan", min);
                  updateFilter("TopSpeed_KmH", "lessThan", max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={300}
                step={10}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Efficiency (Wh/km)</Typography>
              <Slider
                value={[
                  filters.find((f) => f.field === "Efficiency_WhKm" && f.op === "greaterThan")?.value as number || 0,
                  filters.find((f) => f.field === "Efficiency_WhKm" && f.op === "lessThan")?.value as number || 300,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter("Efficiency_WhKm", "greaterThan", min);
                  updateFilter("Efficiency_WhKm", "lessThan", max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={300}
                step={5}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Price */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Price</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography>Price (€)</Typography>
              <Slider
                value={[
                  filters.find((f) => f.field === "PriceEuro" && f.op === "greaterThan")?.value as number || 0,
                  filters.find((f) => f.field === "PriceEuro" && f.op === "lessThan")?.value as number || 200000,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter("PriceEuro", "greaterThan", min);
                  updateFilter("PriceEuro", "lessThan", max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={200000}
                step={1000}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* General Info */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>General Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography>Brand</Typography>
              <Select
                value={filters.find(f => f.field === "Brand")?.op || "contains"}
                onChange={(e) => {
                  const newOp = e.target.value as SidebarFilter["op"];
                  if (newOp === "isEmpty") {
                    updateFilter("Brand", "isEmpty");
                  } else {
                    const currentValue = filters.find(f => f.field === "Brand" && f.op !== "isEmpty")?.value as string || "";
                    updateFilter("Brand", newOp, currentValue);
                  }
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="startsWith">Starts With</MenuItem>
                <MenuItem value="endsWith">Ends With</MenuItem>
                <MenuItem value="isEmpty">Is Empty</MenuItem>
              </Select>
              <Autocomplete
                options={brandOptions}
                value={filters.find(f => f.field === "Brand" && f.op !== "isEmpty")?.value as string || ""}
                onChange={(_, newValue) => {
                  const currentOp = filters.find(f => f.field === "Brand")?.op || "contains";
                  updateFilter("Brand", currentOp, newValue || "");
                }}
                renderInput={(params) => <TextField {...params} />}
                freeSolo
                disabled={filters.find(f => f.field === "Brand")?.op === "isEmpty"}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Model</Typography>
              <Select
                value={filters.find(f => f.field === "Model")?.op || "contains"}
                onChange={(e) => {
                  const newOp = e.target.value as SidebarFilter["op"];
                  if (newOp === "isEmpty") {
                    updateFilter("Model", "isEmpty");
                  } else {
                    const currentValue = filters.find(f => f.field === "Model" && f.op !== "isEmpty")?.value as string || "";
                    updateFilter("Model", newOp, currentValue);
                  }
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="startsWith">Starts With</MenuItem>
                <MenuItem value="endsWith">Ends With</MenuItem>
                <MenuItem value="isEmpty">Is Empty</MenuItem>
              </Select>
              <Autocomplete
                options={modelOptions}
                value={filters.find(f => f.field === "Model" && f.op !== "isEmpty")?.value as string || ""}
                onChange={(_, newValue) => {
                  const currentOp = filters.find(f => f.field === "Model")?.op || "contains";
                  updateFilter("Model", currentOp, newValue || "");
                }}
                renderInput={(params) => <TextField {...params} />}
                freeSolo
                disabled={filters.find(f => f.field === "Model")?.op === "isEmpty"}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={powerTrainOptions}
                value={filters.find((f) => f.field === "PowerTrain" && f.op === "equals")?.value as string || ""}
                onChange={(_, newValue) => updateFilter("PowerTrain", "equals", newValue || "")}
                renderInput={(params) => <TextField {...params} label="Power Train" />}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={plugTypeOptions}
                value={filters.find((f) => f.field === "PlugType" && f.op === "equals")?.value as string || ""}
                onChange={(_, newValue) => updateFilter("PlugType", "equals", newValue || "")}
                renderInput={(params) => <TextField {...params} label="Plug Type" />}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={bodyStyleOptions}
                value={filters.find((f) => f.field === "BodyStyle" && f.op === "equals")?.value as string || ""}
                onChange={(_, newValue) => updateFilter("BodyStyle", "equals", newValue || "")}
                renderInput={(params) => <TextField {...params} label="Body Style" />}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.some((f) => f.field === "RapidCharge" && f.op === "equals" && f.value === "Yes")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter("RapidCharge", "equals", "Yes");
                      } else {
                        setFilters((prev) => prev.filter((f) => !(f.field === "RapidCharge" && f.op === "equals")));
                      }
                    }}
                  />
                }
                label="Rapid Charge"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Seats</Typography>
              <Slider
                value={filters.find((f) => f.field === "Seats" && f.op === "equals")?.value as number || 5}
                onChange={(_, newValue) => updateFilter("Seats", "equals", newValue as number)}
                valueLabelDisplay="auto"
                min={2}
                max={9}
                step={1}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={segmentOptions}
                value={filters.find((f) => f.field === "Segment" && f.op === "equals")?.value as string || ""}
                onChange={(_, newValue) => updateFilter("Segment", "equals", newValue || "")}
                renderInput={(params) => <TextField {...params} label="Segment" />}
                loading={loadingOptions}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Date</Typography>
              <Select
                value={filters.find(f => f.field === "Date")?.op || "contains"}
                onChange={(e) => {
                  const newOp = e.target.value as SidebarFilter["op"];
                  if (newOp === "isEmpty") {
                    updateFilter("Date", "isEmpty");
                  } else {
                    const currentValue = filters.find(f => f.field === "Date" && f.op !== "isEmpty")?.value as string || "";
                    updateFilter("Date", newOp, currentValue);
                  }
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="startsWith">Starts With</MenuItem>
                <MenuItem value="endsWith">Ends With</MenuItem>
                <MenuItem value="isEmpty">Is Empty</MenuItem>
              </Select>
              <TextField
                label="Date (YYYY-MM-DD)"
                value={filters.find(f => f.field === "Date" && f.op !== "isEmpty")?.value as string || ""}
                onChange={(e) => {
                  const currentOp = filters.find(f => f.field === "Date")?.op || "contains";
                  updateFilter("Date", currentOp, e.target.value);
                }}
                fullWidth
                disabled={filters.find(f => f.field === "Date")?.op === "isEmpty"}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        <Button variant="outlined" onClick={handleClear} fullWidth>
          Clear
        </Button>
        <Button variant="contained" onClick={handleApply} fullWidth>
          Apply
        </Button>
      </Box>
    </Drawer>
  );
}
