const fs = require('fs');
const path = require('path');

// Paths
const exercisesPath = path.join(__dirname, 'utils', 'exercises.json');
const exerciseNamesPath = path.join(__dirname, 'exercise_names.json');

/**
 * Extract simplified base name from exercise variants
 * Examples:
 * - "Bench Press - Powerlifting" → "Bench Press"
 * - "Bench Press with Chains" → "Bench Press"
 * - "Barbell Bench Press - Medium Grip" → "Bench Press" and "Barbell Bench Press"
 * - "Close-Grip Barbell Bench Press" → "Bench Press"
 */
function extractSimplifiedNames(exerciseName) {
  const simplified = new Set();
  
  // Pattern 1: "Name - Modifier" → extract "Name"
  const dashMatch = exerciseName.match(/^(.+?)\s*-\s*.+$/);
  if (dashMatch) {
    simplified.add(dashMatch[1].trim());
  }
  
  // Pattern 2: "Name with Modifier" → extract "Name"
  const withMatch = exerciseName.match(/^(.+?)\s+with\s+.+$/i);
  if (withMatch) {
    simplified.add(withMatch[1].trim());
  }
  
  // Pattern 3: "Barbell Name - Modifier" → extract both "Barbell Name" and "Name"
  const barbellMatch = exerciseName.match(/^Barbell\s+(.+?)(\s*-\s*.+|$)/);
  if (barbellMatch) {
    const baseName = barbellMatch[1].trim();
    simplified.add(`Barbell ${baseName}`);
    // Only add base if it doesn't start with another equipment type
    if (!baseName.match(/^(Dumbbell|Machine|Cable|Smith|Kettlebell)/i)) {
      simplified.add(baseName);
    }
  }
  
  // Pattern 4: Remove common prefixes/modifiers and extract base
  // Remove: "Close-Grip", "Wide-Grip", "Incline", "Decline", etc.
  let baseName = exerciseName
    .replace(/^(Close-Grip|Wide-Grip|Incline|Decline|Seated|Standing|One-Arm|One Arm|Two-Arm|Two Arm|Alternating|Single-Arm|Single Arm)\s+/i, '')
    .replace(/\s*-\s*.+$/, '') // Remove trailing " - Modifier"
    .replace(/\s+with\s+.+$/i, '') // Remove trailing " with Modifier"
    .trim();
  
  // If we extracted something meaningful, add it
  if (baseName && baseName !== exerciseName && baseName.length > 2) {
    // Don't add if it's too generic (like just "Press" or "Row")
    if (baseName.split(' ').length >= 2 || 
        ['Press', 'Row', 'Curl', 'Squat', 'Deadlift', 'Lunge', 'Raise', 'Extension', 'Pull', 'Push'].some(word => baseName.includes(word))) {
      simplified.add(baseName);
    }
  }
  
  // Pattern 5: Extract common base names for well-known exercises
  const commonBasePatterns = [
    { pattern: /^(.*?)\s*(Bench\s+Press).*$/i, extract: '$2' },
    { pattern: /^(.*?)\s*(Squat).*$/i, extract: (match) => {
      // Only extract if it's not part of another word
      const before = match[1] || '';
      const after = match[3] || '';
      if (!before.match(/\w$/) && !after.match(/^\w/)) {
        return match[1] ? `${match[1].trim()} Squat` : 'Squat';
      }
      return null;
    }},
    { pattern: /^(.*?)\s*(Deadlift).*$/i, extract: (match) => {
      const before = match[1] || '';
      const after = match[3] || '';
      if (!before.match(/\w$/) && !after.match(/^\w/)) {
        return match[1] ? `${match[1].trim()} Deadlift` : 'Deadlift';
      }
      return null;
    }},
    { pattern: /^(.*?)\s*(Shoulder\s+Press).*$/i, extract: '$2' },
    { pattern: /^(.*?)\s*(Row).*$/i, extract: (match) => {
      const before = match[1] || '';
      const after = match[3] || '';
      if (!before.match(/\w$/) && !after.match(/^\w/)) {
        return match[1] ? `${match[1].trim()} Row` : 'Row';
      }
      return null;
    }},
  ];
  
  for (const { pattern, extract } of commonBasePatterns) {
    const match = exerciseName.match(pattern);
    if (match) {
      const extracted = typeof extract === 'function' ? extract(match) : match[0].replace(pattern, extract);
      if (extracted && extracted.trim() && extracted.trim() !== exerciseName) {
        simplified.add(extracted.trim());
      }
    }
  }
  
  return Array.from(simplified);
}

try {
  console.log('Reading exercises.json...');
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
  
  console.log('Reading existing exercise_names.json...');
  const existingNames = JSON.parse(fs.readFileSync(exerciseNamesPath, 'utf8'));
  const existingSet = new Set(existingNames.map(n => n.toLowerCase()));
  
  console.log(`Found ${exercisesData.length} exercises and ${existingNames.length} existing names`);
  
  const newSimplifiedNames = new Set();
  
  console.log('Extracting simplified variants...');
  exercisesData.forEach(exercise => {
    const simplified = extractSimplifiedNames(exercise.name);
    simplified.forEach(name => {
      // Only add if it doesn't already exist (case-insensitive)
      if (!existingSet.has(name.toLowerCase())) {
        newSimplifiedNames.add(name);
      }
    });
  });
  
  console.log(`Found ${newSimplifiedNames.size} new simplified names to add`);
  
  // Combine existing and new names
  const allNames = [...existingNames, ...Array.from(newSimplifiedNames)];
  
  // Remove duplicates (case-insensitive)
  const uniqueNames = [];
  const seen = new Set();
  allNames.forEach(name => {
    const lower = name.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueNames.push(name);
    }
  });
  
  // Sort alphabetically
  uniqueNames.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  
  console.log(`Total unique names: ${uniqueNames.length}`);
  console.log(`Added ${uniqueNames.length - existingNames.length} new names`);
  
  // Write back to file
  fs.writeFileSync(exerciseNamesPath, JSON.stringify(uniqueNames, null, 2) + '\n', 'utf8');
  
  console.log(`Successfully updated exercise_names.json`);
  console.log('\nSample of newly added simplified names:');
  const added = Array.from(newSimplifiedNames).slice(0, 20);
  added.forEach(name => console.log(`  - ${name}`));
  if (newSimplifiedNames.size > 20) {
    console.log(`  ... and ${newSimplifiedNames.size - 20} more`);
  }
  
} catch (error) {
  console.error('Error processing exercises:', error.message);
  console.error(error.stack);
  process.exit(1);
}

