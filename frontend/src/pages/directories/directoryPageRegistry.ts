import React from "react";
// Register custom pages as lazy components
const BankStatementPage = React.lazy(
    () => import("./customDirectoryPages/bank-statement/BankStatement")
);
const RecieptsPage = React.lazy(
    () => import("./customDirectoryPages/reciepts/Reciepts")
);
// import CustomDirectoryPage from './CustomDirectoryPage'; // Example custom component
import type { ComponentType } from "react";

export const DEFAULT_DIRECTORY_COMPONENT_NAME = "Default";

// Only register custom pages here, all as lazy components
const registry: Record<
    string,
    React.LazyExoticComponent<ComponentType<object>>
> = {
    BankStatement: BankStatementPage,
    Reciepts: RecieptsPage,
    // Reciepts: React.lazy(() => import('./CustomDirectoryPage')), // Example registration
};

export function registerDirectoryPage(
    name: string,
    component: React.LazyExoticComponent<ComponentType<object>>
) {
    registry[name] = component;
}

export function getDirectoryPageComponent(
    name?: string
): React.LazyExoticComponent<ComponentType<object>> {
    if (name && registry[name]) return registry[name];
    // Use React.lazy to dynamically import DefaultDirectoryRecords
    return React.lazy(() => import("./DirectoryRecords"));
}
