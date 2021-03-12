// (C) 2007-2021 GoodData Corporation
import { TableDescriptor } from "./structure/tableDescriptor";
import { IDataView, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    createExportFunction,
    DataViewFacade,
    IAvailableDrillTargets,
    IExportFunction,
} from "@gooddata/sdk-ui";
import {
    AUTO_SIZED_MAX_WIDTH,
    autoresizeAllColumns,
    getAutoResizedColumns,
    isColumnAutoResized,
    MANUALLY_SIZED_MAX_WIDTH,
    resetColumnsWidthToDefault,
    resizeAllMeasuresColumns,
    ResizedColumnsStore,
    resizeWeakMeasureColumns,
    syncSuppressSizeToFitOnColumns,
    updateColumnDefinitionsWithWidths,
} from "./resizing/columnSizing";
import { IResizedColumns, UIClick } from "../columnWidths";
import { AgGridDatasource, createAgGridDatasource } from "./data/dataSource";
import { Column, ColumnApi, GridApi } from "@ag-grid-community/all-modules";
import { defFingerprint, ISortItem } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { IntlShape } from "react-intl";
import { fixEmptyHeaderItems } from "@gooddata/sdk-ui-vis-commons";
import { setColumnMaxWidth, setColumnMaxWidthIf } from "./base/agColumnWrapper";
import { agColIds, isMeasureColumn } from "./base/agUtils";
import { agColId } from "./structure/tableDescriptorTypes";
import { sleep } from "./utils";
import { DEFAULT_AUTOSIZE_PADDING, DEFAULT_ROW_HEIGHT } from "./base/constants";
import { getAvailableDrillTargets } from "./drilling/drillTargets";
import { IGroupingProvider } from "./data/rowGroupingProvider";
import sumBy from "lodash/sumBy";
import ApiWrapper from "./base/agApiWrapper";
import {
    initializeStickyRow,
    stickyRowExists,
    updateStickyRowContentClassesAndData,
    updateStickyRowPosition,
} from "./stickyRowHandler";
import {
    ColumnResizingConfig,
    StickyRowConfig,
    TableDataCallbacks,
    TableConfigAccessors,
} from "./privateTypes";
import { ICorePivotTableProps } from "../publicTypes";

const HEADER_CELL_BORDER = 1;
const COLUMN_RESIZE_TIMEOUT = 300;

export class TableFacade {
    private readonly intl: IntlShape;

    public readonly tableDescriptor: TableDescriptor;
    private readonly resizedColumnsStore: ResizedColumnsStore;

    /**
     * When user changes sorts or totals by interacting with the table, the current execution result will
     * be transformed to include these new properties. The transformation creates a new prepared execution
     * which the data source will drive to obtain the new data.
     *
     * This field is set as soon as the new transformed execution gets created and will live until either
     * the execution fails or a first page of the data is sent to ag-grid to render.
     *
     * In all other cases this field be undefined.
     *
     * @private
     */
    private transformedExecution: IPreparedExecution | undefined;
    private currentResult: IExecutionResult;
    private visibleData: DataViewFacade;
    private currentFingerprint: string;

    private autoResizedColumns: IResizedColumns;
    private growToFittedColumns: IResizedColumns;
    private resizing: boolean;
    private numberOfColumnResizedCalls: number;
    private agGridDataSource: AgGridDatasource;

    /**
     * GridApi is set in the finishInitialization and cleared up in destroy. This is intentional, the code in the
     * facade and in the components below must be ready that api is not available and must short-circuit. It is
     * especially important to prevent racy-errors in async actions that may be triggered on the facade _after_
     * the table is re-rendered and the gridApi is for a destructed table.
     *
     * Note: see gridApiGuard. Always use the guard to access the GridApi. Never access the field directly.
     *
     * @private
     */
    private gridApi: GridApi | undefined;

