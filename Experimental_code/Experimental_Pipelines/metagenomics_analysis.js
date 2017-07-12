// TASK 1
// RUNS qc_assembler_pipeline.js
const qcAssembly = task({
  input: '*.fna.gz',
  output: '*.assembly'  //though it has other outputs from now we will only
  // required this one
}, ({ input }) => `node qc_assembler_pipeline.js ${input}`  // though this
// will also require to pass arguments to a watermill pipeline
)

// TASK 2
// RUNS bowtie2, samtools to remove reads from human genome

// TASK 3
// Bacterial species abundance detection - KRAKEN

// TASK 4
// Bacterial identification and typing - meta-mlst

// PIPELINE //
const pipeline = join(
  qc_assembler_pipeline.js,
  removeHuman,
  junction(
    kraken,
    metaMlst
  )
)

