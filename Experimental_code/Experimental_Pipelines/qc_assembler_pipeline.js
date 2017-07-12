// This is just some pseudo code for development of a pipeline


// TASK 1
// Task for QC where input reads will be imported into fastqc

// TASK 2
// Filter with trimmomatic

// TASK 3 (AS OPTIONAL?)
// Goes back to filtering (optional)

// TASK 4
// Spades as assembler --> receives cleaned reads

// TASK 5
// Estimate assembly coverage using bowtie2 + samtools --> taks assembly as
// reference
// and reads to map and estimage the coverage

// TASK 6
// Runs PILON to correct the assembly

// TASK 7
// Identifies the species using the assembly as input and MLST2 as the
// program to detect species.

// PIPELINE //

const pipeline = join(
  fastQc,
  trimmomatic,
  fastQc, // this should be optional may be by passing a flag?
  spadesAssembler,
  // this fork should be optional as well as both branches within the fork
  fork(
    join(bowtieSamtools, pilon), pilon
  ),
  mlst
)

// This pipeline highlights the necessity of passing tasks as optional in
// watermill