import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getPipelineIndicator,
  getReleaseTagFromBuild,
  lightGray,
} from "./common";

import {
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { DataContext, PipelineEnvironment, PipelineInfo } from "../dataContext";

export function renderEnvironmentCol01(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<PipelineEnvironment>,
  tableItem: PipelineEnvironment
) : JSX.Element {

  return (
    <DataContext.Consumer>
      {(context) => (
        <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontSizeM font-size-m scroll-hidden">
            <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} className="fontWeightSemiBold font-weight-semibold">
                  {tableItem.name}
                </div>
                <div className="font-size-s" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  tdb
                </div>
              </div>
        </SimpleTableCell>
      )}
    </DataContext.Consumer>
  );

}