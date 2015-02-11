var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
    include: "http://www.just-eat.co.uk/area/*",
    //include: "http://localhost/*",
    contentScriptOptions: {prefixDataURI: self.data.url("")},
	contentScriptFile: [self.data.url("jquery-2.1.3.min.js"), self.data.url("api.js")],
	contentScriptWhen: "ready"
});