"use client"

import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,
} from '@tanstack/react-table'

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Global Filter Component
function GlobalFilter({ globalFilter, setGlobalFilter, totalRows }) {
  const [value, setValue] = useState(globalFilter ?? '')

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setGlobalFilter(e.target.value)
        }}
        placeholder={`Search ${totalRows} records...`}
        className="pl-10 pr-4 py-2 w-full sm:w-72 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            setGlobalFilter('')
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Column Filter Component
function ColumnFilter({ column }) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'select') {
      return Array.from(column.getFacetedUniqueValues().keys()).sort().filter(Boolean)
    }
    return []
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <select
        value={columnFilterValue ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
      >
        <option value="">All</option>
        {sortedUniqueValues.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    )
  }

  if (filterVariant === 'boolean') {
    return (
      <select
        value={columnFilterValue ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value === '' ? undefined : e.target.value === 'true')}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    )
  }

  return (
    <input
      type="text"
      value={columnFilterValue ?? ''}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filter..."
      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
    />
  )
}

// Column Visibility Dropdown
function ColumnVisibilityDropdown({ table }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Columns
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2 max-h-80 overflow-y-auto">
            <div className="px-3 py-2 border-b border-gray-100">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Toggle All
              </label>
            </div>
            {table.getAllLeafColumns().map((column) => (
              <div key={column.id} className="px-3 py-1.5 hover:bg-gray-50">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {column.columnDef.header}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Export Functions
function exportToCSV(data, columns, filename) {
  const headers = columns.map((col) => col.header).join(',')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey]
        const cellValue = value ?? ''
        return `"${String(cellValue).replace(/"/g, '""')}"`
      })
      .join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Main DataTable Component
export default function DataTable({
  data,
  columns,
  loading = false,
  error = null,
  title = 'Data Table',
  subtitle = '',
  exportFilename = 'export',
  enableColumnFilters = true,
  enableRowSelection = false,
  enableExport = true,
  onRowClick,
  emptyMessage = 'No data found',
  actions,
  serverSidePagination = null, // { pageCount, pageIndex, pageSize, onPaginationChange }
  serverSideSort = null, // { sorting, onSortingChange }
  serverSideFilter = null, // { globalFilter, onGlobalFilterChange }
}) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [showColumnFilters, setShowColumnFilters] = useState(false)

  // Always pass a stable pagination state
  const paginationState = serverSidePagination
    ? {
        pageIndex: Number.isFinite(serverSidePagination.pageIndex) ? serverSidePagination.pageIndex : 0,
        pageSize: Number.isFinite(serverSidePagination.pageSize) ? serverSidePagination.pageSize : 20,
      }
    : undefined;

  // Debug: log serverSidePagination and paginationState
  console.log('[DataTable] serverSidePagination:', serverSidePagination);
  console.log('[DataTable] paginationState:', paginationState);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: serverSideSort?.sorting ?? sorting,
      columnFilters,
      globalFilter: serverSideFilter?.globalFilter ?? globalFilter,
      rowSelection,
      columnVisibility,
      ...(paginationState && { pagination: paginationState }),
    },
    onSortingChange: serverSideSort?.onSortingChange ?? setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: serverSideFilter?.onGlobalFilterChange ?? setGlobalFilter,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSideFilter ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: serverSideSort ? undefined : getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    ...(serverSidePagination && {
      pageCount: serverSidePagination.pageCount,
      manualPagination: true,
      onPaginationChange: (...args) => {
        console.log('[DataTable] onPaginationChange called with:', ...args);
        serverSidePagination.onPaginationChange?.(...args);
      },
    }),
    ...(serverSideSort && { manualSorting: true }),
    ...(serverSideFilter && { manualFiltering: true }),
    enableRowSelection,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Error:</span> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Global Search */}
            <GlobalFilter
              globalFilter={serverSideFilter?.globalFilter ?? globalFilter}
              setGlobalFilter={serverSideFilter?.onGlobalFilterChange ?? setGlobalFilter}
              totalRows={serverSidePagination?.totalRows ?? data.length}
            />

            {/* Toggle Column Filters */}
            {enableColumnFilters && (
              <button
                onClick={() => setShowColumnFilters(!showColumnFilters)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  showColumnFilters
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            )}

            {/* Column Visibility */}
            <ColumnVisibilityDropdown table={table} />

            {/* Export */}
            {enableExport && (
              <button
                onClick={() => exportToCSV(data, columns.filter(c => c.accessorKey || c.accessorFn), exportFilename)}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            )}

            {/* Custom Actions */}
            {actions}
          </div>
        </div>

        {/* Selected Rows Info */}
        {enableRowSelection && selectedRows.length > 0 && (
          <div className="mt-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {selectedRows.length} row(s) selected
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: ' ↑',
                                desc: ' ↓',
                              }[header.column.getIsSorted()] ?? ' ↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                {/* Column Filters Row */}
                {showColumnFilters && (
                  <tr key={`${headerGroup.id}-filter`} className="bg-gray-50 border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th key={`${header.id}-filter`} className="px-4 py-2">
                        {header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </th>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              Showing{' '}
              <span className="font-medium">
                {Number.isFinite(table.getState().pagination.pageIndex) && Number.isFinite(table.getState().pagination.pageSize)
                  ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                  : 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Number.isFinite(table.getState().pagination.pageIndex) && Number.isFinite(table.getState().pagination.pageSize)
                  ? Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      serverSidePagination?.totalRows ?? table.getFilteredRowModel().rows.length
                    )
                  : 1}
              </span>{' '}
              of{' '}
              <span className="font-medium">
                {Number.isFinite(serverSidePagination?.totalRows)
                  ? serverSidePagination.totalRows
                  : table.getFilteredRowModel().rows.length}
              </span>{' '}
              results
            </span>

            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-gray-600">Page</span>
              {(() => {
                // Defensive guards for pagination state
                const pagination = table.getState().pagination || {};
                const pageIndex = Number.isFinite(pagination.pageIndex) && pagination.pageIndex >= 0 ? pagination.pageIndex : 0;
                const pageCount = Number.isFinite(table.getPageCount()) && table.getPageCount() > 0 ? table.getPageCount() : 1;
                console.log('[DataTable] Pagination UI: pageIndex', pageIndex, 'pageCount', pageCount, 'pagination', pagination);
                return <>
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      table.setPageIndex(page)
                    }}
                    className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">of {pageCount}</span>
                </>;
              })()}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
