// File: scripts/batch-resave.user.js
// Description: Auto-added top comment for easier file identification.

// ==UserScript==
// @name         VelvetSnap Batch Re-save Templates
// @namespace    http://localhost:3000
// @version      1.0
// @description  Auto re-save all strip templates via Strip Studio
// @author       You
// @match        http://localhost:*/admin/templates*
// @match        http://localhost:*/admin/template-studio*
// @match        https://*/admin/templates*
// @match        https://*/admin/template-studio*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const KEY = '__vs_batch_resave__';

  function getState() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  }

  function setState(state) {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  }

  function clearState() {
    sessionStorage.removeItem(KEY);
  }

  const path = window.location.pathname;

  // ====== TEMPLATE LIST PAGE ======
  if (path.includes('/admin/templates')) {
    let state = getState();

    // If no state or previous run finished, start fresh
    if (!state || !state.running) {
      const links = Array.from(document.querySelectorAll('a[href*="/admin/template-studio?edit="]'));
      const ids = links.map((a) => new URL(a.href).searchParams.get('edit')).filter(Boolean);

      if (ids.length === 0) {
        console.log('[BatchReSave] No templates found.');
        return;
      }

      state = { ids, idx: 0, running: true };
      setState(state);
      console.log(`[BatchReSave] Starting batch re-save for ${ids.length} templates`);
    }

    if (state.idx >= state.ids.length) {
      console.log('[BatchReSave] All done!');
      clearState();
      return;
    }

    const nextId = state.ids[state.idx];
    state.idx++;
    setState(state);
    console.log(`[BatchReSave] Navigating to template ${state.idx}/${state.ids.length}: ${nextId}`);
    window.location.href = `/admin/template-studio?edit=${nextId}`;
  }

  // ====== STRIP STUDIO PAGE ======
  if (path.includes('/admin/template-studio')) {
    const state = getState();
    if (!state || !state.running) {
      console.log('[BatchReSave] No active batch session. Start from /admin/templates');
      return;
    }

    const waitMs = 5000;
    console.log(`[BatchReSave] Waiting ${waitMs / 1000}s for canvas to render...`);

    setTimeout(async () => {
      try {
        // 1. Click "Save Template" button to open the modal
        const allButtons = document.querySelectorAll('button');
        let saveBtn = null;
        for (const btn of allButtons) {
          if (btn.textContent.trim().includes('Save Template') || btn.textContent.trim() === '💾 Save Template') {
            saveBtn = btn;
            break;
          }
        }

        if (!saveBtn) {
          console.error('[BatchReSave] Save Template button not found');
          return;
        }

        saveBtn.click();
        console.log('[BatchReSave] Clicked Save Template');
        await sleep(800);

        // 2. Click the final Save/Update button in the modal
        const modalButtons = document.querySelectorAll('button');
        let confirmBtn = null;
        for (const btn of modalButtons) {
          const text = btn.textContent.trim();
          if (text === 'Update' || text === 'Save') {
            // Make sure it's the modal button (enabled, visible)
            if (!btn.disabled) {
              confirmBtn = btn;
              break;
            }
          }
        }

        if (!confirmBtn) {
          console.error('[BatchReSave] Confirm button not found in modal');
          return;
        }

        confirmBtn.click();
        console.log('[BatchReSave] Clicked confirm, waiting for redirect...');

        // 3. Wait for redirect back to template list (handled by router.push)
        // The page will navigate away automatically
      } catch (err) {
        console.error('[BatchReSave] Error:', err);
      }
    }, waitMs);
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
})();
