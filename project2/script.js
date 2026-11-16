const scenes = Array.from(document.querySelectorAll('.verse1, .verse2-4, .verse7-8, .verse9-10, .verse12')).map((el) => ({
  el,
  target: 0,
  current: 0
}));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const SMOOTHING = 0.15;

const SERPENT_CLIMB_START = 0.15;
const SERPENT_CLIMB_END = 0.5;
const WINDOW_FRAME_START = 0.55;
const WINDOW_FRAME_END = 0.85;
const SERPENT_WOBBLES = 5;
const SERPENT_TILT = 3;

const HAIR_ENTER_END = 0.75;
const HAIR_GUSTS = 8;
const HAIR_SWAY = 2.5;
const HAIR_TUCK = -0.08;
const hairImage = document.querySelector('.hair');
const boySection = document.querySelector('.verse9-10');

const BOY_FRAME_END = 0.33;
const BOY_OPEN_START = 0.55;
const BOY_OPEN_END = 0.9;
const boyPicture = document.querySelector('.boy');

let isAnimating = false;

function measureProgress() {
  scenes.forEach((scene) => {
    const rect = scene.el.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    let progress = -rect.top / scrollableDistance;
    progress = Math.min(Math.max(progress, 0), 1);
    scene.target = progress;
  });
}

function animate() {
  let allSettled = true;

  scenes.forEach((scene) => {
    scene.current += (scene.target - scene.current) * SMOOTHING;

    if (Math.abs(scene.target - scene.current) < 0.0005) {
      scene.current = scene.target;
    } else {
      allSettled = false;
    }

    scene.el.style.setProperty('--progress', scene.current.toFixed(4));

    if (scene.el.classList.contains('verse2-4')) {
      updateStatueScene(scene);
    }

    if (scene.el.classList.contains('verse7-8')) {
      updateHair(scene);
    }

    if (scene.el.classList.contains('verse9-10')) {
      updateBoy(scene);
    }

    if (scene.el.classList.contains('verse12')) {
      updateFaces(scene);
    }
  });

  if (allSettled) {
    isAnimating = false;
  } else {
    requestAnimationFrame(animate);
  }
}

function updateStatueScene(scene) {
  const p = scene.current;

  let statueGrow = p / SERPENT_CLIMB_END;
  statueGrow = Math.min(Math.max(statueGrow, 0), 1);

  let climb = (p - SERPENT_CLIMB_START) / (SERPENT_CLIMB_END - SERPENT_CLIMB_START);
  climb = Math.min(Math.max(climb, 0), 1);

  const tilt = Math.sin(climb * Math.PI * SERPENT_WOBBLES) * SERPENT_TILT;

  let windowFrame = (p - WINDOW_FRAME_START) / (WINDOW_FRAME_END - WINDOW_FRAME_START);
  windowFrame = Math.min(Math.max(windowFrame, 0), 1);

  scene.el.style.setProperty('--window-frame', windowFrame.toFixed(4));
  scene.el.style.setProperty('--statue-grow', statueGrow.toFixed(4));
  scene.el.style.setProperty('--serpent-climb', climb.toFixed(4));
  scene.el.style.setProperty('--serpent-tilt', tilt.toFixed(2) + 'deg');
}

function updateHair(scene) {
  const p = scene.current;

  let enter = p / HAIR_ENTER_END;
  enter = Math.min(Math.max(enter, 0), 1);

  const sway = Math.sin(enter * Math.PI * HAIR_GUSTS) * HAIR_SWAY;

  const screenH = window.innerHeight;
  const hairBox = hairImage.getBoundingClientRect().height;
  const frameTop = hairImage.parentElement.getBoundingClientRect().top;
  const boyTop = boySection.getBoundingClientRect().top - frameTop;
  // Start below the screen and rise until half the lines show,
  // then stay on top of the photo as it comes up
  const riseFromBelow = screenH + (1 - enter) * hairBox / 2;
  const hairCenter = Math.min(riseFromBelow, boyTop + HAIR_TUCK * hairBox);
  const hairY = hairCenter - screenH / 2;

  scene.el.style.setProperty('--hair-y', hairY.toFixed(1) + 'px');

  scene.el.style.setProperty('--hair-enter', enter.toFixed(4));
  scene.el.style.setProperty('--hair-sway', sway.toFixed(3));
  scene.el.style.setProperty('--gray', enter.toFixed(4));
}

