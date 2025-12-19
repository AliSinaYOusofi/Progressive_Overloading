const fs = require('fs');
const path = require('path');

// Read the exercises.json file
const exercisesPath = path.join(__dirname, 'utils', 'exercises.json');
const outputPath = path.join(__dirname, 'exercise_names.json');

try {
  // Read and parse the JSON file
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
  
  // Extract exercise names
  const exerciseNames = exercisesData.map(exercise => exercise.name);
  
  // Write to exercise_names.json
  fs.writeFileSync(outputPath, JSON.stringify(exerciseNames, null, 2), 'utf8');
  
  console.log(`Successfully extracted ${exerciseNames.length} exercise names to exercise_names.json`);
} catch (error) {
  console.error('Error processing exercises:', error.message);
  process.exit(1);
}

