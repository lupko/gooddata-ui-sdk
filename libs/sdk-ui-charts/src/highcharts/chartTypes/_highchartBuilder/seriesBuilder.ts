// (C) 2007-2020 GoodData Corporation
import Highcharts, { ChartDataOptions } from "../../lib";
import { DataPoint, DataViewFacade, IDataSeries, IDataSlice } from "@gooddata/sdk-ui";

type HighchartsSeriesFactory<T extends Highcharts.SeriesOptionsType> = () => T;
type HighchartsDataPointFactory<T extends ChartDataOptions | null> = () => T;

/**
 * Highchart series modifications is a function which the series builder will call for each underlying data series
 * or data slices with the intent to update configuration of the highchart series object.
 *
 * The function may mutate existing series, create a copy and modify that or return 'undefined' which signals
 * to the builder that the highchart series should be discarded and not included in the resulting series array.
 */
export type HighchartSeriesModification<
    TSource extends IDataSeries | IDataSlice,
    TSeries extends Highcharts.SeriesOptionsType
> = (idx: number, data: TSource, input: TSeries) => TSeries | undefined;

/**
 * Highcharts data point modification is a function which the series will call for each data point that makes
 * it into highchart series.
 *
 * The function may mutate existing data point, create a copy and modify that, or return 'undefined' which
 * signals to the builder that the data point should be discarded and not included in the series.
 */
export type HighchartDataPointModification<T extends ChartDataOptions> = (
    seriesIdx: number,
    idx: number,
    dp: DataPoint,
    input: T,
) => T | undefined;

/**
 * Highchart series transformation is called out by the builder to perform transformation of series before
 * data point processing starts and after it finishes.
 */
export type HighchartSeriesTransformation<TSeries extends Highcharts.SeriesOptionsType> = (
    series: TSeries,
) => TSeries | undefined;

/**
 * Complex modifications can be used when the templated data processing requires to maintain state while processing
 * series and its data points. The series builder can be customized with complex modification factories - for each
 * series under construction, the builder will instantiate complex modifications using the factory and call out
 * the different functions during the construction cycle.
 *
 * All functions are optional. If they are not specified, builder will skip them.
 */
export interface HighchartSeriesStatefulMod<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
> {
    /**
     * Modification function to call when builder constructs highchart series from the underlying data series.
     */
    dataSeriesModification?: HighchartSeriesModification<IDataSeries, TSeries>;

    /**
     * Modification function to call when builder constructs highchart series from the underlying data slices.
     */
    dataSlicesModification?: HighchartSeriesModification<IDataSlice, TSeries>;

    /**
     * If the builder drives data point creation, it will call out this transformation function right before
     * it starts creating and applying modifications for the data points. If the function returns undefined, the
     * highchart series will be skipped.
     */
    beforeDataPointProcessing?: HighchartSeriesTransformation<TSeries>;

    /**
     * If the builder drives data point creation, it will use this data point modification function together
     * with the other data point modifications it is set up to use.
     */
    dataPointProcessing?: HighchartDataPointModification<TData>;

    /**
     * If the builder drives data point creation, it will call out this transformation function right after
     * it finishes creating all data points.
     */
    afterDataPointProcessing?: HighchartSeriesTransformation<TSeries>;
}

export type HighchartSeriesStatefulModFactory<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
> = () => HighchartSeriesStatefulMod<TSeries, TData>;

