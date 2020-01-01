import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuilds, getBuildDefinitions, getReleases } from "./PipelineServices";
import { dashboardColumns, buildColumns }  from "./tableData";

import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Button } from "azure-devops-ui/Button";
import { CustomDialog } from "azure-devops-ui/Dialog";

import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { Release } from "azure-devops-extension-api/Release";
import { HeaderTitleArea, CustomHeader } from "azure-devops-ui/Header";
import { PanelContent, PanelFooter } from "azure-devops-ui/Panel";

class CICDDashboard extends React.Component<{}, {}> {
  private isDialogOpen = new ObservableValue<boolean>(false);
  private currentSelectedBuildReferenceId = new ObservableValue<Number>(-1);

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Release>()
  };
  
  public componentDidMount() {
    SDK.init();
    let projectName = "Community";
    // TODO: If build def not been runs since x days... not list it !!
    getBuildDefinitions(projectName).then(result => {
      console.log("Def Count: " + result.length);
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        console.log(result[i].name);
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          if(currentBuildDef != undefined){
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      console.log("Result Table: " + currentBuildState.length);
      // Update the currentBuilds Definition
      this.setState({ buildDefs: currentBuildState });
    });

    // Get the All build instance
    getBuilds(projectName).then(result=> {
      let buildsList = this.state.builds;
      for(let i=0;i<result.length;i++){
        let newBuild = result[i];
        let currentBuild = buildsList.find(x=> x.id === newBuild.id);
        if(currentBuild === undefined){
          buildsList.push(newBuild);
        } else {
          currentBuild = newBuild;
        }
      }
      this.setState({ builds: buildsList });
    });

    getReleases(projectName).then(result => {
      let releaseList = this.state.releases;
      for(let i=0;i<result.length;i++){
        let newRelease = result[i];
        let currentRelease = releaseList.find(x=> x.id === newRelease.id);
        if(currentRelease === undefined) {
          releaseList.push(newRelease);
        } else {
          currentRelease = newRelease;
        }
      }
      this.setState({releases: releaseList });
    });
  }

  private itemProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(
    new ArrayItemProvider(this.state.buildDefs)
  );

  private buildItemProvider = new ObservableValue<ArrayItemProvider<Build>>(
    //new ArrayItemProvider(this.state.builds.filter(x=> x.id === this.currentSelectedBuildReferenceId.value))
    new ArrayItemProvider(this.state.builds)
  );

  public render() : JSX.Element {
    const onDismiss = () => {
      this.isDialogOpen.value = false;
      this.currentSelectedBuildReferenceId.value = -1;
    };

    return (
      <Card className="flex-grow bolt-table-card" 
            titleProps={{ text: "All pipelines" }} 
            contentProps={{ contentPadding: false }}>
        <Observer isDialogOpen={this.isDialogOpen}>
          {(props: { isDialogOpen: boolean }) => {
            return props.isDialogOpen ? (
              <CustomDialog onDismiss={onDismiss} modal={true}>
                <CustomHeader className="bolt-header-with-commandbar" separator>
                  <HeaderTitleArea>
                    <div className="flex-grow scroll-hidden"
                        style={{ marginRight: "16px" }}>
                      <div className="title-m"
                          style={{
                              height: "500px",
                              width: "500px",
                              maxHeight: "32px" }}>
                          Build details
                      </div>
                    </div>
                  </HeaderTitleArea>
                </CustomHeader>
                <PanelContent>
                  <Observer itemProvider={this.buildItemProvider}>
                    {(observableProps: {itemProvider: ArrayItemProvider<Build> }) => (
                      <Table<Build> columns={buildColumns}
                                    itemProvider={observableProps.itemProvider}
                                    showLines={true}
                                    role="table"/>
                    )}
                  </Observer>
                </PanelContent>
                <PanelFooter showSeparator className="body-m">
                  The Cumulative Flow chart shows the count of work items (over
                                    time) for each column of a Kanban board.

                </PanelFooter>
              </CustomDialog>
            ) : null;
          }}
        </Observer>
        <Observer itemProvider={this.itemProvider}>
          {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => (
            <Table<BuildDefinitionReference> columns={dashboardColumns} 
                itemProvider={observableProps.itemProvider}
                showLines={true}
                onSelect={(event, data) => {
                  this.currentSelectedBuildReferenceId.value = data.data.id;
                  this.isDialogOpen.value = true;
                  console.log("Selected Row - " + data.index)
                }}
                onActivate={(event, row) => console.log("Activated Row - " + row.index)}
                role="table"/>
          )}
        </Observer>
      </Card>
    );
  }
}

