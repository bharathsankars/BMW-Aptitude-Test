// This is the main component for displaying the data grid
// uses AG Grid to show electric car data

import { useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent, GridApi, ColumnState } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Typography,
  Pagination,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";

import type { ElectricCar } from "../types/car";
import type { Field, QueryInput, ColumnConfig } from "../types/query";
import { queryCars, deleteCar, getColumns } from "../api/cars";

//sorting and filtering
type SortModel = { colId: string; sort: "asc" | "desc" }[];
type FilterModel = Record<string, any>;

//main function component
export default function GenericDataGrid() {
  // Hooks for navigation and theme
  const navigate = useNavigate();
  const { mode } = useTheme();

  // Register the AG Grid modules
  ModuleRegistry.registerModules([AllCommunityModule]);

  //holds the grid API
  const gridApiRef = useRef<GridApi | null>(null);

  // State for the table data
  const [rows, setRows] = useState<ElectricCar[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 25; // Number of rows per page

  // State for user experience and control
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({
    open: false,
    msg: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<ElectricCar | null>(null);
  const [selectedRows, setSelectedRows] = useState<ElectricCar[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch columns on mount
  useEffect(() => {
    async function fetchColumns() {
      try {
        const cols = await getColumns();
        setColumns(cols);
      } catch (error) {
        console.error("Failed to fetch columns:", error);
      }
    }
    fetchColumns();
  }, []);

  // Load data when columns are available
  useEffect(() => {
    if (columns.length > 0 && rows.length === 0) {
      load(1);
    }
  }, [columns]);

  // Define the columns for the grid
  const columnDefs = useMemo(() => {
    // Function to create number columns
    const numberCol = (
      field: Field,
      headerName?: string,
      formatter?: (value: any) => string
    ) => ({
      field,
      headerName: headerName ?? field,
      sortable: true,
      resizable: true,
      cellStyle: { textAlign: "left" },
      valueFormatter: formatter
        ? (params: any) => formatter(params.value)
        : undefined,
      minWidth: 120,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: ["equals", "greaterThan", "lessThan", "blank"],
        maxNumConditions: 1,
      },
      tooltipField: field,
    });

    // Function to create text columns
    const textCol = (field: Field, headerName?: string) => ({
      field,
      headerName: headerName ?? field,
      sortable: true,
      resizable: true,
      cellStyle: { textAlign: "left" },
      minWidth: 100,
      filter: "agTextColumnFilter",
      filterParams: {
        filterOptions: [
          "contains",
          "equals",
          "startsWith",
          "endsWith",
          "blank",
        ],
        maxNumConditions: 1,
      },
      tooltipField: field,
    });

    // Actions column with buttons
    const actionsCol = {
      headerName: "Actions",
      pinned: "right" as const,
      width: 160,
      suppressMenu: true,
      sortable: false,
      filter: false,
      cellRenderer: (p: any) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/detail/${p.data.id}`)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setCarToDelete(p.data);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    };

    // Formatter map
    const formatterMap: Record<string, (value: any) => string> = {
      "km": (value) => value ? `${value.toLocaleString()} km` : "",
      "€": (value) => value ? `€${value.toLocaleString()}` : "",
      "s": (value) => value ? `${value} s` : "",
      "km/h": (value) => value ? `${value} km/h` : "",
      "Wh/km": (value) => value ? `${value} Wh/km` : "",
    };

    // Generate column definitions from fetched columns
    const colDefs = columns.map((col) => {
      const formatter = formatterMap[col.format || ""];
      if (col.type === "number") {
        return numberCol(col.field, col.headerName, formatter);
      } else {
        return textCol(col.field, col.headerName);
      }
    });

    // Return all the column definitions
    return [actionsCol, ...colDefs];
  }, [navigate, columns]);

  // Handler for confirming delete
  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;
    try {
      await deleteCar(carToDelete.id);
      setToast({
        open: true,
        msg: `"${carToDelete.Brand} ${carToDelete.Model}" has been successfully deleted.`,
        severity: "success",
      });
      await load(1);
    } catch (e: any) {
      setToast({
        open: true,
        msg: e?.message || "Delete failed",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    }
  };

  // Handler for canceling delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Function to convert data to CSV format
  function arrayToCSV(data: any[]): string {
    if (data.length === 0) return "";
    const allHeaders = Object.keys(data[0]);
    const headers = allHeaders.filter((h) => h !== "id" && h !== "is_active"); // Exclude id and is_active fields
    const csv = [headers.join(",")];
    data.forEach((row) => {
      const values = headers.map((h) => {
        const val = row[h];
        if (val == null) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`; // Escape quotes
        }
        return str;
      });
      csv.push(values.join(","));
    });
    return csv.join("\n");
  }

  // Handler for exporting data
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const q = buildQuery();
      q.pageSize = 200; // Set to fetch all data
      q.page = 1;
      const res = await queryCars(q);
      const csv = arrayToCSV(res.rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "electric_cars.csv";
      a.click();
      URL.revokeObjectURL(url);
      setToast({
        open: true,
        msg: "Data exported successfully.",
        severity: "success",
      });
    } catch (e: any) {
      setToast({
        open: true,
        msg: e?.message || "Export failed",
        severity: "error",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Handler for when selection changes
  const onSelectionChanged = () => {
    if (gridApiRef.current) {
      const selected = gridApiRef.current.getSelectedRows();
      setSelectedRows(selected);
    }
  };

  // Function to build query from grid state
  function buildQuery(): QueryInput {
    const filterModel: FilterModel =
      gridApiRef.current?.getFilterModel?.() ?? {};

    // Get sort state
    const colState: ColumnState[] =
      gridApiRef.current?.getColumnState?.() ?? [];
    const sort: SortModel = colState
      .filter((c) => !!c.sort)
      .map((c) => ({ colId: String(c.colId), sort: c.sort as "asc" | "desc" }));

    // Build filters
    const gridFilters: QueryInput["filters"] = Object.entries(
      filterModel
    ).flatMap(([field, f]) => {
      if (!f) return [];
      if (f.filterType === "text") {
        const op = f.type === "blank" ? "isEmpty" : f.type ?? "contains";
        return [{ field: field as Field, op, value: f.filter }];
      }
      if (f.filterType === "number") {
        const opMap: Record<string, string> = {
          greaterThan: "greaterThan",
          lessThan: "lessThan",
          equals: "equals",
          blank: "isEmpty",
        };
        const op = opMap[f.type] ?? "equals";
        return [
          {
            field: field as Field,
            op,
            value: f.type === "blank" ? undefined : Number(f.filter),
          },
        ];
      }
      return [];
    });

    const allFilters = [...gridFilters];

    // Map sort
    const mappedSort = sort.map((s) => ({
      field: s.colId as Field,
      dir: s.sort,
    }));

    return { page, pageSize, search, sort: mappedSort, filters: allFilters };
  }

  // Function to load data
  async function load(toPage = page) {
    setLoading(true);
    try {
      const q = buildQuery();
      q.page = toPage;
      const res = await queryCars(q);
      setRows(res.rows);
      console.log("Rows after setRows:", res.rows); // Debug log
      setTotal(res.total);
      setPage(toPage);
    } finally {
      setLoading(false);
    }
  }

  // Handler for when grid is ready
  function onGridReady(params: GridReadyEvent) {
    console.log("Grid API set:", params.api);
    gridApiRef.current = params.api;
  }

  // Return the JSX
  return (
    <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
      <CardHeader
        title={
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search (Brand, Model, PlugType, BodyStyle)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(1)}
                sx={{
                  width: 420,
                  backgroundColor: mode === "light" ? "white" : "#2a2a2a",
                  borderRadius: 1,
                  padding: 1,
                }}
                variant="outlined"
                InputProps={{ endAdornment: <SearchIcon /> }}
              />
              <Button variant="contained" onClick={() => load(1)}>
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={exportLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
                onClick={handleExport}
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting..." : "Export CSV"}
              </Button>
            </Stack>
          </Box>
        }
        subheader={
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: "0.875rem" }}
          >
            Click on column headers to sort or filter data. Use Ctrl+click for
            multi-sort.
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {/* The Grid */}
        <Box sx={{ position: "relative", height: "72vh" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  mode === "light"
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(0, 0, 0, 0.8)",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <div
            className="ag-theme-quartz"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact<ElectricCar>
              onGridReady={onGridReady}
              rowData={rows}
              columnDefs={columnDefs as any}
              defaultColDef={{
                sortable: true,
                filter: false,
                resizable: true,
                floatingFilter: false,
              }}
              onFilterChanged={() => load(1)}
              onSortChanged={() => load(1)}
              suppressPaginationPanel={true}
              animateRows={true}
              rowHeight={50}
              headerHeight={50}
              rowSelection="multiple"
              onSelectionChanged={onSelectionChanged}
              alwaysShowVerticalScroll={true}
              multiSortKey="ctrl"
              overlayNoRowsTemplate='<span style="padding: 10px; border: 1px solid #ccc; background: #fafafa;">No data to display</span>'
              getRowClass={(params) =>
                params.node.rowIndex !== null && params.node.rowIndex % 2 === 0
                  ? "even-row"
                  : "odd-row"
              }
            />
          </div>
        </Box>

        {/* Pagination */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ p: 2, pt: 1 }}
        >
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(_, value) => load(value)}
            color="primary"
            shape="rounded"
            size="small"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" sx={{ ml: 2 }}>
            {total} rows
          </Typography>
        </Stack>
      </CardContent>

      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

      {/* Custom styles */}
      <style>
        {`
           .ag-theme-quartz .ag-header-cell.ag-header-cell-sorted-asc .ag-sort-ascending-icon {
      color: #388e3c !important; /* Green for ascending */
    }
    .ag-theme-quartz .ag-header-cell.ag-header-cell-sorted-desc .ag-sort-descending-icon {
      color: #d32f2f !important; /* Red for descending */
    }

    /* Hover effects */
    .ag-theme-quartz .ag-header-cell.ag-header-cell-sorted-asc .ag-sort-ascending-icon:hover {
      color: #2e7d32 !important; /* Darker green on hover */
    }
    .ag-theme-quartz .ag-header-cell.ag-header-cell-sorted-desc .ag-sort-descending-icon:hover {
      color: #b71c1c !important; /* Darker red on hover */
    }
          .even-row {
            background-color: #f9f9f9;
          }
          .odd-row {
            background-color: white;
          }
          .ag-theme-quartz .ag-row:hover {
            background-color: #e3f2fd !important;
          }
          .ag-theme-quartz .ag-header-cell-label {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.6);
            font-size: 16px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .ag-theme-quartz .ag-header {
            background-color: #f4f6f8;
            border-bottom: 1px solid #ddd;
          }
          .ag-theme-quartz .ag-cell {
            border-right: 1px solid #eee;
            padding: 8px 12px;
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .ag-theme-quartz .ag-cell:last-child {
            border-right: none;
          }
          .ag-theme-quartz .ag-paging-panel {
            display: none;
          }
          .ag-theme-quartz .ag-icon {
            color: #0a65cc;
            transition: color 0.3s ease;
          }
          .ag-theme-quartz .ag-icon:hover {
            color: #004a99;
          }
          .ag-theme-quartz .ag-filter-icon {
            color: #0a65cc;
            cursor: pointer;
          }
          .ag-theme-quartz .ag-filter-icon:hover {
            color: #004a99;
          }
          .ag-theme-quartz .ag-sort-ascending-icon {
            color: #388e3c;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .ag-theme-quartz .ag-sort-ascending-icon:hover {
            color: #2e7d32;
          }
          .ag-theme-quartz .ag-sort-descending-icon {
            color: #d32f2f;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .ag-theme-quartz .ag-sort-descending-icon:hover {
            color: #b71c1c;
          }
          .ag-theme-quartz .ag-header-cell-label .ag-header-icon {
            margin-left: 6px;
          }
          .ag-theme-quartz .ag-header-cell-label .ag-header-icon .ag-icon {
            font-size: 18px;
          }

          /* Dark mode overrides */
          [data-theme="dark"] .even-row {
            background-color: #2a2a2a;
          }
          [data-theme="dark"] .odd-row {
            background-color: #1e1e1e;
          }
          [data-theme="dark"] .ag-theme-quartz .ag-row:hover {
            background-color: #333 !important;
          }
          [data-theme="dark"] .ag-theme-quartz .ag-header {
            background-color: #1e1e1e;
          }
          [data-theme="dark"] .ag-theme-quartz .ag-header-cell-label {
            color: rgba(255, 255, 255, 0.7);
          }
          [data-theme="dark"] .ag-theme-quartz .ag-cell {
            color: rgba(255, 255, 255, 0.87);
          }
        `}
      </style>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WarningIcon color="warning" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to delete{" "}
            <strong>
              {carToDelete ? `${carToDelete.Brand} ${carToDelete.Model}` : ""}
            </strong>
            . This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
