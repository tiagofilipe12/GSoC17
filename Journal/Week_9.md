# Week 9 (27 July to 2 August)

## Summary

## Progress

### How to merge results from different pipeline branches?

Currently, it is not very intuitive how someone can merge results from 
different pipeline branches. For instance we may think of `fork` at a certain
 point of our pipeline to make two independent branches with less effort than
  duplicating tasks along the pipeline. In fact the result should be the 
  same, however, if later we want to merge the results from the branches of 
  the pipeline things may get ugly. 
  `fork` was designed to branch the pipeline into two or more branches that 
  end in different leaves. This has implication on the choices the user will 
  make to design a pipeline. 
  
  For instance, when I started doing the 
  [two-mappers](https://github.com/bionode/bionode-watermill/tree/dev/examples/pipelines/two-mappers) 
  pipeline, I though it would get references genome and samples and then 
  perform a mapping with two tools: bwa and bowtie2. For this I user `fork` 
  because it saved me the pain of writing more tasks or call them several times
  
  But then I thought, what
   if we are interested in comparing somehow the results from both mapping 
   approaches? Or to have a consensus result from both mapping approaches?
   
   Well, the answer is: with `fork` I cannot!
   The reason is simple. As mentioned above, `fork` is used to end in several
    leaves rather than one leaf. Also `fork` is useful for not waiting for 
    the results of a branch to run the other branch. To sum up, `fork` 
    doesn't wait for anyone!
  
  But ` junction` is in fact designed to wait for the outputs of different 
  branches before running other tasks. So `junction` was in fact what I 
  wanted, although for that I would have to duplicate tasks.
  
  I started by define the two-mappers pipeline as:
  
  ```javascript
const pipeline = join(
  junction(
    getReference,
    join(getSamples,fastqDump)
  ),
  samtoolsFaidx, gunzipIt, /* since this will be common to both mappers, there
   is no
   need to be executed after fork duplicating the effort. */
  junction(
    join(indexReferenceBwa, bwaMapper, samtoolsView, samtoolsSort, samtoolsIndex, samtoolsDepth),
    join(indexReferenceBowtie2, bowtieMapper, samtoolsView, samtoolsSort, samtoolsIndex, samtoolsDepth)
  )
// .... some other tasks that merge the outputs from the two mapping approaches
)
```

However, here I got surprised because my pipeline looked like this:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/merge_two_mappers/merge_two_mappers_before.png "merge 
graph")

The white nodes are the nodes that were expected but that were not executed 
at all. This was happening because `samtoolsView` has already generated an 
`uid` for the first iteration, then when it attempted to execute 
`samtoolsView` task again, it raised an error stating that the `uid` already 
exists. 

Then, I started looking into the [code](https://github.com/bionode/bionode-watermill/blob/dev/lib/lifecycle/generate-uid.js#L16-L46) 
where the uid is generated. `uid` are being generated from props before 
running any task. This means that everything that is within each task `{}` is
 what is used to generate the uids. 
 
 ```javascript
const samtoolsView = task(
  // BEGINNING OF props //
  {
  input: {
    samfile: '*.sam',
    faidxfile: '*.fasta.fai'
  },
  output: '*.bam',
  name: 'Samtools View'
} // END OF props //
, ({ input }) => {
  const outputfile = input.samfile.slice(0,-3) + 'bam'  /* use same name as
   input but replace the final extension to the string to bam. In this case
    if we hardcode the name, it will render an error since two outputs will
     match the same name */
  return `samtools view -b -S -t ${input.faidxfile} -@ ${THREADS} -o ${outputfile} ${input.samfile}`
})
```
 
 But in fact previously watermill was just using `props.input` `props.output` and `props.params`. In fact, users may do minor 
 tweaks into input/output patterns that will render different uids. However, 
 this is not very intuitive and may get confusing if we end up with several 
 patterns.
 
 Furthermore, resolvedInput would be awesome but it is not available when 
 watermill is reading the task, because it will only have `props` and 
 `operationCreator` corresponding to the functions executed within a task.
 
 On the other hand, we do not want to remove this functionality from 
 watermill, i.e., the capacity of checking if a task has been previously 
 executed based on the existence of that `uid`. Also it might get extremely 
 messy to control I/O from different tasks.
 
 Therefore rather than breaking functionality I added another `props` - 
 `name`, which already exists in default task state and that can be used for 
 this check.  
    
  ```javascript
const uid = hash(hashes.input + hashes.output + hashes.params + hashes.name)
```

With this, instead of changing patterns for `input` or 
 `output`, users will need to add a unique name for each task (which is
  kind of 'best practices') and the variable to which each task is assigned 
  must be unique also (because a `const` cannot be defined twice in 
  javascript!).
  
  Here is an example for the two-mappers pipeline:
  
  ```javascript
// === PIPELINE ===

const pipeline = join(
  junction(
    getReference,
    join(getSamples,fastqDump)
  ),
  samtoolsFaidx, gunzipIt, /* since this will be common to both mappers, there
   is no
   need to be executed after fork duplicating the effort. */
  junction(
    join(indexReferenceBowtie2, bowtieMapper, samtoolsView, samtoolsSort, samtoolsIndex, samtoolsDepth),
    join(indexReferenceBwa, bwaMapper, samtoolsView2, samtoolsSort2, samtoolsIndex2, samtoolsDepth2)
  ),
  somethingElse
)
```

Also, notice the difference between the duplicated task. For instance 
`samtoolsView`:

```javascript
const samtoolsView = task({
  name: 'Samtools View',
  input: {
    samfile: '*.sam',
    faidxfile: '*.fasta.fai'
  },
  output: '*.bam'
}, ({ input }) => {
  const outputfile = input.samfile.slice(0,-3) + 'bam'  /* use same name as
   input but replace the final extension to the string to bam. In this case
    if we hardcode the name, it will render an error since two outputs will
     match the same name */
  return `samtools view -b -S -t ${input.faidxfile} -@ ${THREADS} -o ${outputfile} ${input.samfile}`
})
```

and `samtoolsView2`

```javascript
const samtoolsView2 = task({
  name: 'samtoolsView2',
  input: {
    samfile: '*.sam',
    faidxfile: '*.fasta.fai'
  },
  output: '*.bam',
}, ({ input }) => {
  const outputfile = input.samfile.slice(0,-3) + 'bam'  /* use same name as
   input but replace the final extension to the string to bam. In this case
    if we hardcode the name, it will render an error since two outputs will
     match the same name */
  return `samtools view -b -S -t ${input.faidxfile} -@ ${THREADS} -o ${outputfile} ${input.samfile}`
})
```

Notice the change in `name`, that will be enough to generate a different uid 
for each task without adding much confusion or editing to the input and 
output patterns. In fact, in this case I haven't change any of the input and 
output patterns from `samtools`* tasks. Check the code [here](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/merge_two_mappers/merge_two_mappers.js).

Finally, workflow was properly executed as expected (check [this](https://github.com/bionode/GSoC17/tree/master/Experimental_code/Experimental_Pipelines/merge_two_mappers)).


## fork within fork

Using the above workaround for tasks with same props (where `props.name` can be 
used to control `uids`) I tried to make the following workflow:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/fork_fork/index.png "fork fork")

Tried to make it using the following code:

```javascript
'use strict'

// === WATERMILL ===
const {
  task,
  join,
  junction,
  fork
} = require('../../..')

const task0 = task({name: 'coco'}, () => `echo "something0"`)

const task1 = task({name: 'xixi'}, () => `echo "something1"`)

const task2 = task({name: 'foo'}, () => `echo "something2"`)

const task3 = task({name: 'bar'}, () => `echo "something3"`)

const task4 = task({name: 'test'}, () => `echo "something4"`)

const task5 = task({name: 'test1'}, () => `echo "something5"`)

const pipeline = join(task0, fork(join(task4, fork(task1, task3)), task2), task5)

pipeline()
```

However it renders:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/fork_fork/result.png "fork fork")

with the following error message

```
Unhandled rejection TypeError: Cannot read property 'concat' of undefined
    at /home/tiago/bin/bionode-watermill/lib/ctx/index.js:19:49
    at task.then (/home/tiago/bin/bionode-watermill/lib/orchestrators/join.js:61:38)
    at tryCatcher (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/util.js:16:23)
    at Promise._settlePromiseFromHandler (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:512:31)
    at Promise._settlePromise (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:569:18)
    at Promise._fulfillPromises (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:668:14)
    at Promise._settlePromises (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:694:18)
    at Async._drainQueue (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/async.js:133:16)
    at Async._drainQueues (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/async.js:143:10)

```
So, it looks like it is unable to pass task 5 to the end of the fork within 
the first fork (i.e., `fork(task1, task3)`), which in fact is wrapped around 
a `join`.

## junction inside junction

Also using similar tasks to the ones above I tried to make junction work 
inside a junction. Some workflow like this was intended in the end:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/junction_junction/index.png "junction junction")

So I made the following script:

```javascript
'use strict'

// === WATERMILL ===
const {
  task,
  join,
  junction,
  fork
} = require('../../..')

const task0 = task({name: 'coco'}, () => `echo "something0"`)

const task1 = task({name: 'xixi'}, () => `echo "something1"`)

const task2 = task({name: 'foo'}, () => `echo "something2"`)

const task3 = task({name: 'bar'}, () => `echo "something3"`)

const task4 = task({name: 'test'}, () => `echo "something4"`)

const task5 = task({name: 'test1'}, () => `echo "something5"`)

const task6 = task({name: 'test6'}, () => `echo "something6"`)

const pipeline = join(task0, junction(join(task1, junction(task4, task5), task6), task2), task3)

pipeline()
```

But it was rendering the following error:

```
Unhandled rejection TypeError: Cannot read property 'name' of undefined
    at console.log.task.info.map.t (/home/tiago/bin/bionode-watermill/lib/orchestrators/junction.js:17:72)
    at Array.map (native)
    at Promise (/home/tiago/bin/bionode-watermill/lib/orchestrators/junction.js:17:59)
    at Promise._execute (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/debuggability.js:300:9)
    at Promise._resolveFromExecutor (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:483:18)
    at new Promise (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:79:10)
    at taskToPromise (/home/tiago/bin/bionode-watermill/lib/orchestrators/junction.js:15:39)
    at Promise.all.tasks.map.task (/home/tiago/bin/bionode-watermill/lib/orchestrators/junction.js:26:44)
    at Array.map (native)
    at junctionInvocator (/home/tiago/bin/bionode-watermill/lib/orchestrators/junction.js:26:32)
    at Promise (/home/tiago/bin/bionode-watermill/lib/orchestrators/join.js:57:9)
    at Promise._execute (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/debuggability.js:300:9)
    at Promise._resolveFromExecutor (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:483:18)
    at new Promise (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/promise.js:79:10)
    at accumulator (/home/tiago/bin/bionode-watermill/lib/orchestrators/join.js:15:58)
    at tryCatcher (/home/tiago/bin/bionode-watermill/node_modules/bluebird/js/release/util.js:16:23)

```

However this error is solved if we comment the line 17 in `./lib/orchestrators/junction.js`

```javascript
console.log('Junction created for: ', task.info.map(t => `${t.name} (${t.uid})`))
```

In fact besides `console.log`ging this information nothing else is using `t.name` and thus pipeline properly ended as expected:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/junction_junction/result.png "junction junction")

## join inside join

join inside join gave no problems being robust as expected. join inside join 
is in fact just join, so the pipeline was maintained as a simple join.

code:
```javascript
'use strict'

// === WATERMILL ===
const {
  task,
  join,
  junction,
  fork
} = require('../../..')

const task0 = task({name: 'coco'}, () => `echo "something0"`)

const task1 = task({name: 'xixi'}, () => `echo "something1"`)

const task2 = task({name: 'foo'}, () => `echo "something2"`)

const task3 = task({name: 'bar'}, () => `echo "something3"`)

const task4 = task({name: 'test'}, () => `echo "something4"`)

const task5 = task({name: 'test1'}, () => `echo "something5"`)

const task6 = task({name: 'test6'}, () => `echo "something6"`)

const pipeline = join(task0, join(task1, join(task4, task5), task6), task2, task3)

pipeline()
```

result:

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/join_join/result.png "join join")

So, no major issues here!
