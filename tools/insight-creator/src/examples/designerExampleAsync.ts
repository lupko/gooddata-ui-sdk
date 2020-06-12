// (C) 2019-2020 GoodData Corporation

/*
 * This example demonstrates how to use insigh designer in sync-blocking mode. All commands are dispatched and
 * awaited until completion. The update model can then be introspected by the view code to render the updates.
 */
import { newInsightDesignerSession } from "../api/designer";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

function myBackend(): IAnalyticalBackend {
    // @ts-ignore
    return null;
}

function currentWorkspace(): string {
    // @ts-ignore
    return null;
}

export async function exampleWithNewInsight() {
    const backend = myBackend();
    const workspace = currentWorkspace();

    /*
     * AD starts or AD workspace switched:
     *
     * This will do initial loading of all the necessary catalog state etc.
     */
    const designerSession = await newInsightDesignerSession(backend, workspace);

    /**
     * Starting a new insight design. Wait it out, until everything
     */
    const newDesign = await designerSession.createNew("local:bar");
}
