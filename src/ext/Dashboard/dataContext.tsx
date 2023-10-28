import * as React from "react";
import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

export interface PipelineEnvironment {
  id: string;
  name: string;
  projectId: string;
  deploymentRecords: any[]
}


export const DataContext = React.createContext(
  {  
    state: {
      buildDefs: Array<BuildDefinitionReference>(),
      builds: Array<Build>(),
      releases: Array<Deployment>(),
      projects: Array<TeamProjectReference>(),
      environments: Array<PipelineEnvironment>(),
      showAllBuildDeployment: false,
      fullScreenMode: false
    }
  }
);

export interface PipelineInfo extends BuildDefinitionReference {
  pipelineType: string;
}

export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;