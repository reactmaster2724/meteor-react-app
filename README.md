# README #

This repository is a meteor port of the next action project, built to get around the communication issues that were present with the plain node version of the project.

### How do I get set up? ###
Setting up the project is very simple. Meteor takes care of most required actions, so the only thing that needs to be done is to install meteor from the command line:


To use application, you need to

1) Run chrome with disabled web security

on Mac
```
open -a Google\ Chrome --args --disable-web-security --user-data-dir
```

2) Install ignore iframe header chrome extenstion

https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe

### Coding conventions ##

to get pretty print console.log:
console.log JSON.stringify(objectname,null,2) 

in order to see call stack visually:
insert debugger in code, then run meteor debug

```
#!shell

curl https://install.meteor.com/ | sh
```

Once that is done, go into the project directory and run


```
#!shell

meteor
```

The project will now launch on port 3000, so navigate to localhost:3000 for use. use meteor debug to be able to set debugger breakpoints. but its kind of useless since you can look at the object variables, just tells you it exists and its an Object. meteor 2.1 seems to fix this.

#Dev Tips
```
#!shell


ps aux | grep -ie meteor | awk '{print "kill -9 " $2}'
```



workflow.json nodes.workflow_entries error

267(8)? (STDERR) 						throw(ex);
W20170627-14:10:01.268(8)? (STDERR) 						^
W20170627-14:10:01.268(8)? (STDERR) 
W20170627-14:10:01.269(8)? (STDERR) TypeError: Cannot read property 'setSource' of undefined
W20170627-14:10:01.269(8)? (STDERR)     at Graph.loadGraph (server/openb-workflow-engine/main.graph.coffee:266:9)
W20170627-14:10:01.270(8)? (STDERR)     at server/startup/workflow.load.coffee:56:26
W20170627-14:10:01.271(8)? (STDERR)     at Function.time (/Users/hanselke/Dev/nextactionmeteor/.meteor/local/build/programs/server/profile.js:309:28)
W20170627-14:10:01.272(8)? (STDERR)     at /Users/hanselke/Dev/nextactionmeteor/.meteor/local/build/programs/server/boot.js:347:13
W20170627-14:10:01.273(8)? (STDERR)     at /Users/hanselke/Dev/nextactionmeteor/.meteor/local/build/programs/server/boot.js:388:5
W20170627-14:10:01.274(8)? (STDERR)     at Function.run (/Users/hanselke/Dev/nextactionmeteor/.meteor/local/build/programs/server/profile.js:510:12)
W20170627-14:10:01.275(8)? (STDERR)     at /Users/hanselke/Dev/nextactionmeteor/.meteor/local/build/programs/server/boot.js:386:11


use sublime excludes when finding in files

-node_modules/*,-*.meteor/*,-*.min.*




#Known bugs

Dont know how to deal with resetting angular application state, so when moving to actions from dashboard, have to do $window refresh. fixing it only with react rebuild






