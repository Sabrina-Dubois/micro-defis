<template>
  <div class="flame-loading">
    <div class="flame-spinner">
      <div class="flame-icon">🔥</div>
      <div class="flame-glow"></div>
    </div>
    <div class="loading-dot" />
  </div>
</template>

<style scoped>
.flame-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 12px;
}

.flame-spinner {
  position: relative;
  width: 72px;
  height: 72px;
}

.flame-icon {
  font-size: 48px;
  animation: flameFlicker 1.4s ease-in-out infinite;
}

.flame-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 182, 77, 0.9) 0%,
    rgba(255, 87, 34, 0.25) 60%,
    transparent 80%
  );
  filter: blur(8px);
  animation: glowPulse 1.6s ease-in-out infinite;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--v-primary-base, #7c3aed);
  animation: dotBounce 0.9s ease-in-out infinite;
}

@keyframes flameFlicker {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15) translateY(-4px);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes dotBounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
