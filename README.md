# Salesforce Login Manager
Link : [Chrome Extension Page](https://chromewebstore.google.com/detail/salesforce-login-manager/beemdmmeeddbifmjlaiboldgnffddibd)

## Project setup
```
npm install
```

### Compiles and minifies for production
```
npm run build
```

Open chrome extensions tab, click Load Unpacked (make sure developer mode is on) and select the **dist** folder and you should see the extension loaded, after new build you can just simply hit reload button. 

The core logic of this extension is present in 

⋅⋅* src/components/partial/DisplayRecords.vue --> to display all records and buttons
⋅⋅* src/assets/helper.js --> encrypt / decrypt the creds
⋅⋅* extension/js/login.js --> fetch data and submit the chrome extension

Main logic details will be updated on [Doc Page](https://rohitasare7.github.io/Chrome-Ext-Salesforce-Login-Manager/) soon.

Notes : 

Add below line to bypass chrome lint errors
/*global chrome*/
