import { Component } from '@angular/core';
import { VstsDataService } from './Vsts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Vsts Build Dashboard';

  projectsList = null;
  emplList = [];
  buildsList = [];
  deploymentList = [];
  interval = null;

  _teamProjectsSummary = [];

  _minDate = null;

  constructor(private _vstsService : VstsDataService) {
    
  }

  ngOnInit() {
    this.refreshData(true);
    this.interval = setInterval(() => {
      this.refreshData(false);
    }, 2000);
  }

  ngOnDestroy(){
    clearInterval(this.interval);
  }

  refreshData(firstLoad) {
    this._minDate = new Date();
    this._minDate.setDate(this._minDate.getDate() - 6);
    this._minDate = this._minDate.toISOString().slice(0, 10);

    this._vstsService.getProjects().subscribe(data=> {
      this.projectsList = data['value'];
      this.loadDeployment();
      this.loadBuildDefinitions(firstLoad);
      this.loadEmployee();
      this.computeProjectsSummary();
  }, err => {
      console.log(err);
    });
  }

  loadEmployee() {
    if(this.buildsList.length > 0){
      for(let feB in this.buildsList){
        var build = this.buildsList[feB];
        var emplInfo = this.emplList.find(x=> x.id == build.requestedFor.id);
        if(emplInfo == null) {
          var emplDetails = { 
            emplName : build.requestedFor.displayName, id: build.requestedFor.id, 
            buildCount : 0, successRate : 0, failed : 0, succeed : 0, inProgress : 0, queued : 0
          };
          this.emplList.push(emplDetails);
        } else {

          var emplBuilds = this.buildsList.filter(x=> x.requestedFor.id == emplInfo.id);
          var buildFailed = this.buildsList.filter(x=> x.requestedFor.id == emplInfo.id && x.result == "failed");
          var buildSucceed = this.buildsList.filter(x=> x.requestedFor.id == emplInfo.id && x.result === "succeeded");
          var buildQueued = this.buildsList.filter(x=> x.requestedFor.id == emplInfo.id && x.status == "notStarted");
          var buildInProgress = this.buildsList.filter(x=> x.requestedFor.id == emplInfo.id && x.status == "inProgress");

          emplInfo.buildCount = emplBuilds.length;
          emplInfo.succeed = buildSucceed.length;
          emplInfo.failed = buildFailed.length;
          emplInfo.inProgress = buildInProgress.length;
          emplInfo.queued = buildQueued.length;

          emplInfo.successRate = ((emplInfo.succeed / emplInfo.buildCount)* 100).toFixed(2);
        }

        this.emplList.sort((a, b) => b.buildCount - a.buildCount);
      }
    }
  }

  computeProjectsSummary(){
    for(let feP in this.projectsList){
      var currentProject = this.projectsList[feP];

      var projectBuilds = this.buildsList.filter(x=> x.project.id == currentProject.id);
      var projectElement = this._teamProjectsSummary.find(x=> x.id == currentProject.id);

      if(projectElement == null && projectBuilds.length > 0) {
        projectElement = { 
            id: currentProject.id, name: currentProject.name, buildCount : projectBuilds.length,
            failed : 0, succeed : 0, queued : 0, inProgress: 0
          }; 
        this._teamProjectsSummary.push(projectElement);
      }
      else if(projectElement != null) {
        projectElement.buildCount = projectBuilds.length;

        var buildFailed = this.buildsList.filter(x=> x.project.id == currentProject.id && x.result == "failed");
        var buildSucceed = this.buildsList.filter(x=> x.project.id == currentProject.id && x.result === "succeeded");
        var buildQueued = this.buildsList.filter(x=> x.project.id == currentProject.id && x.status == "notStarted");
        var buildInProgress = this.buildsList.filter(x=> x.project.id == currentProject.id && x.status == "inProgress");

        projectElement.failed = buildFailed.length;
        projectElement.succeed = buildSucceed.length;
        projectElement.queued = buildQueued.length;
        projectElement.inProgress = buildInProgress.length;

        projectElement.successRate = ((projectElement.succeed / projectElement.buildCount)* 100).toFixed(2);
      }
    }
  }

  loadDeployment() {
    for(let feP in this.projectsList){
      var project = this.projectsList[feP];

      this._vstsService.getDeployments(project.name, this._minDate)
        .subscribe(data => {
          if(data['count'] > 0) {
            var arr = data['value'];
            for(let feB in arr){
              var elm = this.deploymentList.find(x=> x.id == arr[feB].id && x.releaseEnvironment.name == arr[feB].releaseEnvironment.name);
              if(elm == null) {
                this.deploymentList.push(arr[feB]);
              }
              else {
                var indexToUpdate = this.deploymentList.indexOf(elm);
                this.deploymentList[indexToUpdate] = arr[feB];
              }
            }
          }
      });
    }
  }

  loadBuildDefinitions(firstLoad){
    for(let feP in this.projectsList){
      var project = this.projectsList[feP];
    
      this._vstsService.getBuilds(project.name, this._minDate)
            .subscribe(data => {
              if(data['count'] >= 0){
                var arr = data['value'];
                for(let feB in arr){
                  var currentBuild = arr[feB];

                  var elm = this.buildsList.find(x=> x.id == currentBuild.id);

                  var relDef = this.deploymentList.filter(x=> x.release.artifacts.find(y=> y.definitionReference.version.id == currentBuild.id) != null);
                  if(relDef['length'] > 0) {
                    var currRel = [];

                    for(let feRel in relDef) {
                      var rel = relDef[feRel];
          
                      var currentRelease = currRel.find(x=> x['releaseName'] === rel.release.name);
                      if(currentRelease == null){
                        currentRelease = {
                          releaseName : rel.release.name,
                          env : []
                        };
                      }

                      var attempt = rel.attempt;
                      var envName = rel.releaseEnvironment.name;
                      var envStatus = rel.deploymentStatus;
                      var relId = rel.id;
                      var queuedOn = rel.queuedOn;
                      var test = { env: envName, status : envStatus, id: relId, startTime: queuedOn, attempt: attempt };
                     
                      var env = currentRelease['env'].find(x=> x['env'] == rel.releaseEnvironment.name);
                      if(env == null)
                        currentRelease['env'].push(test);
                      else {
                        var indexToUpdate = currentRelease.env.indexOf(env);
                        currentRelease.env[indexToUpdate] = test;
                      }
                      currentRelease.env = currentRelease.env.sort((a, b) => a['id'] - b['id']);

                      var objToUpdate = currRel.find(x=> x['releaseName'] == currentRelease['releaseName']);
                      if(objToUpdate == null)
                        currRel.push(currentRelease);
                      else {
                        var relIndexToUpdate = currRel.indexOf(objToUpdate);
                        currRel[relIndexToUpdate] = currentRelease;
                      }
                    }
                    currRel = currRel.sort((a, b) => a['releaseName'] - b['releaseName']);
                    currentBuild.releases = currRel;
                  }

                  if(elm == null && currentBuild.deleted == null){
                    this.buildsList.push(currentBuild);
                  }
                  else if(elm != null && currentBuild.deleted == true) {
                    var indexToRemove = this.buildsList.indexOf(currentBuild);
                    this.buildsList = this.buildsList.slice(indexToRemove, 1);
                  }
                  else if(elm != null) {
                    var indexToUpdateBuild = this.buildsList.indexOf(elm);
                    var current = this.buildsList[indexToUpdateBuild];

                    if(current.result != arr[feB].result || current.status != arr[feB].status || current.releases != currentBuild.releases){
                      this.buildsList[indexToUpdateBuild] = arr[feB];
                      if(firstLoad == false && arr[feB].result == "failed") {
                        console.log('a build just failed');
                      }
                    }
                  }
                }
                this.buildsList.sort((a, b)=> b.id - a.id);
              } 
            });
    }
  }
}