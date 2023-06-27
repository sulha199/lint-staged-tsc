#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// lib/index.ts
var import_node_process3 = __toESM(require("node:process"));

// lib/file-type-check.ts
var import_node_fs2 = __toESM(require("node:fs"));
var import_node_process2 = __toESM(require("node:process"));
var import_path = require("path");

// lib/create-tsconfig.ts
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_node_process = __toESM(require("node:process"));

// lib/parse-tsconfig.ts
var matchHashComment = new RegExp(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/, "gi");
var sanitizeJson = (json) => json.replace(matchHashComment, (match, g) => g ? "" : match).trim();
var parseTsConfig = (data) => {
  const json = sanitizeJson(data.toString("utf8"));
  try {
    const tsConfig = JSON.parse(json);
    return tsConfig;
  } catch (error) {
    console.log("Error: Unprocessable tsConfig file");
    process.exit(1);
  }
};

// lib/create-tsconfig.ts
var typesRegex = /^(\w+\.d\.ts)|(.*types.*)$/;
var tsConfigPath = import_node_path.default.join(import_node_process.default.cwd(), "tsconfig.json");
var createTsConfig = (stagedFiles) => {
  var _a;
  try {
    const tsConfigData = import_node_fs.default.readFileSync(tsConfigPath);
    const tsConfig = parseTsConfig(tsConfigData);
    let tsIncludes = [];
    if (Array.isArray(tsConfig == null ? void 0 : tsConfig.include) && tsConfig.include.length > 0) {
      tsIncludes = [
        ...(_a = tsConfig == null ? void 0 : tsConfig.include) == null ? void 0 : _a.filter((included) => typesRegex.test(included))
      ];
    }
    tsConfig.include = [...tsIncludes, ...stagedFiles];
    tsConfig.compilerOptions.noEmit = true;
    delete tsConfig.compilerOptions.emitDeclarationOnly;
    return tsConfig;
  } catch (error) {
    console.log("Error: cannot read tsConfig file");
    import_node_process.default.exit(1);
  }
};

// lib/run-typescript.ts
var import_node_child_process = require("node:child_process");

// lib/errors.ts
var ErrorExec = class {
  constructor(stdout, error) {
    this.stdout = stdout;
    this.error = error;
  }
};

// lib/run-typescript.ts
var runTypescript = async (tsConfigPath2) => new Promise((resolve, reject) => {
  (0, import_node_child_process.exec)(`npx tsc -p ${tsConfigPath2}`, (error, stdout) => {
    if (error) {
      return reject(new ErrorExec(stdout, error));
    }
    return resolve(stdout);
  });
});

// lib/file-type-check.ts
var randomString = () => Math.random().toString(36).slice(2, 11);
var fileTypeCheck = async (stagedFiles) => {
  var _a;
  const tsConfig = createTsConfig(stagedFiles);
  const radomizedFileName = `tsconfig.${randomString()}.json`;
  import_node_fs2.default.writeFileSync(radomizedFileName, JSON.stringify(tsConfig));
  try {
    await runTypescript(radomizedFileName);
    import_node_fs2.default.unlinkSync(radomizedFileName);
    import_node_process2.default.exitCode = 0;
  } catch (error) {
    import_node_fs2.default.unlinkSync(radomizedFileName);
    if (error instanceof ErrorExec) {
      const currentPath = import_node_process2.default.cwd();
      const errorMessage = error.stdout;
      const newLine = "\r\n";
      const linesFromError = errorMessage.split(newLine);
      const getRelativePath = (absolutePath) => ((0, import_path.isAbsolute)(absolutePath) ? (0, import_path.relative)(currentPath, absolutePath) : absolutePath).replaceAll("\\", "/");
      const errorsFromStagedFiles = [];
      stagedFiles.forEach((absolutePath) => {
        const relativePath = getRelativePath(absolutePath);
        errorsFromStagedFiles.push(...linesFromError.filter((line) => line.includes(relativePath)));
      });
      if (errorsFromStagedFiles.length > 0) {
        console.log(errorsFromStagedFiles.join(newLine));
        import_node_process2.default.exitCode = ((_a = error.error) == null ? void 0 : _a.code) || 1;
      }
    } else {
      console.log(error);
      import_node_process2.default.exitCode = 1;
    }
  } finally {
    return import_node_process2.default.exitCode;
  }
};
var file_type_check_default = fileTypeCheck;

// lib/index.ts
(() => {
  const args = import_node_process3.default.argv.slice(2);
  const files = args.filter((file) => /\.(ts|tsx)$/.test(file));
  if (files.length === 0) {
    import_node_process3.default.exitCode = 0;
  }
  file_type_check_default(files);
})();
