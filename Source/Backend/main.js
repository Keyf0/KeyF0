require("./Build/KFModules/Web/Web").init();
require("./Build/KFModules/NetNode/NetNode").init();
require("./Build/KFModules/PixiGamePlay/PIXIGamePlay").init();
require("./Build/KFModules/Nodejs/NDFileIO").SetDefaultIO();
require("./Build/KFModules/Nodejs/NDHttpRequest").SetDefaultHttpRequest();
let NDws = require("./NDws");
require("./Build/KFNetwork/WS/IWebSocket").IWebSocket_Type.meta.instantiate = function(url){
    return new NDws(url);
};

let AppLauncher = require("./Build/App/AppLauncher");
let app = new AppLauncher.AppLauncher(2);
app.setFPS(30);

app.config.OnKFDLoaded.on(function (kfdtb) {});
app.run("../Html/appnettest","../Html/kfds","PIXIScene.blk");
