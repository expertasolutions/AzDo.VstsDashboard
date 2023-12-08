import * as React from "react";
import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

export interface PipelineEnvironment {
  id: number;
  name: string;
  projectId: string;
  deploymentRecords: any[]
  environmentChecks: any[]
}


export const DataContext = React.createContext(
  {  
    state: {
      buildDefs: Array<BuildDefinitionReference>(),
      builds: Array<PipelineElement>(),
      releases: Array<Deployment>(),
      projects: Array<TeamProjectReference>(),
      environments: Array<PipelineEnvironment>(),
      approvals: Array<any>(),
      showAllBuildDeployment: false,
      fullScreenMode: false
    }
  }
);

export interface PipelineElement extends Build {
  timeline: any;
}

export interface PipelineReference extends BuildDefinitionReference {
  pipelineType: string;
  timeline: any;
}

export const DataProvider = DataContext.Provider;
export const DataConsumer = DataContext.Consumer;