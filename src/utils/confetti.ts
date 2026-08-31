import confetti from 'canvas-confetti';

export function fireCelebration() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x: 0.5, y: 1 },
      startVelocity: 45,
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
      ticks: 200,
      gravity: 1,
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  } catch {
    // Evita erros caso o ambiente não suporte canvas
  }
}

// Alias para compatibilidade
export const triggerCompletionConfetti = fireCelebration;

