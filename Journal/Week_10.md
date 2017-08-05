# Week 10 (3 August to 10 August)

## Summary

In [last week issue with fork](https://github.com/bionode/GSoC17/blob/master/Journal/Week_9.md#fork-within-fork)
we have characterized all the limitations of each orchestrator and what 
should be done to solve it. Some orchestrators properly worker with each 
other but fork had several limitations, since it didn't permit to have a fork 
inside fork.


## Progress

### fork refactoring

For instance consider the following pipeline:

```javascript
const pipeline = join(
  task0, 
  fork(   // outer fork
    join(
      task4, 
      fork(   // inner fork
        task1, 
        task3
      )
    ), 
    task2
  ), 
  task5
)
```

Here you can see that this pipeline has two forks, one inside the other. This
 pipeline should render a pipeline equal to the one described in last week:
 
 ![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/fork_fork/index.png "fork fork")

Here I will use `outer fork` to refer to the first fork and `inner fork` for 
the second fork that is inside the first fork.

The issue with fork is that current api doesn't allow for elements inside 
fork to be an array of tasks rather than a task. So in order to deal with 
this I had to add a statement to check (when fork is found) if it has just 
tasks inside:

```javascript
fork(task1, task2)
```

or if it has some more complex structure like:

```javascript
fork(task1, fork(task2, task3))
```

or 

```javascript
fork(task1, junction(task2, task3))
```

or even

```javascript
fork(task1, join(task2, task3))
```

Off course these examples are pseudocode and will not work on real pipelines 
because one 
cannot fork without first having something to fork. But the important thing 
here is that orchestrators struggle to work inside fork, although junction 
and join seemed to work without adding code to the current fork implementation.

However fork requires the pipeline to be able to duplicate tasks with different 
`uids`, otherwise they will stop and not run the pipeline. 

So, I started working on a hack for this in order to make every orchestrator 
work inside a fork.

First of all, fork has to distinguish whether it is dealing with simples 
tasks or with orchestrators and the difference between both is that each 
element of fork

```javascript
task.info.tasks.forEach((forkee, j) //{ ... }
```

can be an array and then it is an orchestrator (`join`, `junction`, `fork`)

```javascript
if (forkee.info.tasks) //{ ... }
```

This will render an array of `taskInvocator` functions but it may also 
contain other orchestrators like the pipeline described above, where the 
`join` after the `outer fork` has an array of length 2 with `task4` and `fork(task1, task3)`

Or the element inside fork can be a task, in which case it just has to 
duplicate the downstreams tasks twice. For the outer fork downstream tasks 
are defined as `restTasks` which basically `slice` the array of tasks inside 
`outer fork` to construct a new array with all tasks downstream from the 
current one (`i + 1`) ([code](https://github.com/bionode/bionode-watermill/pull/70/files#diff-60c3fb460a0980c2b661e199742c79ceR38)). Then, this downstream task or tasks are 
duplicated adn 
a new `lineage` is added to the workflow, which in fact sort of duplicates 
the pipeline from now on [code](https://github.com/bionode/bionode-watermill/pull/70/files#diff-60c3fb460a0980c2b661e199742c79ceR42).

**to be continued....**

(still under construction)

Results:

```javascript
const pipeline = join(
  task0,
  fork(
    join(
      task4,
      fork(
        task1,
        task3
      )
    ),
    task2
  ),
  task5
)
```

 ![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/fork_fork/index.png "fork fork")


going even further:

```javascript
const pipeline = join(
  task0,
  fork(
    join(
      task4,
      fork(
        task1,
        fork(task3,task6)
      )
    ),
    task2
  ),
  task5
)
```

 ![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/fork_fork/index.png "fork fork")
