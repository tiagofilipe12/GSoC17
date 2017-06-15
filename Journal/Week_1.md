# Week 1 (30 May to 7 June)

- [Summary](#summary)
- [Bionode-fastq refactoring](#bionode-fastq-refactoring)
- [Getting familiar with bionode-watermill](#getting-familiar-with-bionode-watermill)

## Summary

During this week I was mainly involved in the [Mozzila Global Sprint](https://github.com/bionode/bionode/issues/44) 
 in which bionode participated. In this mozzila sprint I tried to understand 
 how [bionode-watermill](https://github.com/bionode/bionode-watermill) tasks and orchestrators (join, junction and fork) work
  and assembled a [new pipeline](https://github.com/bionode/bionode-watermill/blob/master/examples/pipelines/two-mappers/pipeline.js) 
  for the examples of bionode-watermill. Furthermore, I also started to refactor
  [bionode-fastq](https://github.com/bionode/bionode-fastq) to use stream 
  modules (through2, split2 and pumpify).
  
## Bionode-fastq refactoring

For this refactoring, we included the npm packages `through2`, `split2` and 
`pumpify` and this was basically important for learning to use streams (read 
and transform). 

So, first a read stream is created using `fs.createReadStream(input_file)` 
and then this is piped to `pumpify`. `pumpify` will then split the file by 
line using `split()` and applying a file parser function `jsParse()`. This 
later function will transform the file into chuncks of 4 lines to a json 
chunk as follows: `{name: line1, seq: line2, name2: line3,
                             qual: line4}`.
When this object is full and line starts with the correct identifier (`@`), 
it will start a new chunk.

This solved the challenge of parsing this type of files (.fastq)
 since sample information are devided in 4 lines and then a new sample begins
  in the fifth line (ando so on). However, when we have a file where one or 
  more of this lines are blank for some reason, this would not work properly.
  Therefore, a statement was added to check if the line object is empty (`trim
  () !== ''`)
  If line is empty nothing is done to the chunk object mentioned above and 
  passes to the next line.

This script is still under development and in the future a CLI should be 
added.

## Getting familiar with bionode-watermill

In order to get familiar with bionode-watermill, I started by testing some of
 the existing [examples](https://github.com/bionode/bionode-watermill/tree/master/examples/pipelines).
 However, I could test how some pipelines worked and how some steps of the 
 variant calling pipelines worked, I struggled with the installation of some 
 dependencies of these pipelines and thus I started doing a new pipeline from
  scratch with something that I was more familiar.

I started doing the [two-mappers](https://github.com/bionode/bionode-watermill/tree/master/examples/pipelines/two-mappers/pipeline.js) 
example pipeline, which is basically a pipeline that fetches some reads using
 [bionode-ncbi](https://github.com/bionode/bionode-ncbi) and a reference 
 genome from NCBI. Then, this reads are mapped against the reference genome 
 using bowtie2 and bwa (which was important to understand the potential of 
 **fork** orchestrator). The assemblage of this pipeline allowed me to 
 understand the mechanics of tasks and orchestrators of bionode-watermill.