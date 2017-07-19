# Week 6 (13 July to 20 July)

## Summary

## Progress

### Optional tasks

#### The comment workaround

Currently optional tasks have to be declared each time the pipeline has to be
 run, i.e. one may comment a given task in the script that exectutes the 
 pipeline. 
 
 ```javascript
const pipeline = join(
  task1,
  task2,
  task3
)
```

This will render the following workflow:

`task1 --> task2 --> task3`

but if we comment task2:

 ```javascript
const pipeline = join(
  task1,
  //task2,    //notice that I commented the comma
  task3
)
```

Thiw will render the following workflow:

`task1 --> task3`
 
 This will actually work but is somehow sketchy.
 
 
 #### Using nodejs process.argv
 
 Node.js already has the option to pass optional args to the command in shell
 . For instance if we write something in shell: `node pipeline.js arg1 arg2`,
we end up with the following array available in `process.argv`:

```javascript
[
  node,
  pipeline.js,
  arg1,
  arg2
]
```
And this can be used to construct alternative pipelines without adding more 
functions to `bionode-watermill` api.

For instance, the user can define two pipelines in its script:

```javascript
const pipeline1 = join(task1, task2, task3)

const pipeline2 = join(task1, task3)

/* then an if statement that checks the presence of args could be like the 
following*/

if (process.argv[2] === 'optional') {
  // executes the optional task
  pipeline1()
} else {
  // executes the standard pipeline
  pipeline2()
}
```