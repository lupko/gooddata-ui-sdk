// (C) 2007-2021 GoodData Corporation
import Highcharts from "../../lib";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { HighchartsSeriesBuilder } from "./seriesBuilder";

const barSeriesFactory = (): Highcharts.SeriesBarOptions => ({ type: "bar" });
const barDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `bar` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const BarSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesBarOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(barSeriesFactory, barDatapoint, dv);

const columnSeriesFactory = (): Highcharts.SeriesColumnOptions => ({ type: "column" });
const columnDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `column` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const ColumnSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesColumnOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(columnSeriesFactory, columnDatapoint, dv);

const bubbleSeriesFactory = (): Highcharts.SeriesBubbleOptions => ({ type: "bubble" });
const bubbleDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `bubble` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const BubbleSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesBubbleOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(bubbleSeriesFactory, bubbleDatapoint, dv);

const bulletSeriesFactory = (): Highcharts.SeriesBulletOptions => ({ type: "bullet" });
const bulletDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `bullet` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const BulletSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesBulletOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(bulletSeriesFactory, bulletDatapoint, dv);

const funnelSeriesFactory = (): Highcharts.SeriesFunnelOptions => ({ type: "funnel" });
const funnelDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `funnel` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const FunnelSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesFunnelOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(funnelSeriesFactory, funnelDatapoint, dv);

const heatmapSeriesFactory = (): Highcharts.SeriesHeatmapOptions => ({ type: "heatmap" });
const heatmapDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `heatmap` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const HeatmapSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesHeatmapOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(heatmapSeriesFactory, heatmapDatapoint, dv);

const lineSeriesFactory = (): Highcharts.SeriesLineOptions => ({ type: "line" });
const lineDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `line` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const LineSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesLineOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(lineSeriesFactory, lineDatapoint, dv);

const pieSeriesFactory = (): Highcharts.SeriesPieOptions => ({ type: "pie" });
const pieDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `pie` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const PieSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesPieOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(pieSeriesFactory, pieDatapoint, dv);

const scatterSeriesFactory = (): Highcharts.SeriesScatterOptions => ({ type: "scatter" });
const scatterDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `scatter` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const ScatterSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesScatterOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(scatterSeriesFactory, scatterDatapoint, dv);

const treemapSeriesFactory = (): Highcharts.SeriesTreemapOptions => ({ type: "treemap" });
const treemapDatapoint = (): Highcharts.PointOptionsObject => ({});

/**
 * Creates new builder for `treemap` series.
 *
 * @param dv - data to work with
 * @constructor
 */
export const TreemapSeriesBuilder = (
    dv: DataViewFacade,
): HighchartsSeriesBuilder<Highcharts.SeriesTreemapOptions, Highcharts.PointOptionsObject> =>
    new HighchartsSeriesBuilder(treemapSeriesFactory, treemapDatapoint, dv);
