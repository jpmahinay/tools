// main.js

function getDATAPROJECT() {
  // Show HTML popup for project selection
  var html = HtmlService.createHtmlOutputFromFile('SelectProjectID.html')
      .setWidth(420)
      .setHeight(150);
  google.script.host.showDialog(html);
  // Continue script will be called from the HTML file
}

function continueScript(projectId, sheetName) {
  try {
    // Show processing message
    var htmlOutput = HtmlService.createHtmlOutput('<p>Processing.. Please Wait</p>')
        .setWidth(200)
        .setHeight(40);
    google.script.host.showDialog(htmlOutput);

    // Get credentials from cache or set them if not cached
    var cache = CacheService.getScriptCache();
    var consumerKey = cache.get("consumerKey") || "dcf0884b-bb81-490a-8709-efab05170b1d";
    var consumerSecret = cache.get("consumerSecret") || "w7FFlxlbtctZUFtEyW7ePTVkXAUlDb3qLKAUVLUJgenq7dVt15Tcb9R-YqLn0Em8";
    cache.putAll({"consumerKey": consumerKey, "consumerSecret": consumerSecret});

    // OAuth Signature 
    var signature = encodeURIComponent(consumerSecret) + "&";

    // Get headers from cache or set them if not cached
    var headers = cache.get("headers") || {
      "Authorization": getAuthHeader(consumerKey, signature) 
    };
    cache.put("headers", headers);

    // Options
    var options = {
      headers: headers,
      muteHttpExceptions: true
    };

    // Get base URL from cache or set it if not cached
    var baseUrl = cache.get("baseUrl") || "https://api.buzzstream.com/v1";
    cache.put("baseUrl", baseUrl);

    // Get and write websites data
    var allWebsites = getAllWebsites(baseUrl, projectId, options);
    
    // Convert data to a string
    var dataString = allWebsites.map(website => website.name).join('\n');

    // Show the data in a text box on the HTML
    var htmlOutputWithData = HtmlService.createHtmlOutput('<textarea rows="10" cols="50">' + dataString + '</textarea><br><br><button onclick="google.script.host.close()">Close</button>')
        .setWidth(400)
        .setHeight(250);
    google.script.host.showDialog(htmlOutputWithData, 'Buzzstream Data');
  } catch (error) {
    // Display error on HTML
    var errorOutput = HtmlService.createHtmlOutput('<p style="color: red;">Error: ' + error.message + '</p><br><button onclick="google.script.host.close()">Close</button>')
        .setWidth(300)
        .setHeight(100);
    google.script.host.showDialog(errorOutput, 'Error');
  }
}

function getAuthHeader(consumerKey, signature) {
  var timestamp = Math.round(new Date().getTime() / 1000);
  return 'OAuth oauth_consumer_key="' + consumerKey + '",oauth_signature_method="PLAINTEXT",oauth_timestamp="' + timestamp + '",oauth_nonce="' + '",oauth_version="1.0",oauth_signature="' + signature + '"';  
}

function getAllWebsites(baseUrl, projectId, options) {
  var allWebsites = [];
  var offset = 0;
  var maxResults = 1000;

  do {
    var websitesUrl = baseUrl + "/websites?project=" + projectId + "&offset=" + offset + "&max_results=" + maxResults;
    var websites = getWebsites(websitesUrl, options);

    if (websites.length === 0) {
      break;  // No more results, exit loop
    }

    allWebsites = allWebsites.concat(websites);
    offset += maxResults;

  } while (websites.length === maxResults);

  return allWebsites;
}

function getWebsites(url, options) {
  var response = UrlFetchApp.fetch(url + "&expand=true", options);
  var data = JSON.parse(response.getContentText()); 
  return data.list || [];
}
