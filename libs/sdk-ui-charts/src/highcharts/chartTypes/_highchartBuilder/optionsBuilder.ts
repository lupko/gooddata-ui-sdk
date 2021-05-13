// (C) 2007-2021 GoodData Corporation
import Highcharts, { HighchartsOptions } from "../../lib";
import merge from "lodash/merge";

export class HighchartsOptionsBuilder {
    private readonly ho: HighchartsOptions;

    private constructor(initialOptions: HighchartsOptions) {
        this.ho = initialOptions;
    }

    /**
     * Creates new instance of builder initialized from the base template optionally merged with additional
     * partials.
     *
     * @param baseTemplate - base template to build on top of
     * @param partials - additional partials to merge on top of the base, optional
     */
    public static from(
        baseTemplate: HighchartsOptions,
        ...partials: Array<Partial<HighchartsOptions>>
    ): HighchartsOptionsBuilder {
        const initialOptions: HighchartsOptions = merge({}, baseTemplate, ...(partials ?? []));

        return new HighchartsOptionsBuilder(initialOptions);
    }

    public setSeries(series: Array<Highcharts.SeriesOptionsType>): HighchartsOptionsBuilder {
        this.ho.series = series;

        return this;
    }

    public addSeries(series: Array<Highcharts.SeriesOptionsType>): HighchartsOptionsBuilder {
        if (!this.ho.series) {
            return this.setSeries(series);
        }

        this.ho.series.push(...series);

        return this;
    }

    public build(): HighchartsOptions {
        return this.ho;
    }
}
