// (C) 2019-2020 GoodData Corporation

export { dummyBackend, dummyBackendEmptyData, dummyDataView } from "./dummyBackend";

export { decoratedBackend, DecoratorFactories } from "./decoratedBackend";

export {
    DecoratedExecutionFactory,
    PreparedExecutionWrapper,
    DecoratedPreparedExecution,
    DecoratedExecutionResult,
} from "./decoratedBackend/execution";

export {
    DecoratedWorkspaceCatalogFactory,
    DecoratedWorkspaceCatalog,
    WorkspaceCatalogWrapper,
} from "./decoratedBackend/catalog";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend";
export { withCaching, CachingConfiguration, DefaultCachingConfiguration } from "./cachingBackend";