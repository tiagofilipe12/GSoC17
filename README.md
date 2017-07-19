# GSoC Bionode 2017

[![Join the chat at https://gitter.im/bionode/GSoC17](https://badges.gitter.im/bionode/GSoC17.svg)](https://gitter.im/bionode/GSoC17?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


This is a repository for all kind of code tests, reports and all kind of useful 
documentation that I found useful for my GSoC project 2017.

## Timeline

- [x] Bionode-watermill testing & mozzila sprint ([30 May to 7 June](https://github.com/bionode/GSoC17/blob/master/Journal/Week_1.md))
- [x] Bionode-watermill tutorial ([7 June to 14 June](https://github.com/bionode/GSoC17/blob/master/Journal/Week_2.md))
- [x] Basic Manifest files ([15 June to 22 June](https://github.com/bionode/GSoC17/blob/master/Journal/Week_3.md))
- [x] DAG visualization ([23 June to 28 June](https://github.com/bionode/GSoC17/blob/master/Journal/Week_4.md))
- [x] Improve DAG visualization as described 
[here (29 June to 05 July)](https://github.com/bionode/GSoC17/blob/master/Journal/Week_5.md#todo).
    - [x] Real-time graph visualization.
    - [x] Manifest file improvement (this might be solved with DAG 
    visualization)
- [ ] Start studying and documenting the graph generation of orchestrators. ***
- [ ] Folder naming according to the definition of tasks? (needs discussion)
- [ ] Incremental mode (useful for debugging).
- [ ] Benchmark bionode-watermill comparison ([check this issue](https://github.com/bionode/GSoC17/issues/3)).
- [ ] Implement streams.

## Ideas

* Optional tasks (Comment lines, pass an option to task itself and still be 
able to import the task and use it, multiple pipelines)
* Object pipeline definition (try to change the pipeline from a promise to an
 object.. and ability to import the pipeline into another pipeline, know dag 
 shape ahead of running).
* CWL
* use cases for streaming tasks (a | b | c), saving stodut to files, etc
* Human input in certain tasks
* Improve graph visualization to see in real-time which files already run and
 where it is (marking it as green/red for instance whether or not task is done)
* Ad hoc multi (input) dataset implementation --> each one runs in its own 
dag (first implementation).
