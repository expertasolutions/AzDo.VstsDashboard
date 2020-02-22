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
    ColumnMore,
    ITableColumn,
    TableColumnLayout,
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

function buildRefOnSize(event: MouseEvent, index: number, width: number) {
  return (dashboardColumns[index].width as ObservableValue<number>).value = width;
}

export const buildColumns : ITableColumn<Build>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    renderCell: renderBuildStatus,
    width: new ObservableValue(-20),
  },
  {
    id: "BuildInfo01",
    name: "Build # | Branch/commit", 
    renderCell: renderBuildInfo01Cell,
    width: new ObservableValue(-25),
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    renderCell: renderDeploymentInfo01,
    width: new ObservableValue(-65)
  },
  {
    id: "BuildInfo02",
    renderCell: renderBuildInfo02Cell,
    width: 150,
  }
]

export const dashboardColumns : ITableColumn<BuildDefinitionReference>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    onSize: buildRefOnSize,
    renderCell: renderBuildRef01,
    width: new ObservableValue(-20)
  },
  {
    id: "pipeline",
    name: "Last Run",
    onSize: buildRefOnSize,
    renderCell: renderLastBuild01,
    width: new ObservableValue(-25)
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    onSize: buildRefOnSize,
    renderCell: renderReleaseInfo01,
    width: new ObservableValue(-65)
  },
  {
    id:"LastBuildInfo02",
    onSize: buildRefOnSize,
    renderCell: renderLastBuild02,
    width: 150
  },
];

