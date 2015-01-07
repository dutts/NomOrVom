var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
    include: "http://www.just-eat.co.uk/area/*",
    //include: "http://localhost/*",
    contentScriptOptions: {prefixDataURI: self.data.url("")},
	contentScriptFile: [self.data.url("jquery-1.11.1.min.js"), self.data.url("api.js")]
});