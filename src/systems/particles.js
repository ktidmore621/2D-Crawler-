import {
  PARTICLE_COUNT,
  PARTICLE_MIN_SIZE,
  PARTICLE_MAX_SIZE,
  PARTICLE_MIN_SPEED,
  PARTICLE_MAX_SPEED,
  PARTICLE_MIN_ALPHA,
  PARTICLE_MAX_ALPHA,
  PARTICLE_DRIFT_STRENGTH,
  TOXIC_GREEN,
  AMBER,
} from '../utils/constants.js';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(boundsWidth, boundsHeight, startAnywhere) {
  const isToxic = Math.random() < 0.35;
  return {
    x: rand(0, boundsWidth),
    y: startAnywhere ? rand(0, boundsHeight) : boundsHeight + rand(0, 40),
    size: rand(PARTICLE_MIN_SIZE, PARTICLE_MAX_SIZE),
    speed: rand(PARTICLE_MIN_SPEED, PARTICLE_MAX_SPEED),
    alpha: rand(PARTICLE_MIN_ALPHA, PARTICLE_MAX_ALPHA),
    color: isToxic ? TOXIC_GREEN : AMBER,
    phase: rand(0, Math.PI * 2),
    driftFreq: rand(0.3, 1.2),
  };
}

export function createParticleState(boundsWidth, boundsHeight) {
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(boundsWidth, boundsHeight, true));
  }
  return { particles };
}

export function updateParticles(state, boundsWidth, boundsHeight, elapsed, deltaSeconds) {
  for (const p of state.particles) {
    p.y -= p.speed * deltaSeconds;
    p.x += Math.sin(elapsed * p.driftFreq + p.phase) * PARTICLE_DRIFT_STRENGTH * deltaSeconds;

    if (p.y < -10 || p.x < -20 || p.x > boundsWidth + 20) {
      Object.assign(p, createParticle(boundsWidth, boundsHeight, false));
    }
  }
}
