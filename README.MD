# parese-name-import


require node version >= 6.0

A script help you parse your file to transform whole module import to import only you need.

This is useful when the package you use support ES6 modules and you want to transform your old code to support ES6 modules import and save some space of your build file when using tree shaking(statically analyse the code and only include the bits of the library that are actually used).

For example transform
```js
import THREE from "three";
const myMesh = new THREE.Mesh();
```
to
```js
import { Mesh } from "three";
const myMesh = new Mesh();
```

### Usage
```
node index.js [path] [replacedStatement]
```
* [path]: the path the your folder or your file
* [replacedStatement]: the import statement you want to replace

To transform example above, all you need is do the following.
```
node index.js /src/ 'import THREE from "three";'
```
