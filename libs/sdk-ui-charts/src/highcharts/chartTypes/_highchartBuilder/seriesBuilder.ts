// (C) 2007-2020 GoodData Corporation
import Highcharts, { ChartDataOptions } from "../../lib";
import { DataPoint, DataViewFacade, IDataSeries, IDataSlice } from "@gooddata/sdk-ui";
import { SeriesBarDataOptions, SeriesBarOptions } from "highcharts";
import { IDataView } from "@gooddata/sdk-backend-spi";

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
    TData extends IDataSeries | IDataSlice,
    TSeries extends Highcharts.SeriesOptionsType
> = (idx: number, data: TData, input: TSeries) => TSeries | undefined;

/**
 * Highcharts data point modification is a function which the series will call for each data point that makes
 * it into highchart series.
 *
 * The function may mutate existing data point, create a copy and modify that, or return 'undefined' which
 * signals to the builder that the data point should be discarded and not included in the series.
 */
export type HighchartDataPointModification<T extends ChartDataOptions> = (
    seriesId: number,
    idx: number,
    dp: DataPoint,
    input: T,
) => T | undefined;

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
 * 3.  If the `data` prop of highchart series instance is not set, the builder will then iterate all data points in the
 *     of the currently processed data series or slice. The builder will create a new empty data point instance and then
 *     pass this through a chain of data point modification functions. These populate data point as necessary.
 *
 *     For convenience, if data point modification returns undefined, the builder will not include the data point into
 *     the series.
 *
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

    private createAndPopulate<TInput extends IDataSeries | IDataSlice>(
        seriesIdx: number,
        from: TInput,
        modifications: Array<HighchartSeriesModification<TInput, TSeries>>,
    ): TSeries | undefined {
        let newSeries: TSeries | undefined = this.seriesFactory();

        for (const mod of modifications) {
            newSeries = mod(seriesIdx, from, newSeries);

            if (newSeries === undefined) {
                break;
            }
        }

        if (newSeries === undefined) {
            return;
        }

        if (newSeries.data === undefined) {
            let dpIdx = 0;
            newSeries.data = [];

            for (const dp of from.dataPoints()) {
                let newDatapoint: TData | undefined = this.dataPointFactory();

                for (const mod of this.dataPointModifications) {
                    newDatapoint = mod(seriesIdx, dpIdx, dp, newDatapoint);

                    if (newDatapoint === undefined) {
                        break;
                    }
                }

                dpIdx++;

                if (newDatapoint === undefined) {
                    continue;
                }

                newSeries.data.push(newDatapoint);
            }
        }

        return newSeries;
    }

    public populateFromDataSeries(
        ...modifications: Array<HighchartSeriesModification<IDataSeries, TSeries>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        let idx = 0;
        for (const series of this.dv.data().series()) {
            const newSeries: TSeries | undefined = this.createAndPopulate<IDataSeries>(
                idx,
                series,
                modifications,
            );

            if (newSeries !== undefined) {
                this.series.push(newSeries);
            }

            idx++;
        }

        return this;
    }

    public populateFromDataSlices(
        ...modifications: Array<HighchartSeriesModification<IDataSlice, TSeries>>
    ): HighchartsSeriesBuilder<TSeries, TData> {
        let idx = 0;
        for (const slice of this.dv.data().slices()) {
            const newSeries: TSeries | undefined = this.createAndPopulate<IDataSlice>(
                idx,
                slice,
                modifications,
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

const barSeriesFactory = (): SeriesBarOptions => ({ type: "bar" });
const barDatapoint = (): SeriesBarDataOptions => ({});

/**
 * Creates new builder for `bar` series.
 *
 * @param dataView - data to work with
 * @constructor
 */
export const BarSeriesBuilder = (
    dataView: IDataView,
): HighchartsSeriesBuilder<SeriesBarOptions, SeriesBarDataOptions> =>
    new HighchartsSeriesBuilder(barSeriesFactory, barDatapoint, DataViewFacade.for(dataView));
