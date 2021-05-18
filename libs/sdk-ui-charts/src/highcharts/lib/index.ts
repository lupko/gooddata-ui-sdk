// (C) 2019-2021 GoodData Corporation
// Have only one entrypoint to highcharts and drill module
// Import this reexported variable in other files instead of direct import from highcharts
import Highcharts, {
    SeriesMapbubbleDataOptions,
    SeriesMapDataOptions,
    SeriesMappointDataOptions,
    SeriesSankeyPointOptionsObject,
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
    | PointOptionsObject
    | SeriesSankeyPointOptionsObject
    | SeriesMapbubbleDataOptions
    | SeriesMapDataOptions
    | SeriesMappointDataOptions;

export default Highcharts;
