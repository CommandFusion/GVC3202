var baseURL = "http://61.210.230.218:8001/";
var username = "user";
var password = "12345678";
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
						CF.setJoin(webViewJoin, baseURL + "index.html?time=" + Date.now());
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