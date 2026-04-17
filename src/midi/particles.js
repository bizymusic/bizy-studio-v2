// particles.js
// 🎆 粒子系统
export function createParticleSystem(container, max = 200) {
  const particles = [];

  function createParticle() {
    const el = document.createElement("div");
    el.className = "particle";
    el.style.display = "none";
    container.appendChild(el);

    return { el, x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false };
  }

  for (let i = 0; i < max; i++) {
    particles.push(createParticle());
  }

  function getParticle() {
    return particles.find(p => !p.active);
  }

  function spawn(x, y) {
    for (let i = 0; i < 3; i++) {
      const p = getParticle();
      if (!p) return;

      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = (Math.random() - 0.5) * 1.5;
      p.life = 1;

      p.el.style.display = "block";
      p.el.style.opacity = 1;
    }
  }

  function update(delta) {
    particles.forEach(p => {
      if (!p.active) return;

      p.life -= delta;

      if (p.life <= 0) {
        p.active = false;
        p.el.style.display = "none";
        return;
      }

      p.x += p.vx * 60 * delta;
      p.y += p.vy * 60 * delta;

      p.el.style.opacity = p.life;
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.life})`;
    });
  }

  return { spawn, update };
}