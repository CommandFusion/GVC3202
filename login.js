var baseURL = "http://220.145.125.107:8001/";
var username = "admin";
var password = "Netadmin";
var webViewJoin = "s1";

function doLogin() {
	// Send a request to the Vid Conf system to start the login process
	CF.request(baseURL + "manager?action=loginrealm&time=" + Date.now(), function(status, headers, body) {
		if (status == "200" && body) {
			// Now that we have the realm data, we can calculate the hash
			CF.hash(CF.Hash_MD5, username + ":" + body + ":" + password, function(hash) {
				// Submit the login request directly in the web view
				CF.request(baseURL + "manager?action=login&Username=" + username + "&Secret=" + hash.toLowerCase() + "&time=" + Date.now(), function(status, headers, body) {
					if (status == "200") {
						// Check if in sleep mode
						var msgs = res_parse_rawtext(body);
						if (msgs.headers['response'].toLowerCase() == "success") {
							if (msgs.headers["insleep"] == "1") {
								CF.log("In sleep mode...waking up now...");
								CF.request(baseURL + "manager?action=reboot&reboottype=3&time=" + Date.now(), function(status, headers, body) {
									// Requested wake up, now check if in sleep mode 3 seconds later
									setTimeout(checkWakeup, 3000);
									return;
								});
							} else {
								CF.setJoin(webViewJoin, baseURL + "index.html?time=" + Date.now());
							}
						} else {
							CF.log("LOGIN ERROR!");
							CF.logObject(msgs);
						}
						return;
					}
					CF.log(status);
					CF.logObject(headers);
					CF.log(body);
				});
			});
			return;
		}
		CF.log(status);
		CF.logObject(headers);
		CF.log(body);
	});
}

function res_parse_rawtext(data) {
    msgs = new Object();
    msgs.headers = new Array();
    msgs.names = new Array();
    var allheaders = data.split('\r\n');
    var y = 0;
    for (var x = 0; x < allheaders.length; x++) {
        if (allheaders[x].length) {
            var fields = allheaders[x].split('=');
            if (fields[0] != undefined && fields[1] != undefined) {
                msgs.headers[fields[0].toLowerCase()] = fields[1];
                msgs.names[y++] = fields[0].toLowerCase();
            }
        }
    }
    return msgs;
}

function checkWakeup() {
	CF.log("Checking if awake yet...");
	CF.request(baseURL + "manager?action=insleepmode&time=" + Date.now(), function(status, headers, body) {
		if (status == "200") {
			var msgs = res_parse_rawtext(body);
			if (msgs.headers["insleep"] == "1") {
				// Still asleep...
				CF.log("Still asleep...please wait...");
				setTimeout(checkWakeup, 3000);
			} else {
				// Woken up and logged in, lets go!
				CF.setJoin(webViewJoin, baseURL + "index.html?time=" + Date.now());
			}
			return;
		}
		CF.log(status);
		CF.logObject(headers);
		CF.log(body);
	});
}