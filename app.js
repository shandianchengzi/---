import * as LC from './lib/lc.min';
import * as Adapters from '@leancloud/platform-adapters-baidu';
LC.setAdapters(Adapters);
var APP_ID = "你的APP_ID";//请去leancloud自己注册账号并填入APP_ID
var APP_KEY = "你的APP_KEY";//请去leancloud自己注册账号并填入APP_KEY
var serverURL = "你的域名";//请去leancloud自己注册账号并填入serverURL
LC.init({
    appId: APP_ID,
    appKey: APP_KEY,
    serverURL: serverURL
}); //app.js
/* globals swan */

App({
    onLaunch(options) {
        // do something when launch
    },
    onShow(options) {
        // do something when show
    },
    onHide() {
        // do something when hide
    }
});
