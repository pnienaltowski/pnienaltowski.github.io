const canvas = document.querySelector("[data-cell-canvas]");
const rotatingText = document.querySelector("[data-rotating-text]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const endings = [
  "build algorithms that reveal what others can't see.",
  "track microscopic motion in 3D.",
  "like making complex things simple.",
  "turn complexity into clarity."
];

if (rotatingText) {
  rotatingText.textContent = endings[0];
}

if (rotatingText && !reduceMotion.matches) {
  let endingIndex = 0;

  window.setInterval(() => {
    rotatingText.classList.add("is-changing");

    window.setTimeout(() => {
      endingIndex = (endingIndex + 1) % endings.length;
      rotatingText.textContent = endings[endingIndex];
      rotatingText.classList.remove("is-changing");
    }, 230);
  }, 4200);
}

if (canvas) {
  const context = canvas.getContext("2d");
  let cells = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let lastTime = 0;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  const createCell = () => {
    const baseLength = 28 + Math.random() * 58;
    const direction = Math.random() * Math.PI * 2;
    const approachesGlass = Math.random() < 0.32;
    const depthBase = approachesGlass
      ? 0.68 + Math.random() * 0.24
      : 0.06 + Math.random() * 0.62;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      baseLength,
      baseThickness: baseLength * (0.28 + Math.random() * 0.2),
      angle: direction,
      velocityX: Math.cos(direction) * (17 + Math.random() * 32),
      velocityY: Math.sin(direction) * (17 + Math.random() * 32),
      phase: Math.random() * Math.PI * 2,
      wobble: 0.45 + Math.random() * 0.8,
      depthBase,
      depthRange: approachesGlass ? 0.2 + Math.random() * 0.22 : 0.12 + Math.random() * 0.3,
      depthSpeed: 0.00034 + Math.random() * 0.0005,
      drift: 8 + Math.random() * 18,
      tailLength: baseLength * (0.6 + Math.random() * 1.15),
      blueShift: Math.random()
    };
  };

  const populate = () => {
    const count = width < 600 ? 14 : Math.min(30, Math.max(20, Math.round(width / 52)));
    cells = Array.from({ length: count }, createCell);
  };

  const getDepth = (cell, time) =>
    clamp(cell.depthBase + Math.sin(time * cell.depthSpeed + cell.phase) * cell.depthRange, 0.03, 1);

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    populate();
    draw(0, false);
  };

  const fluidBody = (cell, time, length, thickness) => {
    const halfLength = length / 2;
    const halfThickness = thickness / 2;
    const waveA = Math.sin(time * 0.0011 * cell.wobble + cell.phase);
    const waveB = Math.cos(time * 0.0014 * cell.wobble + cell.phase * 1.7);
    const pinch = halfThickness * 0.2;

    context.beginPath();
    context.moveTo(-halfLength, waveB * pinch);
    context.bezierCurveTo(
      -halfLength * 0.72,
      -halfThickness * (0.78 + waveA * 0.16),
      halfLength * 0.35,
      -halfThickness * (1.1 - waveB * 0.18),
      halfLength,
      waveA * pinch
    );
    context.bezierCurveTo(
      halfLength * 0.72,
      halfThickness * (0.8 - waveA * 0.12),
      -halfLength * 0.3,
      halfThickness * (1.12 + waveB * 0.16),
      -halfLength,
      waveB * pinch
    );
    context.closePath();
  };

  const drawCell = (cell, time, depth) => {
    const scale = 0.38 + depth * 2.35;
    const length = cell.baseLength * scale;
    const thickness = cell.baseThickness * scale;
    const alpha = 0.08 + depth * 0.38;
    const blur = (1 - depth) * 14;
    const tailWave = Math.sin(time * 0.0018 * cell.wobble + cell.phase);

    context.save();
    context.translate(cell.x, cell.y);
    context.rotate(cell.angle + Math.sin(time * 0.00055 + cell.phase) * 0.24);
    context.filter = `blur(${blur.toFixed(1)}px)`;
    context.globalCompositeOperation = "screen";

    const red = Math.round(45 + cell.blueShift * 28);
    const green = Math.round(112 + cell.blueShift * 42);
    const bodyColor = `rgba(${red}, ${green}, 255, ${alpha})`;
    const edgeColor = `rgba(120, 181, 255, ${alpha + 0.14})`;

    context.shadowColor = `rgba(43, 112, 255, ${0.18 + depth * 0.34})`;
    context.shadowBlur = 8 + depth * 24;
    fluidBody(cell, time, length, thickness);
    context.fillStyle = bodyColor;
    context.fill();
    context.lineWidth = 0.7 + depth * 0.8;
    context.strokeStyle = edgeColor;
    context.stroke();

    context.shadowBlur = 0;
    context.beginPath();
    context.moveTo(-length * 0.2, -thickness * 0.16);
    context.bezierCurveTo(
      length * 0.05,
      thickness * (0.18 + tailWave * 0.1),
      length * 0.24,
      -thickness * 0.08,
      length * 0.42,
      thickness * 0.12
    );
    context.strokeStyle = `rgba(180, 216, 255, ${alpha * 0.72})`;
    context.lineWidth = Math.max(0.7, depth * 1.4);
    context.stroke();

    const tailStart = -length / 2 + 2;
    const tailLength = cell.tailLength * scale;
    for (let filament = 0; filament < 2; filament += 1) {
      const offset = (filament - 0.5) * thickness * 0.2;
      context.beginPath();
      context.moveTo(tailStart, offset);
      context.bezierCurveTo(
        -length * 0.72,
        thickness * (0.7 + tailWave * 0.4 + filament * 0.12),
        -tailLength * 0.72,
        -thickness * (0.8 - tailWave * 0.34),
        -length / 2 - tailLength,
        thickness * (tailWave + filament * 0.18)
      );
      context.strokeStyle = `rgba(112, 178, 255, ${alpha * (0.72 - filament * 0.16)})`;
      context.lineWidth = Math.max(0.55, depth * 1.15);
      context.stroke();
    }

    context.restore();
  };

  const draw = (time, advance = true) => {
    context.clearRect(0, 0, width, height);
    const delta = Math.min((time - lastTime) / 1000 || 0, 0.04);
    lastTime = time;

    const layeredCells = cells
      .map((cell) => ({ cell, depth: getDepth(cell, time) }))
      .sort((a, b) => a.depth - b.depth);

    for (const layer of layeredCells) {
      const { cell, depth } = layer;

      if (advance) {
        const depthVelocity = 0.42 + depth * 0.88;
        const fluidDrift = Math.sin(time * 0.0012 * cell.wobble + cell.phase) * cell.drift;
        cell.x += (cell.velocityX + Math.cos(cell.angle + Math.PI / 2) * fluidDrift) * depthVelocity * delta;
        cell.y += (cell.velocityY + Math.sin(cell.angle + Math.PI / 2) * fluidDrift) * depthVelocity * delta;
        cell.angle += Math.sin(time * 0.00045 + cell.phase) * 0.0011;

        const margin = (cell.baseLength + cell.tailLength) * 2.2;
        if (cell.x < -margin) cell.x = width + margin;
        if (cell.x > width + margin) cell.x = -margin;
        if (cell.y < -margin) cell.y = height + margin;
        if (cell.y > height + margin) cell.y = -margin;
      }

      drawCell(cell, time, depth);
    }

    context.filter = "none";
    context.globalCompositeOperation = "source-over";
  };

  const animate = (time) => {
    draw(time, true);
    frameId = window.requestAnimationFrame(animate);
  };

  const updateMotion = () => {
    window.cancelAnimationFrame(frameId);
    if (reduceMotion.matches) {
      draw(0, false);
    } else {
      lastTime = 0;
      frameId = window.requestAnimationFrame(animate);
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
    } else {
      updateMotion();
    }
  });
  reduceMotion.addEventListener("change", updateMotion);

  resize();
  updateMotion();
}


