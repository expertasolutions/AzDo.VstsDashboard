
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient,
  BuildResult, 
  BuildStatus,
  Build
} from "azure-devops-extension-api/Build";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";

export interface IBuildDef {
  id:number;
  name: string;
  ProjectName: string;
  latestBuild: IPipelineItem; 
  Pipelines: Array<IPipelineItem>;
}

export interface IPipelineItem {
  id: number;
  buildNumber: string;
  requestedFor?: IdentityRef;
  result: BuildResult;
  status: BuildStatus;
  startTime?: Date;
  endTime?: Date;
}

export async function getBuilds(projectName: string)  {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getBuilds(projectName);
  return await response;
}

export async function getBuildDefinitions(projectName: string) {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getDefinitions(projectName);
  return await response;
}