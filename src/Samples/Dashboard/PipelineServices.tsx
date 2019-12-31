
import * as SDK from "azure-devops-extension-sdk";
import * as API from "azure-devops-extension-api";
import { 
  BuildRestClient, Build,
  BuildResult, BuildStatus
} from "azure-devops-extension-api/Build";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";

export interface IBuildDef {
  id:number;
  name: string;
  ProjectName: string;
  Pipelines:[]
}

export interface IPipelineItem {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: IdentityRef;
  result: BuildResult;
  status: BuildStatus;
  startTime?: Date;
  endTime?: Date;
}

const getBuilds = async(projectName: string) => {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getBuilds(projectName);
  return await response;
}

const getBuildDefinitions = async(projectName: string) => {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getDefinitions(projectName);
  return await response;
}