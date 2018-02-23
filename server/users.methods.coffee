Meteor.methods
  addErpCookie: (targetUserEmail, cookie) ->
    targetUser = Meteor.users.find({ "profile.email": targetUserEmail}).fetch()[0]
    targetUserID = targetUser._id
    console.log "users.method trying to set profile.erpnext_sid with " + cookie + " for " + targetUserID
    Meteor.users.update({_id: targetUserID}, {$set: {"profile.erpnext_sid": cookie}})
    
  removeUserRole: (user,targetUserID, role) ->
    console.log "users.methods removeUser role user: " + JSON.stringify(user,null,2) + " targetUserID: " + targetUserID + " role: " + role
    isManager = 'manager' in user.profile.groups
    isAdmin = 'administrator' in user.profile.groups

    if !(isAdmin or isManager)
      return

    targetUser = Meteor.users.findOne({_id: targetUserID})
    console.log "users.method removeUser targetUser: " + JSON.stringify(targetUser,null,2)
    roleIndex = targetUser.profile.roles.indexOf role

    if roleIndex >= 0
      targetUser.profile.roles.splice(roleIndex,1)

      Meteor.users.update({_id: targetUserID}, {$set: {"profile.roles": targetUser.profile.roles}})

  addUserRole: (targetUserID, role) ->
    user = Meteor.user()
    isManager = 'manager' in user.profile.groups
    isAdmin = 'administrator' in user.profile.groups

    if !(isAdmin or isManager)
      return

    console.log role

    targetUser = Meteor.users.findOne({_id: targetUserID})
    roleIndex = targetUser.profile.roles.indexOf role

    if roleIndex < 0
      targetUser.profile.roles.push role
      Meteor.users.update({_id: targetUserID}, {$set: {"profile.roles": targetUser.profile.roles}})
  ### not used, used users.publish instead
  getUserList: () ->

    Meteor.users.find {}, {fields: { profile: 1, _id: 1}}, (userListcur) ->
      console.log 'users.methods getUserList userListcur: ' + userListcur
      userListcur.find (userList) ->
        console.log "users.methods userList: " + JSON.stringify(userList,null,2)
        return userList
  ####
