import * as React from "react";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

export const DataContext = React.createContext(
  {  
    state: {
      buildDefs: Array<BuildDefinitionReference>(),
      builds: Array<Build>(),
      releases: Array<Deployment>(),
      patate: String
    }
  }
);

export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;