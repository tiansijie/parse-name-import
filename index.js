var fs = require('fs');
var acorn = require("acorn");

let path = process.argv[2];
const importStatement = process.argv[3];
const parsedImport = acorn.parse(importStatement, {sourceType: "module"});

let packageName = "";
let target = "";
if (parsedImport.body[0].type === "ImportDeclaration") {
	const importBody = parsedImport.body[0];
	packageName = importBody.source.value;
	target = `${importBody.specifiers[0].local.name}.`;
}
else if (parsedImport.body[0].type === "VariableDeclaration") {
	const varBody = parsedImport.body[0];
	if (varBody.declarations.length) {
		const decl = varBody.declarations[0];
		target = `${decl.id.name}.`;
		packageName = decl.init.arguments.length && decl.init.arguments[0].value;
	}
}
else {
	console.log("need to provide correct import statement");
	process.exit(1);
}

if (target === "" || packageName === "") {
	console.log("need to provide correct import statement");
	process.exit(1);
}

path = path.trim();
if (path.substring(path.length - 3, path.length) === ".js") {
	parseTarget(path);
}
else {
	if (path[path.length - 1] !== "/") {
		path = path + "/"
	}
	readAllFiles(path);
}

function readAllFiles(path) {
	fs.readdir(path, "utf8", (err, files) => {
		if (!err) {
			files.forEach(file => {
				if (file[0] !== ".") {
					if (file.includes(".js")) {
						parseTarget(`${path}${file}`);
					}
					else {
						readAllFiles(`${path}${file}/`);
					}
				}
			});
		}
	});
}


function parseTarget(path) {
	fs.readFile(path, 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		let result = [];
		let rMap = {};
		let rIndex = 0;
		let copy = data.slice(0);
		let count = 0;

		while(copy.indexOf(target) !== -1) {
			const index = copy.indexOf(target);
			copy = copy.substring(0, index) + copy.substring(index + target.length);

			result[rIndex] = ""
			for(let i = index; i < copy.length; ++i) {
				if (copy[i] === "("
				|| copy[i] === ";"
				|| copy[i] === " "
				|| copy[i] === ","
				|| copy[i] === ")"
				|| copy[i] === "}"
				|| copy[i] === "{"
				|| copy[i] === "."
				|| copy[i] === "\n"
			) {
					break;
				}
				result[rIndex] += copy[i];
			}
			rMap[result[rIndex]] = true;
			rIndex++;
		}

		if (importStatement && importStatement.length) {
			const importIndex = copy.indexOf(importStatement);
			if (importIndex !== -1) {
				copy = copy.substring(0, importIndex) + copy.substring(importIndex + importStatement.length);
			}
		}

		const appendData = Object.keys(rMap).join(",\n");
		if(appendData.length) {
			const normalizedData = `import {\n${appendData}\n} from "${packageName}";\n`;
			fs.writeFile(path, normalizedData + copy, (err) => {
				if (err) {
					throw err;
				}
				console.log(`Parsed done on ${path}`);
			});
		}
	});
}