const contactCanvas = document.querySelector("[data-contact-canvas]");

if (contactCanvas) {
  const networkContext = contactCanvas.getContext("2d");
  let networkWidth = 0;
  let networkHeight = 0;
  let networkNodes = [];
  let networkFrame = 0;
  let networkLastTime = 0;

  const createNetworkNode = () => ({
    x: Math.random() * networkWidth,
    y: Math.random() * networkHeight,
    velocityX: (Math.random() - 0.5) * 18,
    velocityY: (Math.random() - 0.5) * 18,
    radius: 2 + Math.random() * 4,
    phase: Math.random(),
    depth: 0.3 + Math.random() * 0.7
  });

  const populateNetwork = () => {
    const count = networkWidth < 600 ? 15 : Math.min(30, Math.max(22, Math.round(networkWidth / 54)));
    networkNodes = Array.from({ length: count }, createNetworkNode);
  };

  const resizeNetwork = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = contactCanvas.getBoundingClientRect();
    networkWidth = bounds.width;
    networkHeight = bounds.height;
    contactCanvas.width = Math.round(networkWidth * ratio);
    contactCanvas.height = Math.round(networkHeight * ratio);
    networkContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    populateNetwork();
    drawNetwork(0, false);
  };

  const drawNetwork = (time, advance = true) => {
    const delta = Math.min((time - networkLastTime) / 1000 || 0, 0.04);
    networkLastTime = time;
    networkContext.clearRect(0, 0, networkWidth, networkHeight);

    if (advance) {
      for (const node of networkNodes) {
        node.x += node.velocityX * delta;
        node.y += node.velocityY * delta;

        if (node.x < -30) node.x = networkWidth + 30;
        if (node.x > networkWidth + 30) node.x = -30;
        if (node.y < -30) node.y = networkHeight + 30;
        if (node.y > networkHeight + 30) node.y = -30;
      }
    }

    for (let first = 0; first < networkNodes.length; first += 1) {
      const nodeA = networkNodes[first];

      for (let second = first + 1; second < networkNodes.length; second += 1) {
        const nodeB = networkNodes[second];
        const deltaX = nodeB.x - nodeA.x;
        const deltaY = nodeB.y - nodeA.y;
        const distance = Math.hypot(deltaX, deltaY);
        const threshold = 150 + Math.min(nodeA.depth, nodeB.depth) * 100;

        if (distance < threshold) {
          const strength = 1 - distance / threshold;
          const alpha = strength * 0.2 * Math.min(nodeA.depth, nodeB.depth);

          networkContext.beginPath();
          networkContext.moveTo(nodeA.x, nodeA.y);
          networkContext.lineTo(nodeB.x, nodeB.y);
          networkContext.strokeStyle = `rgba(89, 151, 255, ${alpha})`;
          networkContext.lineWidth = 0.6 + strength * 0.7;
          networkContext.stroke();

          if (strength > 0.42) {
            const progress = (time * 0.00011 + nodeA.phase + nodeB.phase) % 1;
            const pulseX = nodeA.x + deltaX * progress;
            const pulseY = nodeA.y + deltaY * progress;

            networkContext.beginPath();
            networkContext.arc(pulseX, pulseY, 1.1 + strength * 1.8, 0, Math.PI * 2);
            networkContext.fillStyle = `rgba(151, 199, 255, ${0.24 + strength * 0.5})`;
            networkContext.shadowColor = "rgba(80, 148, 255, 0.8)";
            networkContext.shadowBlur = 12;
            networkContext.fill();
            networkContext.shadowBlur = 0;
          }
        }
      }
    }

    for (const node of networkNodes) {
      const pulse = 0.86 + Math.sin(time * 0.0013 + node.phase * Math.PI * 2) * 0.14;
      const radius = node.radius * node.depth * pulse;

      networkContext.beginPath();
      networkContext.arc(node.x, node.y, radius * 3.4, 0, Math.PI * 2);
      networkContext.fillStyle = `rgba(54, 119, 255, ${0.035 + node.depth * 0.055})`;
      networkContext.fill();

      networkContext.beginPath();
      networkContext.arc(node.x, node.y, Math.max(1.2, radius), 0, Math.PI * 2);
      networkContext.fillStyle = `rgba(112, 177, 255, ${0.22 + node.depth * 0.46})`;
      networkContext.shadowColor = "rgba(66, 137, 255, 0.72)";
      networkContext.shadowBlur = 12 + node.depth * 10;
      networkContext.fill();
      networkContext.shadowBlur = 0;
    }
  };

  const animateNetwork = (time) => {
    drawNetwork(time, true);
    networkFrame = window.requestAnimationFrame(animateNetwork);
  };

  const updateNetworkMotion = () => {
    window.cancelAnimationFrame(networkFrame);
    if (reduceMotion.matches) {
      drawNetwork(0, false);
    } else {
      networkLastTime = 0;
      networkFrame = window.requestAnimationFrame(animateNetwork);
    }
  };

  window.addEventListener("resize", resizeNetwork, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(networkFrame);
    } else {
      updateNetworkMotion();
    }
  });
  reduceMotion.addEventListener("change", updateNetworkMotion);

  resizeNetwork();
  updateNetworkMotion();
}
