"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const shell = __importStar(require("shelljs"));
const path = __importStar(require("path"));
const homedir = require("os").homedir();
function install(javaVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        installJava(javaVersion);
        installSbt();
    });
}
exports.install = install;
function installJava(javaVersion) {
    core.startGroup("Install Java");
    shell
        .exec("curl -sL https://github.com/shyiko/jabba/raw/master/install.sh", {
        silent: true
    })
        .exec("bash");
    const jabbaBin = path.join(homedir, ".jabba", "bin");
    core.addPath(jabbaBin);
    const jabba = path.join(jabbaBin, "jabba");
    const toInstall = shell
        .exec(`${jabba} ls-remote`)
        .grep(javaVersion)
        .head({ "-n": 1 })
        .stdout.trim();
    console.log(`Installing ${toInstall}`);
    shell.exec(`${jabba} install ${toInstall}`);
    const javaHome = shell
        .exec(`${jabba} which --home ${toInstall}`)
        .stdout.trim();
    core.exportVariable("JAVA_HOME", javaHome);
    core.addPath(path.join(javaHome, "bin"));
    core.endGroup();
}
function installSbt() {
    core.startGroup("Install sbt");
    const bin = path.join(homedir, "bin");
    shell.mkdir(bin);
    core.addPath(bin);
    curl("https://raw.githubusercontent.com/paulp/sbt-extras/master/sbt", "sbt");
    curl("https://raw.githubusercontent.com/coursier/sbt-extras/master/sbt", path.join(bin, "csbt"));
    core.endGroup();
}
function curl(url, outputFile) {
    shell.exec(`curl -sL ${url}`, { silent: true }).to(outputFile);
    shell.chmod("+x", outputFile);
    console.log(`Downloaded '${path.basename(outputFile)}'`);
}