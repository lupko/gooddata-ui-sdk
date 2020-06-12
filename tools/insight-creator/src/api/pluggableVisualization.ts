// (C) 2019-2020 GoodData Corporation
import React from "react";
import { IInsightDefinition, IMeasure } from "@gooddata/sdk-model";
import { IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { IVisualizationCallbacks, IVisualizationProps } from "@gooddata/sdk-ui";

/*
 * This is sketch how the pluggable visualization interface could look like. It would be located with the
 * plug vis implementations. This sketch design plug visualizations to render in-tree.
 */

/**
 * Base props for pluggable visualizations. These are the same props that are used by all React componentry.
 */
export type PluggableVisualizationProps = IVisualizationProps & IVisualizationCallbacks;

export interface IPluggableVisualization {
    version: string;
    name: string;
    url: string;

    config: IPluggableVisualizationDesignerConfig;

    renderVisualization: (
        executionFactory: IExecutionFactory,
        insight: IInsightDefinition,
        props: IVisualizationProps,
    ) => React.ReactNode;
    renderConfiguration: (
        executionFactory: IExecutionFactory,
        insight: IInsightDefinition,
    ) => React.ReactNode;
    renderPicker: () => React.ReactNode;
}

/**
 * Alternative to today's UI config. With more stuff in it. All functions that are today on IVisualization
 * 'SPI' are here.
 */
export interface IPluggableVisualizationDesignerConfig {
    transform: (previousVis: IPluggableVisualization, insight: IInsightDefinition) => IInsightDefinition;

    placeDerivedMeasure: (insight: IInsightDefinition, measure: IMeasure) => IInsightDefinition;
}

export interface IPluggableVisualizationCatalog {
    visualizations: IPluggableVisualization[];
}
