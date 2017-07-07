# Week 6 (6 July to 12 July)

## Summary

This week we set the goals to finish the pending issues with graph 
visualization and output file (`graphson.json`), namely the obtaining of 
`resolvedInput` and `operationString`. Also, we started studying the 
implementation of the graph for many orchestrators of watermill, i.e., how 
they behave under different conditions. For that the development of new 
pipelines (commonly used in bioinformatics) might help us clarify if the 
behavior of orchestrators is what we expect.

## Progress

First I implemented a way to log redux actions and states to the 
console (or chrome inspector, with `--inspect`) with `redux-logger`. For that
 I added:
 
 ```javascript
const createLogger = require('redux-logger')
const logger = createLogger()
```
changed the middleware currently being passed to createStore() to accept 
logger if a given environmental variable is called:

```javascript
// default middlewares
let middlewares = [thunk, sagaMW]

// if Environmental variable REDUX_LOGGER is 1 then...
const loggerEnv = process.env.REDUX_LOGGER
// for now call REDUX_LOGGER=1 before executing a pipeline
// REDUX_LOGGER=1 node pipeline.js
if (loggerEnv === '1') {
  middlewares.push(logger)
}
  
const store = createStore(rootReducer, applyMiddleware(...middlewares))
```

This way we can call `REDUX_LOGGER=1 node pipeline.js` and this will output 
all redux related actions and states to the console. Also, one can use chrome
 inspector (`REDUX_LOGGER=1 node --inspect pipeline.js`) and open chrome 
 browser to have a better visualization of the output.
 
After this implementation, found that three errors were being outputted:

1)
```
(node:16356) DeprecationWarning: Calling an asynchronous function without callback is deprecated.
```
2)
```
(node:16356) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connection listeners added. Use emitter.setMaxListeners() to increase limit
```
3)
```
Unhandled rejection (<{"threads":1,"container":null,"resume"...>, no stack trace)
```

For the first one, I removed previous manifest file implementation on 
`lib/sagas/lifecycle.js` and replaced writeFile() in `collection.js` with 
writeFileSync().
The second one, was caused by the default setMaxListeners() behavior of 
sockets.io and then I just had to set 
```javascript
io.sockets.setMaxListeners(0)
```

The third issue, wasn't an issue with watermill itself but rather with `bwa` 
which doesn't handled the fasta.gz files for creating the index. Thus I had 
to re-work the `pipeline.js` and `pipeline_lazy.js`
(`examples/pipelines/two-mappers`) 
script to fix 
this.

## TODO

Future implementation of logger must be passed through a CLI as described 
[here](https://github.com/bionode/bionode-watermill/issues/31). For now, this
is a quick fix for debugging purposes. Later, when we implement a CLI we have
 to have this into account.