showRootComponent(<CICDDashboard />);

/*
export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

import BuildRestClient = require("TFS/Build/RestClient");
import { BuildResult, BuildStatus, QueryDeletedOption } from "TFS/Build/Contracts";
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");

class build {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  queueTime: number;
  result: BuildResult;
  status: BuildStatus;
  deleted: boolean;
  release: string;
}

class release {
  id: number;
  name: string;
}

function getColumns() {
  return [
    { text: "Id", width: 75, index: "id", columnOrder: "desc" },
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 250, index: "definitionName" },
    { text: "Build #", width: 350, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" },
    { text: "Exec (min)", width: 100, index: "queueTime"},
    { text: "Status", width: 100, index: "status", 
      getCellContents: function (
        rowInfo, 
        dataIndex, 
        expandedState, 
        level, 
        column, 
        indentIndex, 
        columnOrder)
      {
        var statusValue = this.getColumnValue(dataIndex, column.index);
        var statusText = "NA";
        switch(statusValue){
          case BuildStatus.NotStarted: 
            statusText = "Not Started";
            break;
          case BuildStatus.Cancelling:
            statusText = "Cancelling";
            break;
          case BuildStatus.Completed:
            statusText = "Completed";
            break;
          case BuildStatus.InProgress:
            statusText = "InProgress";
            break;
          case BuildStatus.Postponed:
            statusText = "Postponed";
            break;
        }
        return $("<div class='grid-cell'/>").width("100").text(statusText);
      }
    },
    { text: "Result", width: 100, index: "result",
      getCellContents: function (
        rowInfo, 
        dataIndex, 
        expandedState, 
        level, 
        column, 
        indentIndex, 
        columnOrder)
      {
        var resultValue = this.getColumnValue(dataIndex, column.index);
        var resultText = "NA";
        switch(resultValue){
          case BuildResult.Canceled: 
            resultText = "Canceled";
            break;
          case BuildResult.Failed:
            resultText = "Failed";
            break;
          case BuildResult.PartiallySucceeded:
            resultText = "Partially Succeeded";
            break;
          case BuildResult.Succeeded:
            resultText = "Succeeded";
            break;
        }
        return $("<div class='grid-cell'/>").width("100").text(resultText);
      }
    }, 
  ]
}

export function getLastBuilds(source: Array<build>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname, null, null, null, null, null,
                    null, null, null, null, null, null, null, 
                    null, null, QueryDeletedOption.IncludeDeleted
    ).then(builds => {
    
    builds.forEach(b=> {
    
      var newBuild = { 
        id: b.id, 
        teamProject: b.project.name,
        definitionName: b.definition.name,
        buildNumber: b.buildNumber,
        requestedFor: b.requestedFor.displayName,
        queueTime: 0,
        result: b.result,
        status: b.status,
        deleted: b.deleted === undefined ? false : b.deleted,
        release: 'NA'
      };
      var buildInstance = source.find(x=> x.id === newBuild.id);
      if(buildInstance === undefined && newBuild.deleted === false) {
        // Add the build in the current list
        source.push(newBuild);
      } else if (buildInstance != undefined && newBuild.deleted === true) {
        console.log("delete a build");
        var indexToRemove = source.indexOf(buildInstance);
        source.splice(indexToRemove,1);
      } else {
        // update the build with new infos
        source[source.indexOf(buildInstance)] = newBuild;
      }
    });
    target.setDataSource(source);
  });
}

export function getRelease(source: Array<release>): void {    
  let client = ReleaseRestClient.getClient()
    client.getDeployments(getTeamContext().projectname).then(definitions => {
        definitions.forEach(d => {
            source.push({ name: d.release.name, id: d.id });
        });
    });
   $("#buildDetails").text(JSON.stringify(source));
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<build>();
var releaseSource = new Array<release>();

var buildGridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "50%",
  columns: getColumns(),
  sortOrder: [
    { index: "id", order: "desc" }
  ],
  openRowDetail: (index: number) => {
    var buildInstance = grid.getRowData(index);
    
    var releases = "test";
    var releases = releaseSource.find(function(elm:releaseGrid) {
      return true;
    //  return elm.artifacts.filter(a=> a.definitionReference.version.id === buildInstance.Id) != null;
    });
    $("#buildDetails").text(JSON.stringify(releases));
  }
  
}
var grid = Controls.create(Grids.Grid, buildContainer, buildGridOptions);
getRelease(releaseSource);

function refreshData() {
  getLastBuilds(buildSource, grid);
}

refreshData();

setInterval(refreshData, 5000);
*/