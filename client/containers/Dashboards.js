import {
  connect
} from 'react-redux'

export default DashboardService = function (store) {
  this.dashboards = {};
  this.overrides = {}

  var self = this;
  Meteor.call('getWorkflow', (error, response) => {
    if (error) {
      console.error("Couldn't get workflow");
    }
    self.dashboards = self._constructDashboards(response.lanes);
    self.overrides = response.overrides;
    //console.log("Service: ", self.dashboards)
    store.dispatch({
      type: 'SET_DASHBOARDS',
      dashboards: self.dashboards,
      overrides: self.overrides
    })
  });

  this._constructDashboards = function (lanes) {
    let dashboard, ids;
    const categories = [];
    const dashboards = {};
    const DashboardDefaults = {
      erpnext: {
        label: "ERP Next Dashboard"
      }
    };

    dashboards.main = {
      label: "Main Dashboard",
      name: "main",
      notifications: 0,
      lanes: []
    };

    for (var lane of Array.from(lanes)) {
      lane.type = 'default';
      if ((lane.category != null) && Array.from(categories).includes(lane.category)) {
        dashboards[lane.category].lanes.push(lane);
      } else if ((lane.category != null) && (lane.category !== 'main')) {
        categories.push(lane.category);
        dashboards[lane.category] = {
          lanes: [lane],
          label: lane.category + " Dashboard",
          notifications: 0
        };
        dashboards.main.lanes.push({
          label: lane.category,
          name: lane.category,
          ids: []
        });
      } else {
        dashboards.main.lanes.push(lane);
      }
    }

    // Do an ids pass
    for (let category of Array.from(categories)) {
      ids = [];
      // Find the ids
      for (lane of Array.from(dashboards[category].lanes)) {
        ids.push.apply(lane.ids);
      }

      // Apply all to this lane
      for (lane of Array.from(dashboards.main.lanes)) {
        if (lane.name === category) {
          lane.ids.push.apply(ids);
          lane.type = 'dashboard';
        }
      }
    }

    for (var dashboardName in DashboardDefaults) {
      dashboard = DashboardDefaults[dashboardName];
      dashboard.notifications = 0;
      dashboards[dashboardName] = dashboard;
    }

    for (dashboardName in dashboards) {
      dashboard = dashboards[dashboardName];
      if (dashboard.lanes != null) {
        /*
        dashboard.lanes.unshift
          label: "Inbox"
          ids: ['INBOX']
          type: 'default'
          name: "INBOX"
        */
        dashboard.lanes.push({
          label: "Done",
          ids: ['DONE'],
          type: 'default',
          name: "DONE"
        });
      }
    }

    // Remove the main dashboard, used only to inintiate dashboards?, dashboards expects array and erpnext doesnt count
    //console.log Object.keys(dashboards)
    if (Object.keys(dashboards).length > 3) {
      delete dashboards.main;
    }

    // Strictly speaking, bad practice to store data
    // in a service. But for now, whatever.
    return dashboards;
  };
}