# miniUid --> task

![alt text](https://github.com/bionode/GSoC17/blob/master/Experimental_code/Experimental_Pipelines/merge_two_mappers/merge_two_mappers.png "merge 
graph")


From left to right (and top to bottom):

* 4243d70 - `getSamples`
* c3c7581 - `fastqDump`
---
* c4ad7f5 - `getReference`
---
* 5877d10 - **junction** 
---
* 95a7458 - `samtoolsFaidx`
* 99093f1 - `gunzipIt`
---
* fb8219f - `indexReferenceBwa`
* dcdfd84 - `bwaMapper`
* beea678 - `samtoolsView2`
* c2f5eff - `samtoolsSort2`
* 028402b - `samtoolsIndex2`
* dc87a5f - `samtoolsDepth2`
---
* 63a56ed - `indexReferenceBowtie2`
* f1e62a9 - `bowtieMapper`
* 6d3851c - `samtoolsView`
* 598e50c - `samtoolsSort`
* 953c619 - `samtoolsIndex`
* 582fabb - `samtoolsDepth`
---
* 500ebbb - **junction** 
---
* 61dec22 - `somethingElse`
