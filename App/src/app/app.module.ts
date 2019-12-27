import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DashboardConfig } from './dashboard.config';
import { VstsDataService } from './Vsts.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import { ModalModule} from 'ngx-bootstrap/modal';

export function initializeApp(appConfig: DashboardConfig){
  return ()=> appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    AppRoutingModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [
    DashboardConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DashboardConfig], 
      multi: true
    },
    VstsDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }