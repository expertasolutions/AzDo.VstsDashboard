import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { getBuildDefinitions, getBuilds , getReleases, getProjects, getProject } from "./PipelineServices";
import { dashboardColumns, buildColumns }  from "./tableData";

import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { DropdownFilterBarItem } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
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
import { Filter, FilterOperatorType, FILTER_CHANGE_EVENT } from "azure-devops-ui/Utilities/Filter";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";

class CICDDashboard extends React.Component<{}, {}> {
  private selectedTabId = new ObservableValue("summary");
  private projectSelection = new DropdownSelection();
  private filter: Filter = new Filter();
  private currentProjectSelected: string = "";
  private currentState = new ObservableValue("");

  constructor(props: {}) {
    super(props);

    this.filter = new Filter();
    this.filter.setFilterItemState("listMulti", {
      value: [],
      operator: FilterOperatorType.and
    });

    this.filter.subscribe(() => {
      this.currentState.value = JSON.stringify(this.filter.getState(), null, 4);
    }, FILTER_CHANGE_EVENT);

    setInterval(()=> {
      if(this.currentProjectSelected != undefined) {
        this.updateFromProject(this.currentProjectSelected);
      }
    }, 5000);
  }

  state = {
    buildDefs: Array<BuildDefinitionReference>(),
    builds: Array<Build>(),
    releases: Array<Deployment>(),
    projects: Array<TeamProjectReference>(),
  };

  private updateFromProject(projectName: string){ 
    this.currentProjectSelected = projectName;
    getBuildDefinitions(projectName).then(result => {
      this.setState({ buildDefs: result });
      this.buildReferenceProvider.value = new ArrayItemProvider(this.state.buildDefs);
    });

    getReleases(projectName).then(result => {
      this.setState({releases: result });
    });

    // Update Builds Runs list...
    getBuilds(projectName).then(result=> {
      this.setState({ builds: result });
      this.buildProvider.value = new ArrayItemProvider(this.state.builds);
    });
  }

  private onProjectSelected = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    let projectName = "";
    if(item.text != undefined)
      projectName = item.text;

    this.updateFromProject(projectName);
  }

  public loadProjects() {
    getProjects().then(result => {
      this.setState( { projects: result });
    });
  }

  public componentDidMount() {
    
    SDK.init().then(()=> {
      console.log("Init is finish");
    });

    SDK.ready().then(()=> {
      console.log("ready is call");
      let context = SDK.getExtensionContext();
      console.log("extensionContext: " + JSON.stringify(context));
      let contrib = SDK.getContributionId();
      console.log("contributionId: " + contrib);
      let host = SDK.getHost();
      console.log("Host: " + JSON.stringify(host));
      let user = SDK.getUser();
      console.log("User: " + JSON.stringify(user));
      this.loadProjects();
    })
  }

  private buildReferenceProvider = new ObservableValue<ArrayItemProvider<BuildDefinitionReference>>(new ArrayItemProvider(this.state.buildDefs));
  private buildProvider = new ObservableValue<ArrayItemProvider<Build>>(new ArrayItemProvider(this.state.builds));

  private onSelectedTabChanged = (newTabId: string) => {
    this.selectedTabId.value = newTabId;
  }

  private async getProjectUrl(projectName:string) {
    let prj = this.state.projects.find(x=> x.name === projectName);
    if(prj === undefined){
      return "http://perdu.com";
    }
    let prjDetail = await getProject(projectName);
    return prjDetail._links.web.href;
  }

  private renderZeroData(tabId: string) : JSX.Element {
    if(tabId === "summary" && this.buildReferenceProvider.value.length === 0){
      return (
        <div className="flex-center">
          <ZeroData
            primaryText="Create your first Pipeline"
            secondaryText={
              <span>
                Automate your build and release processes using our wizard, and go
                from code to cloud-hosted within minutes.
              </span>
            }
            imageAltText="Bars"
            imagePath="https://cdn.vsassets.io/ext/ms.vss-build-web/pipelines/Content/no-builds.G8i4mxU5f17yTzxc.png"
            actionText="Create Pipeline"
            actionType={ZeroDataActionType.ctaButton}
            onActionClick={(event, item) => {
                this.getProjectUrl(this.currentProjectSelected).then(url => {
                  let createPipelineUrl = url + "/_apps/hub/ms.vss-build-web.ci-designer-hub";
                  window.open(createPipelineUrl);
                });
              }
            }
          />
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  private renderTab(tabId: string) : JSX.Element {
    if(tabId === "summary") {
      if(this.buildReferenceProvider.value.length > 0) {
        return (
          <Observer itemProvider={this.buildReferenceProvider}>
            {(observableProps: {itemProvider: ArrayItemProvider<BuildDefinitionReference> }) => 
              {
                return (
                  <Table<BuildDefinitionReference> columns={dashboardColumns} 
                      itemProvider={observableProps.itemProvider}
                      showLines={true}
                      role="table"/>
                );
              }
            }
          </Observer>
        )
      } else {
        return (<div></div>)
      }
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
      return (<div></div>);
    }
  }

  public renderTabBar() : JSX.Element {
    return (<TabBar
            onSelectedTabChanged={this.onSelectedTabChanged}
            selectedTabId={this.selectedTabId}
            tabSize={TabSize.Tall}>
            <Tab name="Summary" id="summary"/>
            <Tab name="Runs" id="builds"/>
          </TabBar>);          
  }

  public render() : JSX.Element {

    return (
      <Surface background={SurfaceBackground.neutral}>
        <Page className="pipelines-page flex-grow">
          <Header title="CI/CD Dashboard" titleSize={TitleSize.Large} />
          <div className="page-content page-content-top">
            <FilterBar filter={this.filter}>
              <KeywordFilterBarItem filterItemKey="pipeline" />
              <DropdownFilterBarItem
                filterItemKey="listSingle"
                filter={this.filter}
                items={this.state.projects.map(i => {
                  return {
                    id: i.id,
                    text: i.name
                  };
                })}
                placeholder="Team Project"
                showFilterBox={true}
                onSelect={this.onProjectSelected}
                selection={this.projectSelection}
              />
            </FilterBar>
          </div>
          <div className="page-content page-content-top">
            <DataContext.Provider value={{ state: this.state }}>
                <Observer selectedTabId={this.selectedTabId}>
                  {(props: { selectedTabId: string }) => {
                    if(this.state.buildDefs.length === 0){
                      return this.renderZeroData(this.selectedTabId.value);
                    } else {
                      return (
                        <Card className="flex-grow bolt-table-card" 
                              titleProps={{ text: "All pipelines" }} 
                              contentProps={{ contentPadding: false }}>
                                  <div  style={{ marginTop: "16px;", marginBottom: "16px;"}}>
                                      { this.renderTab(props.selectedTabId) }
                                  </div>
                        </Card>
                      );
                    }
                  }}
                </Observer>
            </DataContext.Provider>
          </div>
        </Page>
      </Surface>
    );
  }
}

showRootComponent(<CICDDashboard />);