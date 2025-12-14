import { useEffect, useRef, useState } from 'react';

/**
 * Custom Arrow Cursor Component
 * - Arrow pointer (default) → Hand pointer (on clickable)
 * - Hide when window loses focus
 * - Soft ASMR click sounds
 * - PC only (hidden on mobile/touch)
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Soft ASMR click sound
  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Lower frequency, softer sound - ASMR style
      oscillator.frequency.value = 220; // Lower pitch
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Very soft
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      // Audio not supported
    }
  };

  useEffect(() => {
    // Check for touch device
    const checkTouch = () => {
      const isMobile = window.matchMedia('(pointer: coarse)').matches ||
                       'ontouchstart' in window ||
                       navigator.maxTouchPoints > 0;
      setIsTouchDevice(isMobile);
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      setIsVisible(true);
    };

    const onMouseDown = () => {
      setIsClicking(true);
      playClickSound();
    };
    
    const onMouseUp = () => setIsClicking(false);

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = !!(
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.getAttribute('role') === 'button' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.classList.contains('cursor-pointer') ||
        target.onclick !== null ||
        window.getComputedStyle(target).cursor === 'pointer'
      );
      
      setIsHovering(isClickable);
    };

    const onMouseLeave = () => setIsHovering(false);
    
    const onWindowBlur = () => setIsVisible(false);
    const onWindowFocus = () => setIsVisible(true);
    const onMouseLeaveDoc = () => setIsVisible(false);
    const onMouseEnterDoc = () => setIsVisible(true);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseEnter);
    document.addEventListener('mouseout', onMouseLeave);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    document.documentElement.addEventListener('mouseleave', onMouseLeaveDoc);
    document.documentElement.addEventListener('mouseenter', onMouseEnterDoc);

    return () => {
      window.removeEventListener('resize', checkTouch);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseEnter);
      document.removeEventListener('mouseout', onMouseLeave);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      document.documentElement.removeEventListener('mouseleave', onMouseLeaveDoc);
      document.documentElement.removeEventListener('mouseenter', onMouseEnterDoc);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={cursorRef}
      className={`custom-arrow-cursor ${isHovering ? 'hover' : ''} ${isClicking ? 'click' : ''}`}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Glow background on hover */}
      {isHovering && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '48px',
            height: '48px',
            background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Arrow Cursor - changes color on hover */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 4L20 12L12 14L10 22L4 4Z"
          fill={isHovering ? '#ff5722' : '#ff6b35'}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
