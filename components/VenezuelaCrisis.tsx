import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { AlertCircle, Users, Building2, UserCircle, TrendingDown, Play, RotateCcw } from 'lucide-react';

const VenezuelaCrisis = () => {
  // Initial state parameters
  const INITIAL_STATE = {
    wsi: 0.52,
    soc: 0.10,
    trust: 0.30,
    wealth: 0.25,
    education: 0.55,
    civilization: 0.45,
    politicalPower: 0.40,
    
    // Player motives/strategies
    regimeCoercion: 0.70,
    regimeStructural: 0.60,
    oppositionSymbolic: 0.50,
    populationExit: 0.40,
    
    // DPP components
    T: 0.75,
    P: 0.60,
    C: 0.50,
    R: 0.70,
    S: 0.80
  };

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
 const [history, setHistory] = useState<any[]>([]);
  const [state, setState] = useState(INITIAL_STATE);
  const [phase, setPhase] = useState('initial'); // initial, circuitBreaker, structuralFloor, incentiveEngine
  const [interventionActive, setInterventionActive] = useState(false);
  const [showPlayerDetails, setShowPlayerDetails] = useState(true);

  // Reset simulation
  const reset = () => {
    setTime(0);
    setIsRunning(false);
    setState(INITIAL_STATE);
    setHistory([]);
    setPhase('initial');
    setInterventionActive(false);
  };

  // Apply policy intervention (The SGT Pathway)
  const applyIntervention = (phaseType) => {
    setInterventionActive(true);
    setPhase(phaseType);
    
    let newState = { ...state };
    
    switch(phaseType) {
      case 'circuitBreaker':
        // Phase 1: Reduce resistance (R + S)
        newState.regimeCoercion *= 0.7; // Regime yields political space
        newState.S *= 0.85; // External pressure reduced
        newState.R *= 0.90; // Slight rigidity reduction
        newState.oppositionSymbolic *= 1.2; // Opposition gains legitimacy
        break;
        
      case 'structuralFloor':
        // Phase 2: Stabilize structure (technocratic management)
        newState.politicalPower *= 0.80; // Delegate to neutral parties
        newState.wealth *= 1.15; // Currency stabilization begins
        newState.soc *= 1.3; // System capacity improves
        newState.regimeStructural *= 0.70; // Less regime control
        break;
        
      case 'incentiveEngine':
        // Phase 3: Rebuild agency (micro-incentives)
        newState.P *= 1.4; // Personal agency empowered
        newState.wealth *= 1.25; // Small-scale capitalism
        newState.populationExit *= 0.70; // Less emigration
        newState.trust *= 1.3; // Trust begins rebuilding
        break;
    }
    
    setState(newState);
  };

  // Simulation step
  const simulationStep = () => {
    const s = { ...state };
    
    // Calculate W_acc (Dual Pull Principle)
    const W_acc = (s.T + s.P + s.C) - (s.R + s.S);
    
    // Calculate Theta (Threshold Ratio)
    const theta = s.wsi / s.soc;
    
    // SIP Trap: interpretation multiplier
    const phi = 2 / (1 + Math.exp(-2 * W_acc)) - 1;
    
    // Player payoffs and system costs
    const regimePayoff = s.politicalPower * 10 - (theta > 1.0 ? 30 * (theta - 1) : 0);
    const oppositionPayoff = s.trust * 8 - (theta > 1.0 ? 20 * (theta - 1) : 0);
    const populationPayoff = (s.wealth + s.education) * 5 - s.populationExit * 10;
    
    // System dynamics (degradation in crisis)
    if (!interventionActive) {
      // Natural decay path (Red Zone)
      s.trust *= 0.985;
      s.wealth *= 0.975;
      s.education *= 0.990;
      s.soc *= 0.985;
      
      // Coercion increases resistance
      s.S += s.regimeCoercion * 0.005;
      s.R += 0.003;
      
      // Population exits
      s.populationExit = Math.min(0.80, s.populationExit + 0.01);
      
      // Political power erodes despite coercion
      s.politicalPower *= 0.990;
    } else {
      // Intervention path (pathway to recovery)
      if (phase === 'circuitBreaker') {
        s.S = Math.max(0.40, s.S * 0.97);
        s.R = Math.max(0.40, s.R * 0.98);
        s.trust *= 1.005;
      } else if (phase === 'structuralFloor') {
        s.wealth *= 1.01;
        s.soc *= 1.015;
        s.civilization *= 1.005;
      } else if (phase === 'incentiveEngine') {
        s.P = Math.min(1.0, s.P * 1.02);
        s.trust *= 1.015;
        s.wealth *= 1.02;
        s.populationExit *= 0.95;
      }
    }
    
    // Recalculate WSI (weighted fundamentals)
    s.wsi = (
      0.20 * s.wealth +
      0.15 * s.trust +
      0.10 * 0.60 + // Religion (stable)
      0.15 * s.civilization +
      0.20 * s.education +
      0.20 * s.politicalPower
    );
    
    // Update T and C based on stability
    s.T = 0.5 + 0.5 * (s.wsi / 0.75);
    s.C = s.trust;
    
    // Record history
    const record = {
      time,
      wsi: s.wsi.toFixed(3),
      soc: s.soc.toFixed(3),
      theta: theta.toFixed(3),
      W_acc: W_acc.toFixed(3),
      trust: s.trust.toFixed(3),
      wealth: s.wealth.toFixed(3),
      politicalPower: s.politicalPower.toFixed(3),
      regimePayoff: regimePayoff.toFixed(1),
      oppositionPayoff: oppositionPayoff.toFixed(1),
      populationPayoff: populationPayoff.toFixed(1),
      thresholdCrossed: theta > 1.0,
      phase: phase
    };
    
    setHistory(prev => [...prev, record]);
    setState(s);
    setTime(prev => prev + 1);
  };

  // Auto-play effect
  useEffect(() => {
    if (isRunning && time < 200) {
      const timer = setTimeout(simulationStep, speed);
      return () => clearTimeout(timer);
    } else if (time >= 200) {
      setIsRunning(false);
    }
  }, [isRunning, time, speed, state]);

  const currentData = history[history.length - 1] || {};
  const currentTheta = parseFloat(currentData.theta) || 0;
  const currentW_acc = parseFloat(currentData.W_acc) || 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-red-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          SGT Venezuela Crisis: Confrontation Analysis
        </h1>
        <p className="text-slate-600">
          Multi-agent system demonstrating Nash vs Societrics pathway predictions
        </p>
      </div>

      {/* System Status Dashboard */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-lg p-4 ${
          currentTheta > 1.0 ? 'bg-red-100' : 
          currentTheta > 0.8 ? 'bg-yellow-100' : 
          'bg-green-100'
        }`}>
          <div className="text-xs font-medium text-slate-600 mb-1">THRESHOLD (Θ)</div>
          <div className="text-2xl font-bold text-slate-800">{currentData.theta || '0.520'}</div>
          <div className="text-xs mt-1">
            {currentTheta > 1.0 ? '🔴 RED ZONE' : currentTheta > 0.8 ? '🟡 FRAGILE' : '🟢 STABLE'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs font-medium text-slate-600 mb-1">MORAL BALANCE</div>
          <div className="text-2xl font-bold text-slate-800">{currentData.W_acc || '0.850'}</div>
          <div className="text-xs mt-1">
            {currentW_acc < 0 ? 'Resistance > Acceptance' : 'Constructive Pull'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs font-medium text-slate-600 mb-1">SOCIAL TRUST</div>
          <div className="text-2xl font-bold text-slate-800">{(parseFloat(currentData.trust || 0.30) * 100).toFixed(0)}%</div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${parseFloat(currentData.trust || 0.30) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs font-medium text-slate-600 mb-1">TIME / PHASE</div>
          <div className="text-2xl font-bold text-slate-800">{time}</div>
          <div className="text-xs mt-1 capitalize">
            {phase === 'initial' ? 'Natural Decay' : phase.replace(/([A-Z])/g, ' $1')}
          </div>
        </div>
      </div>

      {/* Player Status Cards */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Player Status & Motives</h2>
          <button
            onClick={() => setShowPlayerDetails(!showPlayerDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showPlayerDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {showPlayerDetails && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="text-red-600" size={20} />
                <h3 className="font-semibold text-red-800">Player L: Regime</h3>
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <div><strong>Motive:</strong> Survival (Residual)</div>
                <div><strong>Strategy:</strong> Coercion + Structural Control</div>
                <div className="mt-2 pt-2 border-t border-red-200">
                  <div>Coercion Level: {(state.regimeCoercion * 100).toFixed(0)}%</div>
                  <div>Political Power: {(state.politicalPower * 100).toFixed(0)}%</div>
                </div>
                <div className="mt-2 text-xs">
                  <strong>Payoff:</strong> {currentData.regimePayoff || 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="text-blue-600" size={20} />
                <h3 className="font-semibold text-blue-800">Player O: Opposition</h3>
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <div><strong>Motive:</strong> Restoration (Ulterior)</div>
                <div><strong>Strategy:</strong> Symbolic (Protests, Appeals)</div>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div>Symbolic Strength: {(state.oppositionSymbolic * 100).toFixed(0)}%</div>
                  <div>Trust Base: {(state.trust * 100).toFixed(0)}%</div>
                </div>
                <div className="mt-2 text-xs">
                  <strong>Payoff:</strong> {currentData.oppositionPayoff || 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-600" size={20} />
                <h3 className="font-semibold text-purple-800">Player P: Population</h3>
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <div><strong>Motive:</strong> Survival (Initial)</div>
                <div><strong>Strategy:</strong> Exit (Migration, Black Market)</div>
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <div>Exit Rate: {(state.populationExit * 100).toFixed(0)}%</div>
                  <div>Personal Agency: {(state.P * 100).toFixed(0)}%</div>
                </div>
                <div className="mt-2 text-xs">
                  <strong>Payoff:</strong> {currentData.populationPayoff || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Controls */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Simulation Controls</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? '⏸ Pause' : <><Play size={16} /> Run Simulation</>}
          </button>
          
          <button
            onClick={reset}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-slate-700">Speed:</label>
            <select 
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="border border-slate-300 rounded px-3 py-2"
            >
              <option value={1000}>Slow</option>
              <option value={500}>Normal</option>
              <option value={200}>Fast</option>
              <option value={50}>Very Fast</option>
            </select>
          </div>
        </div>

        {/* SGT Pathway Interventions */}
        <div className="mt-4 pt-4 border-t-2 border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-3">SGT Policy Interventions (The Pathway)</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => applyIntervention('circuitBreaker')}
              disabled={phase !== 'initial'}
              className={`p-4 border-2 rounded-lg text-left transition ${
                phase === 'circuitBreaker' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-semibold text-slate-800">Phase 1: Circuit Breaker</div>
              <div className="text-xs text-slate-600 mt-1">
                Reduce R + S (resistance). Regime yields space, sanctions ease.
              </div>
              <div className="text-xs text-blue-600 mt-2 font-medium">
                Target: W_acc → 0 (neutral zone)
              </div>
            </button>

            <button
              onClick={() => applyIntervention('structuralFloor')}
              disabled={phase !== 'circuitBreaker'}
              className={`p-4 border-2 rounded-lg text-left transition ${
                phase === 'structuralFloor' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-slate-300 hover:border-purple-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-semibold text-slate-800">Phase 2: Structural Floor</div>
              <div className="text-xs text-slate-600 mt-1">
                Technocratic management. Stabilize currency, stop volatility.
              </div>
              <div className="text-xs text-purple-600 mt-2 font-medium">
                Target: |ΔC| ≤ SOC (restore capacity)
              </div>
            </button>

            <button
              onClick={() => applyIntervention('incentiveEngine')}
              disabled={phase !== 'structuralFloor'}
              className={`p-4 border-2 rounded-lg text-left transition ${
                phase === 'incentiveEngine' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-300 hover:border-green-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-semibold text-slate-800">Phase 3: Incentive Engine</div>
              <div className="text-xs text-slate-600 mt-1">
                Empower P (personal agency). Micro-capitalism, property rights.
              </div>
              <div className="text-xs text-green-600 mt-2 font-medium">
                Target: W_acc &gt; 0 (constructive pull)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Time Series Visualization */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">System Evolution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={1.0} stroke="red" strokeDasharray="3 3" label="Crisis (Θ=1)" />
            <ReferenceLine y={0.0} stroke="orange" strokeDasharray="3 3" label="Neutral (W_acc=0)" />
            <Line type="monotone" dataKey="theta" stroke="#ef4444" strokeWidth={2} name="Threshold (Θ)" />
            <Line type="monotone" dataKey="W_acc" stroke="#f59e0b" strokeWidth={2} name="W_acc (DPP)" />
            <Line type="monotone" dataKey="trust" stroke="#3b82f6" strokeWidth={2} name="Trust" />
            <Line type="monotone" dataKey="wealth" stroke="#10b981" strokeWidth={2} name="Wealth" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Nash vs SGT Predictions */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Equilibrium Predictions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-slate-400 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs">NASH</span>
              Classical Prediction
            </h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">Player L (Regime)</div>
                <p className="text-slate-600">
                  Rational to maintain coercion. Survival maximizes short-term utility.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">Player O (Opposition)</div>
                <p className="text-slate-600">
                  Symbolic resistance continues. Cannot alter structural collapse.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">Outcome</div>
                <p className="text-red-600 font-semibold">
                  Regime persists indefinitely via coercion
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">SGT σₑ</span>
              Societrics Prediction
            </h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-800 mb-1">Phase 1: Circuit Breaker</div>
                <p className="text-slate-600">
                  Reduce resistance (R+S). Both sides yield to stop W_acc spiral.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-800 mb-1">Phase 2: Structural Floor</div>
                <p className="text-slate-600">
                  Technocratic management. Stabilize SOC capacity via neutral parties.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-800 mb-1">Phase 3: Incentive Engine</div>
                <p className="text-slate-600">
                  Rebuild P (personal agency). Micro-capitalism restores trust.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-800 mb-1">Outcome</div>
                <p className="text-green-600 font-semibold">
                  Constructive Succession restores equilibrium
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Key SGT Insights:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Nash fails:</strong> Predicts regime survival indefinitely despite system collapse</li>
          <li>• <strong>SGT σₑ:</strong> Excludes coercion once Θ &gt; 1; only constructive path admissible</li>
          <li>• <strong>SIP Trap active:</strong> When W_acc &lt; 0, all regime actions reinterpreted as manipulation</li>
          <li>• <strong>The Pathway:</strong> Sequential interventions required—symbolic alone cannot fix structural crisis</li>
          <li>• <strong>Time Lag (Ω):</strong> Phase 1 must include immediate visible wins to buy time for Phases 2-3</li>
        </ul>
      </div>
    </div>
  );
};

export default VenezuelaCrisis;