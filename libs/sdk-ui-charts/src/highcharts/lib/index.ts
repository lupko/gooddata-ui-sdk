// (C) 2019-2021 GoodData Corporation
// Have only one entrypoint to highcharts and drill module
// Import this reexported variable in other files instead of direct import from highcharts
import Highcharts, {
    SeriesAreaDataOptions,
    SeriesArearangeDataOptions,
    SeriesAreasplineDataOptions,
    SeriesAreasplinerangeDataOptions,
    SeriesBarDataOptions,
    SeriesBoxplotDataOptions,
    SeriesBubbleDataOptions,
    SeriesBulletDataOptions,
    SeriesCandlestickDataOptions,
    SeriesColumnDataOptions,
    SeriesColumnpyramidDataOptions,
    SeriesColumnrangeDataOptions,
    SeriesCylinderDataOptions,
    SeriesDependencywheelDataOptions,
    SeriesErrorbarDataOptions,
    SeriesFlagsDataOptions,
    SeriesFunnel3dDataOptions,
    SeriesFunnelDataOptions,
    SeriesGanttDataOptions,
    SeriesGaugeDataOptions,
    SeriesHeatmapDataOptions,
    SeriesHistogramDataOptions,
    SeriesItemDataOptions,
    SeriesLineDataOptions,
    SeriesMapbubbleDataOptions,
    SeriesMapDataOptions,
    SeriesMaplineDataOptions,
    SeriesMapOptions,
    SeriesMappointDataOptions,
    SeriesNetworkgraphDataOptions,
    SeriesOhlcDataOptions,
    SeriesOrganizationDataOptions,
    SeriesPackedbubbleDataOptions,
    SeriesParetoDataOptions,
    SeriesPieDataOptions,
    SeriesPolygonDataOptions,
    SeriesPyramid3dDataOptions,
    SeriesPyramidDataOptions,
    SeriesSankeyDataOptions,
    SeriesScatter3dDataOptions,
    SeriesScatterDataOptions,
    SeriesSolidgaugeDataOptions,
    SeriesSplineDataOptions,
    SeriesStreamgraphDataOptions,
    SeriesSunburstDataOptions,
    SeriesTilemapDataOptions,
    SeriesTimelineOptions,
    SeriesTreemapDataOptions,
    SeriesVariablepieDataOptions,
    SeriesVariwideDataOptions,
    SeriesVectorDataOptions,
    SeriesVennDataOptions,
    SeriesWaterfallDataOptions,
    SeriesWindbarbDataOptions,
    SeriesWordcloudDataOptions,
    SeriesXrangeDataOptions,
} from "highcharts";

export type HTMLDOMElement = Highcharts.HTMLDOMElement;
export type SVGDOMElement = Highcharts.SVGDOMElement;
export type SVGAttributes = Highcharts.SVGAttributes;
export type StackItemObject = Highcharts.StackItemObject;
export type DataLabelsOptionsObject = Highcharts.DataLabelsOptions;
export type ColorAxisOptions = Highcharts.ColorAxisOptions;
export type HighchartsOptions = Highcharts.Options;
export type YAxisOptions = Highcharts.YAxisOptions;
export type XAxisOptions = Highcharts.XAxisOptions;
export type HighchartsResponsiveOptions = Highcharts.ResponsiveOptions;
export type SeriesPieOptions = Highcharts.SeriesPieOptions;
export type SeriesAreaOptions = Highcharts.SeriesAreaOptions;
export type SeriesBubbleOptions = Highcharts.SeriesBubbleOptions;
export type SeriesLineOptions = Highcharts.SeriesLineOptions;
export type TooltipPositionerPointObject = Highcharts.TooltipPositionerPointObject;
export type PointOptionsObject = Highcharts.PointOptionsObject;

/**
 * This is missing in highcharts typings.
 *
 * @internal
 */
export type ChartDataOptions =
    | SeriesAreaDataOptions
    | SeriesArearangeDataOptions
    | SeriesAreasplineDataOptions
    | SeriesAreasplinerangeDataOptions
    | SeriesBarDataOptions
    | SeriesBoxplotDataOptions
    | SeriesBubbleDataOptions
    | SeriesBulletDataOptions
    | SeriesCandlestickDataOptions
    | SeriesColumnDataOptions
    | SeriesColumnpyramidDataOptions
    | SeriesColumnrangeDataOptions
    | SeriesCylinderDataOptions
    | SeriesDependencywheelDataOptions
    | SeriesErrorbarDataOptions
    | SeriesFlagsDataOptions
    | SeriesFunnel3dDataOptions
    | SeriesFunnelDataOptions
    | SeriesGanttDataOptions
    | SeriesGaugeDataOptions
    | SeriesHeatmapDataOptions
    | SeriesHistogramDataOptions
    | SeriesItemDataOptions
    | SeriesLineDataOptions
    | SeriesMapbubbleDataOptions
    | SeriesMapDataOptions
    | SeriesMaplineDataOptions
    | SeriesMapOptions
    | SeriesMappointDataOptions
    | SeriesNetworkgraphDataOptions
    | SeriesOhlcDataOptions
    | SeriesOrganizationDataOptions
    | SeriesPackedbubbleDataOptions
    | SeriesParetoDataOptions
    | SeriesPieDataOptions
    | SeriesPolygonDataOptions
    | SeriesPyramid3dDataOptions
    | SeriesPyramidDataOptions
    | SeriesSankeyDataOptions
    | SeriesScatter3dDataOptions
    | SeriesScatterDataOptions
    | SeriesSolidgaugeDataOptions
    | SeriesSplineDataOptions
    | SeriesStreamgraphDataOptions
    | SeriesSunburstDataOptions
    | SeriesTilemapDataOptions
    | SeriesTimelineOptions
    | SeriesTreemapDataOptions
    | SeriesVariablepieDataOptions
    | SeriesVariwideDataOptions
    | SeriesVectorDataOptions
    | SeriesVennDataOptions
    | SeriesWaterfallDataOptions
    | SeriesWindbarbDataOptions
    | SeriesWordcloudDataOptions
    | SeriesXrangeDataOptions;


export default Highcharts;
