'use strict'

// === WATERMILL ===
const {
  task,
  join,
  junction,
  fork
} = require('../../..')

const task0 = task({
  name: 'some dum task'
}, ({ }) => `grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}'`
)

const simpleTask1 = task({
  output: '*.bla1', // checks if output file matches the specified pattern
  params: 'test_file1.bla1',  //defines parameters to be passed to the
  // task function
  name: 'task1: creating file 1' //defines the name of the task
}, ({ params }) => `touch ${params} | echo "this is a string from first file" > ${params}`
)

const simpleTask2 = task({
  output:'*.bla2', // specifies the pattern of the expected input
  params: 'another_test_file1.bla2', /* checks if output file matches the
     specified pattern*/
  name: 'task 2: creating file 2'
}, ({ params }) => `touch ${params} | echo "this is a string from second file" > ${params}`
)

const simpleTask3 = task({
  output: '*.bla3', // checks if output file matches the specified pattern
  params: 'test_file2.bla3',  //defines parameters to be passed to the
  // task function
  name: 'task3: creating file 3' //defines the name of the task
}, ({ params }) => `touch ${params} | echo "this is a string from first file" > ${params}`
)

const simpleTask4 = task({
  output:'*.bla4', // specifies the pattern of the expected input
  params: 'another_test_file2.bla4', /* checks if output file matches the
     specified pattern*/
  name: 'task 4: creating file 4'
}, ({ params }) => `touch ${params} | echo "this is a string from second file" > ${params}`
)

const appendFiles = task({
  input: {
    in1: '*.bla1',
    in2: '*.bla2',
    in3: '*.bla3',
    in4: '*.bla4',
  }, // since watermill can't take several inputs
  output: '*.txt', // checks if output file matches the specified patters
  name: 'Write to files' //defines the name of the task
}, ({ input }) => `cat ${input.in1} ${input.in2} ${input.in3} ${input.in4} > final.txt`
)

// this is a kiss example of how fork works
const pipeline = join(
  task0,
  simpleTask1,
  simpleTask2,
  simpleTask3,
  simpleTask4,
  appendFiles

)

//executes the pipeline itself
pipeline()