import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent, GridApi, ColumnState } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Paper,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";

import type { ElectricCar } from "../types/car";
import type { Field, QueryInput } from "../types/query";
import { queryCars, deleteCar } from "../api/cars";
import FilterSidebar, { type SidebarFilter } from "./FilterSidebar";

type SortModel = { colId: string; sort: "asc" | "desc" }[];
type FilterModel = Record<string, any>;

export default function GenericDataGrid() {
  const navigate = useNavigate();

  ModuleRegistry.registerModules([AllCommunityModule]);

  // Hold AG Grid API once grid is ready
  const gridApiRef = useRef<GridApi | null>(null);

  // Table state
  const [rows, setRows] = useState<ElectricCar[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // UX state
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

  // Filter sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilter[]>([]);

  // Columns
  const columnDefs = useMemo(() => {
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
    });
    const textCol = (field: Field, headerName?: string) => ({
      field,
      headerName: headerName ?? field,
      sortable: true,
      resizable: true,
      cellStyle: { textAlign: "left" },
      minWidth: 100,
    });

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

    return [
      actionsCol,
      textCol("Brand"),
      textCol("Model"),
      numberCol("Range_Km", "Range (km)", (value) =>
        value ? `${value.toLocaleString()} km` : ""
      ),
      numberCol("PriceEuro", "Price (€)", (value) =>
        value ? `€${value.toLocaleString()}` : ""
      ),
      numberCol("AccelSec", "0–100 (s)", (value) =>
        value ? `${value} s` : ""
      ),
      textCol("PowerTrain"),
      textCol("PlugType"),
      textCol("BodyStyle"),
      textCol("RapidCharge"),
      textCol("Seats"),
      textCol("Date"),
    ];
  }, [navigate]);

  // Delete confirmation dialog handlers
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

  // Cancel Delete confirmation dialog handlers
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Build a backend query from grid state
  function buildQuery(sidebarFiltersOverride?: SidebarFilter[]): QueryInput {
    const filterModel: FilterModel =
      gridApiRef.current?.getFilterModel?.() ?? {};

    // Derive sort using GridApi.getColumnState()
    const colState: ColumnState[] =
      gridApiRef.current?.getColumnState?.() ?? [];
    const sort: SortModel = colState
      .filter((c) => !!c.sort)
      .map((c) => ({ colId: String(c.colId), sort: c.sort as "asc" | "desc" }));

    const gridFilters: QueryInput["filters"] = Object.entries(
      filterModel
    ).flatMap(([field, f]) => {
      if (!f) return [];
      if (f.filterType === "text") {
        const op = f.type ?? "contains";
        return [{ field: field as Field, op, value: f.filter }];
      }
      if (f.filterType === "number") {
        const opMap: Record<string, string> = {
          greaterThan: "greaterThan",
          lessThan: "lessThan",
          equals: "equals",
        };
        const op = opMap[f.type] ?? "equals";
        return [{ field: field as Field, op, value: Number(f.filter) }];
      }
      return [];
    });

    // Merge sidebar filters
    const allFilters = [
      ...gridFilters,
      ...(sidebarFiltersOverride ?? sidebarFilters),
    ];

    // Map SortModel -> your QueryInput["sort"]
    const mappedSort = sort.map((s) => ({
      field: s.colId as Field,
      dir: s.sort,
    }));

    return { page, pageSize, search, sort: mappedSort, filters: allFilters };
  }

  // Fetch data
  async function load(toPage = page, sidebarFiltersOverride?: SidebarFilter[]) {
    setLoading(true);
    try {
      const q = buildQuery(sidebarFiltersOverride);
      q.page = toPage;
      const res = await queryCars(q);
      setRows(res.rows);
      console.log("Rows after setRows:", res.rows);
      setTotal(res.total);
      setPage(toPage);
    } finally {
      setLoading(false);
    }
  }

  // Grid ready -> capture API, then initial load
  function onGridReady(params: GridReadyEvent) {
    console.log("Grid API set:", params.api);
    gridApiRef.current = params.api;
    load(1);
  }

  // Sidebar handlers
  const handleApplyFilters = (filters: SidebarFilter[]) => {
    setSidebarFilters(filters);
    load(1, filters);
  };

  const handleClearFilters = () => {
    setSidebarFilters([]);
    load(1, []);
  };

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
                  backgroundColor: "white",
                  borderRadius: 1,
                  padding: 1,
                }}
                variant="outlined"
                InputProps={{ endAdornment: <SearchIcon /> }}
              />
              <Button variant="contained" onClick={() => load(1)}>
                Search
              </Button>
            </Stack>
          </Box>
        }
        subheader={
          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            Sort data by clicking on column headers
          </Typography>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setSidebarOpen(true)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {/* Grid */}
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
                backgroundColor: "rgba(255, 255, 255, 0.8)",
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
              defaultColDef={{ sortable: true, filter: false, resizable: true }}
              onFilterChanged={() => load(1)}
              onSortChanged={() => load(1)}
              suppressPaginationPanel={true}
              animateRows={true}
              rowHeight={50}
              headerHeight={50}
              rowSelection="single"
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

        {/* Pager */}
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

      {/* Toasts */}
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

      {/* Filter Sidebar */}
      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={sidebarFilters}
      />
    </Card>
  );
}
