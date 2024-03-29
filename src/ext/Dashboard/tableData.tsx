import { ObservableValue } from "azure-devops-ui/Core/Observable";

import { 
  renderBuildStatus,
  renderBuildInfo01Cell, 
  renderBuildInfo02Cell,
  renderDeploymentInfo01
} from "./cells/build";

import {
  renderBuildRef01,
  renderLastBuild01,
  renderLastBuild02,
  renderReleaseInfo01
} from "./cells/buildReference";

import {
  renderEnvironmentCol01
} from "./cells/environmentRef";

import {
    ITableColumn
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

import { PipelineEnvironment, PipelineReference, PipelineElement } from "./dataContext";

function buildOnSize(event: MouseEvent, index: number, width: number) {
  return (buildColumns[index].width as ObservableValue<number>).value = width;
}

function buildRefOnSize(event: MouseEvent, index: number, width: number) {
  return (dashboardColumns[index].width as ObservableValue<number>).value = width;
}

export const environmentColumns : ITableColumn<PipelineEnvironment>[] = [
  {
    id: "environment",
    name: "name",
    onSize: buildOnSize,
    renderCell: renderEnvironmentCol01,
    width: new ObservableValue(-25)
  }
]

// All Runs
export const buildColumns : ITableColumn<PipelineElement>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildOnSize,
    renderCell: renderBuildStatus,
    width: new ObservableValue(-22.5),
  },
  // {
  //   id: "BuildInfo01",
  //   name: "Build # | Branch & commit", 
  //   onSize: buildOnSize,
  //   renderCell: renderBuildInfo01Cell,
  //   width: new ObservableValue(-22.5),
  // },
  {
    id: "ReleaseInfo01",
    name: "Environments/Stages Status",
    renderCell: renderDeploymentInfo01,
    width: new ObservableValue(-62.5)
  },
  {
    id: "BuildInfo02",
    name: "Execution Infos",
    renderCell: renderBuildInfo02Cell,
    width: new ObservableValue(-15)
  }
]

// Summary
export const dashboardColumns : ITableColumn<PipelineReference>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildRefOnSize,
    renderCell: renderBuildRef01,
    width: new ObservableValue(-22.5)
  },
  // {
  //   id: "pipeline",
  //   name: "Last Build # | Branch & commit",
  //   onSize: buildRefOnSize,
  //   renderCell: renderLastBuild01,
  //   width: new ObservableValue(-22.5)
  // },
  {
    id: "ReleaseInfo01",
    name: "Environments/Stages Status",
    renderCell: renderReleaseInfo01,
    width: new ObservableValue(-62.5)
  },
  {
    id:"LastBuildInfo02",
    name: "Execution Infos",
    renderCell: renderLastBuild02,
    width: new ObservableValue(-15)
  }
];
