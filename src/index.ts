export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

export function show(divName: string, func: (target: HTMLElement) => void){
    const elt = document.getElementById(divName)!;
    let result = func(elt);
}

//import { Artifact } from "ReleaseManagement/Core/Contracts";
import BuildRestClient = require("TFS/Build/RestClient");
//import ReleaseRestClient = require("ReleaseManagement/Core/RestClient");
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import { BuildResult, BuildStatus } from "TFS/Build/Contracts";


class buildGrid {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  queueTime: number;
  result: BuildResult;
  status: BuildStatus;
}

function getColumns() {
  return [
    { text: "Id", width: 100, index: "id" },
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 200, index: "definitionName" },
    { text: "Build #", width: 350, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" },
    { text: "Queue Time (min)", width: 250, index: "queueTime"},
    { text: "Result", width: 200, index: "result",
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
        return $("<div class='grid-cell'/>").width("200").text(resultText);
      }
    },
    { text: "Status", width: 200, index: "status", 
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
        return $("<div class='grid-cell'/>").width("200").text(statusText);
      }
    }
  ]
}

export function getLastBuilds(source: Array<buildGrid>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname).then(builds => {
    builds.forEach(b=> {
      source.push({ 
        id: b.id, 
        teamProject: b.project.name,
        definitionName: b.definition.name,
        buildNumber: b.buildNumber,
        requestedFor: b.requestedFor.displayName,
        queueTime: 0,
        result: b.result,
        status: b.status,
      });
    });
    target.setDataSource(source);
  });
}

class releaseGrid {
    id: number;
    name: string;
}
 
export function getRelease(source: Array<releaseGrid>): void {    
  //let client = ReleaseRestClient.getClient();
  /*
  client.getDeployments(getTeamContext().projectname).then(definitions => {
      definitions.forEach(d => {
          source.push({ name: d.release.name, id: d.id });
      });
  });
  */
}

var buildContainer = $("#gridLastBuilds");
var buildSource = new Array<buildGrid>();
var releaseSource = new Array<releaseGrid>();

var buildGridOptions: Grids.IGridOptions = {
  width: "900",
  height: "100%",
  columns: getColumns(),
  openRowDetail: (index: number) => {
    var buildInstance = grid.getRowData(index);
    
    var releases = "test";
    /*
    var releases = releaseSource.find(function(elm:releaseGrid) {
      return true;
    //  return elm.artifacts.filter(a=> a.definitionReference.version.id === buildInstance.Id) != null;
    });
    */
    $("#buildDetails").text(JSON.stringify(releases));
  }
  
}
var grid = Controls.create(Grids.Grid, buildContainer, buildGridOptions);
getRelease(releaseSource);
getLastBuilds(buildSource, grid);