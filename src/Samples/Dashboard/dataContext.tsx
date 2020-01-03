import * as React from "react";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Release } from "azure-devops-extension-api/Release";

export const DataContext = React.createContext(
  {  
    state: {
      buildDefs: Array<BuildDefinitionReference>(),
      builds: Array<Build>(),
      releases: Array<Release>(),
      patate: String
    }
  }
);

export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;