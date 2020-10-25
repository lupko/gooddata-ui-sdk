// (C) 2007-2020 GoodData Corporation
import Highcharts from "../../lib";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { HighchartsSeriesBuilder } from "./seriesBuilder";

const barSeriesFactory = (): Highcharts.SeriesBarOptions => ({ type: "bar" });
const barDatapoint = (): Highcharts.SeriesBarDataOptions => ({});

/**
 * Creates new builder for `bar` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const BarSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesBarOptions, Highcharts.SeriesBarDataOptions> =>
    new HighchartsSeriesBuilder(barSeriesFactory, barDatapoint, DataViewFacade.for(dataView));

const columnSeriesFactory = (): Highcharts.SeriesColumnOptions => ({ type: "column" });
const columnDatapoint = (): Highcharts.SeriesColumnDataOptions => ({});

/**
 * Creates new builder for `column` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const ColumnSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesColumnOptions, Highcharts.SeriesColumnDataOptions> =>
    new HighchartsSeriesBuilder(columnSeriesFactory, columnDatapoint, DataViewFacade.for(dataView));

const bubbleSeriesFactory = (): Highcharts.SeriesBubbleOptions => ({ type: "bubble" });
const bubbleDatapoint = (): Highcharts.SeriesBubbleDataOptions => ({});

/**
 * Creates new builder for `bubble` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const BubbleSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesBubbleOptions, Highcharts.SeriesBubbleDataOptions> =>
    new HighchartsSeriesBuilder(bubbleSeriesFactory, bubbleDatapoint, DataViewFacade.for(dataView));

const bulletSeriesFactory = (): Highcharts.SeriesBulletOptions => ({ type: "bullet" });
const bulletDatapoint = (): Highcharts.SeriesBulletDataOptions => ({});

/**
 * Creates new builder for `bullet` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const BulletSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesBulletOptions, Highcharts.SeriesBulletDataOptions> =>
    new HighchartsSeriesBuilder(bulletSeriesFactory, bulletDatapoint, DataViewFacade.for(dataView));

const funnelSeriesFactory = (): Highcharts.SeriesFunnelOptions => ({ type: "funnel" });
const funnelDatapoint = (): Highcharts.SeriesFunnelDataOptions => ({});

/**
 * Creates new builder for `funnel` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const FunnelSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesFunnelOptions, Highcharts.SeriesFunnelDataOptions> =>
    new HighchartsSeriesBuilder(funnelSeriesFactory, funnelDatapoint, DataViewFacade.for(dataView));

const heatmapSeriesFactory = (): Highcharts.SeriesHeatmapOptions => ({ type: "heatmap" });
const heatmapDatapoint = (): Highcharts.SeriesHeatmapDataOptions => ({});

/**
 * Creates new builder for `heatmap` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const HeatmapSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesHeatmapOptions, Highcharts.SeriesHeatmapDataOptions> =>
    new HighchartsSeriesBuilder(heatmapSeriesFactory, heatmapDatapoint, DataViewFacade.for(dataView));

const lineSeriesFactory = (): Highcharts.SeriesLineOptions => ({ type: "line" });
const lineDatapoint = (): Highcharts.SeriesLineDataOptions => ({});

/**
 * Creates new builder for `line` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const LineSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesLineOptions, Highcharts.SeriesLineDataOptions> =>
    new HighchartsSeriesBuilder(lineSeriesFactory, lineDatapoint, DataViewFacade.for(dataView));

const pieSeriesFactory = (): Highcharts.SeriesPieOptions => ({ type: "pie" });
const pieDatapoint = (): Highcharts.SeriesPieDataOptions => ({});

/**
 * Creates new builder for `pie` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const PieSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesPieOptions, Highcharts.SeriesPieDataOptions> =>
    new HighchartsSeriesBuilder(pieSeriesFactory, pieDatapoint, DataViewFacade.for(dataView));

const scatterSeriesFactory = (): Highcharts.SeriesScatterOptions => ({ type: "scatter" });
const scatterDatapoint = (): Highcharts.SeriesScatterDataOptions => ({});

/**
 * Creates new builder for `scatter` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const ScatterSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesScatterOptions, Highcharts.SeriesScatterDataOptions> =>
    new HighchartsSeriesBuilder(scatterSeriesFactory, scatterDatapoint, DataViewFacade.for(dataView));

const treemapSeriesFactory = (): Highcharts.SeriesTreemapOptions => ({ type: "treemap" });
const treemapDatapoint = (): Highcharts.SeriesTreemapDataOptions => ({});

/**
 * Creates new builder for `treemap` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const TreemapSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<Highcharts.SeriesTreemapOptions, Highcharts.SeriesTreemapDataOptions> =>
    new HighchartsSeriesBuilder(treemapSeriesFactory, treemapDatapoint, DataViewFacade.for(dataView));
