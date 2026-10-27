'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Bot,
  RefreshCw,
  SendHorizontal
} from 'lucide-react';
import { useInterviewStore } from '@/lib/store/useInterviewStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useWebcam } from '@/hooks/useWebcam';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { formatTime, calculateWpm } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface LiveInterviewRoomProps {
  sessionId: string;
}

export function LiveInterviewRoom({ sessionId }: LiveInterviewRoomProps) {
  const router = useRouter();
  const { 
    activeSession, 
    activeQuestionIndex, 
    goToNextQuestion, 
    goToPreviousQuestion, 
    saveAnswerForCurrentQuestion, 
    completeSession,
    activeFollowUp,
    setActiveFollowUp,
    isGeneratingFollowUp,
    setIsGeneratingFollowUp
  } = useInterviewStore();

  const { profile, recordInterviewCompleted, incrementStreak } = useUserStore();
  const { geminiApiKey, openaiApiKey, autoPlayTTS } = useSettingsStore();

  // Media hooks
  const { videoRef, isEnabled: isWebcamOn, toggleWebcam, isMirrored } = useWebcam();
  const { 
    isListening, 
    transcript, 
    setTranscript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  const { speak, stop: stopTTS, isSpeaking } = useSpeechSynthesis();
  const { canvasRef } = useAudioVisualizer(isListening, isSpeaking);

  // Local state
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [hasFollowUpTriggered, setHasFollowUpTriggered] = useState<boolean>(false);

  const currentQ = activeSession?.questions[activeQuestionIndex];
  const totalQuestions = activeSession?.questions.length || 0;

  // Sync session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When question changes, speak question if autoPlayTTS is on and populate existing answer
  useEffect(() => {
    if (!currentQ) return;
    
    // Set existing answer if previously entered
    setTypedAnswer(currentQ.candidateAnswer || '');
    setTranscript(currentQ.candidateAnswer || '');
    setShowHint(false);
    setHasFollowUpTriggered(false);
    setActiveFollowUp(null);

    if (autoPlayTTS && currentQ.text) {
      speak(currentQ.text);
    }

    return () => {
      stopTTS();
    };
  }, [activeQuestionIndex, currentQ?.id]);

  // Sync speech transcript with typedAnswer state
  useEffect(() => {
    if (transcript) {
      setTypedAnswer(transcript);
    }
  }, [transcript]);

  // Handle request dynamic follow-up
  const handleProbeFollowUp = async () => {
    if (!currentQ || isGeneratingFollowUp || hasFollowUpTriggered) return;
    const answer = typedAnswer.trim();
    if (answer.length < 20) return;

    try {
      setIsGeneratingFollowUp(true);
      const res = await fetch('/api/interview/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.text,
          candidateAnswer: answer,
          role: activeSession?.role || 'Software Engineer',
          type: activeSession?.type || 'TECHNICAL',
          apiKey: geminiApiKey || openaiApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.followUp) {
        setActiveFollowUp(data.followUp);
        setHasFollowUpTriggered(true);
        speak(`Follow up: ${data.followUp.text}`);
      }
    } catch (err) {
      console.warn('Failed to generate follow-up:', err);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // Save current question answer
  const handleSaveAndNext = () => {
    if (!currentQ) return;
    const combinedAnswer = typedAnswer + (followUpAnswer ? ` [Follow-up response: ${followUpAnswer}]` : '');
    saveAnswerForCurrentQuestion(combinedAnswer, 60);

    if (activeQuestionIndex < totalQuestions - 1) {
      goToNextQuestion();
    } else {
      handleFinishInterview();
    }
  };

  // Finish interview & generate report
  const handleFinishInterview = async () => {
    if (!activeSession) return;
    try {
      setIsSubmittingReport(true);
      stopListening();
      stopTTS();

      // Ensure current answer is saved
      const combinedAnswer = typedAnswer + (followUpAnswer ? ` [Follow-up response: ${followUpAnswer}]` : '');
      saveAnswerForCurrentQuestion(combinedAnswer, 60);

      const allQuestions = [...activeSession.questions];
      if (currentQ) {
        allQuestions[activeQuestionIndex].candidateAnswer = combinedAnswer;
      }

      const res = await fetch('/api/interview/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: activeSession.role,
          type: activeSession.type,
          questions: allQuestions,
          totalDurationSeconds: elapsedTime,
          apiKey: geminiApiKey || openaiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.report) {
        throw new Error(data.error || 'Failed to generate performance evaluation');
      }

      // Celebrate completion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      completeSession(data.report);
      recordInterviewCompleted(data.report.overallScore);
      incrementStreak();

      router.push(`/analytics/${data.report.id}`);
    } catch (err: any) {
      console.error('Error completing interview:', err);
      alert('Error analyzing report. Please try again.');
      setIsSubmittingReport(false);
    }
  };

  if (!activeSession || !currentQ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-indigo-400 animate-bounce" />
        <h2 className="text-xl font-bold text-white">No Active Session Found</h2>
        <p className="text-sm text-slate-400">Launch a new mock interview session to enter the simulation room.</p>
        <button
          onClick={() => router.push('/interview')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Go to Mock Catalog
        </button>
      </div>
    );
  }

  // Calculating live pacing
  const currentWpm = calculateWpm(typedAnswer, 60);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Session Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeSession.type.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">Question {activeQuestionIndex + 1} of {totalQuestions}</span>
            </div>
            <h2 className="text-sm font-semibold text-white mt-0.5">{activeSession.title}</h2>
          </div>
        </div>

        {/* Live Session Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-white font-medium">{formatTime(elapsedTime)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">Pacing:</span>
            <span className={`font-semibold ${currentWpm > 170 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentWpm} WPM
            </span>
          </div>

          <button
            onClick={handleFinishInterview}
            disabled={isSubmittingReport}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            {isSubmittingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>End & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Stage: Split Screen (Left: AI & Video, Right: Candidate Response & Waveform) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Interviewer & Candidate Webcam Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Interviewer Avatar Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeaking ? 'bg-indigo-400' : 'bg-slate-500'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSpeaking ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {isSpeaking ? 'AI Speaking...' : 'AI Listening to you'}
                </span>
              </div>

              <button
                onClick={() => isSpeaking ? stopTTS() : speak(currentQ.text)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title={isSpeaking ? 'Mute AI' : 'Replay question audio'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-indigo-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* AI Audio Waveform Visualizer Canvas */}
            <div className="h-20 w-full bg-slate-950/80 rounded-xl flex items-center justify-center p-2 border border-slate-800/80">
              <canvas ref={canvasRef} width={380} height={70} className="w-full h-full" />
            </div>

            {/* Hint Dropdown */}
            {currentQ.contextHint && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Interviewer Context Tip' : 'Show Interviewer Context Tip'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 animate-in fade-in duration-200">
                    {currentQ.contextHint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Candidate Webcam Simulation View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Candidate Video Stream</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isWebcamOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  {isWebcamOn ? 'Live' : 'Camera Off'}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleWebcam}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isWebcamOn ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {isWebcamOn ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{isWebcamOn ? 'Turn Off' : 'Enable Camera'}</span>
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              {isWebcamOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <VideoOff className="w-8 h-8 text-slate-700" />
                  <span className="text-xs">Camera preview is disabled</span>
                </div>
              )}

              {/* Eye contact simulated focal guide */}
              {isWebcamOn && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[10px] text-slate-300 border border-white/10">
                  Target: Eye Level
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Details, Answer Recording & Follow-up (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {currentQ.domain}
              </span>
              <span className="text-xs text-slate-400">
                Seniority: <strong className="text-slate-200">{currentQ.difficulty}</strong>
              </span>
            </div>

            <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed">
              {currentQ.text}
            </h3>
          </div>

          {/* Dynamic AI Follow-up Drawer (if triggered) */}
          {activeFollowUp && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-2 animate-in slide-in-from-top-3 duration-300">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI Follow-Up Question</span>
              </div>
              <p className="text-sm font-medium text-amber-200">{activeFollowUp.text}</p>
              <p className="text-[11px] text-amber-400/80 italic">Interviewer motive: {activeFollowUp.triggerReason}</p>
              <textarea
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                placeholder="Address the follow-up question here..."
                rows={2}
                className="w-full mt-2 bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Candidate Response Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Recording' : 'Speak to Answer'}</span>
                </button>

                {isListening && (
                  <span className="text-xs text-indigo-400 animate-pulse font-medium">
                    Listening & Transcribing...
                  </span>
                )}
              </div>

              {/* Dynamic Follow-up Trigger Button */}
              {!hasFollowUpTriggered && typedAnswer.length > 20 && (
                <button
                  type="button"
                  onClick={handleProbeFollowUp}
                  disabled={isGeneratingFollowUp}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {isGeneratingFollowUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>Ask AI Follow-Up</span>
                </button>
              )}
            </div>

            {/* Answer Text Area & Live Transcription Buffer */}
            <div className="space-y-1">
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Speak into your microphone or type your structured response here..."
                rows={7}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />

              {interimTranscript && (
                <div className="p-2 rounded-lg bg-indigo-950/20 border border-indigo-800/30 text-xs text-indigo-300 italic">
                  Live interim speech: &ldquo;{interimTranscript}&rdquo;
                </div>
              )}
            </div>

            {/* Word count & Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-500">
                {typedAnswer.trim().split(/\s+/).filter(Boolean).length} words recorded
              </span>

              <div className="flex items-center gap-3">
                {activeQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={goToPreviousQuestion}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition"
                >
                  <span>{activeQuestionIndex < totalQuestions - 1 ? 'Save & Next Question' : 'Complete & Generate Report'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
