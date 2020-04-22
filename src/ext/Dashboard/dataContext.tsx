import * as React from "react";
import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

export const DataContext = React.createContext(
  {  
    state: {
      //buildDefs: Array<BuildDefinitionReference>(),
      builds: Array<Build>(),
      releases: Array<Deployment>(),
      projects: Array<TeamProjectReference>(),
      showAllBuildDeployment: false,
      fullScreenMode: false
    }
  }
);

export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;