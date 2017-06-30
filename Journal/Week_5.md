# Week 5 (29 June to 05 July)

## Summary

This week's main goal was to construct a graph object suitable for 
visualization, render the visualization in a simple manner and get output 
manifest text file from this instance of the graph. It would be great to 
establish visualization in real-time meanwhile, where the user could see the 
current status of the graph during the run of any custom pipeline within the 
framework of bionode-watermill.

## Progress

Last week, I figured a very simple way to generate a `graphson` object from the 
established `graph.js` instance already implemented to generate the DAG. 
However, when I started testing with some of the pipelines available in 
[example pipelines](https://github.com/bionode/bionode-watermill/tree/master/examples/pipelines), 
noticed that some extra vertices were being added to the graph object 
(`graphsonObj`). Basically what is adding these extra vertices are tasks that
 have `params` passed to the task object. You can check this code in 
 [collections.js](https://github.com/bionode/bionode-watermill/blob/master/lib/reducers/collection.js)
 
 ```javascript
  // If params is not {}, add a node for it
  const paramsString = JSON.stringify(params)
  if (paramsString !== '{}') {
    // TODO check if params already exists
    graph.addNewVertex(paramsString)

    // Add an edge from params to current task as well
    graph.addNewEdge(paramsString, uid)
  }

  // Add edge from last trajectory node to current output if no params,
  // otherwise to params (which points to current output)
  if (trajectory.length > 0) {
    if (paramsString === '{}') {
      graph.addNewEdge(trajectory[trajectory.length - 1], uid)
    } else {
      graph.addNewEdge(trajectory[trajectory.length - 1], paramsString)
    }
}
```

So, with this piece of code the graphson object rendered something like 
[this](https://github.com/bionode/GSoC17/tree/master/imgs#previous-instance-of-the-graph)
(for the `two-mappers` pipeline.js).
In the previous graph object, you can see in orange the vertices that were 
added as an extra per task with `params`. For graph visualization I think 
these orange vertices aren't interesting, contrary to the green one, which 
represent the junction of the two branches of this join:

```javascript
junction(
  getReference,
  join(getSamples,fastqDump)
)
```

This junction gives the notion that both branches will converge in the next 
tasks, and particularly important if next to a junction, you don't have a 
simple join but rather another junction or a fork (as in the example pipeline
.js):

```javascript
join(
  junction(
      getReference,
      join(getSamples,fastqDump)
  ),
  fork(
    join(IndexReferenceBwa, bwaMapper),
    join(indexReferenceBowtie2, bowtieMapper)
  )
)
```

If we didn't have this junction vertex the pipeline would never converge 
because of the nature of fork which splits the pipeline in two or more 
independent branches.

So what I think is best for now is to keep this junction vertex as 
illustrated [here](https://github.com/bionode/GSoC17/tree/master/imgs#new-instance-of-graph).
Note that `getReference` is the bottom left branch and `join(getSamples,
fastqDump)` is the upper left branch. Then, in orange it is the junction 
vertex and then the fork where `join(IndexReferenceBwa, bwaMapper)` and `join(indexReferenceBowtie2, bowtieMapper)`
fork into two distinct branches on the upper and bottom right.

I think this way it is clearer the flow between tasks, however graph 
visualization still needs improving to better understand it. For now, it has 
labels that show the uid of each task/junction which can be easily used to 
get other parameters from tasks, like input, output, params...

Also an example usage as well as a html page to load the graph in d3 is 
available [here](https://github.com/bionode/GSoC17/blob/master/Experimental_code/graph/index.html).

Also, previous graphson object can be checked [here](https://github.com/bionode/GSoC17/blob/master/Experimental_code/graph/prev_graphson.json), 
with the odd vertices being created like [this one](https://github.com/bionode/GSoC17/blob/master/Experimental_code/graph/prev_graphson.json#L14).
New graphson object can be checked [here](https://github.com/bionode/GSoC17/blob/master/Experimental_code/graph/graphson.json).

## TODO

* [ ] Pass more information to graphson object based on the uid of the tasks
* [ ] Add real-time visualization to graphson object rather than outputting it
 to file or stdout.
* [ ] Work on manifest file based on this object.