/**
 * Series builder provides an opinionated way for constructing Highchart series from SDK's data view. It uses
 * the DataViewFacade and its data access functions. It then allows to create:
 *
 * -  Highchart series per data series found in the data view
 * -  Highchart series per data slice found in the data view
 *
 * The overall construction algorithm is as follows:
 *
 * 1.  For each data series or data slice, the builder creates an empty highchart series and then delegates its full
 *     construction to a set of modification functions. These can be freely passed in by the caller, allowing the calling
 *     code great flexibility as well as allowing composition of the modification functions.
 *
 *     For convenience, as builder does this processing it will expect that some modification function returns 'undefined' in
 *     which case it will omit the data series entirely.
 *
 * 2.  With the modification functions applied, the builder checks whether the modifications have already created the series
 *     `data` or not.
 *
 * 3.  If the `data` prop of highchart series instance is not set, the builder will drive creation of the data points:
 *     -  Run any 'before' transformations on the series
 *     -  Create highcharts data point and drive it through the modification functions
 *     -  Fun any 'after' transformations on the series
 *
 *     For convenience, if data point modification returns undefined, the builder will not include the data point into
 *     the series. Same is true for the 'before' and 'after' functions. If they return undefined, the entire data
 *     series will be scrapped.
 *
 * The builder supports two general types of modification functions:
 *
 * 1.  Stateless modification functions for series and data points. These receive essential context and the series or
 *     data point to modify
 *
 * 2.  Complex stateful modifications - these are objects that may define one or more modification and transformation
 *     functions for series and data points. They are instantiated per series and can thus track state on per-series &
 *     data point basis.
 *
 * Note: while it is possible and not wrong for the data series modification functions to create the data points as well,
 * it is encouraged not to do that and instead rely on the builder processing and data point modification functions - this
 * should result in a code that's easier to reason about.
 *
 * Note: the builder has two generic parameters: TSeries for specifying type of the highchart series and TData for
 * type of data points used by the series. This is somewhat unfortunate however I fear there's no better way to do this
 * with the current highchart typings (where the data can be three different options, one of them being the complex
 * data point type which we need to use).
 */
