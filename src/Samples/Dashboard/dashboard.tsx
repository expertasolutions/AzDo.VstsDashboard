import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuildDefinitions, getBuilds , getReleases, getProjects } from "./PipelineServices";
import { dashboardColumns, buildColumns }  from "./tableData";

import { Button } from "azure-devops-ui/Button";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Page } from "azure-devops-ui/Page";

import { TeamProjectReference } from "azure-devops-extension-api/Core";
import { BuildDefinitionReference, Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

import { showRootComponent } from "../../Common";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { DataContext }  from "./dataContext";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IListBoxItem } from "azure-devops-ui/ListBox";

class CICDDashboard extends React.Component<{}, {}> {
  private projectName = "Community";
  private selectedTabId = new ObservableValue("summary");
  private selectedProject = new ObservableValue<string>("");

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Deployment>(),
    projects: Array<TeamProjectReference>(),
  };

  public refreshData() {

    getProjects().then(result => {
      let newProjectsList = Array<TeamProjectReference>();
      /*
      for(let i=0;result.length;i++){
        let pr = result[i];
        newProjectsList.push(pr);
      }
      */
      //this.setState( { projects: newProjectsList });
    });

    // Update Build References list...
    getBuildDefinitions(this.projectName).then(result => {
      // CODE_REVIEW: temp fix ... dump shit !!
      this.setState( { buildDefs: Array<BuildDefinitionReference>()});
      let currentBuildState = this.state.buildDefs;
      for(let i=0;i<result.length;i++) {
        let resultBuildDef = result[i];
        if(resultBuildDef.latestBuild != undefined) {
          let currentBuildDef = currentBuildState.find(x=> x.id === resultBuildDef.id);
          // CODE_REVIEW: this code not work !!! 
          if(currentBuildDef != undefined) {
            currentBuildDef = resultBuildDef;
          } else {
            currentBuildState.push(resultBuildDef);
          }
        }
      }
      this.setState({ buildDefs: currentBuildState });
      this.buildReferenceProvider.value = new ArrayItemProvider(this.state.buildDefs);
    });

    // Update Builds Runs list...
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
  }

  public componentDidMount() {
    SDK.init();
    this.refreshData();
    
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
  }

  private buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(this.state.buildDefs));
  private buildProvider = new ObservableValue<ArrayItemProvider<Build>>(new ArrayItemProvider(this.state.builds));
  private projectProvider = new ObservableValue<ArrayItemProvider<TeamProjectReference>>(new ArrayItemProvider(this.state.projects));

  private onSelectedTabChanged = (newTabId: string) => {
    this.selectedTabId.value = newTabId;
  }

  private renderTab(tabId: string) : JSX.Element {
    if(tabId === "summary") {
      return (
        <Observer itemProvider={this.buildReferenceProvider}>
          {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => (
            <Table<BuildDefinitionReference> columns={dashboardColumns} 
                itemProvider={observableProps.itemProvider}
                showLines={true}
                role="table"/>
          )}
        </Observer>
      )
    } else if(tabId === "builds") {
      return (
        <Observer itemProvider={ this.buildProvider }>
          {(observableProps: {itemProvider: ArrayItemProvider<Build> }) => (
            <Table<Build> columns={buildColumns} 
                itemProvider={observableProps.itemProvider}
                showLines={true}
                role="table"/>
          )}
        </Observer>
      )
    } else {
      return (<div>{tabId}</div>)
    }
  }

  private renderProjectDropDown(projects: Array<TeamProjectReference>) : Array<IListBoxItem> {
    let proj : Array<IListBoxItem> = [];
    for(let i=0;i<projects.length;i++){
      let p = projects[i];
      proj.push({ id: p.id, text: p.name });
    }
    return proj;
  }

  public render() : JSX.Element {
    return (
      <Surface background={SurfaceBackground.neutral}>
        <Page className="pipelines-page flex-grow">
          <Header title="CI/CD Dashboard" titleSize={TitleSize.Large} />
          <TabBar
            onSelectedTabChanged={this.onSelectedTabChanged}
            selectedTabId={this.selectedTabId}
            tabSize={TabSize.Tall}>
            <Tab name="Summary" id="summary"/>
            <Tab name="Runs" id="builds"/>
          </TabBar>
          <div className="page-content page-content-top">
              <Button text="Refresh" onClick={()=> {
                console.log("refreshData is clicked");
                this.refreshData();
              }} />
              <div className="flex-row" style={{ margin: "8px", alignItems: "center"}}>
                <Observer itemProvider={this.projectProvider}>
                  {(props: { itemProvider: ArrayItemProvider<TeamProjectReference> }) => (
                    <Dropdown
                      placeholder="Select a Project"
                      items={this.renderProjectDropDown(props.itemProvider.value)}
                    />
                  )}
                </Observer>
              </div>
              <Card className="flex-grow bolt-table-card" 
                    titleProps={{ text: "All pipelines" }} 
                    contentProps={{ contentPadding: false }}>
                <DataContext.Provider value={{ state: this.state }}>
                  <Observer selectedTabId={this.selectedTabId}>
                    {(props: { selectedTabId: string }) => {
                      return (
                        <div>
                            {this.renderTab(props.selectedTabId)}
                        </div>
                      )
                    }}
                  </Observer>
                </DataContext.Provider>
              </Card>
            </div>
        </Page>
      </Surface>
    );
  }
}

showRootComponent(<CICDDashboard />);