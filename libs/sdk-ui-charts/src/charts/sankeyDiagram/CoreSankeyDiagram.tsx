// (C) 2007-2018 GoodData Corporation
import React from "react";
import { ICoreChartProps } from "../../interfaces";
import { BaseChart } from "../_base/BaseChart";

export class CoreSankeyDiagram extends React.PureComponent<ICoreChartProps, null> {
    public render(): React.ReactNode {
        return <BaseChart type="sankey" {...this.props} />;
    }
}
