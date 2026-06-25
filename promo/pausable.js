/* ==========================================================================
   pausable.js  —  drop-in pause support for a promo scene.
   Include this BEFORE a scene's own <script>. It wraps the native
   setTimeout/setInterval so timers can be frozen and resumed, and freezes
   CSS @keyframes animations via animation-play-state. It listens for
   'rebillia:pause' / 'rebillia:resume' / 'rebillia:toggle' messages from the
   parent player and toggles on the spacebar when viewed standalone.

   Native timers are kept (not replaced by a rAF clock) so the scene still
   fast-forwards correctly under headless capture AND animates in real browsers.
   ========================================================================== */
(function(){
  var _sT=window.setTimeout.bind(window), _cT=window.clearTimeout.bind(window),
      _sI=window.setInterval.bind(window), _cI=window.clearInterval.bind(window);
  var paused=false, nextId=1, items={};
  var SPEED=1.2;   // >1 slows every scene timer uniformly (1.2 = 20% slower playback)
  function nowMs(){ return (window.performance&&performance.now)?performance.now():Date.now(); }

  window.setTimeout=function(cb,delay){ return add(cb, (+delay||0)*SPEED, false); };
  window.setInterval=function(cb,delay){ return add(cb, (+delay||0)*SPEED, true); };
  window.clearTimeout=function(id){ kill(id); };
  window.clearInterval=function(id){ kill(id); };

  function add(cb, delay, interval){
    var id=nextId++;
    items[id]={cb:cb, delay:delay, interval:interval, remaining:delay, start:0, native:null};
    if(!paused) arm(id);
    return id;
  }
  function kill(id){
    var it=items[id]; if(!it) return;
    if(it.native!=null){ it.interval?_cI(it.native):_cT(it.native); }
    delete items[id];
  }
  function arm(id){
    var it=items[id]; if(!it) return;
    it.start=nowMs();
    if(it.interval && it.remaining===it.delay){
      it.native=_sI(function(){ it.start=nowMs(); try{ it.cb(); }catch(e){} }, it.delay);
    } else {
      it.native=_sT(function(){
        it.native=null;
        try{ it.cb(); }catch(e){}
        if(items[id]){ if(it.interval){ it.remaining=it.delay; arm(id); } else { delete items[id]; } }
      }, it.remaining);
    }
  }
  function pauseTimers(){
    for(var id in items){
      var it=items[id];
      if(it.native!=null){
        var elapsed=nowMs()-it.start;
        var base=it.interval?it.delay:it.remaining;
        it.remaining=Math.max(0, base-elapsed);
        it.interval?_cI(it.native):_cT(it.native);
        it.native=null;
      }
    }
  }
  function resumeTimers(){ for(var id in items) arm(id); }

  var styleEl=null;
  function freezeCSS(on){
    if(on){
      if(!styleEl){ styleEl=document.createElement('style');
        styleEl.textContent='*,*::before,*::after{animation-play-state:paused !important}'; }
      if(!styleEl.parentNode)(document.head||document.documentElement).appendChild(styleEl);
    } else if(styleEl&&styleEl.parentNode){ styleEl.parentNode.removeChild(styleEl); }
  }
  function setPaused(p){
    if(p===paused) return; paused=p;
    if(p){ pauseTimers(); } else { resumeTimers(); }
    freezeCSS(p);
  }

  window.addEventListener('message', function(e){
    if(e.data==='rebillia:pause') setPaused(true);
    else if(e.data==='rebillia:resume') setPaused(false);
    else if(e.data==='rebillia:toggle') setPaused(!paused);
  });
  window.addEventListener('keydown', function(e){
    if(e.code==='Space'||e.key===' '){ e.preventDefault(); setPaused(!paused); }
  });
})();
