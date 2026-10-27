import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Upload, 
  Volume2, 
  VolumeX, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { 
  playScanSuccessSound, 
  playScanWarningSound, 
  playScanErrorSound 
} from '../utils/audio';

export default function GateQrScanner({ 
  participants = [], 
  onTicketScanned, 
  activeTheme 
}) {
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' | 'simulator' | 'upload'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [lastScannedId, setLastScannedId] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Stop camera helper
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setFlashOn(false);
  };

  // Start camera helper
  const startCamera = async () => {
    setCameraError('');
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Please use the Instant Scanner Simulator.');
      setScannerMode('simulator');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        startBarcodeDetection();
      }
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Unable to access camera (' + (err.message || 'Permission denied') + '). Switch to Simulator mode below.');
      setIsCameraActive(false);
    }
  };

  // Toggle Torch / Flash
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const next = !flashOn;
        await track.applyConstraints({
          advanced: [{ torch: next }]
        });
        setFlashOn(next);
      } catch (e) {
        console.warn('Torch not supported on this device/track:', e);
      }
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Real-time Barcode / QR detection loop using native browser BarcodeDetector if available
  const startBarcodeDetection = () => {
    if (!('BarcodeDetector' in window)) {
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      
      const scanFrame = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            handleDetectedCode(rawVal);
            return; // pause detection briefly
          }
        } catch (e) {
          // frame detect pass
        }

        animFrameRef.current = requestAnimationFrame(scanFrame);
      };

      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (e) {
      console.warn('BarcodeDetector error:', e);
    }
  };

  // Process detected QR code string (either JSON payload or plain Ticket ID)
  const handleDetectedCode = (rawValue) => {
    if (!rawValue) return;

    let targetTicketId = rawValue.trim();

    // Check if raw value is JSON from our digital ticket QR pass
    try {
      if (targetTicketId.startsWith('{') && targetTicketId.endsWith('}')) {
        const parsed = JSON.parse(targetTicketId);
        if (parsed.ticketId) {
          targetTicketId = parsed.ticketId;
        }
      }
    } catch (e) {
      // Not JSON, continue with raw string
    }

    // Match BIT2026 pattern if embedded in text
    const match = targetTicketId.match(/BIT2026-\d{4}/i);
    if (match) {
      targetTicketId = match[0].toUpperCase();
    }

    setLastScannedId(targetTicketId);

    // Audio feedback
    if (soundEnabled) {
      const matched = participants.find(p => p.ticketId?.toUpperCase() === targetTicketId.toUpperCase());
      if (!matched) {
        playScanErrorSound();
      } else if (matched.paymentStatus === 'Paid' || matched.event === 'Coding Challenge' || matched.paymentAmount === 0) {
        playScanSuccessSound();
      } else {
        playScanWarningSound();
      }
    }

    if (onTicketScanned) {
      onTicketScanned(targetTicketId);
    }
  };

  // Handle fast demo simulation scan
  const handleSimulateScan = (ticketId) => {
    setIsScanningSim(true);
    setLastScannedId(ticketId);

    setTimeout(() => {
      setIsScanningSim(false);
      handleDetectedCode(ticketId);
    }, 700);
  };

  // Handle image upload decode
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Try reading barcode if BarcodeDetector supports ImageBitmap
    if ('BarcodeDetector' in window) {
      createImageBitmap(file).then(bitmap => {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(bitmap).then(barcodes => {
          if (barcodes.length > 0) {
            handleDetectedCode(barcodes[0].rawValue);
          } else {
            fallbackFileMatch(file.name);
          }
        }).catch(() => fallbackFileMatch(file.name));
      }).catch(() => fallbackFileMatch(file.name));
    } else {
      fallbackFileMatch(file.name);
    }
  };

  const fallbackFileMatch = (filename) => {
    // Check if filename contains ticket ID
    const match = filename.match(/BIT2026-\d{4}/i);
    if (match) {
      handleDetectedCode(match[0].toUpperCase());
    } else if (participants.length > 0) {
      handleDetectedCode(participants[0].ticketId);
    }
  };

  // Start camera on mount if mode is camera
  useEffect(() => {
    if (scannerMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scannerMode, facingMode]);

  const laserColor = activeTheme?.laserColor || '#00f2fe';

  return (
    <div className="gate-scanner-widget" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '1.75rem'
    }}>
      {/* Top Scanner Mode Bar */}
      <div style={{
        background: '#0f172a',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
              BIT Gate Entrance Scanner
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Digital Pass Verification & Attendance Terminal
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${scannerMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.75rem', 
              padding: '0.3rem 0.65rem',
              background: scannerMode === 'camera' ? (activeTheme?.primary || '#2563eb') : '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            onClick={() => setScannerMode('camera')}
          >
            <Camera size={13} />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${scannerMode === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.75rem', 
              padding: '0.3rem 0.65rem',
              background: scannerMode === 'simulator' ? (activeTheme?.primary || '#2563eb') : '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            onClick={() => setScannerMode('simulator')}
          >
            <Zap size={13} />
            <span>Fast Simulator</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${scannerMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.75rem', 
              padding: '0.3rem 0.65rem',
              background: scannerMode === 'upload' ? (activeTheme?.primary || '#2563eb') : '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            onClick={() => setScannerMode('upload')}
          >
            <Upload size={13} />
            <span>Upload Pass</span>
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: soundEnabled ? '#38bdf8' : '#64748b',
              borderRadius: '6px',
              padding: '0.3rem 0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={soundEnabled ? 'Gate Beep Sound Active' : 'Muted'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Mode 1: Live Camera Scanner */}
      {scannerMode === 'camera' && (
        <div style={{ position: 'relative', background: '#090d16', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Video Stream */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxHeight: '380px',
              objectFit: 'cover',
              display: isCameraActive ? 'block' : 'none',
              filter: 'contrast(1.05) brightness(1.02)'
            }}
          />

          {/* Camera Permission / Standby Overlay */}
          {!isCameraActive && (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#cbd5e1' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#94a3b8'
              }}>
                <Camera size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.4rem' }}>
                Camera Scanner Ready
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                Click below to grant camera access and scan attendee digital passes at the college gate.
              </p>
              {cameraError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  maxWidth: '440px',
                  margin: '0 auto 1rem'
                }}>
                  {cameraError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary" onClick={startCamera}>
                  <Camera size={16} />
                  <span>Start Live Gate Camera</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setScannerMode('simulator')}>
                  <Zap size={16} />
                  <span>Use Simulator Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* High-tech HUD Viewfinder Overlay (When Camera is Active) */}
          {isCameraActive && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 15, 30, 0.65) 100%)'
            }}>
              {/* Central QR Target Box */}
              <div style={{
                width: '230px',
                height: '230px',
                position: 'relative',
                boxShadow: `0 0 20px ${activeTheme?.glowColor || 'rgba(6, 182, 212, 0.3)'}`
              }}>
                {/* 4 Illuminated Corner Brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '28px', height: '28px', borderTop: `4px solid ${laserColor}`, borderLeft: `4px solid ${laserColor}` }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '28px', height: '28px', borderTop: `4px solid ${laserColor}`, borderRight: `4px solid ${laserColor}` }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '28px', height: '28px', borderBottom: `4px solid ${laserColor}`, borderLeft: `4px solid ${laserColor}` }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderBottom: `4px solid ${laserColor}`, borderRight: `4px solid ${laserColor}` }} />

                {/* Animated Sweeping Laser Line */}
                <div style={{
                  position: 'absolute',
                  left: '4px',
                  right: '4px',
                  height: '3px',
                  background: `linear-gradient(90deg, transparent 0%, ${laserColor} 50%, transparent 100%)`,
                  boxShadow: `0 0 12px ${laserColor}, 0 0 24px ${laserColor}`,
                  animation: 'gateLaserSweep 2s ease-in-out infinite'
                }} />

                {/* Center crosshair */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  border: '1px dashed rgba(255,255,255,0.4)',
                  borderRadius: '50%'
                }} />
              </div>

              {/* Status instructions banner */}
              <div style={{
                marginTop: '1.25rem',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                <span>Align Participant QR Pass inside frame</span>
              </div>
            </div>
          )}

          {/* Camera controls toolbar at bottom */}
          {isCameraActive && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 10
            }}>
              <button
                type="button"
                onClick={switchCamera}
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw size={13} />
                <span>Flip Camera</span>
              </button>

              <button
                type="button"
                onClick={toggleFlash}
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(15, 23, 42, 0.85)', color: flashOn ? '#fbbf24' : '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                title="Toggle Torch/Flash"
              >
                <Zap size={13} />
                <span>{flashOn ? 'Flash On' : 'Flash Off'}</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-danger btn-sm"
                title="Stop Live Camera"
              >
                <CameraOff size={13} />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Instant Simulator Scanner (Viva / Demo Presentation) */}
      {scannerMode === 'simulator' && (
        <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                ⚡ Fast Gate Scanner Simulator (Viva & Demo Mode)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Simulate gate pass scanning with real-time laser animation and audio feedback.
              </div>
            </div>

            {isScanningSim && (
              <span className="badge badge-primary" style={{ animation: 'pulse 1s infinite' }}>
                Scanning QR Code...
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {participants.map(p => {
              const isPaid = p.paymentStatus === 'Paid' || p.paymentAmount === 0 || p.event === 'Coding Challenge';
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSimulateScan(p.ticketId)}
                  disabled={isScanningSim}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeTheme?.primary || '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <code style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {p.ticketId}
                    </code>
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {isPaid ? `PAID (₹${p.paymentAmount || 100})` : 'PENDING'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {p.event}
                  </div>
                  <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: p.attendanceStatus === 'Attended' ? '#059669' : '#d97706', fontWeight: 600 }}>
                      {p.attendanceStatus === 'Attended' ? '✓ Attended' : 'Gate Entry Pending'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: activeTheme?.primary || '#2563eb', fontWeight: 700 }}>
                      Scan Pass →
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Invalid Ticket Test Case for Reviewer */}
            <button
              type="button"
              onClick={() => handleSimulateScan('BIT2026-9999')}
              disabled={isScanningSim}
              style={{
                background: '#fef2f2',
                border: '1px dashed #fca5a5',
                borderRadius: '10px',
                padding: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <code style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.85rem' }}>
                  BIT2026-9999
                </code>
                <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                  INVALID TEST
                </span>
              </div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.85rem' }}>
                Test Fake / Unregistered Pass
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                Simulate gate rejection with low buzzer tone
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Image / Screenshot Upload Scanner */}
      {scannerMode === 'upload' && (
        <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', textAlign: 'center' }}>
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            background: '#ffffff',
            maxWidth: '460px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}>
              <Upload size={24} />
            </div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Upload Digital Pass Screenshot or QR Image
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Select a participant ticket image (PNG, JPG, or PDF snapshot) to instantly decode and verify entrance.
            </p>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <Upload size={14} />
              <span>Choose QR Image File</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      )}

      {/* Footer Info Banner */}
      <div style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '0.65rem 1.25rem',
        fontSize: '0.75rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>Last Scanned Ticket:</span>
          {lastScannedId ? (
            <code style={{ fontWeight: 800, color: activeTheme?.primary || '#2563eb', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
              {lastScannedId}
            </code>
          ) : (
            <span>None yet</span>
          )}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          Gate Scanner Terminal • Connected to Local Storage Database
        </div>
      </div>
    </div>
  );
}
