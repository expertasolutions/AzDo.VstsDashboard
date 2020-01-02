import * as React from "react";

const DataContext = React.createContext({});
export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;
export default DataContext;