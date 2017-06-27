# Week 4 (22 June to 28 June)

## Summary

This week was dedicated to the improvement of workflow representation. Output
 representation was devided in two stages: a summary file output as text and 
 a graph representation of the workflow being performed in each pipeline.
 
## Progress

At first, I struggled to understand the dynamics implemented in 
bionode-watermill with [redux](https://www.npmjs.com/package/redux). A good 
guide to start understanding how redux work is available [here](https://egghead.io/lessons/javascript-redux-the-single-immutable-state-tree).

After, understanding a little more on how redux is working I started to 
transform the current output for the DAG into something more similar to 
[graphson](https://www.npmjs.com/package/graphson). One nice example on how 
graphson json objects should look like are available [here](https://github.com/tinkerpop/blueprints/wiki/GraphSON-Reader-and-Writer-Library).

Currently bionode-watermill use `graph.js` and is rendering 
something like this on each vertex:

```javascript
'someName': {
  stuff: '...'
  someotherstuff: '...'
}
```

However, graphson expects something like:

```javascript
{ 
  stuff: '...'
  someotherstuff: '...'
}
```

**Right now, I am not sure if graphson will be able to handle this different 
in vertex object!**

So, I managed to hack current `jsonifyGraph` function (see [code](tiagofilipe12/bionode-watermill@d20e79f)),
basically by creating a new object `graphsonObj` in which the previous `obj` 
 elements could be inserted. However, it seems not to be working properly 
 since in some cases with fork it seems to be rendering duplicated vertices.
 Ideas to solve this issue:
 
 * [ ] add a statement to check if id object already exist in all 
 `graphsonObj.graph.vertices.uid` under `graphsonObj`.
 * [ ] start creating the `obj` in a different manner, maybe without `graph.js`?