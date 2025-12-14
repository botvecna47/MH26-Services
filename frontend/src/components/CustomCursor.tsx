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
      
      {isHovering ? (
        // Pointing Finger (on clickable elements) - classic cursor style
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pointing finger shape */}
          <path
            d="M8 15V11C8 9.89543 8.89543 9 10 9C11.1046 9 12 9.89543 12 11V10C12 8.89543 12.8954 8 14 8C15.1046 8 16 8.89543 16 10V11C16 10.4477 16.4477 10 17 10C17.5523 10 18 10.4477 18 11V16C18 19.3137 15.3137 22 12 22H10C6.68629 22 4 19.3137 4 16V15C4 14.4477 4.44772 14 5 14H6.5C7.32843 14 8 14.6716 8 15Z"
            fill="#ff6b35"
            stroke="white"
            strokeWidth="1.2"
          />
          {/* Extended finger */}
          <path
            d="M12 9V4C12 2.89543 11.1046 2 10 2C8.89543 2 8 2.89543 8 4V9"
            fill="#ff6b35"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Arrow Cursor (default)
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 4L20 12L12 14L10 22L4 4Z"
            fill="#ff6b35"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
