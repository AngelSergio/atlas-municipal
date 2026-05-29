(function () {
  'use strict';

  function setupAtlasViewHistory(options) {
    const map = options && options.map;
    const btnPrev = document.getElementById('btn-view-prev');
    const btnNext = document.getElementById('btn-view-next');

    if (!map || !btnPrev || !btnNext) return;

    const states = [];
    const maxStates = 80;
    let currentIndex = -1;
    let isRestoring = false;

    function cloneState() {
      const view = map.getView();
      const center = view.getCenter();
      return {
        center: center ? center.slice() : null,
        zoom: view.getZoom(),
        rotation: view.getRotation() || 0
      };
    }

    function isSameState(a, b) {
      if (!a || !b || !a.center || !b.center) return false;
      return (
        Math.abs(a.center[0] - b.center[0]) < 1 &&
        Math.abs(a.center[1] - b.center[1]) < 1 &&
        Math.abs((a.zoom || 0) - (b.zoom || 0)) < 0.0001 &&
        Math.abs((a.rotation || 0) - (b.rotation || 0)) < 0.000001
      );
    }

    function updateButtons() {
      btnPrev.disabled = currentIndex <= 0;
      btnNext.disabled = currentIndex < 0 || currentIndex >= states.length - 1;
    }

    function trimHistory() {
      if (states.length <= maxStates) return;
      const overflow = states.length - maxStates;
      states.splice(0, overflow);
      currentIndex = Math.max(0, currentIndex - overflow);
    }

    function pushCurrentState(force) {
      const state = cloneState();
      if (!state.center) return;

      if (!force && isSameState(state, states[currentIndex])) {
        updateButtons();
        return;
      }

      if (currentIndex < states.length - 1) {
        states.splice(currentIndex + 1);
      }

      states.push(state);
      currentIndex = states.length - 1;
      trimHistory();
      updateButtons();
    }

    function applyState(state) {
      if (!state || !state.center) return;
      isRestoring = true;
      map.getView().animate(
        {
          center: state.center.slice(),
          zoom: state.zoom,
          rotation: state.rotation || 0,
          duration: 250
        },
        function () {
          isRestoring = false;
        }
      );
      updateButtons();
    }

    function goPrevious() {
      if (currentIndex <= 0) return;
      currentIndex -= 1;
      updateButtons();
      applyState(states[currentIndex]);
    }

    function goNext() {
      if (currentIndex < 0 || currentIndex >= states.length - 1) return;
      currentIndex += 1;
      updateButtons();
      applyState(states[currentIndex]);
    }

    btnPrev.addEventListener('click', goPrevious);
    btnNext.addEventListener('click', goNext);

    map.on('moveend', function () {
      if (isRestoring) return;
      pushCurrentState(false);
    });

    window.AtlasViewHistory = {
      reset: function () {
        states.length = 0;
        currentIndex = -1;
        pushCurrentState(true);
      },
      previous: goPrevious,
      next: goNext,
      getState: function () {
        return { size: states.length, index: currentIndex };
      }
    };

    updateButtons();
  }

  window.setupAtlasViewHistory = setupAtlasViewHistory;
})();
