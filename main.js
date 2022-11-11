const svg = document.getElementById("slide-grid");
const note = document.getElementById("original-note");
const selectNote1 = document.getElementById('note1');
const selectChordQuality1 = document.getElementById('chordQuality1');
const selectNote2 = document.getElementById('note2');
const selectChordQuality2 = document.getElementById('chordQuality2');

function getChord1() {
  return {
    fundamental: selectNote1.options[selectNote1.selectedIndex].value,
    quality: selectChordQuality1.options[selectChordQuality1.selectedIndex].value,
  }
}
function getChord2() {
  return {
    fundamental: selectNote2.options[selectNote2.selectedIndex].value,
    quality: selectChordQuality2.options[selectChordQuality2.selectedIndex].value,
  }
}

const pitches = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

const noteNodes = {};

function createHarmonic(y, originalNote, firstPitch, offset) {
  for(let i = 0; i <= 6 - offset; i++) {
    let matrix = svg.createSVGMatrix();
    const duplicateNote = originalNote.cloneNode(true);
    const x = 114 + (i + offset) * 70;
    matrix = matrix.translate(x, y);
    duplicateNote.transform.baseVal.getItem(0).setMatrix(matrix);
    const notePitch = pitches[(pitches.indexOf(firstPitch) - i + pitches.length) % pitches.length] 
    duplicateNote.id = `note-${i}-${notePitch}`;
    duplicateNote.querySelector('text').textContent = notePitch;
    if (offset && i === 0) {
      duplicateNote.querySelector('line').setAttribute('x1', -30 - offset * 70);
    }
    if (!(notePitch in noteNodes)) noteNodes[notePitch] = [];
    noteNodes[notePitch].push(duplicateNote);
    svg.appendChild(duplicateNote);
  }
}

const harmonicsHighestNotes =["B♭", "F", "B♭", "D", "F", "G", "B♭"]
const harmonicsOffsets = {
  4: 0.2,
  5: 0.4,
}

harmonicsHighestNotes.forEach((pitch, i) => {
  createHarmonic(390 - i * 60, note, pitch, harmonicsOffsets[i] ?? 0);
})

note.remove()

function getTriad(note, [secondOffset, thirdOffset]) {
  const index = pitches.indexOf(note);
  if (index === -1) return [];
  const third = pitches[(index + secondOffset) % pitches.length];
  const fifth = pitches[(index + thirdOffset) % pitches.length];
  return [note, third, fifth];
}

function getMajorTriad(note) {
  return getTriad(note, [4, 7]);
}

function getMinorTriad(note) {
  return getTriad(note, [3, 7]);
}

function getDiminishedTriad(note) {
  return getTriad(note, [3, 6]);
}

function getAugmentedTriad(note) {
  return getTriad(note, [4, 8]);
}

function getSeventhChord(note) {
  const index = pitches.indexOf(note);
  const seventh = pitches[(index + 10) % pitches.length];
  return [...getMajorTriad(note), seventh];
}

function getMajorSeventhChord(note) {
  const index = pitches.indexOf(note);
  const seventh = pitches[(index + 11) % pitches.length];
  return [...getMajorTriad(note), seventh];
}

function getMinorSeventhChord(note) {
  const index = pitches.indexOf(note);
  const seventh = pitches[(index + 10) % pitches.length];
  return [...getMinorTriad(note), seventh];
}

function getHalfDiminishedChord(note) {
  const index = pitches.indexOf(note);
  const seventh = pitches[(index + 10) % pitches.length];
  return [...getDiminishedTriad(note), seventh];
}

function getChordBuilder(quality) {
  switch (quality) {
    case "M":
      return getMajorTriad;
    case "m":
      return getMinorTriad;
    case "dim":
      return getDiminishedTriad;
    case "aug":
      return getAugmentedTriad;
    case "seventh":
      return getSeventhChord;
    case "maj7":
      return getMajorSeventhChord;
    case "min7":
      return getMinorSeventhChord;
    case "half-dim":
      return getHalfDiminishedChord;
    default:
      return () => {};
  }
}

function colorPitch(pitch, color, colorStroke) {
  noteNodes[pitch].forEach(node => {
    const circle = node.querySelector("circle");
    circle.style.fill = color;
    if (colorStroke) { 
      circle.style.stroke = color;
    }
  });
}

function colorGradient(pitch) {
  noteNodes[pitch].forEach(node => {
    const circle = node.querySelector("circle");
    circle.style.fill = "";
    circle.setAttribute('fill', 'url(#Gradient1)');
  });
}

function resetColors() {
  pitches.forEach(p => {
    colorPitch(p, 'black', true);
    colorPitch(p, 'white', false);
  });
}

function updateSvg() {
  resetColors();
  
  const chord1 = getChord1();
  const chordBuilder1 = getChordBuilder(chord1.quality);
  
  const arpeggio1 = chordBuilder1(chord1.fundamental);
  arpeggio1.forEach((pitch, i) => colorPitch(pitch, 'salmon', i === 0))

  const chord2 = getChord2();
  if (chord2.fundamental !== 'none') {
    const chordBuilder2 = getChordBuilder(chord2.quality);
    const arpeggio2 = chordBuilder2(chord2.fundamental);
    
    arpeggio2.forEach((pitch, i) => colorPitch(pitch, 'wheat', i === 0))

    const commonPitch = [...arpeggio1, ...arpeggio2].filter(p => arpeggio1.includes(p) && arpeggio2.includes(p))

    commonPitch.forEach((pitch) => colorGradient(pitch))
  }
}

updateSvg();