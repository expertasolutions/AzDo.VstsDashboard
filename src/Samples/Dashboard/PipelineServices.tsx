
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
  Pipelines: Array<IPipelineItem>;
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

declare const allPipeline : Array<IBuildDef>;

async function getBuilds(projectName: string)  {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getBuilds(projectName);
  return await response;
}

async function getBuildDefinitions(projectName: string) {
  let buildClient = API.getClient(BuildRestClient);
  const response = buildClient.getDefinitions(projectName);
  return await response;
}

export async function loadPipelines(projectName: string) {
  let buildDef = await getBuildDefinitions(projectName);
  for(let i=0;i<buildDef.length;i++){
    let currentDef = buildDef[i];
    let def = allPipeline.find(x=> x.id === currentDef.id);
    if(def === undefined){
      allPipeline.push({
        id: currentDef.id,
        name: currentDef.name,
        ProjectName: currentDef.project.name,
        Pipelines: []
      });
    }
  }

  let builds = await getBuilds(projectName);

  for(let i=0;i<builds.length;i++){
    let currentBuild = builds[i];
    let currentDef = allPipeline.find(x=> x.id === currentBuild.definition.id);
    if(currentDef != undefined){
      let currentPipeline = currentDef.Pipelines.find(x=> x.id === currentBuild.id);
      if(currentPipeline != undefined){
        // Add it
      } else {
        // Update it
      }
    }
  }

}