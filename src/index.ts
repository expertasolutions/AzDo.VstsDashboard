export function getTeamContext(){
  var webcontext = VSS.getWebContext();
  return {
    projectname : webcontext.project.name,
    teamId: webcontext.team.id  
  };
}

//import { Artifact } from "ReleaseManagement/Core/Contracts";
import BuildRestClient = require("TFS/Build/RestClient");
//import ReleaseRestClient = require("ReleaseManagement/Core/RestClient");
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import { BuildResult, BuildStatus } from "TFS/Build/Contracts";


class build {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  queueTime: number;
  result: BuildResult;
  status: BuildStatus;
}

class release {
  id: number;
  name: string;
}

function getColumns() {
  return [
    { text: "Id", width: 75, index: "id" },
    { text: "Team Project", width: 150, index: "teamProject"},
    { text: "Build Definition", width: 250, index: "definitionName" },
    { text: "Build #", width: 350, index: "buildNumber"},
    { text: "RequestedFor", width: 200, index: "requestedFor" },
    { text: "Exec (min)", width: 100, index: "queueTime"},
    { text: "Result", width: 150, index: "result",
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
    { text: "Status", width: 150, index: "status", 
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

export function getLastBuilds(source: Array<build>, target: Grids.Grid): void {
  let client = BuildRestClient.getClient();
  client.getBuilds(getTeamContext().projectname).then(builds => {
    
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
      };

      var buildInstance = source.find(x=> x.id === newBuild.id);
      console.log(newBuild.id + " = " + buildInstance);
      if(buildInstance === null) {
        console.log("Build " + newBuild.id + " will be add");
        // Add the build in the current list
        source.push(newBuild);
      } else {
        console.log(newBuild.id + " updated");
        // update the build with new infos
        buildInstance = newBuild;
      }
    });
    target.setDataSource(source);
  });
}
 
export function getRelease(source: Array<release>): void {    
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
var buildSource = new Array<build>();
var releaseSource = new Array<release>();

var buildGridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "50%",
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
//getRelease(releaseSource);

function refreshData() {
  getLastBuilds(buildSource, grid);
}

//refreshData();

setInterval(refreshData, 5000);