    /**
     * Lifecycle of this field is tied to gridApi. If the gridApiGuard returns an API, then it is for sure
     * that the columnApi is also defined.
     * @private
     */
    private columnApi: ColumnApi | undefined;
    private destroyed: boolean = false;

    private onPageLoadedCallback: ((dv: DataViewFacade, newResult: boolean) => void) | undefined;

    constructor(
        result: IExecutionResult,
        dataView: IDataView,
        tableMethods: TableDataCallbacks & TableConfigAccessors,
        props: Readonly<ICorePivotTableProps>,
    ) {
        this.intl = props.intl;

        this.currentResult = result;
        this.fixEmptyHeaders(dataView);
        this.visibleData = DataViewFacade.for(dataView);
        this.currentFingerprint = defFingerprint(this.currentResult.definition);
        this.tableDescriptor = TableDescriptor.for(this.visibleData);

        this.autoResizedColumns = {};
        this.growToFittedColumns = {};
        this.resizing = false;
        this.resizedColumnsStore = new ResizedColumnsStore(this.tableDescriptor);
        this.numberOfColumnResizedCalls = 0;

        this.agGridDataSource = this.createDataSource(tableMethods);
        this.updateColumnWidths(tableMethods.getResizingConfig());
    }

    public finishInitialization = (gridApi: GridApi, columnApi: ColumnApi): void => {
        invariant(this.gridApi === undefined);
        invariant(this.agGridDataSource);

        this.gridApi = gridApi;
        this.columnApi = columnApi;
        this.gridApi.setDatasource(this.agGridDataSource);
    };

