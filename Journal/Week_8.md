# Week 8 (21 July to 26 July)

## Summary

## Progress

### Execute pipelines inside another pipeline as a task (cont...)

Attempted to import the promise of a pipeline from another `pipeline.js`:

```javascript
const testPipe = require('./test.js')
```

`testPipe` is the exported pipeline (promise) from `test.js`.

then created a task:

```javascript
const importedTask = task({}, () => testPipe())
```

and added it to the end of another pipeline as a normal task.

Pipeline executes properly, a new vertex and edge is created but then it 
generates no output folder as well as information from the tasks being 
executed within `test.js` (this latter is an expected behavior).