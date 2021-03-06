// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { CustomLegendExample } from "./CustomLegendExample";
import CustomLegendExampleSRC from "./CustomLegendExample?raw";
import CustomLegendExampleSRCJS from "./CustomLegendExample?rawJS";

export const CustomLegend = (): JSX.Element => (
    <div>
        <h1>Custom legend</h1>

        <p>
            You can access legend items via <code>onLegendReady</code> and render custom legend.
        </p>

        <ExampleWithSource
            for={CustomLegendExample}
            source={CustomLegendExampleSRC}
            sourceJS={CustomLegendExampleSRCJS}
        />
    </div>
);