    public refreshData = (): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        // make ag-grid refresh data
        // see: https://www.ag-grid.com/javascript-grid-infinite-scrolling/#changing-the-datasource
        gridApi.setDatasource(this.agGridDataSource);
    };

    /**
     * Destroys the facade; this must do any essential cleanup of the resources and state so as to ensure
     * that any asynchronous processing that may be connected to this facade will be muted.
     *
     * This is essential to prevent this error from happening: https://github.com/ag-grid/ag-grid/issues/3334
     *
     * The error (while manifesting in ag-grid) is related to operating with a gridApi that is not connected
     * to a currently rendered table. Various errors occur in ag-grid but those are all symptoms of working
     * with a zombie.
     *
     * As is, destroy will clean up all references to gridApi & column api, so that no code that already relies
     * on their existence gets short-circuited.
     */
    public destroy = (): void => {
        // in spirit of cleaning up the table & the old state, facade should call destroy() on
        // the gridApi. The table never did that so i'm not going to temp the 'luck' at the moment
        this.gridApi = undefined;
        this.columnApi = undefined;
        this.destroyed = true;
    };

    public isFullyInitialized = (): boolean => {
        return this.gridApi !== undefined;
    };

    /**
     * Tests whether the table's data source is currently undergoing transformation & data loading. This will
     * be return true when for instance sorts or totals change and the table's data source drives new execution
     * with the updated sorts or totals.
     */
    public isTransforming = (): boolean => {
        return this.transformedExecution !== undefined;
    };

    public clearFittedColumns = (): void => {
        this.growToFittedColumns = {};
    };

    /**
     * All functions in the entire table should use this gridApiGuard to access an instance of ag-grid's GridApi.
     *
     * If the table facade is destroyed, the guard always returns false and emits a debug log. Otherwise it just
     * returns the current value of gridApi field.
     */
    private gridApiGuard = (): GridApi | undefined => {
        if (!this.destroyed) {
            return this.gridApi;
        }

        // eslint-disable-next-line no-console
        console.debug("Attempting to obtain gridApi for a destructed table.");
        return undefined;
    };

    private updateColumnWidths = (resizingConfig: ColumnResizingConfig): void => {
        this.resizedColumnsStore.updateColumnWidths(resizingConfig.widths);

        updateColumnDefinitionsWithWidths(
            this.tableDescriptor,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            resizingConfig.defaultWidth,
            resizingConfig.growToFit,
            this.growToFittedColumns,
        );
    };

    private createDataSource = (
        tableMethods: TableDataCallbacks & TableConfigAccessors,
    ): AgGridDatasource => {
        this.onPageLoadedCallback = tableMethods.onPageLoaded;

        const dataSource = createAgGridDatasource(
            {
                tableDescriptor: this.tableDescriptor,
                getGroupRows: tableMethods.getGroupRows,
                getColumnTotals: tableMethods.getColumnTotals,
                onPageLoaded: this.onPageLoaded,
                onExecutionTransformed: this.onExecutionTransformed,
                onTransformedExecutionFailed: this.onTransformedExecutionFailed,
                dataViewTransform: (dataView) => {
                    this.fixEmptyHeaders(dataView);
                    return dataView;
                },
            },
            this.visibleData,
            this.gridApiGuard,
            this.intl,
        );

        return dataSource;
    };

    private onExecutionTransformed = (newExecution: IPreparedExecution): void => {
        // eslint-disable-next-line no-console
        console.debug("onExecutionTransformed", newExecution.definition);
        this.transformedExecution = newExecution;
    };

    private onTransformedExecutionFailed = (): void => {
        this.transformedExecution = undefined;
    };

    private onPageLoaded = (dv: DataViewFacade): void => {
        const oldResult = this.currentResult;
        this.transformedExecution = undefined;
        this.currentResult = dv.result();
        this.visibleData = dv;
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        this.onPageLoadedCallback?.(dv, !oldResult?.equals(this.currentResult));
    };

    public createExportFunction = (title: string | undefined): IExportFunction => {
        return createExportFunction(this.currentResult, title);
    };

    public getAvailableDrillTargets = (): IAvailableDrillTargets => {
        return getAvailableDrillTargets(this.visibleData);
    };

    public refreshHeader = (): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        gridApi.refreshHeader();
    };

    public growToFit = (resizingConfig: ColumnResizingConfig): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        invariant(this.columnApi);

        const columns = this.columnApi.getAllColumns();
        this.resetColumnsWidthToDefault(resizingConfig, columns);
        this.clearFittedColumns();

        const widths = columns.map((column) => column.getActualWidth());
        const sumOfWidths = widths.reduce((a, b) => a + b, 0);

        if (sumOfWidths < resizingConfig.clientWidth) {
            const columnIds = agColIds(columns);

            setColumnMaxWidth(this.columnApi, columnIds, undefined);
            gridApi.sizeColumnsToFit();
            setColumnMaxWidthIf(
                this.columnApi,
                columnIds,
                MANUALLY_SIZED_MAX_WIDTH,
                (column: Column) => column.getActualWidth() <= MANUALLY_SIZED_MAX_WIDTH,
            );
            this.setFittedColumns();
        }
    };

    private fixEmptyHeaders = (dataView: IDataView): void => {
        fixEmptyHeaderItems(dataView, `(${this.intl.formatMessage({ id: "visualization.emptyValue" })})`);
    };

    private setFittedColumns = () => {
        invariant(this.columnApi);

        const columns = this.columnApi.getAllColumns();

        columns.forEach((col) => {
            const id = agColId(col);

            this.growToFittedColumns[id] = {
                width: col.getActualWidth(),
            };
        });
    };

    public resetColumnsWidthToDefault = (resizingConfig: ColumnResizingConfig, columns: Column[]): void => {
        invariant(this.columnApi);

        resetColumnsWidthToDefault(
            this.columnApi,
            columns,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            resizingConfig.defaultWidth,
        );
    };

    public applyColumnSizes = (resizingConfig: ColumnResizingConfig): void => {
        invariant(this.columnApi);

        this.resizedColumnsStore.updateColumnWidths(resizingConfig.widths);

        syncSuppressSizeToFitOnColumns(this.resizedColumnsStore, this.columnApi);

        if (resizingConfig.growToFit) {
            this.growToFit(resizingConfig); // calls resetColumnsWidthToDefault internally too
        } else {
            const columns = this.columnApi.getAllColumns();
            this.resetColumnsWidthToDefault(resizingConfig, columns);
        }
    };

    public autoresizeColumns = async (
        resizingConfig: ColumnResizingConfig,
        force: boolean = false,
    ): Promise<boolean> => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return false;
        }

        invariant(this.columnApi);

        if (this.resizing && !force) {
            return false;
        }

        const alreadyResized = () => this.resizing;

        if (this.isPivotTableReady() && (!alreadyResized() || (alreadyResized() && force))) {
            this.resizing = true;
            // we need to know autosize width for each column, even manually resized ones, to support removal of columnWidth def from props
            await this.autoresizeAllColumns(resizingConfig);

            // after that we need to reset manually resized columns back to its manually set width by growToFit or by helper. See UT resetColumnsWidthToDefault for width priorities
            if (resizingConfig.growToFit) {
                this.growToFit(resizingConfig);
            } else if (resizingConfig.columnAutoresizeEnabled && this.shouldPerformAutoresize()) {
                const columns = this.columnApi!.getAllColumns();
                this.resetColumnsWidthToDefault(resizingConfig, columns);
            }
            this.resizing = false;

            return true;
        }

        return false;
    };

    private autoresizeAllColumns = async (resizingConfig: ColumnResizingConfig) => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        invariant(this.columnApi);

        if (!this.shouldPerformAutoresize() || !resizingConfig.columnAutoresizeEnabled) {
            return Promise.resolve();
        }

        await sleep(COLUMN_RESIZE_TIMEOUT);

        /*
         * Ensures correct autoResizeColumns
         */
        this.updateAutoResizedColumns(resizingConfig);
        autoresizeAllColumns(this.columnApi, this.autoResizedColumns);
    };

    private updateAutoResizedColumns = (resizingConfig: ColumnResizingConfig): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        invariant(this.columnApi);
        invariant(resizingConfig.containerRef);

        this.autoResizedColumns = getAutoResizedColumns(
            this.tableDescriptor,
            gridApi,
            this.columnApi,
            this.currentResult,
            resizingConfig.containerRef,
            {
                measureHeaders: true,
                padding: 2 * DEFAULT_AUTOSIZE_PADDING + HEADER_CELL_BORDER,
                separators: resizingConfig.separators,
            },
        );
    };

    public isPivotTableReady = (): boolean => {
        if (!this.gridApi || this.destroyed) {
            return false;
        }

        const api = this.gridApi;

        const noRowHeadersOrRows = () => {
            return Boolean(
                this.visibleData.rawData().isEmpty() && this.visibleData.meta().hasNoHeadersInDim(0),
            );
        };
        const dataRendered = () => {
            return noRowHeadersOrRows() || api.getRenderedNodes().length > 0;
        };
        const tablePagesLoaded = () => {
            const pages = api.getCacheBlockState();
            return (
                pages &&
                Object.keys(pages).every(
                    (pageId: string) =>
                        pages[pageId].pageStatus === "loaded" || pages[pageId].pageStatus === "failed",
                )
            );
        };

        return tablePagesLoaded() && dataRendered();
    };

    private shouldPerformAutoresize = (): boolean => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return false;
        }

        const horizontalPixelRange = gridApi.getHorizontalPixelRange();
        const verticalPixelRange = gridApi.getVerticalPixelRange();

        return horizontalPixelRange.left === 0 && verticalPixelRange.top === 0;
    };

    private isColumnAutoResized = (resizedColumnId: string) => {
        return isColumnAutoResized(this.autoResizedColumns, resizedColumnId);
    };

    public resetResizedColumn = async (column: Column): Promise<void> => {
        if (!this.tableDescriptor) {
            return;
        }

        const id = agColId(column);

        if (this.resizedColumnsStore.isColumnManuallyResized(column)) {
            this.resizedColumnsStore.removeFromManuallyResizedColumn(column);
        }

        column.getColDef().suppressSizeToFit = false;

        if (this.isColumnAutoResized(id)) {
            this.columnApi?.setColumnWidth(column, this.autoResizedColumns[id].width);
            return;
        }

        this.autoresizeColumnsByColumnId(this.columnApi!, agColIds([column]));
        this.resizedColumnsStore.addToManuallyResizedColumn(column, true);
    };

    private autoresizeColumnsByColumnId = (columnApi: ColumnApi, columnIds: string[]) => {
        setColumnMaxWidth(columnApi, columnIds, AUTO_SIZED_MAX_WIDTH);

        columnApi.autoSizeColumns(columnIds);

        setColumnMaxWidth(columnApi, columnIds, MANUALLY_SIZED_MAX_WIDTH);
    };

    public onColumnsManualReset = async (
        resizingConfig: ColumnResizingConfig,
        columns: Column[],
    ): Promise<void> => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        invariant(this.columnApi);

        let columnsToReset = columns;

        /*
         * Ensures that all columns have the correct width to use during column reset
         * resetResizedColumn uses updateAutoResizedColumns to properly reset columns
         */
        if (!Object.keys(this.autoResizedColumns).length) {
            this.updateAutoResizedColumns(resizingConfig);
        }

        if (this.isAllMeasureResizeOperation(resizingConfig, columns)) {
            this.resizedColumnsStore.removeAllMeasureColumns();
            columnsToReset = this.getAllMeasureColumns();
        }

        if (this.isWeakMeasureResizeOperation(resizingConfig, columns)) {
            columnsToReset = this.resizedColumnsStore.getMatchingColumnsByMeasure(
                columns[0],
                this.getAllMeasureColumns(),
            );
            this.resizedColumnsStore.removeWeakMeasureColumn(columns[0]);
        }

        for (const column of columnsToReset) {
            await this.resetResizedColumn(column);
        }

        this.afterOnResizeColumns(resizingConfig);
    };

    private getAllMeasureColumns = () => {
        invariant(this.columnApi);
        return this.columnApi.getAllColumns().filter((col) => isMeasureColumn(col));
    };

    private isAllMeasureResizeOperation(resizingConfig: ColumnResizingConfig, columns: Column[]): boolean {
        return resizingConfig.isMetaOrCtrlKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    private isWeakMeasureResizeOperation(resizingConfig: ColumnResizingConfig, columns: Column[]): boolean {
        return resizingConfig.isAltKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    public onColumnsManualResized = (resizingConfig: ColumnResizingConfig, columns: Column[]): void => {
        if (this.isAllMeasureResizeOperation(resizingConfig, columns)) {
            resizeAllMeasuresColumns(this.columnApi!, this.resizedColumnsStore, columns[0]);
        } else if (this.isWeakMeasureResizeOperation(resizingConfig, columns)) {
            resizeWeakMeasureColumns(
                this.tableDescriptor!,
                this.columnApi!,
                this.resizedColumnsStore,
                columns[0],
            );
        } else {
            columns.forEach((column) => {
                this.resizedColumnsStore.addToManuallyResizedColumn(column);
            });
        }

        this.afterOnResizeColumns(resizingConfig);
    };

    public onManualColumnResize = async (
        resizingConfig: ColumnResizingConfig,
        columns: Column[],
    ): Promise<void> => {
        this.numberOfColumnResizedCalls++;
        await sleep(COLUMN_RESIZE_TIMEOUT);

        if (this.numberOfColumnResizedCalls === UIClick.DOUBLE_CLICK) {
            this.numberOfColumnResizedCalls = 0;
            await this.onColumnsManualReset(resizingConfig, columns);
        } else if (this.numberOfColumnResizedCalls === UIClick.CLICK) {
            this.numberOfColumnResizedCalls = 0;
            this.onColumnsManualResized(resizingConfig, columns);
        }
    };

    private afterOnResizeColumns = (resizingConfig: ColumnResizingConfig) => {
        this.growToFit(resizingConfig);
        const columnWidths = this.resizedColumnsStore.getColumnWidthsFromMap();

        resizingConfig.onColumnResized?.(columnWidths);
    };

    public getGroupingProvider = (): IGroupingProvider => {
        invariant(this.agGridDataSource);

        return this.agGridDataSource.getGroupingProvider();
    };

    public createSortItems = (columns: Column[]): ISortItem[] => {
        return this.tableDescriptor.createSortItems(columns, this.currentResult.definition.sortBy);
    };

    /**
     * Tests whether the provided prepared execution matches the execution that is used to obtain data for this
     * table facade.
     *
     * This is slightly trickier as it needs to accommodate for situations where the underlying execution
     * is being transformed to include new server side sorts / totals. If that operation is in progress, then
     * the transformedExecution will be defined. The code should only compare against this 'soon to be next'
     * execution. This is essential to 'sink' any unneeded full reinits that may happen in some contexts (such as AD)
     * which also listen to sort/total changes and prepare execution for the table from outside. Since
     * the transformation is already in progress, there is no point to reacting to these external stimuli.
     *
     * If the transformation is not happening, then the table is showing data for an existing execution result - in that
     * case the matching goes against the definition backing that result.
     *
     * @param other
     */
    public isMatchingExecution(other: IPreparedExecution): boolean {
        if (this.transformedExecution) {
            const matchingTransformed = this.transformedExecution.fingerprint() === other.fingerprint();

            if (!matchingTransformed) {
                // eslint-disable-next-line no-console
                console.debug(
                    "transformed execution does not match",
                    this.transformedExecution.definition,
                    other.definition,
                );
            }

            return matchingTransformed;
        }

        const matchingCurrentlyRendered = this.currentFingerprint === other.fingerprint();

        if (!matchingCurrentlyRendered) {
            // eslint-disable-next-line no-console
            console.debug("current result does not match", this.currentResult.definition, other.definition);
        }

        return matchingCurrentlyRendered;
    }

    public getTotalBodyHeight = (): number => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return 0;
        }

        const dv = this.visibleData;
        const aggregationCount = sumBy(dv.rawData().totals(), (total) => total.length);
        const rowCount = dv.rawData().firstDimSize();

        const headerHeight = ApiWrapper.getHeaderHeight(gridApi);

        // add small room for error to avoid scrollbars that scroll one, two pixels
        // increased in order to resolve issue BB-1509
        const leeway = 2;

        const bodyHeight = rowCount * DEFAULT_ROW_HEIGHT + leeway;
        const footerHeight = aggregationCount * DEFAULT_ROW_HEIGHT;

        return headerHeight + bodyHeight + footerHeight;
    };

    public updateStickyRowContent = (stickyCtx: StickyRowConfig): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        updateStickyRowContentClassesAndData(
            stickyCtx.scrollPosition,
            stickyCtx.lastScrollPosition,
            DEFAULT_ROW_HEIGHT,
            gridApi,
            this.getGroupingProvider(),
            ApiWrapper,
        );
    };

    public updateStickyRowPosition = (): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        updateStickyRowPosition(gridApi);
    };

    public initializeStickyRow = (): void => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return;
        }

        initializeStickyRow(gridApi);
    };

    public stickyRowExists = (): boolean => {
        const gridApi = this.gridApiGuard();

        if (!gridApi) {
            return false;
        }

        return stickyRowExists(gridApi);
    };

    public getRowCount = (): number => {
        return this.visibleData.rawData().firstDimSize();
    };

    public getDrillDataContext = (): DataViewFacade => {
        return this.visibleData;
    };

    public isResizing = (): boolean => {
        return this.resizing;
    };
}