function updateBoy(scene) {
  const p = scene.current;

  // Step 1: the frame closes in around the boy
  let close = p / BOY_FRAME_END;
  close = Math.min(Math.max(close, 0), 1);

  // Step 2: the frame opens back up (like Sons & Daughters)
  let open = (p - BOY_OPEN_START) / (BOY_OPEN_END - BOY_OPEN_START);
  open = Math.min(Math.max(open, 0), 1);

  const frame = close - open;

  scene.el.style.setProperty('--boy-frame', frame.toFixed(4));
  scene.el.style.setProperty('--boy-open', open.toFixed(4));

  // Soft top edge at the start, back to normal by 15% of the scene
  let fade = 1 - p / 0.15;
  fade = Math.min(Math.max(fade, 0), 1);
  scene.el.style.setProperty('--boy-fade', fade.toFixed(4));

  // When the framing is finished, add the class "framed"
  // so the hover effect in style.css can turn on
  boyPicture.classList.toggle('framed', frame > 0.98);

  // Once the frame starts opening, show the river picture
  boyPicture.classList.toggle('river', p > BOY_OPEN_START);

  // When the river fills the screen: fix it as the page background
  // and start the butterfly animation (see style.css)
  document.body.classList.toggle('river-full', open > 0.99);
}

function updateFaces(scene) {
  const p = scene.current;

  // First half of the scroll: the faces rise to the middle
  let rise = p / 0.5;
  rise = Math.min(Math.max(rise, 0), 1);

  // While rising and after: the faces grow to full size
  let grow = p / 0.8;
  grow = Math.min(Math.max(grow, 0), 1);

  scene.el.style.setProperty('--faces-rise', rise.toFixed(4));
  scene.el.style.setProperty('--faces-grow', grow.toFixed(4));
}

function startAnimating() {
  if (!isAnimating) {
    isAnimating = true;
    requestAnimationFrame(animate);
  }
}

function onScrollOrResize() {
  if (reduceMotion.matches) return;
  measureProgress();
  startAnimating();
}

window.addEventListener('scroll', onScrollOrResize, { passive: true });
window.addEventListener('resize', onScrollOrResize);

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) {
    scenes.forEach((scene) => {
      scene.el.style.removeProperty('--progress');
      scene.el.style.removeProperty('--serpent-climb');
      scene.el.style.removeProperty('--statue-grow');
      scene.el.style.removeProperty('--window-frame');
      scene.el.style.removeProperty('--serpent-tilt');
      scene.el.style.removeProperty('--hair-enter');
      scene.el.style.removeProperty('--hair-sway');
      scene.el.style.removeProperty('--hair-y');
      scene.el.style.removeProperty('--gray');
      scene.el.style.removeProperty('--boy-frame');
      scene.el.style.removeProperty('--boy-open');
      scene.el.style.removeProperty('--faces-rise');
      scene.el.style.removeProperty('--faces-grow');
    });
  } else {
    onScrollOrResize();
  }
});

if (!reduceMotion.matches) {
  measureProgress();
  scenes.forEach((scene) => {
    scene.current = scene.target;
    scene.el.style.setProperty('--progress', scene.current);

    if (scene.el.classList.contains('verse2-4')) {
      updateStatueScene(scene);
    }

    if (scene.el.classList.contains('verse7-8')) {
      updateHair(scene);
    }

    if (scene.el.classList.contains('verse9-10')) {
      updateBoy(scene);
    }

    if (scene.el.classList.contains('verse12')) {
      updateFaces(scene);
    }
  });
}


// =============================================================
// POEM
// Each line in index.html says which section it belongs to and
// between which scroll points it shows. Here we turn the scroll
// position into a number from 0 (hidden) to 1 (visible).
// =============================================================
const poemLines = document.querySelectorAll('.poem-line');
const POEM_FADE = 0.25; // how many screens of scrolling a fade takes

function updatePoem() {
  poemLines.forEach((line) => {
    const section = document.querySelector('.' + line.dataset.section);

    // How many screens we have scrolled into this section
    const screens = -section.getBoundingClientRect().top / window.innerHeight;

    const start = parseFloat(line.dataset.start);
    const end = parseFloat(line.dataset.end);

    const fadeIn = (screens - start) / POEM_FADE;  // grows after start
    const fadeOut = (end - screens) / POEM_FADE;   // shrinks before end
    let visible = Math.min(fadeIn, fadeOut, 1);
    visible = Math.max(visible, 0);

    line.style.setProperty('--v', visible.toFixed(3));
  });
}

window.addEventListener('scroll', updatePoem, { passive: true });
window.addEventListener('resize', updatePoem);
updatePoem();

// Hovering over the faces swaps the last line for the title
const facesPicture = document.querySelector('.faces');
facesPicture.addEventListener('mouseenter', () => {
  document.body.classList.add('faces-hover');
});
facesPicture.addEventListener('mouseleave', () => {
  document.body.classList.remove('faces-hover');
});
