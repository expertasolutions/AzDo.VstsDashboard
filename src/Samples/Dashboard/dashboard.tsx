import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuildDefinitions } from "./PipelineServices";
import { dashboardColumns }  from "./tableData";

import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";

import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { Release } from "azure-devops-extension-api/Release";

class CICDDashboard extends React.Component<{}, {}> {
  private projectName = "Community";

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Release>(),
    patate: "frite",
  };

  public refreshData() {
    getBuildDefinitions(this.projectName).then(result => {
      this.setState( { buildDefs: Array<BuildDefinitionReference>()});
      console.log(this.state.buildDefs.length);
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          if(currentBuildDef != undefined) {
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      this.setState({ buildDefs: currentBuildState });
      this.buildReferenceProvider.value = new ArrayItemProvider(this.state.buildDefs);
      console.log("setState is called");
    });
  }

  public componentDidMount() {
    SDK.init();
    console.log("first call");
    this.refreshData();
    console.log("end call");

    /*
    // TODO: If build def not been runs since x days... not list it !!
    getBuildDefinitions(this.projectName).then(result => {
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
    getBuilds(this.projectName).then(result=> {
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

    getReleases(this.projectName).then(result => {
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
    */
  }

  private buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(
    new ArrayItemProvider(this.state.buildDefs)
  );

  public render() : JSX.Element {
    return (
      <div>
        <Button text="Refresh" onClick={()=> {
          console.log("refreshData is clicked");
          this.refreshData();
          }} />
        <Card className="flex-grow bolt-table-card" 
              titleProps={{ text: "All pipelines" }} 
              contentProps={{ contentPadding: false }}>
          <Observer itemProvider={this.buildReferenceProvider}>
            {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => (
              <Table<BuildDefinitionReference> columns={dashboardColumns} 
                  itemProvider={observableProps.itemProvider}
                  showLines={true}
                  role="table"/>
            )}
          </Observer>
        </Card>
      </div>
    );
  }
}

showRootComponent(<CICDDashboard />);