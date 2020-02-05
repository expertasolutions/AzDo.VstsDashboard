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
} from "azure-devops-ui/Table";

import { 
  Build, 
  BuildDefinitionReference 
} from "azure-devops-extension-api/Build";

export const buildColumns : ITableColumn<Build>[] = [
  {
    id: "Status",
    name: "Status",
    renderCell: renderBuildStatus,
    width: 65
  },
  {
    id: "BuildInfo01",
    name: "Build #", 
    renderCell: renderBuildInfo01Cell,
    width: new ObservableValue(-20),
  },
  {
    id: "BuildInfo02",
    renderCell: renderBuildInfo02Cell,
    width: 125,
  },
  {
    id: "ReleaseInfo01",
    name: "Releases Status",
    renderCell: renderDeploymentInfo01,
    width: new ObservableValue(-70)
  }
]

export const dashboardColumns : ITableColumn<BuildDefinitionReference>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    renderCell: renderBuildRef01,
    width: new ObservableValue(-25)
  },
  {
    id: "pipeline",
    name: "Last Completed Run",
    renderCell: renderLastBuild01,
    width: new ObservableValue(-25)
  },
  {
    id: "ReleaseInfo01",
    name: "Deployment Health",
    renderCell: renderReleaseInfo01,
    width: new ObservableValue(-50)
  },
  {
    id:"LastBuildInfo02",
    renderCell: renderLastBuild02,
    width: 150
  },
];

