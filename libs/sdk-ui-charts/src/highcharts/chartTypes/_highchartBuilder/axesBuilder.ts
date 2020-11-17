// (C) 2007-2020 GoodData Corporation
import Highcharts, { HighchartOptions } from "../../lib";
import { IChartConfig } from "../../../interfaces";
import { identity } from "lodash";

export type HighchartsAxes = {
    xAxis: Array<Highcharts.XAxisOptions>;
    yAxis: Array<Highcharts.YAxisOptions>;
};

export type XAxisModification = (builder: XAxisOptionsBuilder) => XAxisOptionsBuilder;
export type YAxisModification = (builder: YAxisOptionsBuilder) => XAxisOptionsBuilder;

export class AxesBuilder {
    private readonly xAxis: Array<Highcharts.XAxisOptions> = [];
    private readonly yAxis: Array<Highcharts.YAxisOptions> = [];

    private constructor(private readonly config: IChartConfig) {}

    public static usingConfig(config: IChartConfig = {}) {
        return new AxesBuilder(config);
    }

    /**
     * Adds externally constructed X-axes.
     * @param axes
     */
    public addXAxes(...axes: Array<Highcharts.XAxisOptions>): AxesBuilder {
        this.xAxis.push(...axes);

        return this;
    }

    public addYAxes(...axes: Array<Highcharts.YAxisOptions>): AxesBuilder {
        this.yAxis.push(...axes);

        return this;
    }

    public newXAxis(modification: XAxisModification = identity): AxesBuilder {
        const builder = XAxisOptionsBuilder.usingConfig(this.config);
        const newAxis = modification(builder).build();

        this.xAxis.push(newAxis);

        return this;
    }

    public newYAxis(modification: YAxisModification = identity): AxesBuilder {
        const builder = YAxisOptionsBuilder.usingConfig(this.config);
        const newAxis = modification(builder).build();

        this.yAxis.push(newAxis);

        return this;
    }

    public build() {
        return {
            xAxis: this.xAxis,
            yAxis: this.yAxis,
        };
    }
}

export class XAxisOptionsBuilder {
    private readonly xAxis: Highcharts.XAxisOptions = {};

    private constructor(private readonly config: IChartConfig) {}

    public static usingConfig(config: IChartConfig = {}) {
        return new XAxisOptionsBuilder(config);
    }

    public build(): Highcharts.XAxisOptions {
        return this.xAxis;
    }
}

export class YAxisOptionsBuilder {
    private readonly yAxis: Highcharts.YAxisOptions = {};

    private constructor(private readonly config: IChartConfig) {}

    public static usingConfig(config: IChartConfig = {}) {
        return new YAxisOptionsBuilder(config);
    }

    public build(): Highcharts.YAxisOptions {
        return this.yAxis;
    }
}
