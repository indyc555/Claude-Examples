export const workoutGroups = [
  {
    id: 'pull',
    name: 'Pull / Arms',
    colorClass: 'pull',
    exercises: [
      { name: 'incline single arm', defaultSets: 4 },
      { name: 'bicep curl', defaultSets: 4 },
      { name: 'straight arm row', defaultSets: 3 },
      { name: 'wide row', defaultSets: 4 },
      { name: 'rotational punch', defaultSets: 4 },
    ],
  },
  {
    id: 'chest',
    name: 'Chest / Triceps',
    colorClass: 'chest',
    exercises: [
      { name: 'bench', defaultSets: 4 },
      { name: 'alt seated fly', defaultSets: 4 },
      { name: 'weighted seat bench', defaultSets: 4 },
      { name: 'flat fly', defaultSets: 3 },
      { name: 'bench triceps', defaultSets: 4 },
    ],
  },
  {
    id: 'back',
    name: 'Back / Legs',
    colorClass: 'back',
    exercises: [
      { name: 'row deadlift', defaultSets: 4 },
      { name: 'bent over row', defaultSets: 2 },
      { name: 'straight arm row', defaultSets: 2 },
      { name: 'alt reach deadlift', defaultSets: 2 },
      { name: 'deadlift bicep curl', defaultSets: 4 },
    ],
  },
]

export function getGroupColorClass(groupName) {
  if (groupName === 'Pull / Arms') return 'pull'
  if (groupName === 'Chest / Triceps') return 'chest'
  if (groupName === 'Back / Legs') return 'back'
  return 'pull'
}
