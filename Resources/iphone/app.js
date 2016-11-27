function receivePush(e) {
    console.log(e);
    setTimeout(function() {
        notificare.openNotification(e.data);
    }, 0);
}

function deviceTokenSuccess(e) {
    setTimeout(function() {
        Ti.API.info(e.deviceToken);
        notificare.registerDevice(e.deviceToken, function(e) {
            if (!e.error) {
                notificare.startLocationUpdates(e);
                notificare.fetchTags(function(e) {
                    Ti.API.info(e.tags);
                });
                var tags = [ "appcelerator" ];
                notificare.addTags(tags, function() {});
            }
        });
    }, 0);
}

function deviceTokenError(e) {
    setTimeout(function() {
        alert("Failed to register for push notifications! " + e.error);
    }, 0);
}

var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

var notificare = require("ti.notificare");

Ti.API.info("module is => " + notificare);

Alloy.Globals.notificare = notificare;

var deviceToken = null;

notificare.addEventListener("ready", function() {
    if (parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        Ti.App.iOS.addEventListener("usernotificationsettings", function registerForPush() {
            Ti.App.iOS.removeEventListener("usernotificationsettings", registerForPush);
            Ti.Network.registerForPushNotifications({
                success: deviceTokenSuccess,
                error: deviceTokenError,
                callback: receivePush
            });
        });
        notificare.registerUserNotifications();
    } else Ti.Network.registerForPushNotifications({
        types: [ Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND ],
        success: deviceTokenSuccess,
        error: deviceTokenError,
        callback: receivePush
    });
});

Ti.App.iOS.addEventListener("remotenotificationaction", function(e) {
    notificare.handleAction({
        notification: e.data,
        identifier: e.identifier
    }, function(e) {
        Ti.API.info(e.success ? e.success.message : e.error.message);
    });
});

notificare.addEventListener("didOpenNotification", function(e) {
    Ti.API.info(e);
});

notificare.addEventListener("didExecuteAction", function(e) {
    Ti.API.info(e);
});

notificare.addEventListener("didRangeBeacons", function(e) {
    e && e.beacons && e.beacons.length > 0 && e.beacons.forEach(function() {});
});

Alloy.createController("index");