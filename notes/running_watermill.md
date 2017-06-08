# Running bionode-watermill

## How can I run bionode-watermill on my custom pipeline?

In order to require bionode-watermill to run a custom made pipeline, one 
should follow these simple steps:

1. First, create a folder where you place your `pipeline.js`
2. Within this folder run `npm install bionode-watermill`. This will create a
 folder named `node_modules`, with all dependencies of bionode-watermill.
3. After, install any dependencies that are required by your `pipeline.js`.
4. Finally, you will be able to run your pipeline and do not forget to: 
```javascript
require('bionode-watermill')
```

Note: steps 2 and 3 can be replaced by using a [package.json](https://docs.npmjs.com/files/package.json)
inside your main 
folder for the `pipeline.js`. With this method you just do `npm install` 
within the main folder, where the [package.json](https://docs.npmjs.com/files/package.json) 
is located.

