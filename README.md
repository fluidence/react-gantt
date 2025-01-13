# @fluidence/react-gantt

> ### Highly versatile and performant, 2 in 1 Gantt and Scheduler for React<br/>

#### Great for industrial production scheduling as well as regular project management.

[![fluidence.net](https://img.shields.io/badge/made%20by-fluidence-yellow)](https://fluidence.net/)
[![npm: v.1.2.12](https://img.shields.io/badge/npm-v.1.2.12-blue.svg)](https://www.npmjs.com/package/@fluidence/react-gantt)
[![License: GPL v3](https://img.shields.io/badge/license-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)

![gantt-scheduler](https://github.com/fluidence/react-gantt/blob/master/media/scheduler.png?raw=true)

#### Key Features

- Scheduler mode: Displays resources with scheduled tasks in each row
- Gantt mode: Displays tasks in collapsible, hierarchical rows
- Drag-and-drop: Horizontal for shifting tasks in time, and vertical for switching task resources (supports resource compatibility groups)
- Dependency arrows: Finish-to-start, start-to-start, start-to-finish, finish-to-finish
- UTC times display: Timescale can be displayed in local or UTC time zone
- Relative times display: Timescale can be displayed in absolute or relative time from the chart start
- Continuous zoom level: Chart can be zoomed in up to 100x the default zoom level
- Auto timescale: Automatic timescale selection, according to the time range and width of the viewable area
- UI state saving: Column widths, scroll position etc. can be saved and restored to/from the local storage or back-end server at reload


## Install

```bash
$ npm install @fluidence/react-gantt
```

## Usage

View scheduler mode demo [online](https://www.fluidence.net/scheduler-demo).<br/>
View gantt mode demo [online](https://www.fluidence.net/gantt-demo/).


Simple example:
```js
import Gantt from '@fluidence/react-gantt';

const columns =  [
  {
    "text": "Resources",
  }
];

const data = [
 {
  "id": 1,
  "gridValues": ["Cleaner"],
  "bars": [
   {
     "id": 1,
     "text": "Clean Task",
     "type": "Normal",
      "startDate": "2023-03-24T02:30:00.000Z",
      "endDate": "2023-03-24T04:00:00.000Z",
    },
    {
      "id": 2,
      "text": "Clean Task",
      "type": "Normal",
      "startDate": "2023-03-24T13:36:40.000Z",
      "endDate": "2023-03-24T15:06:40.000Z",
    },
    ],
  },
  {
    "id": 2,
    "gridValues": ["Filler"],
    "bars": [
      {
        "id": 1,
        "text": "Fill Task",
        "type": "Normal",
        "startDate": "2023-03-24T03:30:00.000Z",
        "endDate": "2023-03-24T13:36:40.000Z",
      },
    ],
    "childRows": [
      {
        "gridValues": ["Filler tasks"],
        "bars": [
          {
            "id": 1,
            "text": "Task A",
            "type": "Normal",
            "startDate": "2023-03-24T03:30:00.000Z",
            "endDate": "2023-03-24T12:06:40.000Z",
          },
          {
            "id": 2,
            "text": "Task B",
            "type": "Normal",
            "startDate": "2023-03-24T12:06:40.000Z",
            "endDate": "2023-03-24T13:36:40.000Z",
          },
        ]
      }
    ]
  },
]

return (
  <Gantt
    data={data}
    columns={columns}

    timeScale={"DayHour"}
  />
);
```

## API

**license**: A valid license is required for the Gantt to work properly. The component will work in demo mode until a license is provided.

**data (*array*)**: Chart row data. This array contains objects of the following format:
```jsonc
{
  id (string):          row identifier,
  bars (array):         row bars,
  childRows (array):    nested child rows, default: []
  gridValues (array):   grid column values, default: []
}
```
<br/>

The bars array contains object of the following format:
```jsonc
{
  id (string):                            bar identifier
  text (string):                          bar display text,
  type (string):                          the bar type, default: “Normal”,
                                          possible values:
                                          {“Normal”, “Background”, “Overlay”},
  isDraggable (bool):                     can this bar be dragged, default: false,
  droppableRowIds (array | "*"):          An array of row ids that this bar can be
                                          dropped to or the "*" character for all
                                          rows (bars can always be dragged within
                                          their originating row), default: []
                                          (bars can be dragged only within their
                                          originating row),
  startDate (date object or date string): bar start,
  endDate (date object or date string):   bar end,
  barStyle (object):                      inline bar styling, default: {},
                                          format:
      {
        borderWidth (number):      bar border, default: 1,
        borderStyle (string):      border style, default: “solid”,
        borderColor (string):      border color, default: “black”,
        borderRadius (string):     border radius, default: “0px”,
        backgroundColor (string):  background color, default: “orange”,
        color (string):            foreground color, default: “white”,
        cursor (string):           bar cursor, default: “default”,
        pointerEvents (string):    pointer events, default:"auto"
      }
}
```
<br/>

**arrows (*array*)**: Chart dependency arrows, `default: []`. This array contains objects of the  following format:
```jsonc
{
  sourceBarId (number):      the source bar id,
  sourceEdge (string):       arrow starts at start or finish of source bar,
                             possible values: {“S”, “F”},
  destinationBarId (number): the destination bar id,
  destinationEdge (string):  arrow ends at the start or finish of destination bar,
                             possible values: {“S”, “F”}.
}
```
<br/>

**chartStart (*date object* | *date string*)**: Chart start date, `default: minimum bar start date`.

**chartEnd (*date object* | *date string*)**: Chart end date, `default: maximum bar end date`.

**showRelativeTime (*bool*)**: Displays times and time scale relative to the chart start, `default: false` (i.e. absolute times).

**useUTC (*bool*)**: Displays UTC times, `default: false` (i.e. local times).

**columns (*array*)**: The grid columns. An array of objects of the following format:
```jsonc
{
  text (string):          column header text,
  minWidth (number):      minimum column width,
                          default: 0,
  defaultWidth (number):  the default/initial column width if
                          widths.columnWidths array
                          is not provided (see below)
}
```
<br/>

**widths (*object*)**: The grid columns widths. This is normally used to save/load column widths to the local storage or the application back end and set to a ref value initialized as an empty object. The updateWidths function (see below) updates the ref whenever columns are resized by the user without causing a render. Please see the demos for sample code. The widths object is in the following format:
```jsonc
{
  columnWidths (array):     initial grid column widths for using when persisting
                            column widths to the local storage or the application
                            backend. Column widths override the default widths specified
                            in the columns array above. If you want to persist column
                            widths without providing initial widths, you can initialize
                            this value to an empty array,
  gridWidth (number):       the initial grid area width
}
```
<br/>

**updateWidths (*function(widthInfo)*)**: A function accepting a widthInfo object, executing when either a column width or grid width changes.  The **widthInfo** object includes the following:
```jsonc
  columnWidths (array):   the widths of each displayed column,
  gridWidth (number):     the width of the grid
```
Both can be saved in a ref and persisted in the local storage or the application back end. When the page is refreshed, the persisted values should be passed to the **widths** prop.
<br/>

**rowStatus (*object dictionary*)**: Holds row expanded information. Each key corresponds to the id of the row and each value corresponds to the status of the row. The dictionary value is an object of the following format:
```jsonc
{
  isExpanded (bool): row is expanded
}
```
<br/>

**updateRowStatus (*function({})*)**: A function accepting an object dictionary with rowStatus values, executed when the row expanded status changes. This object can be saved in a ref and persisted in the local storage or the application back end. When the page is refreshed, the persisted value should be passed to the **rowStatus** prop.

**maxHeight (*number*)**: The maximum height the chart can occupy, `default: unbounded`.

**scrollLeft (*number*)**: The scrollbar left offset, `default: 0`.

**updateScrollLeft (*function(number)*)**: A function accepting Updates the scrollLeft.

**barHeight (*number*)**: The bar height excluding any vertical padding, `default: 35px`.

**rowVerticalPadding (*number*)**: The padding above and below each row, `default: 8`.


**zoom (*number*)**: The zoom value for the bar chart, range: 1 (fit-to-window)  -  100, `default: 1`.

**lockTimeScale (*bool*)**: Lock timeScale to the value set in the relevant prop (by default the timescale is automatically selected according to the time range and width of the viewable area), `default: false`.

**timeScale (*string*)**: The time scale for the horizontal axis (ignored if the lockTimeScale is set to `false`). Consist of two rows: the first row displays the primary interval and the second row displays the secondary interval. The available options are:

```jsonc
{
  “HourTenmin”,
  “DayHour”,
  “WeekDay”,
  “MonthWeek”,
  “YearMonth”
}
```
<br/>

**showPrimaryGridlines (*bool*)**: Enables primary grid lines, `default: false`.

**showSecondaryGridlines (*bool*)**: Enables secondary grid lines, `default: false`.

**handleBarClick (*function(barClickInfo)*)**: A function accepting a barClickInfo object, executing when any bar in the main area is clicked. The **barClickInfo** object includes the following:
```jsonc
  bar (object):       bar object,
  row (object):       row object,
  clickDate (date):   the chart clicked date on the horizontal axis.
                      clickDate helps with determining clicked bars
                      of lower z index,
  event:              low-level javascript event fired when clicking the bar
```
<br/>

**handleBarRightClick (*function(barRightClickInfo)*)**: A function accepting a barRightClickInfo object, executing when any bar in the main area is right-clicked. The **barRightClickInfo** object includes the following:
```jsonc
  bar (object):       bar object,
  row (object):       row object,
  clickDate (date):   the chart clicked date on the horizontal axis.
                      clickDate helps with determining clicked bars
                      of lower z index,
  event:              low-level javascript event fired when clicking the bar
```
<br/>

**handleRowClick (*function(row)*)**: A function accepting a row parameter, executing when the first grid column of a row is clicked. Returns the row object for that row.

**handleBarDrop (*function(dropInfo)*)**: A function accepting a dropInfo object, executing  when a bar is dropped into a new row. The **dropInfo** object includes the following:
```jsonc
{
  initialPositionX:  initial bar time,
  finalPositionX:    final bar time,
  initialRow:        initial bar row,
  finalRow:          final bar row,
  bar:               the bar object
}
```

## CSS classes
A list of the css classes that determine the styles of the various chart elements along with their default values. The classes can be overridden to change the look-and-feel of the chart:

```css
.gantt-container {
 font-family: sans-serif;
}

.grid {
  background: #81b299;
}

.grid-header-cell {
  color: #fff;
  border-color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.grid-contents-cell {
  color: #fff;
  border-color: #fff;
  font-size: 12px;
}

.bar-chart {
  background: #f9f9f9;
}

.bar-chart-row {
  border-color: #fff;
  background: #d0e0f2;
  font-size: 12px;
}

.bar-chart-grid-primary-gridline {
  border-color: #fff;
}

.bar-chart-grid-secondary-gridline {
  border-color: #fff;
}

.backdrop-bar {
  color: #000000;
}

.normal-bar {
  color: #000000;
}

.overlay-bar {
  color: #000000;
}

.bar-chart-header-row {
  background: #f3f1de;
}

.bar-chart-primary-header-row-entry {
  border-color: #fff;
  font-size: 14px;
  font-weight: bold;
  color: #777;
}

.bar-chart-secondary-header-row-entry {
  border-color: #fff;
  font-size: 12px;
  font-weight: normal;
  color: #777;
}

.gantt-legend {
  padding: 10px;
  font-size: 14px;
  line-height: 2;
  background: #f9f9f9;
}
```

## Report an issue

* [All issues](https://github.com/fluidence/react-gantt/issues)
* [New issue](https://github.com/fluidence/react-gantt/issues/new/choose)

## License

This version of @fluidence/react-gantt is distributed under GPL 3.0 license and can be legally used in GPL projects.<br/>
To use @fluidence/react-gantt in non-GPL projects, please obtain Perpetual license by contacting us at info@fluidence.net