export class HighchartsSeriesBuilder<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
> {
    private readonly seriesFactory: HighchartsSeriesFactory<TSeries>;
    private readonly dataPointFactory: HighchartsDataPointFactory<TData>;
    private readonly dv: DataViewFacade;

    private complexModifications: Array<HighchartSeriesStatefulModFactory<TSeries, TData>> = [];
    private dataPointModifications: Array<HighchartDataPointModification<TData>> = [];

    private series: Array<TSeries> = [];

    constructor(
        seriesFactory: HighchartsSeriesFactory<TSeries>,
        dataPointFactory: HighchartsDataPointFactory<TData>,
        dv: DataViewFacade,
    ) {
        this.seriesFactory = seriesFactory;
        this.dataPointFactory = dataPointFactory;
        this.dv = dv;
    }

    /**
     * Customize builder with data point modification functions. These modifications functions will be used
     * if the data series modifications do not populate the data points themselves.
     *
     * @param modifications
     */
    public withDataPointModifications(
        ...modifications: Array<HighchartDataPointModification<TData>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        this.dataPointModifications = modifications ?? [];

        return this;
    }

    /**
     * Customize builder to use more complex and possibly stateful modifications during series and data point creation.
     * Builder will create stateful modifications per series using the provided factories.
     *
     * @param factories factory functions to create stateful mods
     */
    public withStatefulModifications(
        ...factories: Array<HighchartSeriesStatefulModFactory<TSeries, TData>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        this.complexModifications = factories;

        return this;
    }

    private createAndModifySeries<TSource extends IDataSeries | IDataSlice>(
        seriesIdx: number,
        from: TSource,
        modifications: Array<HighchartSeriesModification<TSource, TSeries> | undefined>,
    ): TSeries | undefined {
        let newSeries: TSeries | undefined = this.seriesFactory();

        for (const mod of modifications) {
            if (mod === undefined) {
                continue;
            }

            newSeries = mod(seriesIdx, from, newSeries);

            if (newSeries === undefined) {
                break;
            }
        }

        return newSeries;
    }

    private applyTransformations(
        series: TSeries,
        transformations: Array<HighchartSeriesTransformation<TSeries> | undefined>,
    ): TSeries | undefined {
        let transformed = series;

        for (const transformation of transformations) {
            if (transformation === undefined) {
                continue;
            }

            transformed = transformation(transformed);

            if (transformed === undefined) {
                break;
            }
        }

        return transformed;
    }

    private createDataPoints(
        seriesIdx: number,
        dataPoints: DataPoint[],
        modifications: Array<HighchartDataPointModification<TData> | undefined>,
    ): TData[] {
        let dpIdx = 0;
        const data: TData[] = [];

        for (const dp of dataPoints) {
            let newDatapoint: TData | undefined = this.dataPointFactory();

            for (const mod of modifications) {
                if (mod === undefined) {
                    continue;
                }

                newDatapoint = mod(seriesIdx, dpIdx, dp, newDatapoint);

                if (newDatapoint === undefined) {
                    break;
                }
            }

            dpIdx++;

            if (newDatapoint === undefined) {
                continue;
            }

            data.push(newDatapoint);
        }

        return data;
    }

    private createAndPopulate<TSource extends IDataSeries | IDataSlice>(
        seriesIdx: number,
        from: TSource,
        modifications: Array<HighchartSeriesModification<TSource, TSeries>>,
        complexSeriesModGetter: (
            mod: HighchartSeriesStatefulMod<TSeries, TData>,
        ) => HighchartSeriesModification<TSource, TSeries>,
    ): TSeries | undefined {
        /*
         * Initialize complex modification instances for the series. Then construct complete list of series modification
         * functions.
         */
        const complexModifications = this.complexModifications.map((factory) => factory());
        const seriesModifications = modifications.concat(
            complexModifications.map((c) => complexSeriesModGetter(c)),
        );

        /*
         * Create series and apply all available modification functions. If any modification returns undefined, the series
         * should not be included so bail out.
         */
        let newSeries: TSeries | undefined = this.createAndModifySeries(seriesIdx, from, seriesModifications);
        if (newSeries === undefined) {
            return;
        }

        /*
         * If the series modification functions did not populate data, then perform the templated data point
         * processing.
         */
        if (newSeries.data === undefined) {
            /*
             * Apply before-data-point-processing transformations (if any). Again, these may cancel the whole
             * series if they return 'undefined' so bail out if that happens.
             */
            newSeries = this.applyTransformations(
                newSeries,
                complexModifications.map((c) => c.beforeDataPointProcessing),
            );
            if (newSeries === undefined) {
                return;
            }

            /*
             * Now do the actual data point processing. Data point modifications may be set in the builder and they
             * may come from the complex modifications.
             */
            const allDataPointModifications = this.dataPointModifications.concat(
                complexModifications.map((c) => c.dataPointProcessing),
            );
            newSeries.data = this.createDataPoints(seriesIdx, from.dataPoints(), allDataPointModifications);

            /*
             * Finally perform post-data-point-processing transformations specified in the complex transformations.
             */
            newSeries = this.applyTransformations(
                newSeries,
                complexModifications.map((c) => c.afterDataPointProcessing),
            );
            if (newSeries === undefined) {
                return;
            }
        }

        return newSeries;
    }

    /**
     * Creates highchart series from the underlying data series. The builder will iterate over all data series
     * in the order as they are returned by backend and then apply modification functions which populate the highchart
     * series.
     *
     * The modification functions may or may not set the series data. If they do not, then the builder will further
     * iterate all data points for the underlying data series, create highcharts data point and apply data point
     * modification functions.
     *
     * @remarks see {@link withDataPointModifications}, {@link withStatefulModifications}
     * @param modifications - modifications to apply
     */
    public populateFromDataSeries(
        ...modifications: Array<HighchartSeriesModification<IDataSeries, TSeries>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        let idx = 0;
        for (const series of this.dv.data().series()) {
            const newSeries: TSeries | undefined = this.createAndPopulate<IDataSeries>(
                idx,
                series,
                modifications,
                (c) => c.dataSeriesModification,
            );

            if (newSeries !== undefined) {
                this.series.push(newSeries);
            }

            idx++;
        }

        return this;
    }

    /**
     * Creates highchart series from the underlying data slices. The builder will iterate over all data slices in
     * the order as they are returned by the backend and then apply modification functions which populate
     * the highchart series.
     *
     * The modification functions may or may not set the series data. If they do not, then the builder will further
     * iterate all data points for the underlying data series, create highcharts data point and apply data point
     * modification functions.
     *
     * @remarks see {@link withDataPointModifications}, {@link withStatefulModifications}
     * @param modifications
     */
    public populateFromDataSlices(
        ...modifications: Array<HighchartSeriesModification<IDataSlice, TSeries>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        let idx = 0;
        for (const slice of this.dv.data().slices()) {
            const newSeries: TSeries | undefined = this.createAndPopulate<IDataSlice>(
                idx,
                slice,
                modifications,
                (c) => c.dataSlicesModification,
            );

            if (newSeries !== undefined) {
                this.series.push(newSeries);
            }

            idx++;
        }

        return this;
    }

    public build(): Array<TSeries> {
        return this.series;
    }
}
