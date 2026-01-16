// ==UserScript==
// @name               Booth ItemPage Enhancer
// @name:zh-CN         Booth 商品页面增强
// @namespace          yueby.booth
// @version            0.1.19
// @author             Yueby
// @description        A userscript for enhancing Booth item page experience
// @description:zh-CN  增强 Booth 商品页面的功能体验，包括变体序号、标签管理、自动翻译等功能
// @icon               ./src/assets/icon.png
// @match              https://manage.booth.pm/items*
// @require            https://cdn.jsdelivr.net/npm/vue@3.5.18/dist/vue.global.prod.js
// @require            https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js
// @require            https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/named-register.min.js
// @require            data:application/javascript,%3B(typeof%20System!%3D'undefined')%26%26(System%3Dnew%20System.constructor())%3B
// @connect            raw.githubusercontent.com
// @grant              GM_addStyle
// @grant              GM_getValue
// @grant              GM_notification
// @grant              GM_registerMenuCommand
// @grant              GM_setClipboard
// @grant              GM_setValue
// @grant              GM_xmlhttpRequest
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const t=document.createElement("style");t.textContent=e,document.head.append(t)})(` .menu-fade-enter-active[data-v-4d60a255]{transition:opacity .15s ease-out,transform .15s ease-out}.menu-fade-leave-active[data-v-4d60a255]{transition:opacity .1s ease-in,transform .1s ease-in}.menu-fade-enter-from[data-v-4d60a255]{opacity:0;transform:scale(.95) translateY(-4px)}.menu-fade-leave-to[data-v-4d60a255]{opacity:0;transform:scale(.95)}.context-menu[data-v-4d60a255]{position:fixed;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 12px #00000026;z-index:10000;min-width:140px;overflow:hidden;padding:4px 0;transform-origin:top left}.context-menu.no-transition[data-v-4d60a255]{transition:none!important}.menu-item[data-v-4d60a255]{padding:8px 16px;cursor:pointer;transition:all .15s ease;font-size:12px;color:#374151;display:flex;align-items:center;gap:8px}.menu-item[data-v-4d60a255]:hover{background:#f3f4f6}.menu-item-danger[data-v-4d60a255]{color:#ef4444}.menu-item-danger[data-v-4d60a255]:hover{background:#fef2f2}.menu-item-disabled[data-v-4d60a255]{opacity:.5;cursor:not-allowed;pointer-events:none}.menu-icon[data-v-4d60a255]{display:flex;align-items:center;justify-content:center;color:#6b7280;flex-shrink:0}.menu-item-danger .menu-icon[data-v-4d60a255]{color:#ef4444}.menu-icon[data-v-4d60a255] svg{width:14px;height:14px}.menu-label[data-v-4d60a255]{flex:1}.menu-separator[data-v-4d60a255]{height:1px;background:#e5e7eb;margin:4px 0}.file-selector[data-v-43c71f00]{width:100%}.file-grid[data-v-43c71f00]{display:grid;gap:8px;overflow-y:auto;padding:8px;border:1px solid var(--be-color-border);border-radius:var(--be-radius-sm)}.file-item[data-v-43c71f00]{padding:6px 8px;transition:all .15s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.file-item[data-v-43c71f00]:hover{transform:translateY(-1px)}.file-item.is-selected[data-v-43c71f00]{background-color:#3b82f61a;border-color:#3b82f64d}.icon-btn[data-v-996dd7d2]{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:#64748b;border-radius:6px;cursor:pointer;transition:all .15s ease;padding:0}.icon-btn[data-v-996dd7d2] svg{width:18px;height:18px;stroke-width:2}.icon-btn[data-v-996dd7d2]:hover{background:#f1f5f9;color:#475569;border-color:#e2e8f0;transform:translateY(-1px)}.icon-btn[data-v-996dd7d2]:active{transform:translateY(1px)}.icon-btn.variant-danger[data-v-996dd7d2]{color:#64748b}.icon-btn.variant-danger[data-v-996dd7d2]:hover{background:#fef2f2;color:#ef4444;border-color:#fee2e2}.modal-overlay[data-v-3bf68892]{position:fixed;top:0;right:0;bottom:0;left:0;background:#00000080;display:flex;align-items:flex-end;justify-content:center;z-index:10000;padding:0;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}.modal-overlay.modal-in-sidebar[data-v-3bf68892]{position:absolute;z-index:2000}.modal-container[data-v-3bf68892]{background:#fff;border-radius:16px 16px 0 0;box-shadow:0 10px 25px #0003;width:100%;max-height:70vh;display:flex;flex-direction:column;overflow:hidden}.modal-overlay.modal-in-sidebar .modal-container[data-v-3bf68892]{max-height:70%}.modal-header[data-v-3bf68892]{padding:10px 12px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#f8fafc}.modal-title[data-v-3bf68892]{margin:0;font-size:14px;font-weight:600;color:#374151}.modal-header-actions[data-v-3bf68892]{display:flex;align-items:center;gap:4px}.modal-header .booth-btn[data-v-3bf68892] svg{width:18px;height:18px;stroke-width:2}.modal-body[data-v-3bf68892]{padding:8px;overflow-y:auto;flex:1;min-height:0;color:#374151}.modal-footer[data-v-3bf68892]{padding:10px 12px;border-top:1px solid #e5e7eb;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px;flex-shrink:0;background:#f8fafc}.modal-body[data-v-3bf68892] .section-header-container{padding-left:0!important;padding-right:0!important}.modal-footer .booth-btn[data-v-3bf68892]{width:100%}.modal-enter-active[data-v-3bf68892],.modal-leave-active[data-v-3bf68892]{transition:opacity .3s ease}.modal-enter-active .modal-container[data-v-3bf68892],.modal-leave-active .modal-container[data-v-3bf68892]{transition:transform .3s ease}.modal-enter-from[data-v-3bf68892],.modal-leave-to[data-v-3bf68892]{opacity:0}.modal-enter-from .modal-container[data-v-3bf68892],.modal-leave-to .modal-container[data-v-3bf68892]{transform:translateY(100%)}.modal-body[data-v-3bf68892]::-webkit-scrollbar{width:6px}.modal-body[data-v-3bf68892]::-webkit-scrollbar-track{background:#f5f5f5}.modal-body[data-v-3bf68892]::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-body[data-v-3bf68892]::-webkit-scrollbar-thumb:hover{background:#999}.preview-box[data-v-93d09832]{padding:var(--be-space-sm);background:var(--be-color-bg-secondary);border:1px solid var(--be-color-border);border-radius:var(--be-radius-sm)}.preview-box pre[data-v-93d09832]{font-family:inherit;font-size:inherit;line-height:inherit}.section-header-container[data-v-5643104c]{padding:var(--be-space-sm);padding-bottom:8px;border-bottom:1px solid var(--be-color-border)}.section-header-container.no-header[data-v-5643104c]{padding-bottom:var(--be-space-sm)}.section-header-container.no-border[data-v-5643104c]{border-bottom:none;padding-bottom:var(--be-space-sm)}.section-header[data-v-5643104c]{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.actions[data-v-5643104c]{display:flex;gap:var(--be-space-sm);flex-wrap:nowrap;align-items:center}.tab-bar[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb}.tab-list[data-v-ee7eccb8]{display:flex;gap:2px}.tab-btn[data-v-ee7eccb8]{padding:6px 12px;border:1px solid transparent;background:transparent;cursor:pointer;font-size:12px;color:#6b7280;border-radius:6px;transition:all .15s ease;display:flex;align-items:center;gap:6px;font-weight:500}.tab-btn[data-v-ee7eccb8]:hover:not(.active){background:#f3f4f6;color:#374151}.tab-btn.active[data-v-ee7eccb8]{background:#fff;color:#3b82f6;font-weight:600;box-shadow:0 1px 2px #00000014}.tab-icon[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:center}.tab-icon[data-v-ee7eccb8] svg{width:13px;height:13px}.tab-label[data-v-ee7eccb8]{white-space:nowrap}.tab-actions[data-v-ee7eccb8]{display:flex;align-items:center;gap:4px}.template-selector[data-v-3d389fdb]{display:flex;flex-direction:column;gap:4px}.template-selector-label[data-v-3d389fdb]{font-size:var(--be-font-size-sm);font-weight:500;color:var(--be-color-text-primary)}.template-selector-select[data-v-3d389fdb]{width:100%}.tree-item[data-v-fbb1ef76]{-webkit-user-select:none;user-select:none}.tree-node-wrapper[data-v-fbb1ef76]{position:relative;transition:all .15s ease}.tree-node-wrapper[draggable=true][data-v-fbb1ef76]{cursor:move}.tree-node-wrapper[data-v-fbb1ef76]:active{cursor:grabbing}.tree-node-wrapper.drag-over-inside[data-v-fbb1ef76]{background:#eff6ff;border-radius:4px}.tree-node-wrapper.drag-over-inside[data-v-fbb1ef76]:before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;border:2px solid #3b82f6;border-radius:4px;pointer-events:none;animation:pulse-fbb1ef76 1s ease-in-out infinite}@keyframes pulse-fbb1ef76{0%,to{opacity:1}50%{opacity:.5}}.drop-indicator[data-v-fbb1ef76]{position:relative;height:2px;margin:2px 0;pointer-events:none}.drop-indicator[data-v-fbb1ef76]:before{content:"";position:absolute;left:0;right:0;height:2px;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.drop-indicator[data-v-fbb1ef76]:after{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.node-item[data-v-fbb1ef76]{position:relative;border-bottom:1px solid rgba(0,0,0,.06);transition:background .15s ease;cursor:pointer}.node-item.is-editing[data-v-fbb1ef76]{cursor:default}.node-item[data-v-fbb1ef76]:not(.is-editing):after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background-color:transparent;pointer-events:none;transition:background-color .1s ease;z-index:1}.node-item[data-v-fbb1ef76]:not(.is-editing):hover:after{background-color:#0000000a}.node-item.selected[data-v-fbb1ef76]{background:#bfdbfe}.tree-node-content[data-v-fbb1ef76]{display:flex;align-items:center;padding:4px 8px;min-height:28px;cursor:inherit;transition:background .15s ease}.node-item.has-custom-content .tree-node-content[data-v-fbb1ef76]{padding-bottom:2px}.node-item.is-editing .tree-node-content[data-v-fbb1ef76]{cursor:default}.toggle-area[data-v-fbb1ef76]{display:flex;align-items:center;cursor:pointer;position:relative;z-index:2;transition:opacity .15s ease;margin-right:8px}.toggle-area[data-v-fbb1ef76]:hover{opacity:.7}.toggle-area .expand-icon[data-v-fbb1ef76]{margin-right:4px}.toggle-area .icon[data-v-fbb1ef76]{margin-right:0}.expand-icon[data-v-fbb1ef76]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:4px;color:#6b7280;flex-shrink:0;transition:transform .2s ease,opacity .15s ease;position:relative;z-index:2}.expand-icon.placeholder[data-v-fbb1ef76]{visibility:hidden;cursor:default}.node-item.is-editing .expand-icon[data-v-fbb1ef76]:not(.placeholder){cursor:pointer}.node-item.is-editing .expand-icon[data-v-fbb1ef76]:not(.placeholder):hover{opacity:.7}.expand-icon[data-v-fbb1ef76] svg{width:12px;height:12px}.icon[data-v-fbb1ef76]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:8px;flex-shrink:0;position:relative;z-index:2}.icon[data-v-fbb1ef76] svg{display:block;width:16px;height:16px;stroke-width:2}.node-custom-content[data-v-fbb1ef76]{padding-top:2px;padding-bottom:4px;padding-right:8px}.node-custom-content[data-v-fbb1ef76]:empty{display:none;padding:0}.node-item.is-editing .node-custom-content[data-v-fbb1ef76]{opacity:.6;pointer-events:none}.node-name-input[data-v-fbb1ef76]{flex:1;padding:2px 6px;border-radius:3px;font-size:13px;font-family:inherit;line-height:1.4}.name[data-v-fbb1ef76]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:#374151;line-height:1.4}.count[data-v-fbb1ef76]{font-size:11px;color:#9ca3af;margin-left:6px;font-weight:400}.node-header-extra[data-v-fbb1ef76]{margin-left:auto;display:flex;align-items:center;gap:8px}.tree-wrapper[data-v-d653bc39]{display:flex;flex-direction:column;height:100%;overflow:hidden}.tree-search[data-v-d653bc39]{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;flex-shrink:0}.tree-toolbar[data-v-d653bc39]{padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;flex-shrink:0}.search-input[data-v-d653bc39]{flex:1;border:none;outline:none;background:transparent;font-size:12px;color:#374151}.tree-search-toolbar[data-v-d653bc39]{display:flex;align-items:center;gap:6px;margin-left:auto}.search-input[data-v-d653bc39]::placeholder{color:#9ca3af}.search-results[data-v-d653bc39]{flex:1;overflow-y:auto;min-height:0}.search-empty[data-v-d653bc39]{padding:40px 20px;text-align:center;color:#9ca3af;font-size:13px}.tree-toolbar[data-v-d653bc39]{padding:8px;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;background:#fff;min-height:40px}.node-tree[data-v-d653bc39]{-webkit-user-select:none;user-select:none;flex:1;overflow-y:auto;min-height:0;position:relative}.tree-content[data-v-d653bc39]{position:relative;z-index:1}.empty-state[data-v-d653bc39]{padding:40px 20px;text-align:center;color:#94a3b8;font-size:13px;border:1px dashed #cbd5e1;border-radius:4px;margin:8px;transition:all .15s ease}.draggable-card-list[data-v-89529f85]{display:flex;flex-direction:column;gap:6px;padding:var(--be-space-sm);background:#00000005;border:1px solid var(--be-color-border);border-radius:var(--be-radius)}.drag-transition-move[data-v-89529f85]{transition:transform .3s ease}.drag-transition-enter-active[data-v-89529f85],.drag-transition-leave-active[data-v-89529f85]{transition:all .3s ease}.drag-transition-leave-active[data-v-89529f85]{position:absolute}.drag-transition-enter-from[data-v-89529f85],.drag-transition-leave-to[data-v-89529f85]{opacity:0;transform:translateY(-10px)}.draggable-card-list .draggable-card-list[data-v-89529f85]{background:transparent;border:none;padding:0}.draggable-card[data-v-89529f85]{padding:4px;background:var(--be-color-bg-secondary);border:1px solid var(--be-color-border);border-radius:var(--be-radius);cursor:default;transition:var(--be-transition-normal)}.draggable-card[data-v-89529f85]:hover{border-color:var(--be-color-border-hover);box-shadow:var(--be-shadow-sm)}.draggable-card.is-dragging[data-v-89529f85]{opacity:.5;transform:scale(.95);box-shadow:var(--be-shadow-lg);border-color:var(--be-color-primary)}.draggable-card.is-drag-over[data-v-89529f85]{opacity:.7}.card-actions[data-v-89529f85]{display:flex;align-items:center;gap:var(--be-space-xs);padding:4px 0;border-bottom:1px solid var(--be-color-border);margin-bottom:4px;min-height:28px;flex-wrap:nowrap;overflow:hidden}.drag-handle[data-v-89529f85]{cursor:grab;color:var(--be-color-text-muted);flex-shrink:0;display:flex;align-items:center;padding:4px;margin:-4px;touch-action:none;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}.drag-handle[data-v-89529f85]:active{cursor:grabbing}.drag-handle.is-locked[data-v-89529f85]{cursor:not-allowed!important;pointer-events:none}@media (max-width: 768px){.drag-handle[data-v-89529f85]{padding:8px;margin:-8px}}.card-number[data-v-89529f85]{font-size:var(--be-font-size-sm);font-weight:600;color:var(--be-color-text-secondary);flex-shrink:0}.actions-content[data-v-89529f85]{flex:1;min-width:0;display:flex;align-items:center;gap:var(--be-space-xs);overflow:hidden}.card-content[data-v-89529f85]{display:flex;flex-direction:column;gap:var(--be-space-sm)}:root{--be-color-primary: #3b82f6;--be-color-primary-hover: #2563eb;--be-color-primary-active: #1d4ed8;--be-color-success: #10b981;--be-color-success-hover: #059669;--be-color-danger: #ef4444;--be-color-danger-hover: #dc2626;--be-color-warning: #f59e0b;--be-color-info: #3b82f6;--be-color-gray-50: #f8fafc;--be-color-gray-100: #f3f4f6;--be-color-gray-200: #e5e7eb;--be-color-gray-300: #d1d5db;--be-color-gray-400: #9ca3af;--be-color-gray-500: #6b7280;--be-color-gray-600: #4b5563;--be-color-gray-700: #374151;--be-color-gray-800: #1f2937;--be-color-gray-900: #111827;--be-color-text: #374151;--be-color-text-secondary: #6b7280;--be-color-text-muted: #9ca3af;--be-color-text-inverse: #ffffff;--be-color-bg: #ffffff;--be-color-bg-secondary: #f8fafc;--be-color-bg-tertiary: #f3f4f6;--be-color-bg-hover: #f9fafb;--be-color-bg-active: #f3f4f6;--be-color-border: #e5e7eb;--be-color-border-hover: #d1d5db;--be-color-border-light: #f3f4f6;--be-shadow-sm: 0 1px 2px rgba(0, 0, 0, .05);--be-shadow-md: 0 4px 6px rgba(0, 0, 0, .1);--be-shadow-lg: 0 10px 15px rgba(0, 0, 0, .1);--be-shadow-xl: 0 20px 25px rgba(0, 0, 0, .15);--be-space-xs: 4px;--be-space-sm: 8px;--be-space-md: 16px;--be-space-lg: 24px;--be-space-xl: 32px;--be-radius-sm: 4px;--be-radius: 6px;--be-radius-md: 8px;--be-radius-lg: 12px;--be-radius-xl: 16px;--be-radius-full: 9999px;--be-font-size-xs: 10px;--be-font-size-sm: 11px;--be-font-size-base: 12px;--be-font-size-md: 13px;--be-font-size-lg: 14px;--be-font-size-xl: 16px;--be-font-size-2xl: 18px;--be-transition-fast: .1s ease;--be-transition-normal: .15s ease;--be-transition-slow: .3s ease;--be-z-dropdown: 1000;--be-z-modal: 1500;--be-z-toast: 2000;--be-z-tooltip: 2500}.booth-enhancer-sidebar *{box-sizing:border-box}.booth-enhancer-sidebar input,.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select,.booth-enhancer-sidebar button{font-family:inherit}.booth-btn{display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:6px;font-weight:500;cursor:pointer;transition:all .15s ease;text-decoration:none;white-space:nowrap;-webkit-user-select:none;user-select:none;position:relative;overflow:hidden;font-family:inherit;background:#f3f4f6;color:#374151;border:1px solid #d1d5db}.booth-btn:hover:not(:disabled){background:#e5e7eb;border-color:#9ca3af;transform:translateY(-1px)}.booth-btn:active:not(:disabled){background:#d1d5db;transform:translateY(1px)}.booth-btn:disabled{background:#f3f4f6;color:#9ca3af;cursor:not-allowed;box-shadow:none;opacity:.6}.booth-btn:disabled:hover{background:#f3f4f6;color:#9ca3af;box-shadow:none;transform:none}.booth-btn-sm{padding:4px 8px;font-size:11px;min-height:24px}.booth-btn-md{padding:6px 12px;font-size:12px;min-height:32px}.booth-btn-lg{padding:8px 16px;font-size:14px;min-height:40px}.booth-btn-primary{background:#3b82f6;color:#fff;box-shadow:0 1px 3px #3b82f64d;border:1px solid transparent}.booth-btn-primary:hover:not(:disabled){background:#2563eb;box-shadow:0 2px 4px #3b82f666}.booth-btn-primary:active:not(:disabled){background:#1d4ed8;transform:translateY(1px)}.booth-btn-secondary{background:#f3f4f6;color:#374151;border:1px solid #d1d5db}.booth-btn-secondary:hover:not(:disabled){background:#e5e7eb;border-color:#9ca3af}.booth-btn-secondary:active:not(:disabled){background:#d1d5db;transform:translateY(1px)}.booth-btn-success{background:#10b981;color:#fff;box-shadow:0 1px 3px #10b9814d;border:1px solid transparent}.booth-btn-success:hover:not(:disabled){background:#059669;box-shadow:0 2px 4px #10b98166}.booth-btn-success:active:not(:disabled){background:#047857;transform:translateY(1px)}.booth-btn-danger{background:#ef4444;color:#fff;box-shadow:0 1px 3px #ef44444d;border:1px solid transparent}.booth-btn-danger:hover:not(:disabled){background:#dc2626;box-shadow:0 2px 4px #ef444466}.booth-btn-danger:active:not(:disabled){background:#b91c1c;transform:translateY(1px)}.booth-btn-ghost{background:transparent;color:#64748b;border:1px solid transparent}.booth-btn-ghost:hover:not(:disabled){background:#f1f5f9;color:#475569;border-color:#e2e8f0}.booth-btn-ghost:active:not(:disabled){background:#e2e8f0;transform:translateY(1px)}.booth-btn-icon{padding:6px;min-width:32px;min-height:32px}.booth-btn-icon.booth-btn-sm{padding:4px;min-width:24px;min-height:24px}.booth-btn-icon.booth-btn-lg{padding:8px;min-width:40px;min-height:40px}.booth-btn:focus{outline:none;box-shadow:0 0 0 3px #3b82f61a}.booth-btn:focus:not(:focus-visible){box-shadow:none}.booth-btn-group{display:inline-flex;border-radius:6px;overflow:hidden;box-shadow:0 1px 2px #0000000d}.booth-btn-group .booth-btn{border-radius:0;border-right:1px solid rgba(255,255,255,.2)}.booth-btn-group .booth-btn:first-child{border-top-left-radius:6px;border-bottom-left-radius:6px}.booth-btn-group .booth-btn:last-child{border-top-right-radius:6px;border-bottom-right-radius:6px;border-right:none}.booth-btn-loading{position:relative;color:transparent}.booth-btn-loading:after{content:"";position:absolute;top:50%;left:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border:2px solid transparent;border-top-color:currentColor;border-radius:50%;animation:booth-btn-spin .6s linear infinite}@keyframes booth-btn-spin{to{transform:rotate(360deg)}}.booth-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;position:relative}.booth-toggle input[type=checkbox]{position:absolute;opacity:0;width:0;height:0}.booth-toggle .toggle-slider{position:relative;width:36px;height:20px;background:#d1d5db;border-radius:10px;transition:all .15s ease}.booth-toggle .toggle-slider:before{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .3s;box-shadow:0 2px 4px #0003}.booth-toggle input[type=checkbox]:checked+.toggle-slider{background:#3b82f6}.booth-toggle input[type=checkbox]:checked+.toggle-slider:before{transform:translate(16px)}.booth-toggle .toggle-label{font-size:14px;color:#374151;font-weight:400}.booth-toggle:hover .toggle-slider{background:#9ca3af;transform:translateY(-1px)}.booth-toggle:hover .toggle-label{color:#1f2937}.booth-toggle input[type=checkbox]:active+.toggle-slider{transform:translateY(1px)}.booth-toggle input[type=checkbox]:active+.toggle-slider:before{transform:translate(2px)}.booth-toggle input[type=checkbox]:checked:active+.toggle-slider:before{transform:translate(16px)}.booth-toggle-sm .toggle-slider{width:36px;height:20px}.booth-toggle-sm .toggle-slider:before{width:16px;height:16px}.booth-toggle-sm input[type=checkbox]:checked+.toggle-slider:before{transform:translate(16px)}.booth-toggle-lg .toggle-slider{width:52px;height:28px}.booth-toggle-lg .toggle-slider:before{width:24px;height:24px}.booth-toggle-lg input[type=checkbox]:checked+.toggle-slider:before{transform:translate(24px)}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]),.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select{width:100%;padding:6px 12px;margin:0;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;transition:all .15s ease;box-sizing:border-box;display:block;line-height:1.5;-webkit-appearance:none;-moz-appearance:none;appearance:none}.booth-enhancer-sidebar select{padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:16px 16px}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]):hover,.booth-enhancer-sidebar textarea:hover,.booth-enhancer-sidebar select:hover{border-color:#9ca3af}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]):focus,.booth-enhancer-sidebar textarea:focus,.booth-enhancer-sidebar select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.booth-enhancer-sidebar input::placeholder,.booth-enhancer-sidebar textarea::placeholder{color:#9ca3af}.booth-enhancer-sidebar textarea{min-height:1.25em;resize:vertical}.modal-content{display:flex;flex-direction:column;gap:var(--be-space-sm)}.modal-content p{margin:0;line-height:1.6;color:#6b7280}.form-group{margin-bottom:var(--be-space-sm)}.form-group:last-child{margin-bottom:0}.form-group label{display:block;margin-bottom:4px;font-size:12px;font-weight:500;color:#374151}.form-group .required{color:#ef4444;margin-left:4px}.label-hint{font-size:var(--be-font-size-xs);color:var(--be-color-text-muted);font-weight:400;font-style:italic}.form-hint{margin:2px 0 0;font-size:var(--be-font-size-xs);color:var(--be-color-text-secondary)}.empty-hint{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.hint-text{font-size:var(--be-font-size-base);color:var(--be-color-text-secondary)}.tab-nav{display:flex;gap:var(--be-space-xs);border-bottom:1px solid var(--be-color-border);margin-bottom:var(--be-space-sm)}.tab-btn{padding:var(--be-space-xs) var(--be-space-sm);font-size:var(--be-font-size-base);font-weight:500;color:var(--be-color-text-secondary);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:var(--be-transition-normal)}.tab-btn:hover{color:var(--be-color-text);background:var(--be-color-bg-secondary)}.tab-btn.active{color:var(--be-color-primary);border-bottom-color:var(--be-color-primary)}.tab-content{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:var(--be-space-sm)}.form-group input,.form-group textarea,.form-group select{width:100%;padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;box-sizing:border-box;line-height:1.5;transition:all .15s ease;-webkit-appearance:none;-moz-appearance:none;appearance:none}.form-group select{padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:16px 16px}.form-group input:hover,.form-group textarea:hover,.form-group select:hover{border-color:#9ca3af}.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.form-group textarea{min-height:1.25em;resize:vertical}.booth-enhancer-sidebar ::-webkit-scrollbar{width:6px;height:6px}.booth-enhancer-sidebar ::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb:hover{background:#94a3b8}.be-m-0{margin:0!important}.be-mt-0{margin-top:0!important}.be-mr-0{margin-right:0!important}.be-mb-0{margin-bottom:0!important}.be-ml-0{margin-left:0!important}.be-m-xs{margin:var(--be-space-xs)!important}.be-m-sm{margin:var(--be-space-sm)!important}.be-m-md{margin:var(--be-space-md)!important}.be-m-lg{margin:var(--be-space-lg)!important}.be-p-0{padding:0!important}.be-pt-0{padding-top:0!important}.be-pr-0{padding-right:0!important}.be-pb-0{padding-bottom:0!important}.be-pl-0{padding-left:0!important}.be-p-xs{padding:var(--be-space-xs)!important}.be-p-sm{padding:var(--be-space-sm)!important}.be-p-md{padding:var(--be-space-md)!important}.be-p-lg{padding:var(--be-space-lg)!important}.be-px-xs{padding-left:var(--be-space-xs)!important;padding-right:var(--be-space-xs)!important}.be-px-sm{padding-left:var(--be-space-sm)!important;padding-right:var(--be-space-sm)!important}.be-px-md{padding-left:var(--be-space-md)!important;padding-right:var(--be-space-md)!important}.be-px-lg{padding-left:var(--be-space-lg)!important;padding-right:var(--be-space-lg)!important}.be-pt-xs{padding-top:var(--be-space-xs)!important}.be-pt-sm{padding-top:var(--be-space-sm)!important}.be-pt-md{padding-top:var(--be-space-md)!important}.be-pt-lg{padding-top:var(--be-space-lg)!important}.be-pb-xs{padding-bottom:var(--be-space-xs)!important}.be-pb-sm{padding-bottom:var(--be-space-sm)!important}.be-pb-md{padding-bottom:var(--be-space-md)!important}.be-pb-lg{padding-bottom:var(--be-space-lg)!important}.be-mb-xs{margin-bottom:var(--be-space-xs)!important}.be-mb-sm{margin-bottom:var(--be-space-sm)!important}.be-mb-md{margin-bottom:var(--be-space-md)!important}.be-mb-lg{margin-bottom:var(--be-space-lg)!important}.be-flex{display:flex!important}.be-flex-column{flex-direction:column!important}.be-flex-row{flex-direction:row!important}.be-justify-start{justify-content:flex-start!important}.be-justify-center{justify-content:center!important}.be-justify-end{justify-content:flex-end!important}.be-justify-between{justify-content:space-between!important}.be-align-start{align-items:flex-start!important}.be-align-center{align-items:center!important}.be-align-end{align-items:flex-end!important}.be-flex-1{flex:1!important}.be-flex-grow{flex-grow:1!important}.be-flex-shrink-0{flex-shrink:0!important}.be-min-w-0{min-width:0!important}.be-gap-xs{gap:var(--be-space-xs)!important}.be-gap-sm{gap:var(--be-space-sm)!important}.be-gap-md{gap:var(--be-space-md)!important}.be-gap-lg{gap:var(--be-space-lg)!important}.be-text-left{text-align:left!important}.be-text-center{text-align:center!important}.be-text-right{text-align:right!important}.be-text-xs{font-size:var(--be-font-size-xs)!important}.be-text-sm{font-size:var(--be-font-size-sm)!important}.be-text-md{font-size:var(--be-font-size-md)!important}.be-text-lg{font-size:var(--be-font-size-lg)!important}.be-font-normal{font-weight:400!important}.be-font-medium{font-weight:500!important}.be-font-bold{font-weight:600!important}.be-text-primary{color:var(--be-color-text)!important}.be-text-secondary{color:var(--be-color-text-secondary)!important}.be-text-muted{color:var(--be-color-text-muted)!important}.be-text-danger{color:var(--be-color-danger)!important}.be-text-success{color:var(--be-color-success)!important}.be-hidden{display:none!important}.be-visible{visibility:visible!important}.be-invisible{visibility:hidden!important}.be-block{display:block!important}.be-inline{display:inline!important}.be-inline-block{display:inline-block!important}.be-w-full{width:100%!important}.be-w-auto{width:auto!important}.be-h-full{height:100%!important}.be-grid{display:grid!important}.be-grid-cols-2{grid-template-columns:repeat(2,1fr)!important}.be-grid-cols-3{grid-template-columns:repeat(3,1fr)!important}.be-grid-cols-4{grid-template-columns:repeat(4,1fr)!important}.be-border{border:1px solid var(--be-color-border)!important}.be-border-0{border:none!important}.be-border-t{border-top:1px solid var(--be-color-border)!important}.be-border-r{border-right:1px solid var(--be-color-border)!important}.be-border-b{border-bottom:1px solid var(--be-color-border)!important}.be-border-l{border-left:1px solid var(--be-color-border)!important}.be-rounded-sm{border-radius:var(--be-radius-sm)!important}.be-rounded-md{border-radius:var(--be-radius-md)!important}.be-rounded-lg{border-radius:var(--be-radius-lg)!important}.be-rounded-full{border-radius:9999px!important}.be-bg{background:var(--be-color-bg)!important}.be-bg-secondary{background:var(--be-color-bg-secondary)!important}.be-bg-tertiary{background:var(--be-color-bg-tertiary)!important}.be-shadow-sm{box-shadow:var(--be-shadow-sm)!important}.be-shadow-md{box-shadow:var(--be-shadow-md)!important}.be-shadow-lg{box-shadow:var(--be-shadow-lg)!important}.be-shadow-none{box-shadow:none!important}.be-cursor-pointer{cursor:pointer!important}.be-cursor-default{cursor:default!important}.be-cursor-not-allowed{cursor:not-allowed!important}.be-overflow-hidden{overflow:hidden!important}.be-overflow-auto{overflow:auto!important}.be-overflow-scroll{overflow:scroll!important}.be-whitespace-nowrap{white-space:nowrap!important}.be-text-ellipsis{text-overflow:ellipsis!important;overflow:hidden!important}.be-relative{position:relative!important}.be-absolute{position:absolute!important}.be-fixed{position:fixed!important}.be-sticky{position:sticky!important}.be-transition{transition:all var(--be-transition-normal)!important}.be-transition-fast{transition:all var(--be-transition-fast)!important}.be-transition-slow{transition:all var(--be-transition-slow)!important}@media (max-width: 768px){.booth-btn-md{padding:5px 10px;font-size:11px;min-height:28px}.booth-btn-lg{padding:7px 14px;font-size:13px;min-height:36px}.booth-toggle .toggle-label{font-size:12px}.form-group label{font-size:11px}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]),.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select{font-size:11px}}@media (max-width: 480px){:root{--be-space-md: 12px;--be-space-lg: 16px}.booth-btn-sm{padding:3px 6px;font-size:10px;min-height:20px}.booth-btn-md{padding:4px 8px;font-size:10px;min-height:24px}.booth-btn-lg{padding:6px 12px;font-size:12px;min-height:32px}.booth-toggle .toggle-slider{width:36px;height:20px}.booth-toggle .toggle-slider:before{width:16px;height:16px}.booth-toggle input[type=checkbox]:checked+.toggle-slider:before{transform:translate(16px)}.booth-toggle .toggle-label{font-size:11px}}.booth-enhancer-sidebar[data-v-19213a99]{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:#fffffffa;border:1px solid #e0e0e0;border-radius:12px 0 0 12px;box-shadow:-4px 0 12px #0000001a;font-size:12px;color:#333;overflow:hidden}.sidebar-content[data-v-19213a99]{flex:1;overflow:hidden;display:flex;flex-direction:column;background:#fff;min-height:0;position:relative}.tab-slide-enter-active[data-v-19213a99]{transition:opacity .2s ease-out,transform .2s ease-out}.tab-slide-leave-active[data-v-19213a99]{transition:opacity .15s ease-in,transform .15s ease-in}.tab-slide-enter-from[data-v-19213a99]{opacity:0;transform:translate(15px)}.tab-slide-leave-to[data-v-19213a99]{opacity:0;transform:translate(-10px)}.tab-slide-enter-to[data-v-19213a99],.tab-slide-leave-from[data-v-19213a99]{opacity:1;transform:translate(0)}.sidebar-content[data-v-19213a99]>*{width:100%;height:100%}.tag-preset-tab[data-v-81455dc4]{height:100%;display:flex;flex-direction:column;background:#fff}.toolbar[data-v-81455dc4]{flex-shrink:0;background:#fff;border-bottom:1px solid #e0e0e0}.tree-container[data-v-81455dc4]{flex:1;overflow-y:auto;padding:4px;min-height:0;scrollbar-width:thin;scrollbar-color:#cbd5e1 #f5f5f5}.tree-container[data-v-81455dc4]::-webkit-scrollbar{width:6px}.tree-container[data-v-81455dc4]::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.tree-container[data-v-81455dc4]::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.tree-container[data-v-81455dc4]::-webkit-scrollbar-thumb:hover{background:#94a3b8}.folder-content[data-v-81455dc4]{display:flex;align-items:center;width:100%;padding:6px 8px}.folder-content .icon[data-v-81455dc4]{color:#fbbf24;display:flex;align-items:center;justify-content:center;margin-right:8px;flex-shrink:0}.folder-content .name[data-v-81455dc4]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#334155}.folder-content .count[data-v-81455dc4]{font-size:12px;color:#94a3b8;margin-left:4px}.tag-custom-content[data-v-81455dc4]{width:100%}.tag-badges-wrapper[data-v-81455dc4]{display:flex;flex-wrap:wrap;gap:4px}.tag-badge[data-v-81455dc4]{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:10px;color:#2563eb;line-height:1.2;white-space:nowrap;transition:all .15s ease}.tag-badge[data-v-81455dc4]:hover{background:#dbeafe;border-color:#93c5fd}.tag-text[data-v-81455dc4]{flex-shrink:0}.tag-delete-btn[data-v-81455dc4]{flex-shrink:0;width:14px;height:14px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:50%;color:#3b82f6;cursor:pointer;transition:all .15s ease;opacity:.7}.tag-delete-btn[data-v-81455dc4]:hover{opacity:1;background:#3b82f6;color:#fff;transform:scale(1.1)}.modal-message[data-v-81455dc4]{color:#6b7280;font-size:13px;line-height:1.6;margin:0}.modal-message-with-margin[data-v-81455dc4]{color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 12px}.modal-textarea-code[data-v-81455dc4]{font-family:Consolas,Monaco,monospace;line-height:1.5}.modal-textarea-code-small[data-v-81455dc4]{font-family:Consolas,Monaco,monospace;line-height:1.5;font-size:11px}.form-hint-small[data-v-81455dc4]{display:block;margin-top:6px;color:#6b7280;font-size:11px}.item-data-tab[data-v-6c6b3856]{height:100%;display:flex;flex-direction:column;background:#fff}.item-custom-content[data-v-6c6b3856]{display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;line-height:1.4}.item-field[data-v-6c6b3856]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.item-separator[data-v-6c6b3856]{flex-shrink:0}.modal-message[data-v-6c6b3856]{color:#6b7280;font-size:13px;line-height:1.6;margin:0}.modal-message-with-margin[data-v-6c6b3856]{color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 12px}.modal-textarea-code[data-v-6c6b3856]{font-family:Consolas,Monaco,monospace;line-height:1.5}.template-grid[data-v-70ec8f42]{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:300px;overflow-y:auto;padding:8px;border:1px solid var(--be-color-border);border-radius:var(--be-radius-sm)}.template-item[data-v-70ec8f42]{padding:8px;transition:all .15s ease}.template-item[data-v-70ec8f42]:hover{transform:translateY(-1px)}.empty-hint[data-v-cc57d61c]{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.tag-badges-wrapper[data-v-55e6e409]{display:flex;flex-wrap:wrap;gap:4px}.tag-badge[data-v-55e6e409]{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:10px;color:#2563eb;line-height:1.2;white-space:nowrap;transition:all .15s ease}.tag-badge[data-v-55e6e409]:hover{background:#dbeafe;border-color:#93c5fd}.tag-text[data-v-55e6e409]{flex-shrink:0}.tag-delete-btn[data-v-55e6e409]{flex-shrink:0;width:14px;height:14px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:50%;color:#3b82f6;cursor:pointer;transition:all .15s ease;opacity:.7}.tag-delete-btn[data-v-55e6e409]:hover{opacity:1;background:#3b82f6;color:#fff;transform:scale(1.1)}.discount-config[data-v-5862736f]{display:flex;flex-direction:column;gap:var(--be-space-sm);margin-top:var(--be-space-sm)}.empty-hint[data-v-cc98f3f8]{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.item-cards-grid[data-v-cc98f3f8]{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}.item-cards-grid.single-item[data-v-cc98f3f8]{grid-template-columns:1fr}.item-card[data-v-cc98f3f8]{display:flex;flex-direction:column;background:var(--be-color-bg);border:1px solid var(--be-color-border);border-radius:var(--be-radius-md);overflow:hidden}.item-card-header[data-v-cc98f3f8]{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--be-color-bg-secondary);border-bottom:1px solid var(--be-color-border);gap:4px}.item-card-title[data-v-cc98f3f8]{flex:1;font-size:11px;font-weight:600;color:var(--be-color-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.item-card-delete-btn[data-v-cc98f3f8]{flex-shrink:0;width:16px;height:16px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:50%;color:var(--be-color-text-secondary);cursor:pointer;opacity:.6}.item-card-delete-btn[data-v-cc98f3f8]:hover{opacity:1;background:var(--be-color-bg-hover)}.item-card-content[data-v-cc98f3f8]{padding:6px 8px}.item-select-btn[data-v-cc98f3f8]{width:100%;display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--be-color-bg);border:1px dashed var(--be-color-border);border-radius:var(--be-radius-sm);font-size:10px;color:var(--be-color-text-secondary);cursor:pointer}.item-select-btn[data-v-cc98f3f8]:hover,.item-select-btn.has-item[data-v-cc98f3f8]{border-style:solid}.item-select-text[data-v-cc98f3f8]{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.booth-enhancer-lock-icon{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:#999;cursor:help;z-index:10}.booth-enhancer-lock-icon svg{display:block}.empty-state[data-v-a3af0ecb]{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:var(--be-space-xl);text-align:center}.empty-icon[data-v-a3af0ecb]{color:var(--be-color-text-muted);margin-bottom:var(--be-space-lg);opacity:.5}.empty-state p[data-v-a3af0ecb]{margin:0 0 var(--be-space-lg);font-size:var(--be-font-size-base);color:var(--be-color-text-secondary);max-width:400px}.empty-hint[data-v-a3af0ecb]{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.edit-tab[data-v-a3af0ecb]{display:flex;flex-direction:column;height:100%;position:relative}.edit-tab-scrollable[data-v-a3af0ecb]{flex:1;overflow-y:auto;display:flex;flex-direction:column}.item-select-list[data-v-a3af0ecb]{max-height:400px;overflow-y:auto}.item-select-btn[data-v-a3af0ecb]{width:100%;justify-content:flex-start;padding:var(--be-space-sm)}.item-select-btn[data-v-a3af0ecb]:hover{background:var(--be-color-bg-hover)} `);

System.addImportMap({ imports: {"vue":"user:vue"} });
System.set("user:vue", (()=>{const _=Vue;('default' in _)||(_.default=_);return _})());

System.register("./__entry.js", ['./__monkey.entry-CNjZeeHM.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {



		})
	};
}));

System.register("./__monkey.entry-CNjZeeHM.js", ['vue'], (function (exports, module) {
  'use strict';
  var createApp, ref, watch, defineComponent, defineAsyncComponent, computed, onMounted, onUnmounted, createElementBlock, openBlock, createVNode, createElementVNode, unref, withCtx, createBlock, createCommentVNode, createTextVNode, toDisplayString, resolveDynamicComponent, Fragment, renderList, normalizeClass, renderSlot, Teleport, Transition, normalizeStyle, nextTick;
  return {
    setters: [module => {
      createApp = module.createApp;
      ref = module.ref;
      watch = module.watch;
      defineComponent = module.defineComponent;
      defineAsyncComponent = module.defineAsyncComponent;
      computed = module.computed;
      onMounted = module.onMounted;
      onUnmounted = module.onUnmounted;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createVNode = module.createVNode;
      createElementVNode = module.createElementVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createBlock = module.createBlock;
      createCommentVNode = module.createCommentVNode;
      createTextVNode = module.createTextVNode;
      toDisplayString = module.toDisplayString;
      resolveDynamicComponent = module.resolveDynamicComponent;
      Fragment = module.Fragment;
      renderList = module.renderList;
      normalizeClass = module.normalizeClass;
      renderSlot = module.renderSlot;
      Teleport = module.Teleport;
      Transition = module.Transition;
      normalizeStyle = module.normalizeStyle;
      nextTick = module.nextTick;
    }],
    execute: (function () {

      exports({
        b: getSelectedDescriptionTemplate,
        c: getSelectedDiscountTemplate,
        d: createDefaultItemConfig,
        e: getSelectedNameTemplate,
        g: getSelectedDiscountIndicatorTemplate,
        u: useStorage
      });

      var __defProp = Object.defineProperty;
      var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
      var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
      class Simulate {
        /**
         * 模拟用户输入文本
         * @param element 目标输入元素
         * @param text 要输入的文本
         */
        static input(element, text) {
          var _a, _b;
          let nativeInputValueSetter;
          if (element instanceof HTMLInputElement) {
            nativeInputValueSetter = (_a = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")) == null ? void 0 : _a.set;
          } else if (element instanceof HTMLTextAreaElement) {
            nativeInputValueSetter = (_b = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")) == null ? void 0 : _b.set;
          }
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(element, text);
          } else {
            element.value = text;
          }
          const ev2 = new Event("input", { bubbles: true });
          element.dispatchEvent(ev2);
        }
        /**
         * 模拟键盘按下事件
         * @param element 目标元素
         * @param keyCode 键码
         */
        static keyDown(element, keyCode) {
          const keyboardEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            code: "Enter",
            keyCode,
            which: keyCode,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
          });
          element.dispatchEvent(keyboardEvent);
        }
        /**
         * 模拟按下回车键
         * @param element 目标元素
         */
        static pressEnter(element) {
          this.keyDown(element, 13);
        }
        /**
         * 模拟鼠标点击事件
         * @param element 目标元素
         */
        static click(element) {
          const mouseEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(mouseEvent);
        }
        /**
         * 模拟拖拽操作
         * @param sourceElement 源元素（被拖拽的元素）
         * @param targetElement 目标元素（放置位置的元素）
         * @param position 'before' | 'after' - 放置在目标元素之前还是之后
         */
        /**
         * 模拟鼠标拖拽操作（触发 Booth 的拖拽处理器）
         * @param sourceDragHandle 拖拽触发元素（如 button）
         * @param targetDragHandle 目标拖拽元素（如 button）
         * @param sourceElement 实际要移动的元素（如 li）
         * @param targetElement 目标位置的元素（如 li）
         * @param position 插入位置
         */
        static dragAndDrop(sourceDragHandle, targetDragHandle, sourceElement, targetElement, position = "before") {
          try {
            const sourceRect = sourceDragHandle.getBoundingClientRect();
            const targetRect = targetDragHandle.getBoundingClientRect();
            const mouseDownEvent = new MouseEvent("mousedown", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: sourceRect.left + sourceRect.width / 2,
              clientY: sourceRect.top + sourceRect.height / 2,
              button: 0
            });
            sourceDragHandle.dispatchEvent(mouseDownEvent);
            const dragStartEvent = new DragEvent("dragstart", {
              bubbles: true,
              cancelable: true,
              dataTransfer: new DataTransfer(),
              clientX: sourceRect.left + sourceRect.width / 2,
              clientY: sourceRect.top + sourceRect.height / 2
            });
            sourceElement.dispatchEvent(dragStartEvent);
            const targetY = position === "before" ? targetRect.top + 5 : targetRect.bottom - 5;
            const dragEnterEvent = new DragEvent("dragenter", {
              bubbles: true,
              cancelable: true,
              dataTransfer: dragStartEvent.dataTransfer,
              clientX: targetRect.left + targetRect.width / 2,
              clientY: targetY
            });
            targetElement.dispatchEvent(dragEnterEvent);
            const dragOverEvent = new DragEvent("dragover", {
              bubbles: true,
              cancelable: true,
              dataTransfer: dragStartEvent.dataTransfer,
              clientX: targetRect.left + targetRect.width / 2,
              clientY: targetY
            });
            targetElement.dispatchEvent(dragOverEvent);
            const dropEvent = new DragEvent("drop", {
              bubbles: true,
              cancelable: true,
              dataTransfer: dragStartEvent.dataTransfer,
              clientX: targetRect.left + targetRect.width / 2,
              clientY: targetY
            });
            targetElement.dispatchEvent(dropEvent);
            const dragEndEvent = new DragEvent("dragend", {
              bubbles: true,
              cancelable: true,
              dataTransfer: dragStartEvent.dataTransfer
            });
            sourceElement.dispatchEvent(dragEndEvent);
            const mouseUpEvent = new MouseEvent("mouseup", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: targetRect.left + targetRect.width / 2,
              clientY: targetY,
              button: 0
            });
            targetDragHandle.dispatchEvent(mouseUpEvent);
            return true;
          } catch (error) {
            console.error("[dragAndDrop] 模拟拖拽失败:", error);
            return false;
          }
        }
      }
      class BaseAPI {
        constructor() {
          __publicField(this, "_isReady", false);
          __publicField(this, "_readyCallbacks", []);
          if (this.shouldActivate()) {
            this.initialize();
          }
        }
        /**
         * 异步初始化
         */
        async initialize() {
          try {
            await this.waitForDOMReady();
            await this.load();
            this._isReady = true;
            this.triggerReadyCallbacks();
          } catch (error) {
            console.error(`${this.constructor.name} 初始化失败:`, error);
          }
        }
        /**
         * 等待页面完全加载（包括所有资源和脚本）
         */
        waitForDOMReady() {
          if (document.readyState === "complete") {
            return Promise.resolve();
          }
          return new Promise(
            (resolve) => window.addEventListener("load", () => resolve(), { once: true })
          );
        }
        /**
         * 触发 ready 回调
         */
        triggerReadyCallbacks() {
          this._readyCallbacks.forEach((callback) => {
            try {
              callback(this);
            } catch (error) {
              console.error("Ready callback error:", error);
            }
          });
          this._readyCallbacks = [];
        }
        /**
         * 监听就绪事件
         * 如果已经就绪，立即调用回调
         * 否则等待就绪后调用
         */
        onReady(callback) {
          if (this._isReady) {
            callback(this);
          } else {
            this._readyCallbacks.push(callback);
          }
        }
        /**
         * 检查是否就绪
         */
        ready() {
          return this._isReady;
        }
        /**
         * 检查是否已激活（是否在正确的页面上）
         */
        isActivated() {
          return this.shouldActivate();
        }
      }
      class ItemEditAPI extends BaseAPI {
        constructor() {
          super();
          __publicField(this, "_data", {
            nameInput: null,
            descriptionTextarea: null,
            tags: [],
            tagElements: null
          });
          __publicField(this, "_newSectionCallback");
          __publicField(this, "_newVariationCallback");
          __publicField(this, "_sectionRemovedCallback");
          __publicField(this, "_variationRemovedCallback");
          // 临时一次性回调（用于 addSection/removeSection 等待方法）
          __publicField(this, "_tempSectionAddedCallback");
          __publicField(this, "_tempVariationAddedCallback");
          __publicField(this, "_tempSectionRemovedCallback");
          __publicField(this, "_tempVariationRemovedCallback");
        }
        /**
         * 实时获取 sections（不缓存）
         */
        get sections() {
          return this.parseSections();
        }
        /**
         * 实时获取 variations（不缓存）
         */
        get variations() {
          return this.parseVariations();
        }
        /**
         * 判断是否应该在当前页面激活
         */
        shouldActivate() {
          const path = window.location.pathname;
          return /^\/items\/\d+\/edit(_pre)?$/.test(path);
        }
        /**
         * 等待名称输入框出现并填充数据
         */
        waitForElements(timeout = 1e4) {
          return new Promise((resolve) => {
            const checkNameInput = () => {
              const nameInput = document.querySelector(
                "#name input"
              );
              return nameInput && nameInput.value.trim().length > 0;
            };
            if (checkNameInput()) {
              resolve();
              return;
            }
            const timer = setTimeout(() => {
              observer.disconnect();
              resolve();
            }, timeout);
            const observer = new MutationObserver(() => {
              if (checkNameInput()) {
                clearTimeout(timer);
                observer.disconnect();
                resolve();
              }
            });
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          });
        }
        /**
         * 加载数据
         * 等待关键元素出现后再加载
         */
        async load() {
          await this.waitForElements();
          this.loadName();
          this.loadDescription();
          this.loadTagElements();
          this.setupListObserver();
        }
        /**
         * 加载商品名称
         */
        loadName() {
          const input = document.querySelector("#name input");
          this._data.nameInput = input || null;
        }
        /**
         * 加载商品描述
         */
        loadDescription() {
          const textarea = document.querySelector(
            "#description textarea"
          );
          this._data.descriptionTextarea = textarea || null;
        }
        /**
         * 查找所有包含变体项的 ul 容器
         */
        findAllListContainers() {
          const ulSet = /* @__PURE__ */ new Set();
          document.querySelectorAll("section.bg-white.desktop\\:px-24.desktop\\:pt-24.desktop\\:rounded-t-4 ul").forEach((ul) => ulSet.add(ul));
          document.querySelectorAll("ul.grid.gap-16").forEach((ul) => ulSet.add(ul));
          return Array.from(ulSet).filter(
            (container) => container.querySelector("li .variation-box-head")
          );
        }
        /**
         * 从容器中获取所有 li 元素
         */
        getListItems(container) {
          return Array.from(container.children).filter(
            (child) => child.tagName.toLowerCase() === "li"
          );
        }
        /**
         * 实时解析 Sections（从 DOM）
         */
        parseSections() {
          return this.findAllListContainers().filter((container) => this.isSectionList(container)).flatMap(
            (container) => this.getListItems(container).flatMap((item) => {
              const headlineInput = item.querySelector("input.charcoal-text-field-input");
              const bodyTextarea = item.querySelector("textarea.charcoal-text-area-textarea");
              if (!headlineInput || !bodyTextarea) return [];
              return [{
                element: item,
                container,
                headlineInput,
                bodyTextarea,
                deleteButton: this.findDeleteButton(item)
              }];
            })
          );
        }
        /**
         * 实时解析 Variations（从 DOM）
         */
        parseVariations() {
          return this.findAllListContainers().filter((container) => !this.isSectionList(container)).flatMap(
            (container) => this.getListItems(container).flatMap((item) => {
              const nameContainer = item.querySelector('div[id^="variationName-"]');
              const priceContainer = item.querySelector('div[id^="variationDigitalPrice-"]');
              const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector("input.charcoal-text-field-input");
              const priceInput = priceContainer == null ? void 0 : priceContainer.querySelector("input.charcoal-text-field-input");
              if (!nameInput || !priceInput) return [];
              return [{
                element: item,
                container,
                nameInput,
                priceInput,
                deleteButton: this.findDeleteButton(item),
                dragHandle: this.findDragHandle(item)
              }];
            })
          );
        }
        /**
         * 判断是否为 Section 列表
         */
        isSectionList(ul) {
          const section = ul.closest("section");
          if (!section) return false;
          return section.classList.contains("bg-white") && section.classList.contains("desktop:px-24") && section.classList.contains("desktop:pt-24") && section.classList.contains("desktop:rounded-t-4");
        }
        /**
         * 加载标签元素
         */
        loadTagElements() {
          const container = document.querySelector("#item_tag");
          const input = document.querySelector(
            ".js-item-tags-array"
          );
          const inputContainer = document.querySelector(
            "#item_tag .item-search-input__container"
          );
          if (container && input && inputContainer) {
            this._data.tagElements = {
              container,
              input,
              inputContainer
            };
          }
        }
        /**
         * 解析并添加 Section 元素
         */
        addSectionElement(item, container) {
          var _a;
          const headlineInput = item.querySelector("input.charcoal-text-field-input");
          const bodyTextarea = item.querySelector("textarea.charcoal-text-area-textarea");
          if (!headlineInput || !bodyTextarea) return;
          const sectionElement = {
            element: item,
            container,
            headlineInput,
            bodyTextarea,
            deleteButton: this.findDeleteButton(item)
          };
          (_a = this._newSectionCallback) == null ? void 0 : _a.call(this, sectionElement);
          if (this._tempSectionAddedCallback) {
            this._tempSectionAddedCallback();
            this._tempSectionAddedCallback = void 0;
          }
        }
        /**
         * 解析并添加 Variation 元素
         */
        addVariationElement(item, container) {
          var _a;
          const nameContainer = item.querySelector('div[id^="variationName-"]');
          const priceContainer = item.querySelector('div[id^="variationDigitalPrice-"]');
          const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector("input.charcoal-text-field-input");
          const priceInput = priceContainer == null ? void 0 : priceContainer.querySelector("input.charcoal-text-field-input");
          if (!nameInput || !priceInput) return;
          const variationElement = {
            element: item,
            container,
            nameInput,
            priceInput,
            deleteButton: this.findDeleteButton(item),
            dragHandle: this.findDragHandle(item)
          };
          (_a = this._newVariationCallback) == null ? void 0 : _a.call(this, variationElement);
          if (this._tempVariationAddedCallback) {
            this._tempVariationAddedCallback();
            this._tempVariationAddedCallback = void 0;
          }
        }
        /**
         * 处理单个列表项的添加
         */
        handleItemAdded(item, container) {
          const isSection = this.isSectionList(container);
          if (isSection) {
            this.addSectionElement(item, container);
          } else {
            this.addVariationElement(item, container);
          }
        }
        /**
         * 检查元素是否是我们关注的列表容器
         */
        isTargetListContainer(element) {
          return element.tagName === "UL" && element.classList.contains("grid") && element.classList.contains("gap-16");
        }
        /**
         * 设置列表观察器，监听新增和删除的列表项
         */
        setupListObserver() {
          const observer = new MutationObserver((mutations) => {
            var _a, _b;
            for (const mutation of mutations) {
              for (const node of Array.from(mutation.addedNodes)) {
                if (!(node instanceof HTMLElement)) continue;
                if (this.isTargetListContainer(node) && node.querySelector("li .variation-box-head")) {
                  const items = Array.from(node.children).filter(
                    (child) => child.tagName.toLowerCase() === "li"
                  );
                  items.forEach((item) => this.handleItemAdded(item, node));
                } else if (node.tagName.toLowerCase() === "li") {
                  const container = node.parentElement;
                  if (container && this.isTargetListContainer(container) && node.querySelector(".variation-box-head")) {
                    this.handleItemAdded(node, container);
                  }
                }
              }
              for (const node of Array.from(mutation.removedNodes)) {
                if (!(node instanceof HTMLElement)) continue;
                if (node.tagName.toLowerCase() !== "li") continue;
                const container = mutation.target;
                const isSection = this.isSectionList(container);
                if (isSection) {
                  (_a = this._sectionRemovedCallback) == null ? void 0 : _a.call(this, node);
                  if (this._tempSectionRemovedCallback) {
                    this._tempSectionRemovedCallback();
                    this._tempSectionRemovedCallback = void 0;
                  }
                } else {
                  (_b = this._variationRemovedCallback) == null ? void 0 : _b.call(this, node);
                  if (this._tempVariationRemovedCallback) {
                    this._tempVariationRemovedCallback();
                    this._tempVariationRemovedCallback = void 0;
                  }
                }
              }
            }
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
        /**
         * 获取完整的商品编辑数据
         */
        get data() {
          this._data.tags = this.getTags();
          return {
            ...this._data,
            sections: this.sections,
            variations: this.variations
          };
        }
        /**
         * 获取标签元素
         */
        get tagElements() {
          return this._data.tagElements;
        }
        /**
         * 监听新增的 Section 元素
         */
        onSectionAdded(callback) {
          this._newSectionCallback = callback;
        }
        /**
         * 监听新增的 Variation 元素
         */
        onVariationAdded(callback) {
          this._newVariationCallback = callback;
        }
        /**
         * 获取当前所有标签数据
         */
        getTags() {
          const tags = [];
          const tagElements = document.querySelectorAll(
            "#item_tag .bg-secondary500 .font-bold"
          );
          tagElements.forEach((element) => {
            var _a;
            const text = (_a = element.textContent) == null ? void 0 : _a.trim();
            if (text) {
              tags.push({
                text,
                element
              });
            }
          });
          return tags;
        }
        /**
         * 获取标签文本列表
         */
        getTagTexts() {
          return this.getTags().map((tag) => tag.text);
        }
        /**
         * 检查标签是否存在
         */
        hasTag(tagText) {
          return this.getTagTexts().includes(tagText);
        }
        /**
         * 获取标签删除按钮
         */
        getTagDeleteButtons() {
          return Array.from(
            document.querySelectorAll(
              '#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'
            )
          ).map((icon) => icon.closest("a")).filter(Boolean);
        }
        /**
         * 获取/设置商品名
         */
        get name() {
          var _a;
          return ((_a = this._data.nameInput) == null ? void 0 : _a.value) || "";
        }
        set name(value) {
          if (!this._data.nameInput) {
            console.error("找不到商品名输入框");
            return;
          }
          Simulate.input(this._data.nameInput, value);
        }
        /**
         * 获取/设置商品描述
         */
        get description() {
          var _a;
          return ((_a = this._data.descriptionTextarea) == null ? void 0 : _a.value) || "";
        }
        set description(value) {
          if (!this._data.descriptionTextarea) {
            console.error("找不到商品描述文本域");
            return;
          }
          Simulate.input(this._data.descriptionTextarea, value);
        }
        /**
         * 设置商品名（别名）
         */
        setName(value) {
          this.name = value;
        }
        /**
         * 设置商品描述（别名）
         */
        setDescription(value) {
          this.description = value;
        }
        /**
         * 更新指定 Section
         */
        updateSection(index, data) {
          const section = this.sections[index];
          if (!section) return;
          if (data.headline !== void 0 && section.headlineInput) {
            Simulate.input(section.headlineInput, data.headline);
          }
          if (data.body !== void 0 && section.bodyTextarea) {
            Simulate.input(section.bodyTextarea, data.body);
          }
        }
        /**
         * 更新指定 Variation
         */
        updateVariation(index, data) {
          const variation = this.variations[index];
          if (!variation) return;
          if (data.name !== void 0 && variation.nameInput) {
            Simulate.input(variation.nameInput, data.name);
          }
          if (data.price !== void 0 && variation.priceInput) {
            Simulate.input(variation.priceInput, data.price);
          }
        }
        /**
         * 批量添加 Tags
         */
        async addTags(tags) {
          if (!this._data.tagElements) return;
          const { input } = this._data.tagElements;
          for (const tag of tags) {
            if (this.hasTag(tag)) continue;
            Simulate.input(input, tag);
            const enterEvent = new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              bubbles: true,
              cancelable: true
            });
            input.dispatchEvent(enterEvent);
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }
        /**
         * 批量移除 Tags
         */
        async removeTags(tags) {
          if (!this._data.tagElements) return;
          const tagsToRemove = new Set(tags);
          const currentTags = this.getTagTexts();
          const indicesToRemove = [];
          currentTags.forEach((tag, index) => {
            if (tagsToRemove.has(tag)) {
              indicesToRemove.push(index);
            }
          });
          if (indicesToRemove.length === 0) return;
          const deleteButtons = this.getTagDeleteButtons();
          for (let i = indicesToRemove.length - 1; i >= 0; i--) {
            const index = indicesToRemove[i];
            if (deleteButtons[index]) {
              deleteButtons[index].click();
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }
        }
        /**
         * 监听商品名变化
         */
        onNameChange(callback) {
          if (this._data.nameInput) {
            this._data.nameInput.addEventListener("input", (e) => {
              callback(e.target.value);
            });
          }
        }
        /**
         * 监听描述变化
         */
        onDescriptionChange(callback) {
          if (this._data.descriptionTextarea) {
            this._data.descriptionTextarea.addEventListener("input", (e) => {
              callback(e.target.value);
            });
          }
        }
        /**
         * 为元素添加输入监听器
         */
        addInputListeners(elements, callback) {
          elements.forEach((element) => {
            element == null ? void 0 : element.addEventListener("input", () => callback());
          });
        }
        /**
         * 监听 Section 列表变化
         */
        onSectionsChange(callback) {
          this.sections.forEach((section) => {
            this.addInputListeners([section.headlineInput, section.bodyTextarea], callback);
          });
          const originalCallback = this._newSectionCallback;
          this._newSectionCallback = (section) => {
            this.addInputListeners([section.headlineInput, section.bodyTextarea], callback);
            originalCallback == null ? void 0 : originalCallback(section);
            callback();
          };
        }
        /**
         * 监听 Variation 列表变化
         */
        onVariationsChange(callback) {
          this.variations.forEach((variation) => {
            this.addInputListeners([variation.nameInput, variation.priceInput], callback);
          });
          const originalCallback = this._newVariationCallback;
          this._newVariationCallback = (variation) => {
            this.addInputListeners([variation.nameInput, variation.priceInput], callback);
            originalCallback == null ? void 0 : originalCallback(variation);
            callback();
          };
        }
        /**
         * 查找 Section 元素内的删除按钮
         * @param sectionElement Section 的 li 元素
         * @returns 删除按钮或 null
         */
        findDeleteButton(itemElement) {
          const buttons = itemElement.querySelectorAll("button");
          return buttons.length >= 2 ? buttons[1] : null;
        }
        /**
         * 查找 Variation 的拖拽按钮
         * @param itemElement Variation 的 li 元素
         * @returns 拖拽按钮或 null
         */
        findDragHandle(itemElement) {
          const firstButton = itemElement.querySelector("button.variation-box-head");
          return firstButton;
        }
        /**
         * 查找"添加段落"按钮
         * 该按钮位于 Section 列表底部
         */
        findAddSectionButton() {
          var _a;
          const buttons = document.querySelectorAll("div.cursor-pointer");
          for (const button of buttons) {
            const hasIcon = button.querySelector(".icon-plus");
            const textContent = (_a = button.textContent) == null ? void 0 : _a.trim();
            if (hasIcon && (textContent == null ? void 0 : textContent.includes("段落"))) {
              return button;
            }
          }
          return null;
        }
        /**
         * 查找"添加 Variation"按钮
         * 该按钮位于 Variation 列表区域
         */
        findAddVariationButton() {
          var _a;
          const buttons = document.querySelectorAll(
            "button.flex.flex-col.justify-between.items-center"
          );
          for (const button of buttons) {
            const hasDownloadIcon = button.querySelector('pixiv-icon[name="16/Download"]');
            const textContent = (_a = button.textContent) == null ? void 0 : _a.trim();
            if (hasDownloadIcon && (textContent == null ? void 0 : textContent.includes("Digital"))) {
              return button;
            }
          }
          return null;
        }
        /**
         * 点击"添加段落"按钮，自动创建新的 Section
         * @returns 是否成功找到并点击按钮
         */
        clickAddSectionButton() {
          const button = this.findAddSectionButton();
          if (button) {
            button.click();
            return true;
          }
          return false;
        }
        /**
         * 点击"添加 Variation"按钮，自动创建新的 Variation
         * @returns 是否成功找到并点击按钮
         */
        clickAddVariationButton() {
          const button = this.findAddVariationButton();
          if (button) {
            button.click();
            return true;
          }
          return false;
        }
        /**
         * 创建一个带超时的等待 Promise
         */
        createWaitPromise(setCallback, clearCallback, timeout) {
          return new Promise((resolve) => {
            const timer = setTimeout(() => {
              clearCallback();
              resolve(false);
            }, timeout);
            setCallback(() => {
              clearTimeout(timer);
              resolve(true);
            });
          });
        }
        /**
         * 添加 Section 并等待完成
         * @param timeout 超时时间（毫秒），默认 5000ms
         * @returns Promise<boolean> 是否成功添加
         */
        async addSection(timeout = 5e3) {
          if (!this.clickAddSectionButton()) {
            return false;
          }
          return this.createWaitPromise(
            (callback) => {
              this._tempSectionAddedCallback = callback;
            },
            () => {
              this._tempSectionAddedCallback = void 0;
            },
            timeout
          );
        }
        /**
         * 添加 Variation 并等待完成
         * @param timeout 超时时间（毫秒），默认 5000ms
         * @returns Promise<boolean> 是否成功添加
         */
        async addVariation(timeout = 5e3) {
          if (!this.clickAddVariationButton()) {
            return false;
          }
          return this.createWaitPromise(
            (callback) => {
              this._tempVariationAddedCallback = callback;
            },
            () => {
              this._tempVariationAddedCallback = void 0;
            },
            timeout
          );
        }
        /**
         * 设置"添加段落"按钮的点击监听器
         * 当用户手动点击按钮时触发回调
         */
        setupAddSectionButtonListener(callback) {
          const checkAndAttach = () => {
            const button = this.findAddSectionButton();
            if (button && !button.dataset.listenerAttached) {
              button.dataset.listenerAttached = "true";
              button.addEventListener("click", () => {
                callback();
              });
            }
          };
          checkAndAttach();
          const observer = new MutationObserver(() => {
            checkAndAttach();
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
        /**
         * 设置"添加 Variation"按钮的点击监听器
         * 当用户手动点击按钮时触发回调
         */
        setupAddVariationButtonListener(callback) {
          const checkAndAttach = () => {
            const button = this.findAddVariationButton();
            if (button && !button.dataset.listenerAttached) {
              button.dataset.listenerAttached = "true";
              button.addEventListener("click", () => {
                callback();
              });
            }
          };
          checkAndAttach();
          const observer = new MutationObserver(() => {
            checkAndAttach();
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
        /**
         * 删除指定的 Section
         * @param section Section 元素对象
         * @returns 是否成功删除
         */
        deleteSectionByElement(section) {
          if (!section.deleteButton) {
            section.deleteButton = this.findDeleteButton(section.element);
          }
          if (section.deleteButton) {
            section.deleteButton.click();
            return true;
          }
          return false;
        }
        /**
         * 删除指定索引的 Section
         * @param index Section 在列表中的索引
         * @returns 是否成功点击删除按钮
         */
        deleteSectionByIndex(index) {
          const section = this.sections[index];
          if (section) {
            return this.deleteSectionByElement(section);
          }
          return false;
        }
        /**
         * 删除 Section 并等待完成
         * @param index Section 在列表中的索引
         * @param timeout 超时时间（毫秒），默认 5000ms
         * @returns Promise<boolean> 是否成功删除
         */
        async removeSection(index, timeout = 5e3) {
          const section = this.sections[index];
          if (!section) return false;
          if (!section.deleteButton) {
            section.deleteButton = this.findDeleteButton(section.element);
          }
          if (!section.deleteButton) return false;
          section.deleteButton.click();
          return this.createWaitPromise(
            (callback) => {
              this._tempSectionRemovedCallback = callback;
            },
            () => {
              this._tempSectionRemovedCallback = void 0;
            },
            timeout
          );
        }
        /**
         * 删除所有 Sections
         * @returns 成功删除的数量
         */
        deleteAllSections() {
          let count = 0;
          while (this.sections.length > 0) {
            if (this.deleteSectionByIndex(this.sections.length - 1)) {
              count++;
            } else {
              break;
            }
          }
          return count;
        }
        /**
         * 删除指定的 Variation
         * @param variation Variation 元素对象
         * @returns 是否成功删除
         */
        deleteVariationByElement(variation) {
          if (!variation.deleteButton) {
            variation.deleteButton = this.findDeleteButton(variation.element);
          }
          if (variation.deleteButton) {
            variation.deleteButton.click();
            return true;
          }
          return false;
        }
        /**
         * 根据索引删除 Variation
         * @param index Variation 在列表中的索引
         * @returns 是否成功删除
         */
        deleteVariationByIndex(index) {
          const variation = this.variations[index];
          if (variation) {
            return this.deleteVariationByElement(variation);
          }
          return false;
        }
        /**
         * 删除 Variation 并等待完成
         * @param index Variation 在列表中的索引
         * @param timeout 超时时间（毫秒），默认 5000ms
         * @returns Promise<boolean> 是否成功删除
         */
        async removeVariation(index, timeout = 5e3) {
          const variation = this.variations[index];
          if (!variation) return false;
          if (!variation.deleteButton) {
            variation.deleteButton = this.findDeleteButton(variation.element);
          }
          if (!variation.deleteButton) return false;
          variation.deleteButton.click();
          return this.createWaitPromise(
            (callback) => {
              this._tempVariationRemovedCallback = callback;
            },
            () => {
              this._tempVariationRemovedCallback = void 0;
            },
            timeout
          );
        }
        /**
         * 删除所有 Variations
         * @returns 成功删除的数量
         */
        deleteAllVariations() {
          let count = 0;
          while (this.variations.length > 0) {
            if (this.deleteVariationByIndex(this.variations.length - 1)) {
              count++;
            } else {
              break;
            }
          }
          return count;
        }
        // ===== Variation 文件管理方法 =====
        /**
         * 从页面的文件管理面板获取所有文件列表
         * @returns 文件元素数组
         */
        /**
         * 获取 variation 的已关联文件
         * @param variationIndex variation 索引
         * @returns 文件 ID 数组
         */
        getVariationFiles(variationIndex) {
          const variation = this.variations[variationIndex];
          if (!variation) return [];
          const fileLinks = variation.element.querySelectorAll('a[href*="/downloadables/"]');
          const fileIds = [];
          fileLinks.forEach((link) => {
            const href = link.href;
            const idMatch = href.match(/\/downloadables\/(\d+)/);
            if (idMatch) {
              fileIds.push(idMatch[1]);
            }
          });
          return fileIds;
        }
        /**
         * 获取所有可下载文件（实时从 DOM 获取）
         */
        get files() {
          return this.getAllFiles().map((file) => ({
            id: file.id,
            name: file.name
          }));
        }
        getAllFiles() {
          var _a;
          const titleElements = document.querySelectorAll(".font-booth-demi");
          let filePanel = null;
          for (const title of Array.from(titleElements)) {
            if ((_a = title.textContent) == null ? void 0 : _a.includes("Add/Edit Files")) {
              filePanel = title.closest(".bg-white");
              break;
            }
          }
          if (!filePanel) return [];
          const fileList = filePanel.querySelector("ul.list-none");
          if (!fileList) return [];
          return this.parseFileListFromContainer(fileList);
        }
        /**
         * 从容器中解析文件列表
         * @param container 文件列表容器
         * @returns 文件元素数组
         */
        parseFileListFromContainer(container) {
          const fileElements = container.querySelectorAll("li");
          const files = [];
          fileElements.forEach((li) => {
            var _a;
            const checkbox = li.querySelector('input.charcoal-checkbox-input[type="checkbox"]');
            const link = li.querySelector('a[href*="/downloadables/"]');
            if (checkbox && link) {
              const href = link.href;
              const idMatch = href.match(/\/downloadables\/(\d+)/);
              const id = idMatch ? idMatch[1] : "";
              const name = ((_a = link.textContent) == null ? void 0 : _a.trim()) || "";
              files.push({
                id,
                name,
                checkbox,
                checked: checkbox.checked
              });
            }
          });
          return files;
        }
        /**
         * 查找 variation 的编辑按钮或 "Add/Edit Files" 元素
         * @param index Variation 索引
         * @returns 编辑按钮/div 元素或 null
         */
        findVariationEditButton(index) {
          var _a;
          const variation = this.variations[index];
          if (!variation) return null;
          const iconElement = variation.element.querySelector("i.icon-downloadables");
          if (iconElement) {
            const clickableParent = iconElement.closest("div.cursor-pointer");
            if ((_a = clickableParent == null ? void 0 : clickableParent.textContent) == null ? void 0 : _a.includes("Add/Edit Files")) {
              return clickableParent;
            }
          }
          const filesSection = variation.element.querySelector("div:nth-child(3)");
          if (filesSection) {
            const buttons = Array.from(filesSection.querySelectorAll("button"));
            const editButton = buttons.find((btn) => {
              var _a2;
              const text = ((_a2 = btn.textContent) == null ? void 0 : _a2.trim()) || "";
              return text === "Edit" || text.includes("Edit") && !text.includes("Delete");
            });
            if (editButton) return editButton;
          }
          console.error(`[ItemEditAPI] 未找到 Variation ${index} 的编辑按钮`);
          return null;
        }
        /**
         * 打开 variation 编辑面板并返回面板信息
         * @param index Variation 索引
         * @param timeout 超时时间（毫秒）
         * @returns Promise<VariationEditPanel | null>
         */
        async openVariationEditPanel(index, timeout = 5e3) {
          const button = this.findVariationEditButton(index);
          if (!button) return null;
          Simulate.click(button);
          await new Promise((resolve) => setTimeout(resolve, 100));
          return new Promise((resolve) => {
            let observer = null;
            const timer = setTimeout(() => {
              console.error(`[ItemEditAPI] Variation ${index} 打开面板超时`);
              observer == null ? void 0 : observer.disconnect();
              resolve(null);
            }, timeout);
            const checkPanel = () => {
              const panel = this.findVariationEditPanel();
              if (panel) {
                clearTimeout(timer);
                observer == null ? void 0 : observer.disconnect();
                resolve(panel);
                return true;
              }
              return false;
            };
            if (checkPanel()) return;
            observer = new MutationObserver(checkPanel);
            observer.observe(document.body, {
              childList: true,
              attributes: true,
              attributeFilter: ["class", "style"],
              subtree: true
            });
          });
        }
        /**
         * 查找 variation 编辑面板
         * @returns VariationEditPanel 或 null
         */
        findVariationEditPanel() {
          const containers = document.querySelectorAll("body > div.fixed.top-0.left-0.right-0");
          const container = Array.from(containers).find(
            (c) => {
              var _a;
              return (_a = c.textContent) == null ? void 0 : _a.includes("Add/Edit Files");
            }
          );
          if (!container) return null;
          const hasHiddenClass = container.classList.contains("hidden");
          const hasFileList = container.querySelector("ul.list-none") !== null;
          if (hasHiddenClass && !hasFileList) return null;
          const closeButton = Array.from(container.querySelectorAll("button")).find((btn) => btn.querySelector('pixiv-icon[name="32/BoothClose"]')) || null;
          const files = this.parseFileList(container);
          return { container, closeButton, files };
        }
        /**
         * 解析文件列表
         * @param container 面板容器
         * @returns 文件元素数组
         */
        parseFileList(container) {
          const fileElements = container.querySelectorAll("ul.list-none > li");
          const files = [];
          fileElements.forEach((li) => {
            var _a;
            const checkbox = li.querySelector('input.charcoal-checkbox-input[type="checkbox"]');
            const link = li.querySelector('a[href*="/downloadables/"]');
            if (checkbox && link) {
              const href = link.href;
              const idMatch = href.match(/\/downloadables\/(\d+)/);
              const id = idMatch ? idMatch[1] : "";
              const name = ((_a = link.textContent) == null ? void 0 : _a.trim()) || "";
              files.push({
                id,
                name,
                checkbox,
                checked: checkbox.checked
              });
            }
          });
          return files;
        }
        /**
         * 选择文件
         * @param panel Variation 编辑面板
         * @param fileIds 要选择的文件 ID 数组
         * @param mode 选择模式：replace（替换）或 append（追加）
         */
        selectFiles(panel, fileIds, mode = "replace") {
          panel.files.forEach((file) => {
            const shouldCheck = fileIds.includes(file.id);
            const needsUpdate = mode === "replace" ? file.checked !== shouldCheck : shouldCheck && !file.checked;
            if (needsUpdate) {
              file.checkbox.click();
            }
          });
        }
        /**
         * 关闭 variation 编辑面板
         * @param panel Variation 编辑面板
         */
        closeVariationEditPanel(panel) {
          if (!panel.closeButton) {
            console.error(`[ItemEditAPI] 未找到关闭按钮`);
            return;
          }
          panel.closeButton.click();
        }
        /**
         * 获取已选文件 ID 列表
         * @param panel Variation 编辑面板
         * @returns 已选文件的 ID 数组
         */
        getSelectedFileIds(panel) {
          return panel.files.filter((f) => f.checked).map((f) => f.id);
        }
        /**
         * 从 variation 卡片读取已选择的文件 ID 列表
         * @param index Variation 索引
         * @returns 文件 ID 数组
         */
        getVariationSelectedFileIds(index) {
          const variation = this.variations[index];
          if (!variation) return [];
          const filesSection = variation.element.querySelector("div:nth-child(3)");
          if (!filesSection) return [];
          const fileList = filesSection.querySelector("div.grid.gap-12 > div > ul");
          if (!fileList) return [];
          const fileLinks = fileList.querySelectorAll('a[href*="/downloadables/"]');
          const fileIds = [];
          fileLinks.forEach((link) => {
            const href = link.href;
            const match = href.match(/\/downloadables\/(\d+)/);
            if (match) {
              fileIds.push(match[1]);
            }
          });
          return fileIds;
        }
        /**
         * 为 variation 设置文件（自动打开/关闭面板）
         * @param variationIndex Variation 索引
         * @param fileIds 要选择的文件 ID 数组
         * @param mode 选择模式：replace（替换）或 append（追加）
         * @returns Promise<{ success: boolean; updated: boolean }> success: 是否成功, updated: 是否实际更新了文件
         */
        async setVariationFiles(variationIndex, fileIds, mode = "replace") {
          const currentSelectedIds = this.getVariationSelectedFileIds(variationIndex).sort();
          const targetIds = [...new Set(fileIds)].sort();
          const isIdentical = mode === "replace" && currentSelectedIds.length === targetIds.length && currentSelectedIds.every((id, index) => id === targetIds[index]);
          if (isIdentical) {
            return { success: true, updated: false };
          }
          const panel = await this.openVariationEditPanel(variationIndex);
          if (!panel) return { success: false, updated: false };
          this.selectFiles(panel, fileIds, mode);
          await new Promise((resolve) => setTimeout(resolve, 100));
          this.closeVariationEditPanel(panel);
          return { success: true, updated: true };
        }
        /**
         * 调整 Variation 的顺序（通过拖拽模拟）
         * @param fromIndex 源索引
         * @param toIndex 目标索引
         * @returns 是否成功
         */
        moveVariation(fromIndex, toIndex) {
          const variations = this.variations;
          if (fromIndex < 0 || fromIndex >= variations.length || toIndex < 0 || toIndex >= variations.length || fromIndex === toIndex) {
            return false;
          }
          const sourceVar = variations[fromIndex];
          const targetVar = variations[toIndex];
          const sourceDragHandle = sourceVar.dragHandle || sourceVar.element;
          const targetDragHandle = targetVar.dragHandle || targetVar.element;
          const sourceElement = sourceVar.element;
          const targetElement = targetVar.element;
          const position = fromIndex < toIndex ? "after" : "before";
          return Simulate.dragAndDrop(
            sourceDragHandle,
            targetDragHandle,
            sourceElement,
            targetElement,
            position
          );
        }
      }
      class PageFeature {
        constructor(context) {
          __publicField(this, "context");
          __publicField(this, "path");
          __publicField(this, "api");
          this.context = context;
          this.path = window.location.pathname;
        }
        /**
         * 执行页面功能
         */
        async execute() {
          this.api = this.createAPI();
          if (this.api) {
            await new Promise((resolve) => {
              this.api.onReady(async () => {
                await this.initialize();
                resolve();
              });
            });
          } else {
            await this.initialize();
          }
        }
        /**
         * 获取API实例
         */
        getAPI() {
          return this.api;
        }
      }
      const scriptRel = /* @__PURE__ */ function detectScriptRel() {
        const relList = typeof document !== "undefined" && document.createElement("link").relList;
        return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
      }();
      const assetsURL = function(dep) {
        return "/" + dep;
      };
      const seen = {};
      const __vitePreload = function preload(baseModule, deps, importerUrl) {
        let promise = Promise.resolve();
        if (deps && deps.length > 0) {
          document.getElementsByTagName("link");
          const cspNonceMeta = document.querySelector(
            "meta[property=csp-nonce]"
          );
          const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
          promise = Promise.allSettled(
            deps.map((dep) => {
              dep = assetsURL(dep);
              if (dep in seen) return;
              seen[dep] = true;
              const isCss = dep.endsWith(".css");
              const cssSelector = isCss ? '[rel="stylesheet"]' : "";
              if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
                return;
              }
              const link = document.createElement("link");
              link.rel = isCss ? "stylesheet" : scriptRel;
              if (!isCss) {
                link.as = "script";
              }
              link.crossOrigin = "";
              link.href = dep;
              if (cspNonce) {
                link.setAttribute("nonce", cspNonce);
              }
              document.head.appendChild(link);
              if (isCss) {
                return new Promise((res, rej) => {
                  link.addEventListener("load", res);
                  link.addEventListener(
                    "error",
                    () => rej(new Error(`Unable to preload CSS for ${dep}`))
                  );
                });
              }
            })
          );
        }
        function handlePreloadError(err) {
          const e = new Event("vite:preloadError", {
            cancelable: true
          });
          e.payload = err;
          window.dispatchEvent(e);
          if (!e.defaultPrevented) {
            throw err;
          }
        }
        return promise.then((res) => {
          for (const item of res || []) {
            if (item.status !== "rejected") continue;
            handlePreloadError(item.reason);
          }
          return baseModule().catch(handlePreloadError);
        });
      };
      const _hoisted_1$4 = {
        key: 0,
        class: "menu-separator"
      };
      const _hoisted_2$4 = ["onClick"];
      const _hoisted_3$3 = ["innerHTML"];
      const _hoisted_4$3 = { class: "menu-label" };
      const _hoisted_5$2 = {
        key: 2,
        class: "menu-separator"
      };
      const _sfc_main$4 = /* @__PURE__ */ defineComponent({
        __name: "ContextMenu",
        props: {
          show: { type: Boolean },
          x: {},
          y: {},
          items: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const menuRef = ref(null);
          const adjustedPosition = ref({ x: 0, y: 0 });
          const isRepositioning = ref(false);
          const calculatePosition = async () => {
            isRepositioning.value = true;
            adjustedPosition.value = { x: props.x, y: props.y };
            await nextTick();
            await nextTick();
            if (!menuRef.value) {
              isRepositioning.value = false;
              return;
            }
            const menu = menuRef.value;
            const menuRect = menu.getBoundingClientRect();
            const parent = document.querySelector(".booth-enhancer-sidebar");
            let containerRect;
            let containerWidth;
            let containerHeight;
            if (parent) {
              containerRect = parent.getBoundingClientRect();
              containerWidth = containerRect.width;
              containerHeight = containerRect.height;
            } else {
              containerWidth = document.documentElement.clientWidth;
              containerHeight = document.documentElement.clientHeight;
              containerRect = new DOMRect(0, 0, containerWidth, containerHeight);
            }
            let finalX = props.x;
            let finalY = props.y;
            const padding = 8;
            const rightBoundary = containerRect.left + containerWidth;
            if (finalX + menuRect.width > rightBoundary - padding) {
              finalX = Math.max(containerRect.left + padding, rightBoundary - menuRect.width - padding);
            }
            if (finalX < containerRect.left + padding) {
              finalX = containerRect.left + padding;
            }
            const bottomBoundary = containerRect.top + containerHeight;
            if (finalY + menuRect.height > bottomBoundary - padding) {
              finalY = Math.max(containerRect.top + padding, bottomBoundary - menuRect.height - padding);
            }
            if (finalY < containerRect.top + padding) {
              finalY = containerRect.top + padding;
            }
            adjustedPosition.value = { x: finalX, y: finalY };
            await nextTick();
            isRepositioning.value = false;
          };
          watch(() => [props.show, props.x, props.y], ([newShow]) => {
            if (newShow) {
              calculatePosition();
            }
          });
          const handleItemClick = (item) => {
            if (item.disabled) return;
            item.action();
            emit("close");
          };
          const handleGlobalClick = (e) => {
            if (menuRef.value && !menuRef.value.contains(e.target)) {
              emit("close");
            }
          };
          watch(() => props.show, (isShow) => {
            if (isShow) {
              setTimeout(() => {
                document.addEventListener("click", handleGlobalClick);
              }, 0);
            } else {
              document.removeEventListener("click", handleGlobalClick);
            }
          });
          onUnmounted(() => {
            document.removeEventListener("click", handleGlobalClick);
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Teleport, { to: "body" }, [
              createVNode(Transition, { name: "menu-fade" }, {
                default: withCtx(() => [
                  _ctx.show ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    ref_key: "menuRef",
                    ref: menuRef,
                    class: normalizeClass(["context-menu", { "no-transition": isRepositioning.value }]),
                    style: normalizeStyle({ left: adjustedPosition.value.x + "px", top: adjustedPosition.value.y + "px" })
                  }, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.items, (item, index) => {
                      return openBlock(), createElementBlock(Fragment, { key: index }, [
                        item.label === "-" ? (openBlock(), createElementBlock("div", _hoisted_1$4)) : (openBlock(), createElementBlock("div", {
                          key: 1,
                          class: normalizeClass(["menu-item", {
                            "menu-item-danger": item.danger,
                            "menu-item-disabled": item.disabled
                          }]),
                          onClick: ($event) => handleItemClick(item)
                        }, [
                          item.icon ? (openBlock(), createElementBlock("span", {
                            key: 0,
                            class: "menu-icon",
                            innerHTML: item.icon
                          }, null, 8, _hoisted_3$3)) : createCommentVNode("", true),
                          createElementVNode("span", _hoisted_4$3, toDisplayString(item.label), 1)
                        ], 10, _hoisted_2$4)),
                        item.separator ? (openBlock(), createElementBlock("div", _hoisted_5$2)) : createCommentVNode("", true)
                      ], 64);
                    }), 128))
                  ], 6)) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ]);
          };
        }
      });
      const _export_sfc = exports("_", (sfc, props) => {
        const target = sfc.__vccOpts || sfc;
        for (const [key, val] of props) {
          target[key] = val;
        }
        return target;
      });
      const ContextMenu = exports("a", /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-4d60a255"]]));
      const _hoisted_1$3 = ["title"];
      const _hoisted_2$3 = ["innerHTML"];
      const _sfc_main$3 = /* @__PURE__ */ defineComponent({
        __name: "IconButton",
        props: {
          icon: {},
          title: {},
          variant: {}
        },
        emits: ["click"],
        setup(__props, { emit: __emit }) {
          const emit = __emit;
          const handleClick = (e) => {
            emit("click", e);
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("button", {
              class: normalizeClass(["icon-btn", { [`variant-${_ctx.variant}`]: _ctx.variant }]),
              title: _ctx.title,
              onClick: handleClick
            }, [
              createElementVNode("span", { innerHTML: _ctx.icon }, null, 8, _hoisted_2$3)
            ], 10, _hoisted_1$3);
          };
        }
      });
      const IconButton = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-996dd7d2"]]);
      const withSize = exports("w", (svg, size, strokeWidth) => {
        let result = svg.replace("<svg ", `<svg width="${size}" height="${size}" `);
        if (strokeWidth !== void 0) {
          result = result.replace(/stroke-width="[\d.]+"/g, `stroke-width="${strokeWidth}"`);
        }
        return result;
      });
      const icons = exports("i", {
        // 导航
        chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>`,
        chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>`,
        chevronUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>`,
        chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>`,
        // 操作
        download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>`,
        upload: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>`,
        send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>`,
        edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`,
        // 文件夹
        folderEmpty: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
        folderFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
        folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
        folderOpen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
  </svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>`,
        files: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 7H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V12z" fill="currentColor"></path>
    <polyline points="12 7 12 12 16 12" fill="currentColor"></polyline>
    <path d="M17 2H10a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z" fill="white"></path>
    <polyline points="17 2 17 7 21 7" fill="white"></polyline>
  </svg>`,
        // 搜索
        search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>`,
        // 标签
        tag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>`,
        // 设置
        settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`,
        // 状态
        eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
        check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,
        alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>`,
        // 魔法/自动化
        magic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z"></path>
    <path d="M7.5 4.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L5.5 6.5l1.5-.5.5-1.5z"></path>
    <path d="M18.5 14.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"></path>
  </svg>`,
        // 其他
        moreVertical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>`,
        moreHorizontal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>`,
        lock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>`
      });
      const _hoisted_1$2 = { class: "modal-container" };
      const _hoisted_2$2 = { class: "modal-header" };
      const _hoisted_3$2 = { class: "modal-title" };
      const _hoisted_4$2 = { class: "modal-header-actions" };
      const _hoisted_5$1 = ["innerHTML"];
      const _hoisted_6$1 = { class: "modal-body" };
      const _hoisted_7 = {
        key: 0,
        class: "modal-footer"
      };
      const _hoisted_8 = ["onClick"];
      const _sfc_main$2 = /* @__PURE__ */ defineComponent({
        __name: "Modal",
        props: {
          show: { type: Boolean },
          title: {},
          buttons: {},
          closeOnClickOutside: { type: Boolean, default: true },
          closeOnEsc: { type: Boolean, default: true },
          teleportTo: { default: "body" }
        },
        emits: ["close", "action"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const handleClose = () => {
            emit("close");
          };
          const handleOverlayClick = (e) => {
            if (props.closeOnClickOutside && e.target === e.currentTarget) {
              handleClose();
            }
          };
          const handleButtonClick = (action) => {
            emit("action", action);
          };
          const handleKeyDown = (e) => {
            if (props.closeOnEsc && e.key === "Escape" && props.show) {
              handleClose();
            }
          };
          onMounted(() => {
            document.addEventListener("keydown", handleKeyDown);
          });
          onUnmounted(() => {
            document.removeEventListener("keydown", handleKeyDown);
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Teleport, {
              to: _ctx.teleportTo,
              disabled: _ctx.teleportTo !== "body"
            }, [
              createVNode(Transition, { name: "modal" }, {
                default: withCtx(() => [
                  _ctx.show ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    class: normalizeClass(["modal-overlay", { "modal-in-sidebar": _ctx.teleportTo !== "body" }]),
                    onClick: handleOverlayClick
                  }, [
                    createElementVNode("div", _hoisted_1$2, [
                      createElementVNode("div", _hoisted_2$2, [
                        createElementVNode("div", _hoisted_3$2, toDisplayString(_ctx.title || "提示"), 1),
                        createElementVNode("div", _hoisted_4$2, [
                          renderSlot(_ctx.$slots, "header-actions", {}, void 0, true),
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                            onClick: handleClose,
                            type: "button",
                            title: "关闭"
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(icons).close
                            }, null, 8, _hoisted_5$1)
                          ])
                        ])
                      ]),
                      createElementVNode("div", _hoisted_6$1, [
                        renderSlot(_ctx.$slots, "default", {}, void 0, true)
                      ]),
                      _ctx.$slots.footer || _ctx.buttons && _ctx.buttons.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.buttons, (btn) => {
                            return openBlock(), createElementBlock("button", {
                              key: btn.action,
                              class: normalizeClass(["booth-btn booth-btn-md", [`booth-btn-${btn.variant || "secondary"}`]]),
                              onClick: ($event) => handleButtonClick(btn.action),
                              type: "button"
                            }, toDisplayString(btn.text), 11, _hoisted_8);
                          }), 128))
                        ], true)
                      ])) : createCommentVNode("", true)
                    ])
                  ], 2)) : createCommentVNode("", true)
                ]),
                _: 3
              })
            ], 8, ["to", "disabled"]);
          };
        }
      });
      const Modal = exports("M", /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-3bf68892"]]));
      const _hoisted_1$1 = { class: "tab-bar" };
      const _hoisted_2$1 = { class: "tab-list" };
      const _hoisted_3$1 = ["onClick"];
      const _hoisted_4$1 = ["innerHTML"];
      const _hoisted_5 = { class: "tab-label" };
      const _hoisted_6 = {
        key: 0,
        class: "tab-actions"
      };
      const _sfc_main$1 = /* @__PURE__ */ defineComponent({
        __name: "TabBar",
        props: {
          tabs: {},
          activeTab: {}
        },
        emits: ["update:activeTab"],
        setup(__props, { emit: __emit }) {
          const emit = __emit;
          const handleTabClick = (tabId) => {
            emit("update:activeTab", tabId);
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1$1, [
              createElementVNode("div", _hoisted_2$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.tabs, (tab) => {
                  return openBlock(), createElementBlock("button", {
                    key: tab.id,
                    class: normalizeClass(["tab-btn", { active: _ctx.activeTab === tab.id }]),
                    onClick: ($event) => handleTabClick(tab.id)
                  }, [
                    tab.icon ? (openBlock(), createElementBlock("span", {
                      key: 0,
                      class: "tab-icon",
                      innerHTML: tab.icon
                    }, null, 8, _hoisted_4$1)) : createCommentVNode("", true),
                    createElementVNode("span", _hoisted_5, toDisplayString(tab.label), 1)
                  ], 10, _hoisted_3$1);
                }), 128))
              ]),
              _ctx.$slots.actions ? (openBlock(), createElementBlock("div", _hoisted_6, [
                renderSlot(_ctx.$slots, "actions", {}, void 0, true)
              ])) : createCommentVNode("", true)
            ]);
          };
        }
      });
      const TabBar = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ee7eccb8"]]);
      var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
      var _GM_notification = /* @__PURE__ */ (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
      var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
      var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
      var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
      var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
      function createDefaultGlobalTemplates() {
        return {
          nameTemplates: [
            {
              id: "default-name",
              name: "默认商品名",
              template: "{商品名}",
              isDefault: true
            },
            {
              id: "smart-auto",
              name: "智能商品名（推荐）",
              template: "{智能标题}",
              isDefault: false
            },
            {
              id: "smart-with-discount",
              name: "智能商品名（含折扣标识）",
              template: "{折扣标识}{智能标题}",
              isDefault: false
            },
            {
              id: "always-show-count",
              name: "总是显示数量",
              template: "{支持数} {商品类型复数} | {首个变体名}",
              isDefault: false
            }
          ],
          descriptionTemplates: [
            {
              id: "default-desc",
              name: "默认描述",
              template: "",
              isDefault: true
            }
          ],
          discountTemplates: [
            {
              id: "default-discount",
              name: "默认打折",
              template: "【セール中】\n通常価格: ¥{原价} → セール価格: ¥{折扣价} ({折扣百分比}% OFF)",
              isDefault: true
            },
            {
              id: "fullset-discount",
              name: "含 Fullset",
              template: "◆[セール開催中]◆\n- フルセット : {Fullset原价} JPY >> {Fullset折扣价} JPY\n- 単品: {原价} JPY >> {折扣价} JPY\n⏰ {折扣开始时间} - {折扣结束时间}\n({折扣百分比}% OFF)",
              isDefault: false
            }
          ],
          discountIndicatorTemplates: [
            {
              id: "default-discount-indicator",
              name: "默认标识",
              template: "[SALE] ",
              isDefault: true
            },
            {
              id: "fire-emoji",
              name: "火焰表情",
              template: "🔥 ",
              isDefault: false
            },
            {
              id: "japanese-sale",
              name: "日文特价",
              template: "【セール中】",
              isDefault: false
            },
            {
              id: "percent-off",
              name: "折扣标签",
              template: "[-{折扣百分比}%] ",
              isDefault: false
            }
          ],
          logTemplates: [
            {
              id: "default-log",
              name: "默认日志",
              template: "⟡ {日期}\n　・ {内容}",
              isDefault: true
            }
          ],
          itemInfoTemplates: [
            {
              id: "default-item-info",
              name: "默认商品信息",
              template: "⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -",
              isDefault: true
            }
          ],
          sectionTemplates: []
        };
      }
      function createDefaultSingleItemConfig(itemId) {
        return {
          itemId,
          itemName: "",
          itemType: "normal",
          itemTypeName: "Item",
          useSmartLogic: true,
          selectedTemplates: {
            nameTemplateId: "default-name",
            descriptionTemplateId: "default-desc",
            discountTemplateId: "default-discount",
            discountIndicatorTemplateId: "default-discount-indicator"
          },
          customDescription: "",
          discount: {
            enabled: false,
            discountPercent: 0
          },
          pricing: {
            normalVariationPrice: 0,
            fullsetPrice: 0
          },
          sections: [],
          variations: [],
          tagNodeIds: []
        };
      }
      function createDefaultItemConfig(itemId) {
        return createDefaultSingleItemConfig(itemId);
      }
      function isTextTemplate(template) {
        return "template" in template;
      }
      function getSelectedTemplate(templates, selectedTemplateId) {
        if (!templates || templates.length === 0) {
          return "";
        }
        const template = selectedTemplateId ? templates.find((t) => t.id === selectedTemplateId) : void 0;
        const selectedTemplate = template || templates.find((t) => t.isDefault) || templates[0];
        return selectedTemplate && isTextTemplate(selectedTemplate) ? selectedTemplate.template : "";
      }
      function getTemplateByType(config, itemConfig, templateKey, idKey) {
        var _a;
        return getSelectedTemplate(
          config[templateKey],
          (_a = itemConfig.selectedTemplates) == null ? void 0 : _a[idKey]
        );
      }
      function getSelectedNameTemplate(config, itemConfig) {
        return getTemplateByType(config, itemConfig, "nameTemplates", "nameTemplateId");
      }
      function getSelectedDescriptionTemplate(config, itemConfig) {
        return getTemplateByType(config, itemConfig, "descriptionTemplates", "descriptionTemplateId");
      }
      function getSelectedDiscountTemplate(config, itemConfig) {
        return getTemplateByType(config, itemConfig, "discountTemplates", "discountTemplateId");
      }
      function getSelectedDiscountIndicatorTemplate(config, itemConfig) {
        return getTemplateByType(config, itemConfig, "discountIndicatorTemplates", "discountIndicatorTemplateId");
      }
      const createDefaultData = () => {
        return {
          tagTree: {
            rootIds: [],
            nodes: {}
          },
          itemTree: {
            rootIds: [],
            nodes: {}
          },
          globalTemplates: createDefaultGlobalTemplates(),
          itemConfigs: {},
          ui: {
            sidebarOpen: false,
            activeTab: "tags"
          }
        };
      };
      const STORAGE_KEY = "booth-enhancer-config-v4";
      const SAVE_DEBOUNCE = 500;
      const _ConfigStorage = class _ConfigStorage {
        constructor() {
          __publicField(this, "_data");
          __publicField(this, "_saveTimer", null);
          this._data = ref(this.load());
          watch(
            this._data,
            () => this.saveWithDebounce(),
            { deep: true }
          );
        }
        static getInstance() {
          if (!_ConfigStorage.instance) {
            _ConfigStorage.instance = new _ConfigStorage();
          }
          return _ConfigStorage.instance;
        }
        get data() {
          return this._data;
        }
        load() {
          try {
            const stored = _GM_getValue(STORAGE_KEY, null);
            if (stored) {
              const data = JSON.parse(stored);
              if (data.ui) {
                data.ui.sidebarOpen = false;
              }
              return data;
            }
          } catch (e) {
            console.error("Failed to load config:", e);
          }
          return createDefaultData();
        }
        save() {
          try {
            _GM_setValue(STORAGE_KEY, JSON.stringify(this._data.value));
          } catch (e) {
            console.error("Failed to save config:", e);
          }
        }
        saveWithDebounce() {
          if (this._saveTimer) window.clearTimeout(this._saveTimer);
          this._saveTimer = window.setTimeout(() => {
            this.save();
            this._saveTimer = null;
          }, SAVE_DEBOUNCE);
        }
        // === Unity 风格节点操作 ===
        /**
         * 创建节点
         */
        createNode(tree, name, data, parentId = null) {
          const id = crypto.randomUUID();
          const node = {
            id,
            parentId,
            name,
            children: [],
            expanded: true,
            data,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          tree.nodes[id] = node;
          if (parentId) {
            const parent = tree.nodes[parentId];
            if (parent) parent.children.push(id);
          } else {
            tree.rootIds.push(id);
          }
          this.saveWithDebounce();
          return node;
        }
        /**
         * 删除节点
         */
        deleteNode(tree, id) {
          const node = tree.nodes[id];
          if (!node) return;
          [...node.children].forEach((childId) => this.deleteNode(tree, childId));
          if (node.parentId) {
            const parent = tree.nodes[node.parentId];
            if (parent) {
              parent.children = parent.children.filter((cid) => cid !== id);
            }
          } else {
            tree.rootIds = tree.rootIds.filter((rid) => rid !== id);
          }
          delete tree.nodes[id];
          this.saveWithDebounce();
        }
        /**
         * 移动节点
         */
        moveNode(tree, id, targetParentId) {
          const node = tree.nodes[id];
          if (!node) return;
          if (node.id === targetParentId) return;
          if (targetParentId) {
            let current = tree.nodes[targetParentId];
            while (current) {
              if (current.id === id) return;
              if (!current.parentId) break;
              current = tree.nodes[current.parentId];
            }
          }
          if (node.parentId) {
            const oldParent = tree.nodes[node.parentId];
            if (oldParent) {
              oldParent.children = oldParent.children.filter((cid) => cid !== id);
            }
          } else {
            tree.rootIds = tree.rootIds.filter((rid) => rid !== id);
          }
          if (targetParentId) {
            const newParent = tree.nodes[targetParentId];
            if (newParent) {
              newParent.children.push(id);
            }
          } else {
            tree.rootIds.push(id);
          }
          node.parentId = targetParentId;
          node.updatedAt = Date.now();
          this.saveWithDebounce();
        }
        /**
         * 在指定位置插入节点（用于排序）
         */
        insertNodeAt(tree, nodeId, targetParentId, index) {
          const node = tree.nodes[nodeId];
          if (!node) return;
          if (targetParentId) {
            if (nodeId === targetParentId) return;
            let current = tree.nodes[targetParentId];
            while (current) {
              if (current.id === nodeId) return;
              if (!current.parentId) break;
              current = tree.nodes[current.parentId];
            }
          }
          if (node.parentId) {
            const oldParent = tree.nodes[node.parentId];
            if (oldParent) {
              oldParent.children = oldParent.children.filter((cid) => cid !== nodeId);
            }
          } else {
            tree.rootIds = tree.rootIds.filter((rid) => rid !== nodeId);
          }
          if (targetParentId) {
            const newParent = tree.nodes[targetParentId];
            if (newParent) {
              newParent.children.splice(index, 0, nodeId);
            }
          } else {
            tree.rootIds.splice(index, 0, nodeId);
          }
          node.parentId = targetParentId;
          node.updatedAt = Date.now();
          this.saveWithDebounce();
        }
        /**
         * 重命名节点
         */
        renameNode(tree, id, newName) {
          const node = tree.nodes[id];
          if (!node) return;
          node.name = newName;
          node.updatedAt = Date.now();
          this.saveWithDebounce();
        }
        // ===== 导出方法 =====
        exportTags() {
          return { tagTree: this._data.value.tagTree };
        }
        exportItems() {
          return { itemTree: this._data.value.itemTree };
        }
        exportTemplates() {
          return { globalTemplates: this._data.value.globalTemplates };
        }
        exportSingleItem(itemId) {
          const config = this._data.value.itemConfigs[itemId];
          return config || null;
        }
        exportAllItems() {
          return { ...this._data.value.itemConfigs };
        }
        // ===== 导入方法 =====
        importTags(data) {
          if (!data.tagTree || !data.tagTree.nodes) {
            throw new Error("无效的标签数据格式");
          }
          this._data.value.tagTree = data.tagTree;
        }
        importItems(data) {
          if (!data.itemTree || !data.itemTree.nodes) {
            throw new Error("无效的商品数据格式");
          }
          this._data.value.itemTree = data.itemTree;
        }
        importTemplates(data) {
          if (!data.globalTemplates) {
            throw new Error("无效的模板数据格式");
          }
          this._data.value.globalTemplates = data.globalTemplates;
        }
        importSingleItem(config, options) {
          if (!config.itemId) {
            throw new Error("商品配置缺少 itemId");
          }
          const exists = !!this._data.value.itemConfigs[config.itemId];
          if (exists && !(options == null ? void 0 : options.replace)) {
            return false;
          }
          this._data.value.itemConfigs[config.itemId] = config;
          return true;
        }
        importAllFromZip(files) {
          const errors = [];
          if (files["tags.json"]) {
            try {
              this.importTags(files["tags.json"]);
            } catch (e) {
              errors.push("标签数据");
            }
          }
          if (files["items.json"]) {
            try {
              this.importItems(files["items.json"]);
            } catch (e) {
              errors.push("商品列表");
            }
          }
          if (files["templates.json"]) {
            try {
              this.importTemplates(files["templates.json"]);
            } catch (e) {
              errors.push("全局模板");
            }
          }
          for (const [filename, data] of Object.entries(files)) {
            if (filename.startsWith("item-") && filename.endsWith(".json")) {
              try {
                this.importSingleItem(data, { replace: true });
              } catch (e) {
                errors.push(`商品配置 ${filename}`);
              }
            }
          }
          if (errors.length > 0) {
            throw new Error(`以下数据导入失败: ${errors.join("、")}`);
          }
        }
        importAllFromJSON(importData) {
          const errors = [];
          if (!importData.data) {
            throw new Error("无效的备份文件格式");
          }
          const { tags, items, templates, itemConfigs } = importData.data;
          if (tags) {
            try {
              this.importTags(tags);
            } catch (e) {
              errors.push("标签数据");
            }
          }
          if (items) {
            try {
              this.importItems(items);
            } catch (e) {
              errors.push("商品列表");
            }
          }
          if (templates) {
            try {
              this.importTemplates(templates);
            } catch (e) {
              errors.push("全局模板");
            }
          }
          if (itemConfigs) {
            for (const [itemId, config] of Object.entries(itemConfigs)) {
              try {
                this.importSingleItem(config, { replace: true });
              } catch (e) {
                errors.push(`商品配置 ${itemId}`);
              }
            }
          }
          if (errors.length > 0) {
            throw new Error(`以下数据导入失败: ${errors.join("、")}`);
          }
        }
        /**
         * 导出数据为 JSON（保留用于向后兼容）
         */
        exportData() {
          return JSON.stringify(this._data.value, null, 2);
        }
        /**
         * 导入数据从 JSON（保留用于向后兼容）
         */
        importData(jsonString) {
          try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.tagTree || !parsed.itemTree) {
              throw new Error("Invalid data structure");
            }
            this._data.value = parsed;
            this.save();
            return true;
          } catch (e) {
            console.error("Failed to import data:", e);
            return false;
          }
        }
      };
      __publicField(_ConfigStorage, "instance");
      let ConfigStorage = exports("C", _ConfigStorage);
      class ToastManager {
        constructor() {
          __publicField(this, "container", null);
          __publicField(this, "toasts", /* @__PURE__ */ new Set());
          __publicField(this, "targetContainer", null);
          // 图标映射（静态常量）
          __publicField(this, "iconMap", {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
          });
        }
        /**
         * 设置 Toast 显示的目标容器
         * @param container 目标容器元素，如果为 null 则使用 body
         */
        setContainer(container) {
          this.targetContainer = container;
          if (this.container) {
            this.container.remove();
            this.container = null;
          }
        }
        ensureContainer() {
          if (!this.container) {
            this.container = document.createElement("div");
            this.container.className = "booth-toast-container";
            if (this.targetContainer) {
              this.container.setAttribute("data-position", "relative");
            } else {
              this.container.setAttribute("data-position", "fixed");
            }
            this.injectStyles();
            const parent = this.targetContainer || document.body;
            parent.appendChild(this.container);
          }
          return this.container;
        }
        injectStyles() {
          if (document.getElementById("booth-toast-styles")) return;
          const style = document.createElement("style");
          style.id = "booth-toast-styles";
          style.textContent = `
      /* Toast 容器基础样式 */
      .booth-toast-container {
        display: flex;
        gap: 8px;
        pointer-events: none;
        z-index: 1000;
      }

      /* Toast 容器在 body 中时 - 固定在顶部居中 */
      .booth-toast-container[data-position="fixed"] {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: column;
        z-index: 10001;
        align-items: center;
      }

      /* Toast 容器在其他元素中时 - 绝对定位在底部居中 */
      .booth-toast-container[data-position="relative"] {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: column-reverse;
        align-items: center;
      }

      .booth-toast {
        min-width: 200px;
        max-width: 400px;
        padding: 14px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        font-size: 14px;
        line-height: 1.5;
        pointer-events: auto;
        opacity: 0;
        transition: all 0.3s ease;
        word-wrap: break-word;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-icon svg {
        width: 100%;
        height: 100%;
      }

      .toast-message {
        flex: 1;
        padding-top: 1px;
        color: #333;
      }

      /* Toast 从上方滑入 */
      .booth-toast-container[data-position="fixed"] .booth-toast {
        transform: translateY(-20px);
      }

      .booth-toast-container[data-position="fixed"] .booth-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      /* Toast 在相对容器中时从下往上滑入 */
      .booth-toast-container[data-position="relative"] .booth-toast {
        transform: translateY(20px);
      }

      .booth-toast-container[data-position="relative"] .booth-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      .booth-toast-success {
        background: #f0fdf4;
        border: 1px solid #86efac;
      }
      
      .booth-toast-success .toast-icon {
        color: #22c55e;
      }

      .booth-toast-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
      }
      
      .booth-toast-error .toast-icon {
        color: #ef4444;
      }

      .booth-toast-warning {
        background: #fffbeb;
        border: 1px solid #fde68a;
      }
      
      .booth-toast-warning .toast-icon {
        color: #f59e0b;
      }

      .booth-toast-info {
        background: #eff6ff;
        border: 1px solid #93c5fd;
      }
      
      .booth-toast-info .toast-icon {
        color: #3b82f6;
      }

      @media (max-width: 768px) {
        .booth-toast-container[data-position="fixed"] {
          top: 10px;
          left: 10px;
          right: 10px;
          transform: none;
        }

        .booth-toast {
          min-width: 0;
          max-width: none;
          width: 100%;
          padding: 10px 14px;
          font-size: 13px;
        }
      }
    `;
          document.head.appendChild(style);
        }
        show(options) {
          const {
            message,
            type = "info",
            duration = 3e3,
            onClose
          } = options;
          const container = this.ensureContainer();
          const toast2 = document.createElement("div");
          toast2.className = `booth-toast booth-toast-${type}`;
          toast2.innerHTML = `
      <div class="toast-icon">${this.iconMap[type]}</div>
      <div class="toast-message">${message}</div>
    `;
          container.appendChild(toast2);
          this.toasts.add(toast2);
          requestAnimationFrame(() => {
            toast2.classList.add("show");
          });
          setTimeout(() => {
            this.remove(toast2, onClose);
          }, duration);
        }
        remove(toast2, onClose) {
          toast2.classList.remove("show");
          setTimeout(() => {
            if (toast2.parentElement) {
              toast2.parentElement.removeChild(toast2);
            }
            this.toasts.delete(toast2);
            if (onClose) {
              onClose();
            }
            if (this.toasts.size === 0 && this.container) {
              this.container.remove();
              this.container = null;
            }
          }, 300);
        }
        success(message, duration) {
          this.show({ message, type: "success", duration });
        }
        error(message, duration) {
          this.show({ message, type: "error", duration });
        }
        warning(message, duration) {
          this.show({ message, type: "warning", duration });
        }
        info(message, duration) {
          this.show({ message, type: "info", duration });
        }
      }
      const toast = exports("t", new ToastManager());
      function useStorage() {
        const storage = ConfigStorage.getInstance();
        return {
          // 原始实例（用于特殊场景）
          storage,
          // 响应式数据
          data: storage.data,
          // === 导出方法 ===
          exportTags: () => storage.exportTags(),
          exportItems: () => storage.exportItems(),
          exportTemplates: () => storage.exportTemplates(),
          exportSingleItem: (itemId) => storage.exportSingleItem(itemId),
          exportAllItems: () => storage.exportAllItems(),
          // === 导入方法 ===
          importTags: (data) => storage.importTags(data),
          importItems: (data) => storage.importItems(data),
          importTemplates: (data) => storage.importTemplates(data),
          importSingleItem: (config, options) => storage.importSingleItem(config, options),
          importAllFromZip: (files) => storage.importAllFromZip(files),
          importAllFromJSON: (data) => storage.importAllFromJSON(data),
          // === 节点操作方法 ===
          createNode: (tree, name, data, parentId) => storage.createNode(tree, name, data, parentId),
          renameNode: (tree, nodeId, newName) => storage.renameNode(tree, nodeId, newName),
          deleteNode: (tree, nodeId) => storage.deleteNode(tree, nodeId),
          moveNode: (tree, nodeId, newParentId) => storage.moveNode(tree, nodeId, newParentId)
        };
      }
      function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      function downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        triggerDownload(blob, filename);
      }
      function readJSONFile(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            var _a;
            try {
              const data = JSON.parse((_a = e.target) == null ? void 0 : _a.result);
              resolve(data);
            } catch (error) {
              reject(new Error("无效的 JSON 格式"));
            }
          };
          reader.onerror = () => reject(new Error("文件读取失败"));
          reader.readAsText(file);
        });
      }
      function triggerFileInput(accept, callback) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = (e) => {
          var _a;
          const file = (_a = e.target.files) == null ? void 0 : _a[0];
          if (file) callback(file);
        };
        input.click();
      }
      const _hoisted_1 = { class: "modal-content" };
      const _hoisted_2 = ["innerHTML"];
      const _hoisted_3 = ["innerHTML"];
      const _hoisted_4 = { class: "sidebar-content" };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "App",
        props: {
          api: {},
          itemId: {}
        },
        setup(__props) {
          const props = __props;
          const TagTab = defineAsyncComponent(() => __vitePreload(() => module.import('./TagTab-B08_OccJ-C0hC7lug.js'), void 0 ));
          const ItemTab = defineAsyncComponent(() => __vitePreload(() => module.import('./ItemTab-kS9ODuyb-DSijyaZm.js'), void 0 ));
          const EditTab = defineAsyncComponent(() => __vitePreload(() => module.import('./EditTab-BdJemFYU-u7Tc2tmU.js'), void 0 ));
          const {
            data,
            exportTags,
            exportItems,
            exportTemplates,
            exportAllItems,
            importAllFromJSON,
            importTags,
            importItems,
            exportSingleItem,
            importSingleItem
          } = useStorage();
          function getTabComponent() {
            const activeTab = data.value.ui.activeTab;
            switch (activeTab) {
              case "tags":
                return TagTab;
              case "items":
                return ItemTab;
              case "edit":
                return EditTab;
              default:
                return TagTab;
            }
          }
          const editTabRef = ref(null);
          function setComponentRef(el) {
            if (data.value.ui.activeTab === "edit") {
              editTabRef.value = el;
            }
          }
          async function handleApplyAll() {
            if (!editTabRef.value) {
              toast.error("EditTab 未加载");
              return;
            }
            try {
              await editTabRef.value.applyAll();
            } catch (error) {
              console.error("应用所有配置失败:", error);
            }
          }
          const sidebarRef = ref(null);
          const showMenu = ref(false);
          const menuPosition = ref({ x: 0, y: 0 });
          const showImportConflictDialog = ref(false);
          const pendingImportConfig = ref(null);
          const tabs = [
            { id: "tags", label: "标签" },
            { id: "items", label: "商品" },
            { id: "edit", label: "编辑" }
          ];
          watch(() => data.value.ui.sidebarOpen, (isOpen) => {
            const panelRoot = document.getElementById("booth-enhancer-panel-root");
            const toggleBtn = document.querySelector(".booth-enhancer-toggle");
            if (panelRoot) {
              if (isOpen) {
                panelRoot.classList.add("panel-open");
              } else {
                panelRoot.classList.remove("panel-open");
              }
            }
            if (toggleBtn) {
              toggleBtn.innerHTML = isOpen ? icons.chevronRight : icons.chevronLeft;
            }
          });
          const closeSidebar = () => {
            data.value.ui.sidebarOpen = false;
          };
          const handleTabChange = (tab) => {
            data.value.ui.activeTab = tab;
          };
          function generateTimestamp() {
            return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          }
          const handleExport = async () => {
            try {
              const exportData = {
                version: "1.0",
                exportTime: Date.now(),
                data: {
                  tags: exportTags(),
                  items: exportItems(),
                  templates: exportTemplates(),
                  itemConfigs: exportAllItems()
                }
              };
              downloadJSON(exportData, `booth-backup-${generateTimestamp()}.json`);
              toast.success("导出成功");
            } catch (error) {
              console.error("导出失败:", error);
              toast.error("导出失败：" + error.message);
            }
          };
          const handleImport = () => {
            triggerFileInput(".json,application/json", async (file) => {
              try {
                const importData = await readJSONFile(file);
                importAllFromJSON(importData);
                toast.success("导入成功");
              } catch (error) {
                console.error("导入失败:", error);
                toast.error("导入失败：" + error.message);
              }
            });
          };
          const toggleMenu = (event) => {
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();
            menuPosition.value = {
              x: rect.left - 100,
              y: rect.bottom + 4
            };
            showMenu.value = !showMenu.value;
          };
          const closeMenu = () => {
            showMenu.value = false;
          };
          function handleTabExport() {
            const activeTab = data.value.ui.activeTab;
            if (activeTab === "edit") return;
            try {
              const timestamp = generateTimestamp();
              const exportData = activeTab === "tags" ? exportTags() : exportItems();
              const fileName = `booth-${activeTab}-${timestamp}.json`;
              downloadJSON(exportData, fileName);
              toast.success(`${currentTabLabel.value}数据导出成功`);
            } catch (error) {
              console.error("导出失败:", error);
              toast.error("导出失败：" + error.message);
            }
          }
          function handleTabImport() {
            const activeTab = data.value.ui.activeTab;
            if (activeTab === "edit") return;
            triggerFileInput(".json,application/json", async (file) => {
              try {
                const importData = await readJSONFile(file);
                if (activeTab === "tags") {
                  importTags(importData);
                } else {
                  importItems(importData);
                }
                toast.success(`${currentTabLabel.value}数据导入成功`);
              } catch (error) {
                console.error("导入失败:", error);
                toast.error("导入失败：" + error.message);
              }
            });
          }
          const currentTabLabel = computed(() => {
            switch (data.value.ui.activeTab) {
              case "tags":
                return "标签";
              case "items":
                return "商品";
              case "edit":
                return "编辑";
              default:
                return "";
            }
          });
          function handleEditExport() {
            if (!props.itemId) {
              toast.error("无法获取当前商品ID");
              return;
            }
            try {
              const config = exportSingleItem(props.itemId);
              if (!config) {
                toast.error("当前商品没有配置数据");
                return;
              }
              const timestamp = generateTimestamp();
              downloadJSON(config, `booth-item-${props.itemId}-${timestamp}.json`);
              toast.success("商品配置导出成功");
            } catch (error) {
              console.error("导出失败:", error);
              toast.error("导出失败：" + error.message);
            }
          }
          function cleanInvalidFileIds(config, availableFileIds) {
            let removedCount = 0;
            if (config.commonFiles) {
              const initialLength = config.commonFiles.length;
              config.commonFiles = config.commonFiles.filter(
                (fileId) => availableFileIds.has(fileId)
              );
              removedCount += initialLength - config.commonFiles.length;
            }
            if (config.variations) {
              config.variations.forEach((variation) => {
                if (variation.fileIds) {
                  const initialLength = variation.fileIds.length;
                  variation.fileIds = variation.fileIds.filter(
                    (fileId) => availableFileIds.has(fileId)
                  );
                  removedCount += initialLength - variation.fileIds.length;
                }
                if (variation.fileItemMap) {
                  const validFileItemMap = {};
                  for (const [fileId, itemId] of Object.entries(variation.fileItemMap)) {
                    if (availableFileIds.has(fileId)) {
                      validFileItemMap[fileId] = itemId;
                    } else {
                      removedCount++;
                    }
                  }
                  variation.fileItemMap = validFileItemMap;
                }
              });
            }
            return removedCount;
          }
          function handleEditImport() {
            triggerFileInput(".json,application/json", async (file) => {
              try {
                const config = await readJSONFile(file);
                config.itemId = props.itemId;
                const availableFileIds = new Set(props.api.files.map((f) => f.id));
                const removedCount = cleanInvalidFileIds(config, availableFileIds);
                importSingleItem(config, { replace: true });
                const message = removedCount > 0 ? `当前商品配置已成功替换（已清理 ${removedCount} 个无效文件引用）` : "当前商品配置已成功替换";
                toast.success(message, 3e3);
                console.log("[导入成功]", message, config.itemId, config.itemName);
              } catch (error) {
                console.error("导入失败:", error);
                toast.error("导入失败：" + error.message);
              }
            });
          }
          function confirmReplaceConfig() {
            if (pendingImportConfig.value) {
              importSingleItem(pendingImportConfig.value, { replace: true });
              toast.success("商品配置导入成功");
            }
            showImportConflictDialog.value = false;
            pendingImportConfig.value = null;
          }
          function cancelImport() {
            showImportConflictDialog.value = false;
            pendingImportConfig.value = null;
          }
          const menuItems = computed(() => {
            const isEditTab = data.value.ui.activeTab === "edit";
            const exportLabel = isEditTab ? "导出当前商品 (JSON)" : `导出${currentTabLabel.value}数据 (JSON)`;
            const importLabel = isEditTab ? "导入商品配置 (JSON)" : `导入${currentTabLabel.value}数据 (JSON)`;
            const exportAction = isEditTab ? handleEditExport : handleTabExport;
            const importAction = isEditTab ? handleEditImport : handleTabImport;
            return [
              {
                label: "导出完整备份 (JSON)",
                icon: withSize(icons.upload, 14),
                action: handleExport
              },
              {
                label: "导入完整备份 (JSON)",
                icon: withSize(icons.download, 14),
                action: handleImport
              },
              {
                label: "-",
                icon: "",
                action: () => {
                }
              },
              {
                label: exportLabel,
                icon: withSize(icons.upload, 14),
                action: exportAction
              },
              {
                label: importLabel,
                icon: withSize(icons.download, 14),
                action: importAction
              }
            ];
          });
          onMounted(() => {
            if (sidebarRef.value) {
              toast.setContainer(sidebarRef.value);
            }
          });
          onUnmounted(() => {
            toast.setContainer(null);
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", {
              ref_key: "sidebarRef",
              ref: sidebarRef,
              class: "booth-enhancer-sidebar"
            }, [
              createVNode(unref(TabBar), {
                "active-tab": unref(data).ui.activeTab,
                tabs,
                "onUpdate:activeTab": handleTabChange
              }, {
                actions: withCtx(() => [
                  unref(data).ui.activeTab === "edit" ? (openBlock(), createBlock(unref(IconButton), {
                    key: 0,
                    icon: unref(icons).send,
                    title: "应用所有",
                    onClick: handleApplyAll
                  }, null, 8, ["icon"])) : createCommentVNode("", true),
                  createVNode(unref(IconButton), {
                    icon: unref(icons).moreVertical,
                    title: "更多操作",
                    onClick: toggleMenu
                  }, null, 8, ["icon"]),
                  createVNode(unref(IconButton), {
                    icon: unref(icons).close,
                    title: "关闭",
                    onClick: closeSidebar
                  }, null, 8, ["icon"])
                ]),
                _: 1
              }, 8, ["active-tab"]),
              createVNode(ContextMenu, {
                show: showMenu.value,
                x: menuPosition.value.x,
                y: menuPosition.value.y,
                items: menuItems.value,
                onClose: closeMenu
              }, null, 8, ["show", "x", "y", "items"]),
              createVNode(unref(Modal), {
                show: showImportConflictDialog.value,
                title: "导入确认",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: cancelImport
              }, {
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: cancelImport,
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_2)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-danger",
                    onClick: confirmReplaceConfig,
                    title: "替换"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_3)
                  ])
                ]),
                default: withCtx(() => {
                  var _a;
                  return [
                    createElementVNode("div", _hoisted_1, [
                      createElementVNode("p", null, [
                        _cache[0] || (_cache[0] = createTextVNode("商品 ID ", -1)),
                        createElementVNode("strong", null, toDisplayString((_a = pendingImportConfig.value) == null ? void 0 : _a.itemId), 1),
                        _cache[1] || (_cache[1] = createTextVNode(" 已存在配置。", -1))
                      ]),
                      _cache[2] || (_cache[2] = createElementVNode("p", null, "是否要替换现有配置？", -1))
                    ])
                  ];
                }),
                _: 1
              }, 8, ["show"]),
              createElementVNode("div", _hoisted_4, [
                (openBlock(), createBlock(resolveDynamicComponent(getTabComponent()), {
                  ref: setComponentRef,
                  key: unref(data).ui.activeTab + "-" + Date.now(),
                  api: props.api
                }, null, 8, ["api"]))
              ])
            ], 512);
          };
        }
      });
      const AppVue = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-19213a99"]]);
      class PageModule {
        constructor(api) {
          __publicField(this, "api");
          this.api = api;
          this.api.onReady(() => {
            setTimeout(() => {
              this.initialize();
            }, 0);
          });
        }
      }
      class FileManager extends PageModule {
        constructor(api) {
          super(api);
        }
        initialize() {
          this.enhanceFilePanel();
        }
        /**
         * 增强文件管理面板
         */
        enhanceFilePanel() {
          const panel = this.findFilePanel();
          if (!panel) return;
          if (panel.hasAttribute("data-file-manager-enhanced")) return;
          panel.setAttribute("data-file-manager-enhanced", "true");
          const storageDiv = panel.querySelector(".font-heavy-sans.text-\\[14px\\]");
          if (!storageDiv) return;
          this.addActionButtons(storageDiv);
        }
        /**
         * 查找文件管理面板
         */
        findFilePanel() {
          var _a;
          const titleElements = document.querySelectorAll(".font-booth-demi");
          for (const title of Array.from(titleElements)) {
            if ((_a = title.textContent) == null ? void 0 : _a.includes("Add/Edit Files")) {
              return title.closest(".bg-white");
            }
          }
          return null;
        }
        /**
         * 添加操作按钮
         */
        addActionButtons(storageDiv) {
          var _a;
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "flex gap-8 py-12 px-16 border-b border-b-border300";
          buttonContainer.style.cssText = "background: #f8f9fa;";
          const selectAllBtn = document.createElement("button");
          selectAllBtn.type = "button";
          selectAllBtn.className = "btn calm small";
          selectAllBtn.textContent = "全选";
          selectAllBtn.onclick = () => this.selectAllFiles();
          const unselectAllBtn = document.createElement("button");
          unselectAllBtn.type = "button";
          unselectAllBtn.className = "btn calm small";
          unselectAllBtn.textContent = "全不选";
          unselectAllBtn.onclick = () => this.unselectAllFiles();
          buttonContainer.appendChild(selectAllBtn);
          buttonContainer.appendChild(unselectAllBtn);
          (_a = storageDiv.parentElement) == null ? void 0 : _a.insertBefore(buttonContainer, storageDiv.nextSibling);
        }
        /**
         * 全选所有文件
         */
        selectAllFiles() {
          this.setAllCheckboxes(true);
        }
        /**
         * 全不选所有文件
         */
        unselectAllFiles() {
          this.setAllCheckboxes(false);
        }
        /**
         * 设置所有复选框状态
         */
        setAllCheckboxes(checked) {
          const fileCheckboxes = document.querySelectorAll(
            'ul.list-none input.charcoal-checkbox-input[type="checkbox"]'
          );
          Array.from(fileCheckboxes).forEach((checkbox) => {
            const input = checkbox;
            if (input.checked !== checked) {
              Simulate.click(input);
            }
          });
        }
      }
      class ItemNumbers extends PageModule {
        constructor(api) {
          super(api);
          __publicField(this, "_observedContainers");
        }
        get observedContainers() {
          if (!this._observedContainers) {
            this._observedContainers = /* @__PURE__ */ new WeakMap();
          }
          return this._observedContainers;
        }
        initialize() {
          const containers = /* @__PURE__ */ new Set();
          this.api.sections.forEach((section) => containers.add(section.container));
          this.api.variations.forEach((variation) => containers.add(variation.container));
          containers.forEach((container) => {
            this.addNumbersToList(container);
          });
          this.api.onSectionAdded((section) => {
            if (!this.observedContainers.has(section.container)) {
              this.addNumbersToList(section.container);
            }
          });
          this.api.onVariationAdded((variation) => {
            if (!this.observedContainers.has(variation.container)) {
              this.addNumbersToList(variation.container);
            }
          });
        }
        /**
         * 为列表添加序号
         */
        addNumbersToList(ul) {
          const items = Array.from(ul.children).filter(
            (child) => child.tagName.toLowerCase() === "li"
          );
          items.forEach((li, index) => {
            this.addNumberToItem(li, index + 1);
          });
          this.setupListObserver(ul);
        }
        /**
         * 为单个列表项添加序号
         */
        addNumberToItem(li, number) {
          const existingNumber = li.querySelector(".variation-number");
          existingNumber == null ? void 0 : existingNumber.remove();
          const titleContainer = li.querySelector(".variation-box-head .flex.items-center.gap-4");
          if (!titleContainer) return;
          const numberSpan = document.createElement("span");
          numberSpan.className = "variation-number typography-14 inline-block font-semibold";
          numberSpan.style.cssText = "margin-right: 8px; color: #666;";
          numberSpan.textContent = `#${number}`;
          titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
        }
        /**
         * 设置列表观察器
         */
        setupListObserver(ul) {
          const existingObserver = this.observedContainers.get(ul);
          if (existingObserver) {
            existingObserver.disconnect();
          }
          const observer = new MutationObserver(() => {
            const items = Array.from(ul.children).filter(
              (child) => child.tagName.toLowerCase() === "li"
            );
            items.forEach((li, index) => {
              this.addNumberToItem(li, index + 1);
            });
          });
          observer.observe(ul, {
            childList: true,
            subtree: false
          });
          this.observedContainers.set(ul, observer);
        }
      }
      function handleError(error, fallback) {
        console.error("Booth Helper Error:", error);
        if (fallback) {
          try {
            fallback();
          } catch (e) {
            console.error("Fallback handler failed:", e);
          }
        }
      }
      const Config = {
        throttleDelay: 100,
        animationDelay: 1e3
      };
      class Utils {
        // 优化的节流函数，使用Map缓存
        static throttle(func, limit) {
          const key = func.toString();
          if (!this.throttleCache.has(key)) {
            let inThrottle;
            const throttled = function(...args) {
              if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
              }
            };
            this.throttleCache.set(key, throttled);
          }
          return this.throttleCache.get(key);
        }
        // 等待指定时间
        static sleep(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
        // 等待DOM加载完成
        static async waitForDOMReady() {
          if (document.readyState === "loading") {
            await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve));
          }
        }
        // 优化的按钮状态更新
        static updateButtonState(button, success = true, originalHtml) {
          if (!button) return;
          const newHtml = success ? '<i class="icon-check"></i><span class="cmd-label">已完成</span>' : originalHtml;
          button.innerHTML = newHtml;
          button.classList.toggle("calm", !success);
          button.classList.toggle("primary", success);
          if (success) {
            setTimeout(() => {
              button.innerHTML = originalHtml;
              button.classList.add("calm");
              button.classList.remove("primary");
            }, Config.animationDelay);
          }
        }
      }
      __publicField(Utils, "throttleCache", /* @__PURE__ */ new Map());
      class TagManager extends PageModule {
        constructor(api) {
          super(api);
        }
        initialize() {
          this.waitForTagContainer();
        }
        /**
         * 等待标签容器出现
         */
        waitForTagContainer() {
          const tagElements = this.api.tagElements;
          if (tagElements) {
            this.addTagButtons(tagElements.inputContainer);
            return;
          }
          const observer = new MutationObserver(() => {
            const elements = this.api.tagElements;
            if (elements) {
              this.addTagButtons(elements.inputContainer);
              observer.disconnect();
            }
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
        /**
         * 添加标签操作按钮
         */
        addTagButtons(inputContainer) {
          if (inputContainer.querySelector(".tag-action-buttons")) return;
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "flex gap-2 tag-action-buttons";
          buttonContainer.style.cssText = `
            align-items: center;
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
        `;
          const copyBtn = document.createElement("a");
          copyBtn.className = "btn calm small";
          copyBtn.innerHTML = "复制标签";
          copyBtn.onclick = () => this.copyTags();
          const pasteBtn = document.createElement("a");
          pasteBtn.className = "btn calm small";
          pasteBtn.innerHTML = "粘贴标签";
          pasteBtn.onclick = () => this.pasteTags();
          const clearBtn = document.createElement("a");
          clearBtn.className = "btn calm small";
          clearBtn.innerHTML = "清空标签";
          clearBtn.onclick = () => this.clearTags();
          buttonContainer.appendChild(copyBtn);
          buttonContainer.appendChild(pasteBtn);
          buttonContainer.appendChild(clearBtn);
          inputContainer.appendChild(buttonContainer);
        }
        /**
         * 复制标签到剪贴板
         */
        copyTags() {
          try {
            const tags = this.api.getTagTexts();
            if (tags.length === 0) {
              toast.warning("没有找到标签");
              return;
            }
            navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
              const copyBtn = document.querySelector(".tag-action-buttons .btn:first-child");
              if (copyBtn instanceof HTMLElement) {
                Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
              }
            });
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 从剪贴板粘贴标签
         */
        async pasteTags() {
          try {
            const text = await navigator.clipboard.readText();
            const newTags = JSON.parse(text);
            if (!Array.isArray(newTags) || newTags.length === 0) {
              throw new Error("无效的标签数据");
            }
            const tagElements = this.api.tagElements;
            if (!tagElements) throw new Error("找不到标签容器");
            const { input, container } = tagElements;
            const existingTags = this.api.getTagTexts();
            const tagsToAdd = newTags.filter((tag) => !existingTags.includes(tag));
            if (tagsToAdd.length === 0) {
              toast.info("所有标签都已存在，无需添加");
              return;
            }
            const progress = this.createProgressTip(container);
            try {
              for (let i = 0; i < tagsToAdd.length; i++) {
                progress.updateProgress(i + 1, tagsToAdd.length);
                input.focus();
                Simulate.input(input, tagsToAdd[i]);
                await Utils.sleep(1);
                Simulate.pressEnter(input);
                await Utils.sleep(1);
              }
              progress.complete(
                `处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`
              );
              const pasteBtn = document.querySelector(".tag-action-buttons .btn:nth-child(2)");
              if (pasteBtn instanceof HTMLElement) {
                Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
              }
            } catch (error) {
              progress.remove();
              throw error;
            }
          } catch (error) {
            handleError(error, () => {
              toast.error("粘贴标签失败：" + (error instanceof Error ? error.message : String(error)));
            });
          }
        }
        /**
         * 清空所有标签
         */
        async clearTags() {
          try {
            const confirmed = window.confirm("确定要清空所有标签吗？");
            if (!confirmed) return;
            const tagElements = this.api.tagElements;
            if (!tagElements) throw new Error("找不到标签容器");
            const deleteButtons = this.api.getTagDeleteButtons();
            if (deleteButtons.length === 0) {
              toast.warning("没有找到需要清空的标签");
              return;
            }
            const progress = this.createProgressTip(tagElements.container);
            try {
              for (let i = deleteButtons.length - 1; i >= 0; i--) {
                progress.updateProgress(deleteButtons.length - i, deleteButtons.length);
                const button = deleteButtons[i];
                button.click();
                await Utils.sleep(1);
              }
              progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);
              const clearBtn = document.querySelector(".tag-action-buttons .btn:nth-child(3)");
              if (clearBtn instanceof HTMLElement) {
                Utils.updateButtonState(clearBtn, true, clearBtn.innerHTML);
              }
            } catch (error) {
              progress.remove();
              throw error;
            }
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 创建进度提示
         */
        createProgressTip(container) {
          const tipContainer = document.createElement("div");
          tipContainer.style.cssText = `
            margin-bottom: 12px;
            background: #f5f7fa;
            border-radius: 4px;
            padding: 12px;
            position: relative;
        `;
          const textElement = document.createElement("div");
          textElement.style.cssText = "color: #666; font-size: 14px; margin-bottom: 8px;";
          const progressBarContainer = document.createElement("div");
          progressBarContainer.style.cssText = `
            background: #e4e7ed;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        `;
          const progressBar = document.createElement("div");
          progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: #409EFF;
            transition: width 0.3s ease;
            border-radius: 3px;
        `;
          progressBarContainer.appendChild(progressBar);
          tipContainer.appendChild(textElement);
          tipContainer.appendChild(progressBarContainer);
          const inputContainer = container.querySelector(".item-search-input__container");
          if (inputContainer == null ? void 0 : inputContainer.parentElement) {
            inputContainer.parentElement.insertBefore(tipContainer, inputContainer);
          } else {
            container.insertBefore(tipContainer, container.firstChild);
          }
          return {
            container: tipContainer,
            progressBar,
            textElement,
            updateProgress: (current, total, message) => {
              const percentage = current / total * 100;
              progressBar.style.width = `${percentage}%`;
              textElement.textContent = message || `处理中... (${current}/${total})`;
            },
            complete: (message) => {
              progressBar.style.width = "100%";
              progressBar.style.background = "#67C23A";
              textElement.textContent = message;
              setTimeout(() => tipContainer.remove(), 2e3);
            },
            remove: () => tipContainer.remove()
          };
        }
      }
      class ItemEditFeature extends PageFeature {
        constructor(context) {
          super(context);
          __publicField(this, "modules", []);
          __publicField(this, "app", null);
          __publicField(this, "container", null);
          __publicField(this, "toggleBtn", null);
          // 预编译的图标（避免重复创建）
          __publicField(this, "chevronLeftIcon", withSize(icons.chevronLeft, 20, 2.5));
          __publicField(this, "chevronRightIcon", withSize(icons.chevronRight, 20, 2.5));
        }
        shouldExecute() {
          const path = window.location.pathname;
          return /^\/items\/\d+\/edit(_pre)?$/.test(path);
        }
        createAPI() {
          return new ItemEditAPI();
        }
        async initialize() {
          if (this.api) {
            this.modules.push(
              new ItemNumbers(this.api),
              new TagManager(this.api),
              new FileManager(this.api)
            );
            this.injectStyles();
            this.createToggleButton();
            this.createPanelContainer();
            this.mountVueApp();
          }
        }
        /**
         * 注入样式表
         */
        injectStyles() {
          if (document.querySelector("#booth-enhancer-styles")) return;
          const style = document.createElement("style");
          style.id = "booth-enhancer-styles";
          style.textContent = `
            .booth-enhancer-toggle {
                position: fixed;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 30px;
                height: 60px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #e0e0e0;
                border-right: none;
                border-radius: 8px 0 0 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 999;
                font-size: 12px;
                color: #666;
                user-select: none;
            }

            .booth-enhancer-toggle:hover {
                background: #f8f9fa;
                box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
            }

            #booth-enhancer-panel-root {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%) translateX(100%);
                width: 500px;
                min-width: 400px;
                max-width: 650px;
                height: 80vh;
                max-height: 80vh;
                z-index: 1000;
                transition: transform 0.3s ease;
                pointer-events: none;
                box-sizing: border-box;
            }

            #booth-enhancer-panel-root.panel-open {
                transform: translateY(-50%) translateX(0);
                pointer-events: auto;
            }

            @media (max-width: 768px) {
                #booth-enhancer-panel-root {
                    width: 100%;
                    max-width: 400px;
                    height: 70vh;
                    max-height: 70vh;
                }
                
                .booth-enhancer-toggle {
                    width: 40px;
                    height: 60px;
    }
            }

            @media (max-width: 480px) {
                #booth-enhancer-panel-root {
                    width: 100%;
                    height: 85vh;
                    max-height: 85vh;
                }
            }
        `;
          document.head.appendChild(style);
        }
        /**
         * 更新侧边栏状态
         */
        updateSidebarState(isOpen) {
          if (this.toggleBtn) {
            this.toggleBtn.innerHTML = isOpen ? this.chevronRightIcon : this.chevronLeftIcon;
          }
          if (this.container) {
            this.container.classList.toggle("panel-open", isOpen);
          }
        }
        /**
         * 创建侧边栏触发按钮
         */
        createToggleButton() {
          this.toggleBtn = document.createElement("div");
          this.toggleBtn.className = "booth-enhancer-toggle";
          this.toggleBtn.title = "配置面板";
          this.toggleBtn.innerHTML = this.chevronLeftIcon;
          this.toggleBtn.addEventListener("click", () => {
            const storage = ConfigStorage.getInstance();
            const isOpen = !storage.data.value.ui.sidebarOpen;
            storage.data.value.ui.sidebarOpen = isOpen;
            this.updateSidebarState(isOpen);
          });
          document.body.appendChild(this.toggleBtn);
        }
        /**
         * 创建面板容器
         */
        createPanelContainer() {
          this.container = document.createElement("div");
          this.container.id = "booth-enhancer-panel-root";
          const storage = ConfigStorage.getInstance();
          const sidebarOpen = storage.data.value.ui.sidebarOpen;
          if (sidebarOpen) {
            this.updateSidebarState(sidebarOpen);
          }
          document.body.appendChild(this.container);
        }
        /**
         * 挂载 Vue 应用
         */
        mountVueApp() {
          if (!this.container || !this.api) return;
          const match = window.location.pathname.match(/\/items\/(\d+)\/edit/);
          const itemId = match ? match[1] : "";
          this.app = createApp(AppVue, {
            api: this.api,
            itemId
          });
          this.app.mount(this.container);
        }
      }
      class ItemManageParser {
        /**
         * 从元素中提取商品ID
         */
        extractId(element) {
          var _a;
          const dataId = element.getAttribute("data-id");
          if (dataId) return dataId;
          const link = ((_a = element.querySelector(".nav")) == null ? void 0 : _a.getAttribute("href")) || "";
          const match = link.match(/\/items\/(\d+)/);
          return match ? match[1] : "";
        }
        /**
         * 从文本中提取数字
         */
        extractNumber(text) {
          return parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
        }
        /**
         * 解析变体列表（数据+元素）
         */
        parseVariations(element) {
          const rows = element.querySelectorAll(".dashboard-items-variation .row");
          if (rows.length === 0) return [];
          const variations = [];
          rows.forEach((row) => {
            var _a, _b, _c, _d, _e, _f;
            const htmlRow = row;
            const labelEl = row.querySelector(".dashboard-items-variation-label");
            const textContent = (labelEl == null ? void 0 : labelEl.textContent) || "";
            const nameMatch = textContent.match(/#\d+\s*(.+)/);
            const name = nameMatch ? nameMatch[1].trim() : textContent.trim();
            const priceText = ((_b = (_a = row.querySelector(".price")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "0";
            const price = this.extractNumber(priceText);
            const salesText = ((_d = (_c = row.querySelector(".sales_quantity .count")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "0";
            const salesCount = this.extractNumber(salesText);
            const revenueText = ((_f = (_e = row.querySelector(".sales_subtotal")) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || "0";
            const revenue = this.extractNumber(revenueText);
            variations.push({
              data: { name, price, salesCount, revenue },
              element: htmlRow
            });
          });
          return variations;
        }
        /**
         * 解析标签列表（文本+元素）
         */
        parseTags(element) {
          const tagElements = element.querySelectorAll(".dashboard-items-tags li");
          if (tagElements.length === 0) return [];
          const tags = [];
          tagElements.forEach((li) => {
            var _a, _b;
            const text = (_b = (_a = li.querySelector(".tag-text")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
            if (text) {
              tags.push({
                text,
                element: li
              });
            }
          });
          return tags;
        }
        /**
         * 解析单个商品的基础信息（不包含 variations 和 tags 详细数据）
         */
        parseItemBasic(element) {
          var _a, _b, _c, _d;
          try {
            const id = this.extractId(element);
            if (!id) return null;
            const name = ((_b = (_a = element.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "";
            const url = ((_c = element.querySelector(".nav")) == null ? void 0 : _c.getAttribute("href")) || "";
            const thumbnail = ((_d = element.querySelector(".thumbnail img")) == null ? void 0 : _d.src) || "";
            const favElement = element.querySelector(".item-stat.favs .count");
            const favoritesCount = favElement ? parseInt(favElement.textContent || "0", 10) || 0 : 0;
            return {
              id,
              name,
              url,
              thumbnail,
              favoritesCount
            };
          } catch (error) {
            console.error("解析商品基础信息失败:", error);
            return null;
          }
        }
        /**
         * 解析单个商品（完整数据）
         */
        parseItem(element) {
          const basic = this.parseItemBasic(element);
          if (!basic) return null;
          try {
            const tags = this.parseTags(element).map((t) => t.text);
            const variations = this.parseVariations(element).map((v) => v.data);
            return {
              ...basic,
              tags,
              variations
            };
          } catch (error) {
            console.error("解析商品完整数据失败:", error);
            return null;
          }
        }
      }
      class ProgressiveParser {
        constructor(parser) {
          __publicField(this, "parsed", /* @__PURE__ */ new WeakSet());
          // 已解析标记
          __publicField(this, "parser");
          this.parser = parser;
        }
        /**
         * 检查元素是否已解析
         */
        isParsed(element) {
          return this.parsed.has(element);
        }
        /**
         * 按需解析单个商品的完整数据
         * 返回解析后的数据结构（不修改原对象）
         */
        parseItem(element) {
          if (this.parsed.has(element)) return null;
          const itemData = this.parser.parseItem(element);
          if (!itemData) return null;
          this.parsed.add(element);
          return {
            data: itemData,
            variations: this.parser.parseVariations(element),
            tags: this.parser.parseTags(element)
          };
        }
        /**
         * 仅解析基础信息（不包含 variations 和 tags）
         * 用于快速初始化
         */
        parseBasicInfo(element) {
          const basicData = this.parser.parseItemBasic(element);
          if (!basicData) {
            return null;
          }
          return {
            ...basicData,
            tags: [],
            variations: []
          };
        }
        /**
         * 按需解析 variations（懒加载）
         */
        parseVariations(element) {
          return this.parser.parseVariations(element);
        }
        /**
         * 按需解析 tags（懒加载）
         */
        parseTags(element) {
          return this.parser.parseTags(element);
        }
        /**
         * 重置解析状态（用于调试或重新加载）
         */
        reset() {
          this.parsed = /* @__PURE__ */ new WeakSet();
        }
      }
      class ItemManageAPI extends BaseAPI {
        constructor() {
          super();
          __publicField(this, "_items", []);
          __publicField(this, "_parser");
          __publicField(this, "_progressiveParser");
          this._parser = new ItemManageParser();
        }
        /**
         * 判断是否应该在当前页面激活
         * 只在商品管理列表页面激活（不包括编辑页面）
         */
        shouldActivate() {
          const path = window.location.pathname;
          return (path === "/items" || path === "/items/") && !path.match(/\/items\/\d+\/(edit|edit_pre)/);
        }
        /**
         * 等待商品元素出现
         */
        waitForElements(timeout = 5e3) {
          return new Promise((resolve, reject) => {
            const selector = ".item-wrapper";
            if (document.querySelector(selector)) {
              resolve();
              return;
            }
            const observer = new MutationObserver(() => {
              if (document.querySelector(selector)) {
                clearTimeout(timer);
                observer.disconnect();
                resolve();
              }
            });
            const timer = setTimeout(() => {
              observer.disconnect();
              reject(new Error("等待商品元素超时"));
            }, timeout);
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          });
        }
        /**
         * 加载商品数据
         * ⚡ 性能优化：只收集元素引用，不解析数据
         */
        async load() {
          await this.waitForElements();
          const elements = document.querySelectorAll(".item-wrapper");
          this._items = Array.from(elements).map((element) => ({
            element,
            data: null,
            // 延迟解析
            variations: [],
            tags: [],
            variationsUl: element.querySelector(".dashboard-items-variation"),
            tagsUl: element.querySelector(".dashboard-items-tags")
          }));
          this._progressiveParser = new ProgressiveParser(this._parser);
        }
        /**
         * 按需解析商品数据
         * 在元素进入可视范围时调用
         */
        parseItemData(item) {
          if (!this._progressiveParser || item.data) return;
          const parsed = this._progressiveParser.parseItem(item.element);
          if (!parsed) return;
          item.data = parsed.data;
          item.variations = parsed.variations;
          item.tags = parsed.tags;
        }
        /**
         * 获取所有商品（包含数据和DOM元素）
         */
        getItems() {
          return [...this._items];
        }
        /**
         * 获取所有商品数据（只返回数据，不含DOM元素）
         * 注意：未解析的商品数据为 null
         */
        getItemsData() {
          return this._items.map((item) => item.data);
        }
        /**
         * 根据ID获取商品（包含数据和DOM元素）
         * 注意：需要先解析数据才能按ID查找
         */
        getItem(id) {
          return this._items.find((item) => {
            var _a;
            return ((_a = item.data) == null ? void 0 : _a.id) === id;
          });
        }
        /**
         * 根据ID获取商品数据（只返回数据）
         */
        getItemData(id) {
          var _a;
          return (_a = this._items.find((item) => {
            var _a2;
            return ((_a2 = item.data) == null ? void 0 : _a2.id) === id;
          })) == null ? void 0 : _a.data;
        }
        /**
         * 根据ID获取DOM元素
         */
        getItemElement(id) {
          var _a;
          return (_a = this._items.find((item) => {
            var _a2;
            return ((_a2 = item.data) == null ? void 0 : _a2.id) === id;
          })) == null ? void 0 : _a.element;
        }
        /**
         * 刷新数据（重新解析DOM）
         */
        refresh() {
          this.load();
        }
        /**
         * 复制商品标签到剪贴板
         */
        async copyItemTags(itemId) {
          const item = this.getItem(itemId);
          if (!(item == null ? void 0 : item.data)) {
            console.error(`未找到商品或数据未解析: ${itemId}`);
            return false;
          }
          if (item.data.tags.length === 0) {
            alert("没有找到标签");
            return false;
          }
          try {
            await navigator.clipboard.writeText(JSON.stringify(item.data.tags));
            return true;
          } catch (error) {
            console.error("复制标签失败:", error);
            return false;
          }
        }
      }
      class LazyLoadManager {
        constructor(items, api, options = {
          root: null,
          rootMargin: "200px",
          // 提前加载，但不要太激进
          threshold: 0.01
        }) {
          __publicField(this, "observer");
          __publicField(this, "itemMap", /* @__PURE__ */ new WeakMap());
          __publicField(this, "handlers", /* @__PURE__ */ new Map());
          __publicField(this, "processedMap", /* @__PURE__ */ new Map());
          __publicField(this, "pendingItems", []);
          __publicField(this, "rafId", null);
          __publicField(this, "api");
          this.api = api;
          items.forEach((item) => {
            this.itemMap.set(item.element, item);
          });
          this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const element = entry.target;
                const item = this.itemMap.get(element);
                if (item) {
                  this.pendingItems.push(item);
                }
              }
            });
            if (this.pendingItems.length > 0 && !this.rafId) {
              this.rafId = requestAnimationFrame(() => this.processPendingItems());
            }
          }, options);
          items.forEach((item) => {
            this.observer.observe(item.element);
          });
        }
        /**
         * 批量处理待处理的元素
         */
        processPendingItems() {
          const items = this.pendingItems.splice(0);
          this.rafId = null;
          items.forEach((item) => {
            if (!item.data) {
              this.api.parseItemData(item);
            }
            if (!item.data) return;
            this.handlers.forEach((handler, handlerId) => {
              const processedSet = this.processedMap.get(handlerId);
              if (!processedSet || processedSet.has(item.element)) return;
              handler(item);
              processedSet.add(item.element);
            });
          });
        }
        /**
         * 注册处理器
         * @param id 处理器唯一标识
         * @param handler 处理函数
         */
        registerHandler(id, handler) {
          this.handlers.set(id, handler);
          this.processedMap.set(id, /* @__PURE__ */ new WeakSet());
        }
        /**
         * 注销处理器
         */
        unregisterHandler(id) {
          this.handlers.delete(id);
          this.processedMap.delete(id);
        }
        /**
         * 清理观察器
         */
        destroy() {
          if (this.rafId) {
            cancelAnimationFrame(this.rafId);
          }
          this.observer.disconnect();
          this.handlers.clear();
          this.processedMap.clear();
          this.itemMap = /* @__PURE__ */ new WeakMap();
          this.pendingItems = [];
          this.rafId = null;
        }
      }
      class LazyLoadModule extends PageModule {
        constructor(api) {
          super(api);
          __publicField(this, "lazyLoadManager");
          __publicField(this, "handlerId");
          this.handlerId = this.constructor.name;
        }
        /**
         * PageModule 的 initialize 在这里不做任何事
         * 懒加载模块使用独立的生命周期
         */
        initialize() {
        }
        /**
         * 当 LazyLoadManager 准备好时调用
         */
        onLazyLoadReady(manager) {
          this.lazyLoadManager = manager;
          manager.registerHandler(
            this.handlerId,
            (item) => this.processItem(item)
          );
        }
        /**
         * 清理
         */
        destroy() {
          if (this.lazyLoadManager) {
            this.lazyLoadManager.unregisterHandler(this.handlerId);
          }
        }
      }
      class ItemActions extends LazyLoadModule {
        constructor(api) {
          super(api);
        }
        /**
         * 处理单个商品，添加操作按钮
         */
        processItem(itemElement) {
          try {
            const item = itemElement.element;
            if (item.querySelector(".tag-copy-btn") || item.querySelector(".item-delete-btn-x")) return;
            this.addDeleteButton(item);
            this.addCopyTagsButton(item);
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 添加删除按钮
         */
        addDeleteButton(item) {
          const itemId = item.getAttribute("data-id");
          if (!itemId) return;
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "item-delete-btn-x";
          deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
          deleteBtn.title = "删除商品";
          deleteBtn.onclick = async (e) => {
            e.preventDefault();
            await this.handleDeleteItem(item, itemId);
          };
          if (getComputedStyle(item).position === "static") {
            item.style.position = "relative";
          }
          this.injectDeleteButtonStyles();
          item.appendChild(deleteBtn);
        }
        /**
         * 注入删除按钮样式
         */
        injectDeleteButtonStyles() {
          if (document.getElementById("item-delete-btn-styles")) return;
          const style = document.createElement("style");
          style.id = "item-delete-btn-styles";
          style.textContent = `
            .item-delete-btn-x {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 10;
                width: 28px;
                height: 28px;
                padding: 0;
                border: none;
                border-radius: 50%;
                background-color: #fff;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .item-delete-btn-x svg {
                width: 16px;
                height: 16px;
                display: block;
            }

            .item-delete-btn-x:hover {
                background-color: #ff5252;
                color: #fff;
                box-shadow: 0 4px 8px rgba(255, 82, 82, 0.3);
                transform: scale(1.1);
            }

            .item-delete-btn-x:active {
                transform: scale(0.95);
            }
        `;
          document.head.appendChild(style);
        }
        /**
         * 添加复制标签按钮
         */
        addCopyTagsButton(item) {
          const tagList = item.querySelector(".dashboard-items-tags");
          const footerActions = item.querySelector(".dashboard-item-footer-actions");
          const itemId = item.getAttribute("data-id");
          if (tagList && footerActions && itemId) {
            const copyBtn = document.createElement("a");
            copyBtn.className = "btn calm small tag-copy-btn mr-8";
            copyBtn.innerHTML = "复制标签";
            copyBtn.onclick = async (e) => {
              e.preventDefault();
              const success = await this.api.copyItemTags(itemId);
              if (success) {
                Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
              }
            };
            footerActions.insertBefore(copyBtn, footerActions.firstChild);
          }
        }
        /**
         * 处理删除商品
         */
        async handleDeleteItem(item, itemId) {
          var _a, _b, _c;
          try {
            if (!confirm("确定要删除这个商品吗？此操作不可恢复。")) return;
            const itemName = ((_b = (_a = item.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "未知商品";
            if (!confirm(`再次确认删除商品：
${itemName}
ID: ${itemId}`)) return;
            const csrfToken = (_c = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _c.getAttribute("content");
            if (!csrfToken) {
              throw new Error("无法获取CSRF token");
            }
            const response = await fetch(`https://manage.booth.pm/items/${itemId}`, {
              method: "DELETE",
              headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "x-requested-with": "XMLHttpRequest",
                "x-csrf-token": csrfToken
              },
              referrer: window.location.href,
              referrerPolicy: "strict-origin-when-cross-origin",
              mode: "cors",
              credentials: "include"
            });
            if (response.ok) {
              item.remove();
            } else {
              const errorText = await response.text();
              console.log("删除失败响应:", errorText);
              throw new Error(`删除失败: ${response.status}
${errorText}`);
            }
          } catch (error) {
            handleError(error, () => {
              alert("删除商品失败，请刷新页面重试");
            });
          }
        }
      }
      class ItemCollapse extends LazyLoadModule {
        // 缓存标签 header
        constructor(api) {
          super(api);
          __publicField(this, "stylesInjected", false);
          __publicField(this, "eventDelegateSetup", false);
          __publicField(this, "tagHeaderCache", null);
        }
        /**
         * 快速千分位格式化（比 toLocaleString 快 10 倍）
         */
        static formatNumber(num) {
          if (num < 1e3) return num.toString();
          const str = num.toString();
          const len = str.length;
          const mod = len % 3;
          let result = mod > 0 ? str.slice(0, mod) : "";
          for (let i = mod; i < len; i += 3) {
            if (result) result += ",";
            result += str.slice(i, i + 3);
          }
          return result;
        }
        initialize() {
          this.injectStyles();
          this.setupEventDelegate();
          super.initialize();
        }
        /**
         * 使用事件委托代替每个 header 的独立事件监听器
         */
        setupEventDelegate() {
          if (this.eventDelegateSetup) return;
          this.eventDelegateSetup = true;
          document.addEventListener("click", (e) => {
            var _a;
            const target = e.target;
            const header = target.closest(".item-collapse-header");
            if (!header) return;
            const targetElement = header.nextElementSibling;
            if (!targetElement) return;
            const icon = (_a = header.firstElementChild) == null ? void 0 : _a.firstElementChild;
            if (icon) {
              const isCollapsed = targetElement.classList.contains("collapsed");
              targetElement.classList.toggle("collapsed", !isCollapsed);
              icon.classList.toggle("collapsed", !isCollapsed);
            }
          }, { passive: true });
        }
        /**
         * 处理单个商品，添加折叠功能
         */
        processItem(itemElement) {
          var _a, _b, _c, _d;
          try {
            const { variationsUl, tagsUl, variations } = itemElement;
            if (variationsUl && variations.length > 0 && !((_a = variationsUl.previousElementSibling) == null ? void 0 : _a.classList.contains("item-collapse-header"))) {
              const header = this.createVariationHeader(itemElement);
              (_b = variationsUl.parentElement) == null ? void 0 : _b.insertBefore(header, variationsUl);
              variationsUl.classList.add("item-collapsible", "collapsed");
            }
            if (tagsUl && itemElement.tags.length > 0 && !((_c = tagsUl.previousElementSibling) == null ? void 0 : _c.classList.contains("item-collapse-header"))) {
              const header = this.createTagHeader();
              (_d = tagsUl.parentElement) == null ? void 0 : _d.insertBefore(header, tagsUl);
              tagsUl.classList.add("item-collapsible", "collapsed");
            }
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 创建基础折叠标题（使用 innerHTML 减少 DOM 操作）
         */
        createBaseHeader(title, badgesHTML) {
          const header = document.createElement("div");
          header.className = "item-collapse-header";
          header.innerHTML = `
            <div class="item-collapse-title">
                <span class="item-collapse-icon collapsed">▼</span>
                <span>${title}</span>
            </div>
            ${badgesHTML ? `<div class="item-collapse-badges">${badgesHTML}</div>` : ""}
        `;
          return header;
        }
        /**
         * 创建变体列表折叠标题（优化统计计算）
         */
        createVariationHeader(itemElement) {
          const { variations } = itemElement;
          let totalSales = 0;
          let totalRevenue = 0;
          const count = variations.length;
          for (let i = 0; i < count; i++) {
            totalSales += variations[i].data.salesCount;
            totalRevenue += variations[i].data.revenue;
          }
          const badgesHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${ItemCollapse.formatNumber(totalRevenue)}</strong></span>
        `;
          return this.createBaseHeader("变体列表", badgesHTML);
        }
        /**
         * 创建标签列表折叠标题（使用缓存）
         */
        createTagHeader() {
          if (!this.tagHeaderCache) {
            this.tagHeaderCache = this.createBaseHeader("标签列表");
          }
          return this.tagHeaderCache.cloneNode(true);
        }
        /**
         * 注入样式表
         */
        injectStyles() {
          if (this.stylesInjected) {
            return;
          }
          this.stylesInjected = true;
          const style = document.createElement("style");
          style.id = "booth-item-collapse-styles";
          style.textContent = `
            /* 折叠图标样式 */
            .item-collapse-icon {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                font-size: 10px;
                color: #666;
                flex-shrink: 0;
            }

            .item-collapse-icon.collapsed {
                transform: rotate(-90deg);
            }

            /* 折叠容器样式 - 无动画，直接隐藏 */
            .item-collapsible {
                contain: layout style paint; /* 限制重排范围 */
            }

            .item-collapsible.collapsed {
                display: none !important;
            }

            /* 折叠标题容器 - 无动画 */
            .item-collapse-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 13px;
                color: #333;
                user-select: none;
                border-bottom: 1px solid #e0e0e0;
                cursor: pointer;
                gap: 12px;
                contain: layout style paint;
            }
            
            @media (hover: hover) {
                .item-collapse-header:hover {
                    background-color: #f5f5f5;
                }
            }
            
            .item-collapse-header:first-of-type {
                margin-top: 8px;
            }

            /* 标题部分 */
            .item-collapse-title {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }

            /* Badges 容器 */
            .item-collapse-badges {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            /* Badge 基础样式 */
            .item-badge {
                padding: 4px 10px;
                font-size: 11px;
                border-radius: 12px;
                white-space: nowrap;
            }

            .item-badge strong {
                font-weight: 600;
            }

            /* Badge 变体数量 */
            .item-badge-count {
                background-color: #e3f2fd;
                color: #1976d2;
            }

            /* Badge 销量 */
            .item-badge-sales {
                background-color: #f3e5f5;
                color: #7b1fa2;
            }

            /* Badge 收益 */
            .item-badge-revenue {
                background-color: #e8f5e9;
                color: #388e3c;
            }
        `;
          document.head.appendChild(style);
        }
      }
      class ItemNavigation extends PageModule {
        // 过滤后的商品列表
        constructor(api) {
          super(api);
          __publicField(this, "navigationContainer", null);
          __publicField(this, "toggleButton", null);
          __publicField(this, "items", []);
          __publicField(this, "isExpanded", false);
          __publicField(this, "searchInput", null);
          __publicField(this, "isScrolling", false);
          __publicField(this, "scrollTimeout", null);
          __publicField(this, "hoverTimeout", null);
          // 虚拟列表相关
          __publicField(this, "virtualScrollContainer", null);
          __publicField(this, "virtualContentWrapper", null);
          __publicField(this, "itemHeight", 60);
          // 每个导航项的高度
          __publicField(this, "bufferSize", 5);
          // 上下缓冲区的元素数量
          __publicField(this, "visibleRange", { start: 0, end: 0 });
          __publicField(this, "renderedItems", /* @__PURE__ */ new Map());
          // 已渲染的元素缓存
          __publicField(this, "filteredItems", []);
        }
        /**
         * 初始化：立即创建导航栏框架，然后异步解析数据
         */
        initialize() {
          if (document.querySelector(".item-navigation")) {
            return;
          }
          this.injectStyles();
          this.items = this.api.getItems();
          if (this.items.length === 0) return;
          this.createToggleButton();
          this.createNavigationContainer();
          this.setupScrollListener();
          setTimeout(() => {
            this.showLoadingState();
          }, 0);
          this.parseAndPopulateItems();
        }
        /**
         * 分批解析商品数据并填充导航栏
         */
        async parseAndPopulateItems() {
          const batchSize = 20;
          for (let i = 0; i < this.items.length; i += batchSize) {
            const batch = this.items.slice(i, i + batchSize);
            batch.forEach((item) => {
              if (!item.data) {
                this.api.parseItemData(item);
              }
            });
            if (i + batchSize < this.items.length) {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
          this.hideLoadingState();
          this.createNavigationItems();
        }
        /**
         * 显示加载状态
         */
        showLoadingState() {
          var _a;
          const container = (_a = this.navigationContainer) == null ? void 0 : _a.querySelector(".navigation-items-container");
          if (!container) return;
          const loadingState = document.createElement("div");
          loadingState.className = "navigation-loading-state";
          loadingState.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #666;
            font-size: 14px;
        `;
          loadingState.innerHTML = `
            <div style="margin-bottom: 8px;">正在加载商品...</div>
            <div style="font-size: 12px; color: #999;">0 / ${this.items.length}</div>
        `;
          container.appendChild(loadingState);
        }
        /**
         * 隐藏加载状态
         */
        hideLoadingState() {
          var _a;
          const container = (_a = this.navigationContainer) == null ? void 0 : _a.querySelector(".navigation-items-container");
          if (!container) return;
          const loadingState = container.querySelector(".navigation-loading-state");
          loadingState == null ? void 0 : loadingState.remove();
        }
        /**
         * 创建虚拟列表容器
         */
        createNavigationItems() {
          if (!this.navigationContainer) return;
          const itemsContainer = this.navigationContainer.querySelector(".navigation-items-container");
          if (!itemsContainer) return;
          itemsContainer.innerHTML = "";
          if (this.items.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.className = "navigation-empty-state";
            emptyState.textContent = "暂无商品";
            itemsContainer.appendChild(emptyState);
            return;
          }
          this.virtualScrollContainer = itemsContainer;
          this.virtualScrollContainer.style.cssText = `
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            height: 100%;
        `;
          this.virtualContentWrapper = document.createElement("div");
          this.virtualContentWrapper.style.cssText = `
            position: relative;
            height: ${this.items.length * this.itemHeight}px;
        `;
          this.virtualScrollContainer.appendChild(this.virtualContentWrapper);
          this.filteredItems = this.items;
          this.setupVirtualScroll();
          this.updateVisibleItems();
        }
        /**
         * 设置虚拟滚动监听
         */
        setupVirtualScroll() {
          if (!this.virtualScrollContainer) return;
          let rafId = null;
          this.virtualScrollContainer.addEventListener("scroll", () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
              this.updateVisibleItems();
              rafId = null;
            });
          }, { passive: true });
        }
        /**
         * 更新可见区域的元素
         */
        updateVisibleItems() {
          if (!this.virtualScrollContainer || !this.virtualContentWrapper) return;
          const scrollTop = this.virtualScrollContainer.scrollTop;
          const containerHeight = this.virtualScrollContainer.clientHeight;
          const totalItems = this.filteredItems.length;
          const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
          const end = Math.min(
            totalItems - 1,
            Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
          );
          if (start === this.visibleRange.start && end === this.visibleRange.end) {
            return;
          }
          this.visibleRange = { start, end };
          this.renderedItems.forEach((element, index) => {
            if (index < start || index > end) {
              element.remove();
              this.renderedItems.delete(index);
            }
          });
          for (let i = start; i <= end; i++) {
            if (!this.renderedItems.has(i)) {
              const itemElement = this.filteredItems[i];
              if (!itemElement.data) continue;
              const navItem = this.createNavigationItem(itemElement, i);
              this.renderedItems.set(i, navItem);
              this.virtualContentWrapper.appendChild(navItem);
            }
          }
        }
        /**
         * 创建单个导航项元素
         */
        createNavigationItem(itemElement, index) {
          const { element, variations } = itemElement;
          const data = itemElement.data;
          const variationCount = variations.length;
          let salesCount = 0;
          for (let i = 0; i < variationCount; i++) {
            salesCount += variations[i].data.salesCount;
          }
          const favoritesCount = data.favoritesCount;
          const navItem = document.createElement("div");
          navItem.className = "navigation-item";
          navItem.setAttribute("data-item-id", data.id);
          navItem.style.cssText = `
            position: absolute;
            top: ${index * this.itemHeight}px;
            left: 0;
            right: 0;
            height: ${this.itemHeight}px;
        `;
          const thumbnailContainer = document.createElement("div");
          thumbnailContainer.className = "navigation-thumbnail";
          if (data.thumbnail) {
            const img = document.createElement("img");
            img.src = data.thumbnail;
            img.onerror = () => {
              thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
            };
            thumbnailContainer.appendChild(img);
          } else {
            thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
          }
          const itemInfo = document.createElement("div");
          itemInfo.className = "navigation-item-info";
          const nameRow = document.createElement("div");
          nameRow.className = "navigation-item-name-row";
          const nameSpan = document.createElement("span");
          nameSpan.className = "navigation-item-name";
          nameSpan.textContent = data.name;
          const countSpan = document.createElement("span");
          countSpan.className = "navigation-item-variant-count";
          countSpan.textContent = `${variationCount}变体`;
          nameRow.appendChild(nameSpan);
          nameRow.appendChild(countSpan);
          const statsRow = document.createElement("div");
          statsRow.className = "navigation-item-stats-row";
          const statsLeft = document.createElement("div");
          statsLeft.className = "navigation-item-stats-left";
          const salesSpan = document.createElement("span");
          salesSpan.className = `navigation-item-sales ${salesCount > 0 ? "has-sales" : "no-sales"}`;
          salesSpan.textContent = `销量: ${salesCount}`;
          const favsSpan = document.createElement("span");
          favsSpan.className = `navigation-item-favorites ${favoritesCount > 0 ? "has-favorites" : "no-favorites"}`;
          favsSpan.innerHTML = `<span style="color: inherit;">❤️</span> ${favoritesCount}`;
          statsLeft.appendChild(salesSpan);
          statsLeft.appendChild(favsSpan);
          const indexSpan = document.createElement("span");
          indexSpan.className = "navigation-item-index";
          indexSpan.textContent = `#${index + 1}`;
          statsRow.appendChild(statsLeft);
          statsRow.appendChild(indexSpan);
          itemInfo.appendChild(statsRow);
          itemInfo.appendChild(nameRow);
          navItem.appendChild(thumbnailContainer);
          navItem.appendChild(itemInfo);
          navItem.onclick = () => this.scrollToItem(element, navItem);
          return navItem;
        }
        /**
         * 注入样式表
         */
        injectStyles() {
          if (document.querySelector("#booth-navigation-styles")) return;
          const style = document.createElement("style");
          style.id = "booth-navigation-styles";
          style.textContent = `
            .navigation-toggle-button {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
                width: 30px;
                height: 60px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 8px 0 0 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
                z-index: 999;
                font-size: 12px;
                color: #666;
            }

            .navigation-toggle-button:hover {
                background: #f8f9fa;
                box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
            }

            .item-navigation {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%) translateX(100%);
                width: 400px;
                min-width: 300px;
                max-width: 500px;
                height: 80vh;
                max-height: 80vh;
                z-index: 1000;
                transition: transform 0.3s ease;
                pointer-events: none;
                box-sizing: border-box;
            }

            .item-navigation.expanded {
                transform: translateY(-50%) translateX(0);
            }

            .navigation-content {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 12px 0 0 12px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
                pointer-events: auto;
            }

            /* 导航项样式 */
            .navigation-item {
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                display: flex;
                align-items: center;
                gap: 8px;
                box-sizing: border-box;
            }

            /* 导航项hover效果 */
            .navigation-item:hover:not(.active) {
                background-color: #f8f9fa;
                border-color: #e9ecef;
            }

            /* 导航项active状态 */
            .navigation-item.active {
                background-color: #e3f2fd !important;
                border-left-color: #2196f3 !important;
                border-color: #bbdefb !important;
            }

            /* PC端：hover显示（通过JavaScript处理，这里只处理样式） */
            @media (hover: hover) and (pointer: fine) {
                .item-navigation:hover {
                    pointer-events: auto;
                }
            }

            /* 移动端：点击切换 */
            @media (max-width: 768px) {
                .item-navigation {
                    width: 100%;
                    max-width: 400px;
                    height: 70vh;
                    max-height: 70vh;
                }

                .navigation-toggle-button {
                    width: 40px;
                    height: 60px;
                }
            }

            /* 小屏幕移动端 */
            @media (max-width: 480px) {
                .item-navigation {
                    width: 100%;
                    height: 85vh;
                    max-height: 85vh;
                    top: 50%;
                    transform: translateY(-50%) translateX(100%);
                }

                .item-navigation.expanded {
                    transform: translateY(-50%) translateX(0);
                }
            }

            /* 头部样式 */
            .navigation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
                pointer-events: auto;
            }

            .navigation-header-title {
            font-weight: 600;
            color: #333;
            font-size: 14px;
            }

            /* 关闭按钮样式 */
            .navigation-close-button {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
                font-size: 20px;
                line-height: 1;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .navigation-close-button:hover {
                background-color: #e0e0e0;
                color: #333;
            }

            /* 搜索容器样式 */
            .navigation-search {
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
            flex-shrink: 0;
            width: 100%;
                min-width: 0;
                box-sizing: border-box;
                display: block;
            }

            /* 搜索输入框样式 */
            .navigation-search-input {
                width: 100% !important;
                height: 32px;
            padding: 8px 12px;
                margin: 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
                box-sizing: border-box;
                line-height: 1;
                display: block;
                max-width: none;
                min-width: 0;
            }

            .navigation-search-input:focus {
                border-color: #2196f3;
            }

            /* 列表容器样式 */
            .navigation-items-container {
            flex: 1;
            overflow-y: auto;
            padding: 4px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: #ccc #f5f5f5;
            }

            /* 空状态样式 */
            .navigation-empty-state {
                text-align: center;
                color: #666;
                padding: 20px;
                font-style: italic;
            }

            /* 缩略图容器样式 */
            .navigation-thumbnail {
                width: 40px;
                height: 40px;
                flex-shrink: 0;
                border-radius: 4px;
                overflow: hidden;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .navigation-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* 商品信息容器样式 */
            .navigation-item-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
                min-width: 0;
            }

            .navigation-item-name-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
            }

            .navigation-item-name {
                flex: 1;
                margin-right: 6px;
                font-weight: 500;
                font-size: 11px;
                line-height: 1.3;
                word-wrap: break-word;
                min-width: 0;
            }

            .navigation-item-variant-count {
                color: #666;
                font-size: 9px;
                flex-shrink: 0;
                background: #f0f0f0;
                padding: 1px 4px;
                border-radius: 8px;
            }

            .navigation-item-stats-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                color: #666;
            }

            .navigation-item-stats-left {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .navigation-item-sales {
                font-weight: 500;
            }

            .navigation-item-sales.has-sales {
                color: #28a745;
            }

            .navigation-item-sales.no-sales {
                color: #999;
            }

            .navigation-item-favorites {
                font-weight: 500;
            }

            .navigation-item-favorites.has-favorites {
                color: #f48fb1;
            }

            .navigation-item-favorites.no-favorites {
                color: #999;
            }

            .navigation-item-index {
                color: #999;
                font-size: 9px;
            }
        `;
          document.head.appendChild(style);
        }
        /**
         * 创建独立的切换按钮
         */
        createToggleButton() {
          if (document.querySelector(".navigation-toggle-button")) return;
          this.toggleButton = document.createElement("div");
          this.toggleButton.className = "navigation-toggle-button";
          this.toggleButton.innerHTML = "◀";
          this.toggleButton.onclick = (e) => {
            e.stopPropagation();
            this.toggleNavigation();
          };
          this.toggleButton.onmouseenter = () => {
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
              this.showNavigation();
            }
          };
          document.body.appendChild(this.toggleButton);
        }
        /**
         * 创建导航栏容器
         */
        createNavigationContainer() {
          this.navigationContainer = document.createElement("div");
          this.navigationContainer.className = "item-navigation";
          this.createContentContainer();
          document.body.appendChild(this.navigationContainer);
          this.setupPCHoverBehavior();
        }
        /**
         * 设置PC端hover行为
         */
        setupPCHoverBehavior() {
          if (!this.navigationContainer || !this.toggleButton) return;
          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            return;
          }
          this.navigationContainer.onmouseenter = () => {
            if (this.hoverTimeout) {
              clearTimeout(this.hoverTimeout);
              this.hoverTimeout = null;
            }
          };
          this.navigationContainer.onmouseleave = () => {
            if (this.hoverTimeout) {
              clearTimeout(this.hoverTimeout);
            }
            this.hoverTimeout = window.setTimeout(() => {
              const buttonRect = this.toggleButton.getBoundingClientRect();
              const mouseX = window.lastMouseX || 0;
              const mouseY = window.lastMouseY || 0;
              if (!(mouseX >= buttonRect.left && mouseX <= buttonRect.right && mouseY >= buttonRect.top && mouseY <= buttonRect.bottom)) {
                this.hideNavigation();
              }
            }, 200);
          };
          document.addEventListener("mousemove", (e) => {
            window.lastMouseX = e.clientX;
            window.lastMouseY = e.clientY;
          });
        }
        /**
         * 创建内容容器
         */
        createContentContainer() {
          const contentContainer = document.createElement("div");
          contentContainer.className = "navigation-content";
          const header = document.createElement("div");
          header.className = "navigation-header";
          const title = document.createElement("div");
          title.className = "navigation-header-title";
          title.textContent = `商品导航 (${this.items.length})`;
          header.appendChild(title);
          const closeButton = document.createElement("div");
          closeButton.className = "navigation-close-button";
          closeButton.innerHTML = "×";
          closeButton.onclick = () => {
            this.hideNavigation();
          };
          header.appendChild(closeButton);
          const searchContainer = document.createElement("div");
          searchContainer.className = "navigation-search";
          this.searchInput = document.createElement("input");
          this.searchInput.type = "text";
          this.searchInput.className = "navigation-search-input";
          this.searchInput.placeholder = "搜索商品...";
          this.searchInput.oninput = () => this.filterItems();
          searchContainer.appendChild(this.searchInput);
          const itemsContainer = document.createElement("div");
          itemsContainer.className = "navigation-items-container";
          if (!document.querySelector("#navigation-scrollbar-style")) {
            const style = document.createElement("style");
            style.id = "navigation-scrollbar-style";
            style.textContent = `
                .navigation-items-container::-webkit-scrollbar {
                    width: 6px;
                }
                .navigation-items-container::-webkit-scrollbar-track {
                    background: #f5f5f5;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb:hover {
                    background: #999;
                }
            `;
            document.head.appendChild(style);
          }
          contentContainer.appendChild(header);
          contentContainer.appendChild(searchContainer);
          contentContainer.appendChild(itemsContainer);
          this.navigationContainer.appendChild(contentContainer);
        }
        /**
         * 切换导航栏状态（移动端使用）
         */
        toggleNavigation() {
          if (!this.navigationContainer) return;
          this.isExpanded = !this.isExpanded;
          if (this.isExpanded) {
            this.showNavigation();
          } else {
            this.hideNavigation();
          }
        }
        /**
         * 显示导航栏
         */
        showNavigation() {
          if (!this.navigationContainer) return;
          this.navigationContainer.classList.add("expanded");
          this.navigationContainer.style.pointerEvents = "auto";
          this.isExpanded = true;
          if (this.toggleButton) {
            this.toggleButton.innerHTML = "▶";
          }
        }
        /**
         * 隐藏导航栏
         */
        hideNavigation() {
          if (!this.navigationContainer) return;
          this.navigationContainer.classList.remove("expanded");
          this.navigationContainer.style.pointerEvents = "none";
          this.isExpanded = false;
          if (this.toggleButton) {
            this.toggleButton.innerHTML = "◀";
          }
        }
        /**
         * 过滤商品（基于搜索词显示/隐藏导航项）
         */
        /**
         * 过滤商品（虚拟列表版本）
         */
        filterItems() {
          if (!this.searchInput || !this.virtualContentWrapper) return;
          const searchTerm = this.searchInput.value.toLowerCase().trim();
          if (searchTerm === "") {
            this.filteredItems = this.items;
          } else {
            this.filteredItems = this.items.filter((item) => {
              if (!item.data) return false;
              const name = item.data.name.toLowerCase();
              const id = item.data.id.toLowerCase();
              return name.includes(searchTerm) || id.includes(searchTerm);
            });
          }
          this.virtualContentWrapper.style.height = `${this.filteredItems.length * this.itemHeight}px`;
          this.renderedItems.forEach((element) => element.remove());
          this.renderedItems.clear();
          if (this.virtualScrollContainer) {
            this.virtualScrollContainer.scrollTop = 0;
          }
          this.visibleRange = { start: 0, end: 0 };
          this.updateVisibleItems();
        }
        /**
         * 滚动到指定商品
         */
        scrollToItem(item, navItem) {
          try {
            if (this.scrollTimeout) {
              clearTimeout(this.scrollTimeout);
            }
            this.setActiveItem(navItem);
            this.isScrolling = true;
            if (window.matchMedia("(max-width: 768px)").matches && !this.isExpanded) {
              this.showNavigation();
            }
            item.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            this.scrollTimeout = window.setTimeout(() => {
              this.highlightItem(item);
              this.setActiveItem(navItem);
              this.isScrolling = false;
              this.scrollTimeout = null;
            }, 800);
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 设置活跃商品
         */
        setActiveItem(activeNavItem) {
          var _a;
          (_a = this.navigationContainer) == null ? void 0 : _a.querySelectorAll(".navigation-item").forEach((el) => {
            el.classList.remove("active");
          });
          activeNavItem.classList.add("active");
        }
        /**
         * 高亮商品
         */
        highlightItem(item) {
          item.style.outline = "2px solid #2196f3";
          item.style.outlineOffset = "2px";
          item.style.transition = "outline 0.3s ease";
          setTimeout(() => {
            item.style.outline = "";
            item.style.outlineOffset = "";
          }, 3e3);
        }
        /**
         * 设置滚动监听
         */
        setupScrollListener() {
          let ticking = false;
          const updateActiveItem = () => {
            if (!this.navigationContainer || this.isScrolling) return;
            const windowHeight = window.innerHeight;
            let activeItem = null;
            let minDistance = Infinity;
            const currentItems = Array.from(document.querySelectorAll(".item-wrapper"));
            currentItems.forEach((item) => {
              const rect = item.getBoundingClientRect();
              if (rect.top < windowHeight && rect.bottom > 0) {
                const itemCenter = rect.top + rect.height / 2;
                const screenCenter = windowHeight / 2;
                const distance = Math.abs(itemCenter - screenCenter);
                if (distance < minDistance) {
                  minDistance = distance;
                  activeItem = item;
                }
              }
            });
            if (activeItem) {
              const itemId = activeItem.getAttribute("data-id");
              if (itemId) {
                const activeNavItem = this.navigationContainer.querySelector(`[data-item-id="${itemId}"]`);
                if (activeNavItem instanceof HTMLElement) {
                  this.setActiveItem(activeNavItem);
                }
              }
            }
            ticking = false;
          };
          const onScroll = () => {
            if (!ticking) {
              requestAnimationFrame(updateActiveItem);
              ticking = true;
            }
          };
          window.addEventListener("scroll", onScroll);
          this.scrollListener = onScroll;
        }
      }
      class VariationNumbers extends LazyLoadModule {
        constructor(api) {
          super(api);
        }
        /**
         * 处理单个商品，添加变体序号
         */
        processItem(itemElement) {
          try {
            const { element, variationsUl, variations } = itemElement;
            if (!variationsUl || variations.length === 0) return;
            this.addNumbersToVariations(variations);
            this.setupVariationObserver(element, variationsUl, variations);
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 为变体添加序号（使用 API 的 variations）
         */
        addNumbersToVariations(variations) {
          variations.forEach((variationElement, index) => {
            const labelArea = variationElement.element.querySelector(".dashboard-items-variation-label");
            if (!labelArea) return;
            let numberSpan = variationElement.element.querySelector(".variation-number");
            if (!numberSpan) {
              numberSpan = document.createElement("span");
              numberSpan.className = "variation-number";
              numberSpan.style.cssText = "margin-right: 8px; color: #666;";
              labelArea.insertBefore(numberSpan, labelArea.firstChild);
            }
            numberSpan.textContent = `#${index + 1}`;
          });
        }
        /**
         * 设置变体列表观察器（使用 API 的 variations）
         */
        setupVariationObserver(item, variationList, variations) {
          const observer = new MutationObserver(Utils.throttle((_mutations, _observer) => {
            const needsUpdate = variations.some((variationElement, index) => {
              const numberSpan = variationElement.element.querySelector(".variation-number");
              return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
            });
            if (needsUpdate) {
              requestAnimationFrame(() => this.addNumbersToVariations(variations));
            }
          }, Config.throttleDelay));
          observer.observe(variationList, {
            childList: true,
            subtree: false
          });
          item.variationObserver = observer;
        }
      }
      class ItemManageFeature extends PageFeature {
        constructor(context) {
          super(context);
          __publicField(this, "modules", []);
          __publicField(this, "lazyLoadModules", []);
          __publicField(this, "lazyLoadManager");
        }
        shouldExecute() {
          return this.path === "/items" || this.path === "/items/";
        }
        createAPI() {
          return new ItemManageAPI();
        }
        async initialize() {
          if (!this.api) return;
          this.lazyLoadModules = [
            new ItemActions(this.api),
            new VariationNumbers(this.api),
            new ItemCollapse(this.api)
          ];
          this.modules = [
            ...this.lazyLoadModules,
            new ItemNavigation(this.api)
            // ItemNavigation 立即加载
          ];
          this.api.onReady(() => {
            this.lazyLoadManager = new LazyLoadManager(this.api.getItems(), this.api);
            this.lazyLoadModules.forEach((module) => {
              module.onLazyLoadReady(this.lazyLoadManager);
            });
          });
        }
        /**
         * 清理资源
         */
        destroy() {
          var _a;
          (_a = this.lazyLoadManager) == null ? void 0 : _a.destroy();
          this.modules.forEach((module) => {
            if (typeof module.destroy === "function") {
              module.destroy();
            }
          });
          this.modules = [];
          this.lazyLoadModules = [];
        }
      }
      class SessionAPI extends BaseAPI {
        constructor() {
          super();
        }
        /**
         * 判断是否应该在当前页面激活
         * Session API 在所有页面都可用
         */
        shouldActivate() {
          return true;
        }
        /**
         * 加载数据（Session API 不需要预加载）
         */
        load() {
        }
        /**
         * 从响应头中提取 Cookie 信息
         */
        extractCookieInfo(headers) {
          var _a, _b;
          const cookieHeader = headers.split("\n").find((line) => line.toLowerCase().startsWith("set-cookie:") && line.includes("_plaza_session_nktz7u="));
          if (!cookieHeader) return null;
          const value = cookieHeader.split(";")[0].split("=").slice(1).join("=").trim();
          const expires = (_b = (_a = cookieHeader.match(/expires=([^;]+)/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.trim();
          return {
            value,
            expires: expires ? new Date(expires).toISOString() : null
          };
        }
        /**
         * 获取 Booth Session
         * @returns Promise<SessionResult> Session 数据或错误信息
         */
        async getSession() {
          return new Promise((resolve) => {
            _GM_xmlhttpRequest({
              method: "GET",
              url: "https://manage.booth.pm/orders",
              headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
              },
              onload: (response) => {
                const cookieInfo = this.extractCookieInfo(response.responseHeaders);
                if (cookieInfo) {
                  const sessionData = {
                    _plaza_session_nktz7u: cookieInfo.value,
                    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
                    expires_at: cookieInfo.expires
                  };
                  resolve({
                    success: true,
                    data: sessionData
                  });
                } else {
                  resolve({
                    success: false,
                    error: "未找到有效的 Session"
                  });
                }
              },
              onerror: (error) => {
                resolve({
                  success: false,
                  error: `请求出错: ${error.error || "网络错误"}`
                });
              }
            });
          });
        }
        /**
         * 获取 Session 并格式化为 JSON 字符串
         * @returns Promise<string | null> JSON 格式的 Session 数据
         */
        async getSessionJSON() {
          const result = await this.getSession();
          if (result.success && result.data) {
            return JSON.stringify(result.data, null, 2);
          }
          return null;
        }
      }
      class SessionFeature extends PageFeature {
        constructor(context) {
          super(context);
        }
        shouldExecute() {
          return true;
        }
        createAPI() {
          return new SessionAPI();
        }
        async initialize() {
          _GM_registerMenuCommand("获取Booth Session", () => this.getSessionAndCopy());
        }
        /**
         * 获取通知文本
         */
        getNotificationText(expiresAt) {
          if (expiresAt) {
            const expiryDate = new Date(expiresAt).toLocaleString();
            return `Session已复制
过期时间: ${expiryDate}`;
          }
          return "Session已复制到剪贴板";
        }
        /**
         * 获取 Session 并复制到剪贴板
         */
        async getSessionAndCopy() {
          const api = this.getAPI();
          if (!api) return;
          const result = await api.getSession();
          if (result.success && result.data) {
            const jsonData = JSON.stringify(result.data, null, 2);
            _GM_setClipboard(jsonData, "Booth Session");
            _GM_notification({
              text: this.getNotificationText(result.data.expires_at),
              title: "获取成功",
              timeout: 3e3
            });
          } else {
            _GM_notification({
              text: result.error || "未找到有效的 Session",
              title: "获取失败",
              timeout: 3e3
            });
          }
        }
      }
      class BoothEnhancer {
        constructor() {
          __publicField(this, "context", {
            observers: /* @__PURE__ */ new Map(),
            cachedElements: /* @__PURE__ */ new Map()
          });
          __publicField(this, "features", [
            // new OrderAnalysisFeature(this.context),
            new ItemEditFeature(this.context),
            new ItemManageFeature(this.context),
            new SessionFeature(this.context)
          ]);
        }
        async init() {
          try {
            for (const feature of this.features) {
              try {
                if (feature.shouldExecute()) {
                  await feature.execute();
                }
              } catch (error) {
                handleError(error);
              }
            }
          } catch (error) {
            handleError(error, () => {
              console.error("Booth Enhancer 启动失败");
            });
          }
        }
      }
      new BoothEnhancer().init();

    })
  };
}));

System.register("./TagTab-B08_OccJ-C0hC7lug.js", ['vue', './useTreeTab-DjEliPpp-Ci_pUV8Q.js', './__monkey.entry-CNjZeeHM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createCommentVNode, createElementVNode, Fragment, renderList, toDisplayString, withModifiers, withDirectives, withKeys, vModelText, createTextVNode, useTreeTab, Tree, tagSearchFilter, _export_sfc, useStorage, withSize, icons, Modal;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      computed = module.computed;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createVNode = module.createVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createCommentVNode = module.createCommentVNode;
      createElementVNode = module.createElementVNode;
      Fragment = module.Fragment;
      renderList = module.renderList;
      toDisplayString = module.toDisplayString;
      withModifiers = module.withModifiers;
      withDirectives = module.withDirectives;
      withKeys = module.withKeys;
      vModelText = module.vModelText;
      createTextVNode = module.createTextVNode;
    }, module => {
      useTreeTab = module.u;
      Tree = module.T;
      tagSearchFilter = module.t;
    }, module => {
      _export_sfc = module._;
      useStorage = module.u;
      withSize = module.w;
      icons = module.i;
      Modal = module.M;
    }],
    execute: (function () {

      const _hoisted_1 = { class: "tag-preset-tab" };
      const _hoisted_2 = {
        key: 0,
        class: "tag-custom-content"
      };
      const _hoisted_3 = { class: "tag-badges-wrapper" };
      const _hoisted_4 = { class: "tag-text" };
      const _hoisted_5 = ["onClick"];
      const _hoisted_6 = ["innerHTML"];
      const _hoisted_7 = { key: 0 };
      const _hoisted_8 = { key: 1 };
      const _hoisted_9 = { class: "form-group" };
      const _hoisted_10 = { class: "form-group" };
      const _hoisted_11 = { key: 2 };
      const _hoisted_12 = { key: 3 };
      const _hoisted_13 = { class: "modal-message" };
      const _hoisted_14 = { key: 4 };
      const _hoisted_15 = {
        key: 0,
        class: "modal-message-with-margin"
      };
      const _hoisted_16 = ["placeholder"];
      const _hoisted_17 = { key: 5 };
      const _hoisted_18 = {
        key: 0,
        class: "modal-message-with-margin"
      };
      const _hoisted_19 = ["placeholder"];
      const _hoisted_20 = { key: 6 };
      const _hoisted_21 = { class: "modal-message" };
      const _hoisted_22 = ["innerHTML"];
      const _hoisted_23 = ["innerHTML"];
      const _hoisted_24 = ["innerHTML"];
      const _hoisted_25 = ["innerHTML"];
      const _hoisted_26 = ["innerHTML"];
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "TagTab",
        props: {
          api: {}
        },
        setup(__props) {
          const props = __props;
          const { data, createNode, renameNode } = useStorage();
          const tree = computed(() => data.value.tagTree);
          function hasTags(node) {
            var _a;
            if (!node) return false;
            return ((_a = node.data) == null ? void 0 : _a.tags) && Array.isArray(node.data.tags) && node.data.tags.length > 0;
          }
          function hasChildren(node) {
            return Boolean((node == null ? void 0 : node.children) && node.children.length > 0);
          }
          function hasTagsRecursive(node) {
            if (!node) return false;
            const nodeHasTags = hasTags(node);
            if (nodeHasTags) return true;
            if (!hasChildren(node)) return false;
            return node.children.some((childId) => {
              const childNode = tree.value.nodes[childId];
              return childNode && hasTagsRecursive(childNode);
            });
          }
          function shouldShowRecursiveOption(node, selection) {
            if (selection && selection.length > 0) {
              return selection.some((n) => hasChildren(n) && hasTagsRecursive(n));
            }
            return hasChildren(node) && hasTagsRecursive(node);
          }
          function extractTagsFromNode(node, tagsSet) {
            var _a;
            if (((_a = node.data) == null ? void 0 : _a.tags) && Array.isArray(node.data.tags)) {
              node.data.tags.forEach((tag) => tagsSet.add(tag));
            }
          }
          function extractTagsRecursive(node, tagsSet) {
            extractTagsFromNode(node, tagsSet);
            if (node.children && node.children.length > 0) {
              node.children.forEach((childId) => {
                const childNode = tree.value.nodes[childId];
                if (childNode) {
                  extractTagsRecursive(childNode, tagsSet);
                }
              });
            }
          }
          const customMenuItems = computed(() => [
            {
              label: "应用当前节点标签",
              action: (node, selection) => {
                const tagsToApply = /* @__PURE__ */ new Set();
                if (selection && selection.length > 0) {
                  selection.forEach((n) => extractTagsFromNode(n, tagsToApply));
                } else if (node) {
                  extractTagsFromNode(node, tagsToApply);
                }
                if (tagsToApply.size > 0) {
                  props.api.addTags(Array.from(tagsToApply));
                }
              },
              show: (node, selection) => {
                if (selection && selection.length > 0) {
                  return selection.some(hasTags);
                }
                return hasTags(node);
              }
            },
            {
              label: "应用所有标签（递归）",
              action: (node, selection) => {
                const tagsToApply = /* @__PURE__ */ new Set();
                if (selection && selection.length > 0) {
                  selection.forEach((n) => extractTagsRecursive(n, tagsToApply));
                } else if (node) {
                  extractTagsRecursive(node, tagsToApply);
                }
                if (tagsToApply.size > 0) {
                  props.api.addTags(Array.from(tagsToApply));
                }
              },
              show: shouldShowRecursiveOption,
              separator: true
            },
            {
              label: "移除当前节点标签",
              action: (node, selection) => {
                const tagsToRemove = /* @__PURE__ */ new Set();
                if (selection && selection.length > 0) {
                  selection.forEach((n) => extractTagsFromNode(n, tagsToRemove));
                } else if (node) {
                  extractTagsFromNode(node, tagsToRemove);
                }
                if (tagsToRemove.size > 0) {
                  props.api.removeTags(Array.from(tagsToRemove));
                }
              },
              show: (node, selection) => {
                if (selection && selection.length > 0) {
                  return selection.some(hasTags);
                }
                return hasTags(node);
              },
              danger: true
            },
            {
              label: "移除所有标签（递归）",
              action: (node, selection) => {
                const tagsToRemove = /* @__PURE__ */ new Set();
                if (selection && selection.length > 0) {
                  selection.forEach((n) => extractTagsRecursive(n, tagsToRemove));
                } else if (node) {
                  extractTagsRecursive(node, tagsToRemove);
                }
                if (tagsToRemove.size > 0) {
                  props.api.removeTags(Array.from(tagsToRemove));
                }
              },
              show: shouldShowRecursiveOption,
              danger: true
            }
          ]);
          const handleDeleteTag = (node, tagIndex) => {
            var _a;
            const tags = (_a = node.data) == null ? void 0 : _a.tags;
            if (tags && Array.isArray(tags)) {
              const newTags = [...tags];
              newTags.splice(tagIndex, 1);
              node.data = { tags: newTags };
            }
          };
          const parseTags = (tagsText) => {
            const trimmed = tagsText.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                  return parsed.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0);
                }
              } catch (e) {
                console.warn("JSON 解析失败，尝试普通文本解析:", e);
              }
            }
            return trimmed.split(/[,\n]+/).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
          };
          const treeTab = useTreeTab({
            tree: () => data.value.tagTree,
            onCreateFolder: (parentId) => {
              const newNode = createNode(tree.value, "新建文件夹", void 0, parentId);
              return newNode.id;
            },
            onCreateItem: (parentId) => {
              const tagData = { tags: [] };
              const newNode = createNode(tree.value, "新建 Tag 预设", tagData, parentId);
              return newNode.id;
            },
            onEditItem: async (nodeId) => {
              const node = data.value.tagTree.nodes[nodeId];
              if (!node || !node.data) return;
              const result = await treeTab.modal.openModal({
                type: "createTag",
                title: "编辑 Tag 预设",
                formData: {
                  name: node.name,
                  tagsText: node.data.tags.join("\n")
                }
              });
              if (result && result.name && result.tagsText) {
                const tags = parseTags(result.tagsText);
                if (tags.length > 0) {
                  renameNode(tree.value, nodeId, result.name.trim());
                  node.data.tags = tags;
                }
              }
            }
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              createVNode(Tree, {
                tree: unref(treeTab).tree.value,
                "search-placeholder": "搜索 Tag...",
                "search-filter": unref(tagSearchFilter),
                "custom-menu-items": customMenuItems.value,
                "on-create-folder": unref(treeTab).handleCreateFolder,
                "on-create-item": unref(treeTab).handleCreateItem,
                "on-rename": unref(treeTab).handleRename,
                "on-delete": unref(treeTab).handleDelete,
                "on-edit": unref(treeTab).handleEditItem,
                onSelectionChange: unref(treeTab).handleSelect
              }, {
                default: withCtx(({ node }) => {
                  var _a;
                  return [
                    ((_a = node.data) == null ? void 0 : _a.tags) ? (openBlock(), createElementBlock("div", _hoisted_2, [
                      createElementVNode("div", _hoisted_3, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(node.data.tags, (tag, index) => {
                          return openBlock(), createElementBlock("span", {
                            key: index,
                            class: "tag-badge"
                          }, [
                            createElementVNode("span", _hoisted_4, toDisplayString(tag), 1),
                            createElementVNode("button", {
                              class: "tag-delete-btn",
                              onClick: withModifiers(($event) => handleDeleteTag(node, index), ["stop"]),
                              title: "删除此标签"
                            }, [
                              createElementVNode("span", {
                                innerHTML: unref(withSize)(unref(icons).close, 12)
                              }, null, 8, _hoisted_6)
                            ], 8, _hoisted_5)
                          ]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true)
                  ];
                }),
                _: 1
              }, 8, ["tree", "search-filter", "custom-menu-items", "on-create-folder", "on-create-item", "on-rename", "on-delete", "on-edit", "onSelectionChange"]),
              createVNode(Modal, {
                show: unref(treeTab).modal.state.value.show,
                title: unref(treeTab).modal.state.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(treeTab).modal.closeModal
              }, {
                footer: withCtx(() => [
                  unref(treeTab).modal.state.value.type !== "alert" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: _cache[9] || (_cache[9] = //@ts-ignore
                    (...args) => unref(treeTab).modal.closeModal && unref(treeTab).modal.closeModal(...args)),
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_22)
                  ])) : createCommentVNode("", true),
                  unref(treeTab).modal.state.value.type === "createTag" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[10] || (_cache[10] = ($event) => unref(treeTab).modal.confirmModal(unref(treeTab).modal.state.value.formData)),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_23)
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-danger",
                    onClick: _cache[11] || (_cache[11] = ($event) => unref(treeTab).modal.confirmModal(true)),
                    title: "删除"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).trash, 18)
                    }, null, 8, _hoisted_24)
                  ])) : unref(treeTab).modal.state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[12] || (_cache[12] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_25)
                  ])) : (openBlock(), createElementBlock("button", {
                    key: 4,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[13] || (_cache[13] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_26)
                  ]))
                ]),
                default: withCtx(() => [
                  unref(treeTab).modal.state.value.type === "createFolder" ? (openBlock(), createElementBlock("div", _hoisted_7, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "文件夹名称",
                      onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "createTag" ? (openBlock(), createElementBlock("div", _hoisted_8, [
                    createElementVNode("div", _hoisted_9, [
                      _cache[14] || (_cache[14] = createElementVNode("label", null, [
                        createTextVNode("预设名称 "),
                        createElementVNode("span", { class: "required" }, "*")
                      ], -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(treeTab).modal.state.value.formData.name = $event),
                        type: "text",
                        placeholder: "例如：イチゴ配布物"
                      }, null, 512), [
                        [vModelText, unref(treeTab).modal.state.value.formData.name]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_10, [
                      _cache[15] || (_cache[15] = createElementVNode("label", null, [
                        createTextVNode("标签列表 "),
                        createElementVNode("span", { class: "required" }, "*")
                      ], -1)),
                      withDirectives(createElementVNode("textarea", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(treeTab).modal.state.value.formData.tagsText = $event),
                        class: "modal-textarea-code-small",
                        placeholder: '支持两种格式：\n1. JSON 数组（从 Booth 复制）：["アクセサリー","眼鏡","イチゴ"]\n2. 普通文本（逗号/换行/空格分隔）：アクセサリー,眼鏡,イチゴ',
                        rows: "4"
                      }, null, 512), [
                        [vModelText, unref(treeTab).modal.state.value.formData.tagsText]
                      ]),
                      _cache[16] || (_cache[16] = createElementVNode("small", { class: "form-hint-small" }, ' 💡 直接粘贴从 Booth "复制标签"功能得到的 JSON 数据，或手动输入 ', -1))
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "rename" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "新名称",
                      onKeyup: _cache[5] || (_cache[5] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_12, [
                    createElementVNode("p", _hoisted_13, toDisplayString(unref(treeTab).modal.state.value.formData.message), 1)
                  ])) : unref(treeTab).modal.state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_14, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_15, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: unref(treeTab).modal.state.value.placeholder,
                      onKeyup: _cache[7] || (_cache[7] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_16), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_17, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_18, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      class: "modal-textarea-code",
                      placeholder: unref(treeTab).modal.state.value.placeholder,
                      rows: "4"
                    }, null, 8, _hoisted_19), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "alert" ? (openBlock(), createElementBlock("div", _hoisted_20, [
                    createElementVNode("p", _hoisted_21, toDisplayString(unref(treeTab).modal.state.value.message), 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])
            ]);
          };
        }
      });
      const TagTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-81455dc4"]]));

    })
  };
}));

System.register("./ItemTab-kS9ODuyb-DSijyaZm.js", ['vue', './useTreeTab-DjEliPpp-Ci_pUV8Q.js', './__monkey.entry-CNjZeeHM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createCommentVNode, createElementVNode, toDisplayString, withDirectives, withKeys, vModelText, createTextVNode, useTreeTab, Tree, itemDataSearchFilter, _export_sfc, useStorage, Modal, withSize, icons;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      computed = module.computed;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createVNode = module.createVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createCommentVNode = module.createCommentVNode;
      createElementVNode = module.createElementVNode;
      toDisplayString = module.toDisplayString;
      withDirectives = module.withDirectives;
      withKeys = module.withKeys;
      vModelText = module.vModelText;
      createTextVNode = module.createTextVNode;
    }, module => {
      useTreeTab = module.u;
      Tree = module.T;
      itemDataSearchFilter = module.i;
    }, module => {
      _export_sfc = module._;
      useStorage = module.u;
      Modal = module.M;
      withSize = module.w;
      icons = module.i;
    }],
    execute: (function () {

      const _hoisted_1 = { class: "item-data-tab" };
      const _hoisted_2 = {
        key: 0,
        class: "item-custom-content"
      };
      const _hoisted_3 = { class: "item-field" };
      const _hoisted_4 = { class: "item-field" };
      const _hoisted_5 = { key: 0 };
      const _hoisted_6 = { key: 1 };
      const _hoisted_7 = { class: "form-group" };
      const _hoisted_8 = { class: "form-group" };
      const _hoisted_9 = { class: "form-group" };
      const _hoisted_10 = { key: 2 };
      const _hoisted_11 = { key: 3 };
      const _hoisted_12 = { class: "modal-message" };
      const _hoisted_13 = { key: 4 };
      const _hoisted_14 = {
        key: 0,
        class: "modal-message-with-margin"
      };
      const _hoisted_15 = ["placeholder"];
      const _hoisted_16 = { key: 5 };
      const _hoisted_17 = {
        key: 0,
        class: "modal-message-with-margin"
      };
      const _hoisted_18 = ["placeholder"];
      const _hoisted_19 = { key: 6 };
      const _hoisted_20 = { class: "modal-message" };
      const _hoisted_21 = ["innerHTML"];
      const _hoisted_22 = ["innerHTML"];
      const _hoisted_23 = ["innerHTML"];
      const _hoisted_24 = ["innerHTML"];
      const _hoisted_25 = ["innerHTML"];
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "ItemTab",
        setup(__props) {
          const { data, createNode, renameNode } = useStorage();
          const treeTab = useTreeTab({
            tree: () => data.value.itemTree,
            onCreateFolder: (parentId) => {
              const newNode = createNode(data.value.itemTree, "新建文件夹", void 0, parentId);
              return newNode.id;
            },
            onCreateItem: (parentId) => {
              const itemData = {
                authorName: "",
                itemName: "",
                itemUrl: ""
              };
              const newNode = createNode(data.value.itemTree, "新建商品数据", itemData, parentId);
              return newNode.id;
            },
            onEditItem: async (nodeId) => {
              var _a;
              const node = data.value.itemTree.nodes[nodeId];
              if (!node || !node.data) return;
              const result = await treeTab.modal.openModal({
                type: "createItem",
                title: "编辑商品数据",
                formData: {
                  name: node.name,
                  authorName: node.data.authorName || "",
                  itemUrl: node.data.itemUrl || ""
                }
              });
              if ((_a = result == null ? void 0 : result.name) == null ? void 0 : _a.trim()) {
                const trimmedName = result.name.trim();
                renameNode(data.value.itemTree, nodeId, trimmedName);
                node.data.authorName = result.authorName.trim();
                node.data.itemName = trimmedName;
                node.data.itemUrl = result.itemUrl.trim();
              }
            }
          });
          const customMenuItems = computed(() => []);
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              createVNode(unref(Tree), {
                tree: unref(treeTab).tree.value,
                "search-placeholder": "搜索商品数据...",
                "search-filter": unref(itemDataSearchFilter),
                "on-create-folder": unref(treeTab).handleCreateFolder,
                "on-create-item": unref(treeTab).handleCreateItem,
                "on-rename": unref(treeTab).handleRename,
                "on-delete": unref(treeTab).handleDelete,
                "on-edit": unref(treeTab).handleEditItem,
                "custom-menu-items": customMenuItems.value,
                onSelectionChange: unref(treeTab).handleSelect
              }, {
                default: withCtx(({ node }) => {
                  var _a, _b;
                  return [
                    ((_a = node.data) == null ? void 0 : _a.authorName) || ((_b = node.data) == null ? void 0 : _b.itemUrl) ? (openBlock(), createElementBlock("div", _hoisted_2, [
                      createElementVNode("span", _hoisted_3, toDisplayString(node.data.authorName || "—"), 1),
                      _cache[15] || (_cache[15] = createElementVNode("span", { class: "item-separator" }, "·", -1)),
                      createElementVNode("span", _hoisted_4, toDisplayString(node.name), 1)
                    ])) : createCommentVNode("", true)
                  ];
                }),
                _: 1
              }, 8, ["tree", "search-filter", "on-create-folder", "on-create-item", "on-rename", "on-delete", "on-edit", "custom-menu-items", "onSelectionChange"]),
              createVNode(Modal, {
                show: unref(treeTab).modal.state.value.show,
                title: unref(treeTab).modal.state.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(treeTab).modal.closeModal
              }, {
                footer: withCtx(() => [
                  unref(treeTab).modal.state.value.type !== "alert" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: _cache[10] || (_cache[10] = //@ts-ignore
                    (...args) => unref(treeTab).modal.closeModal && unref(treeTab).modal.closeModal(...args)),
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_21)
                  ])) : createCommentVNode("", true),
                  unref(treeTab).modal.state.value.type === "createItem" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[11] || (_cache[11] = ($event) => unref(treeTab).modal.confirmModal(unref(treeTab).modal.state.value.formData)),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_22)
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-danger",
                    onClick: _cache[12] || (_cache[12] = ($event) => unref(treeTab).modal.confirmModal(true)),
                    title: "删除"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).trash, 18)
                    }, null, 8, _hoisted_23)
                  ])) : unref(treeTab).modal.state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[13] || (_cache[13] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_24)
                  ])) : (openBlock(), createElementBlock("button", {
                    key: 4,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[14] || (_cache[14] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_25)
                  ]))
                ]),
                default: withCtx(() => [
                  unref(treeTab).modal.state.value.type === "createFolder" ? (openBlock(), createElementBlock("div", _hoisted_5, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "文件夹名称",
                      onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "createItem" ? (openBlock(), createElementBlock("div", _hoisted_6, [
                    createElementVNode("div", _hoisted_7, [
                      _cache[16] || (_cache[16] = createElementVNode("label", null, [
                        createTextVNode("商品名称 "),
                        createElementVNode("span", { class: "required" }, "*")
                      ], -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(treeTab).modal.state.value.formData.name = $event),
                        type: "text",
                        placeholder: "例如：イチゴ - Ichigo"
                      }, null, 512), [
                        [vModelText, unref(treeTab).modal.state.value.formData.name]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_8, [
                      _cache[17] || (_cache[17] = createElementVNode("label", null, "作者名称", -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(treeTab).modal.state.value.formData.authorName = $event),
                        type: "text",
                        placeholder: "例如：みゅ"
                      }, null, 512), [
                        [vModelText, unref(treeTab).modal.state.value.formData.authorName]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_9, [
                      _cache[18] || (_cache[18] = createElementVNode("label", null, "商品链接", -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(treeTab).modal.state.value.formData.itemUrl = $event),
                        type: "text",
                        placeholder: "https://booth.pm/..."
                      }, null, 512), [
                        [vModelText, unref(treeTab).modal.state.value.formData.itemUrl]
                      ])
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "rename" ? (openBlock(), createElementBlock("div", _hoisted_10, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "新名称",
                      onKeyup: _cache[6] || (_cache[6] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    createElementVNode("p", _hoisted_12, toDisplayString(unref(treeTab).modal.state.value.formData.message), 1)
                  ])) : unref(treeTab).modal.state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_13, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_14, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: unref(treeTab).modal.state.value.placeholder,
                      onKeyup: _cache[8] || (_cache[8] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_15), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_16, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_17, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      class: "modal-textarea-code",
                      placeholder: unref(treeTab).modal.state.value.placeholder,
                      rows: "4"
                    }, null, 8, _hoisted_18), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "alert" ? (openBlock(), createElementBlock("div", _hoisted_19, [
                    createElementVNode("p", _hoisted_20, toDisplayString(unref(treeTab).modal.state.value.message), 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])
            ]);
          };
        }
      });
      const ItemTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6c6b3856"]]));

    })
  };
}));

System.register("./useTreeTab-DjEliPpp-Ci_pUV8Q.js", ['vue', './__monkey.entry-CNjZeeHM.js', './useModal-Cv530RMh-DbZQZjC8.js'], (function (exports, module) {
  'use strict';
  var ref, computed, defineComponent, onMounted, onUnmounted, createElementBlock, openBlock, createCommentVNode, createVNode, withDirectives, createElementVNode, vModelText, renderSlot, Fragment, renderList, createBlock, createSlots, withCtx, mergeProps, withModifiers, normalizeClass, watch, resolveComponent, normalizeStyle, unref, toDisplayString, nextTick, _export_sfc, useStorage, ConfigStorage, ContextMenu, icons, withSize, useModal;
  return {
    setters: [module => {
      ref = module.ref;
      computed = module.computed;
      defineComponent = module.defineComponent;
      onMounted = module.onMounted;
      onUnmounted = module.onUnmounted;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createCommentVNode = module.createCommentVNode;
      createVNode = module.createVNode;
      withDirectives = module.withDirectives;
      createElementVNode = module.createElementVNode;
      vModelText = module.vModelText;
      renderSlot = module.renderSlot;
      Fragment = module.Fragment;
      renderList = module.renderList;
      createBlock = module.createBlock;
      createSlots = module.createSlots;
      withCtx = module.withCtx;
      mergeProps = module.mergeProps;
      withModifiers = module.withModifiers;
      normalizeClass = module.normalizeClass;
      watch = module.watch;
      resolveComponent = module.resolveComponent;
      normalizeStyle = module.normalizeStyle;
      unref = module.unref;
      toDisplayString = module.toDisplayString;
      nextTick = module.nextTick;
    }, module => {
      _export_sfc = module._;
      useStorage = module.u;
      ConfigStorage = module.C;
      ContextMenu = module.a;
      icons = module.i;
      withSize = module.w;
    }, module => {
      useModal = module.u;
    }],
    execute: (function () {

      exports({
        i: itemDataSearchFilter,
        t: tagSearchFilter,
        u: useTreeTab
      });

      const _hoisted_1$1 = { class: "tree-item" };
      const _hoisted_2$1 = ["innerHTML"];
      const _hoisted_3$1 = {
        key: 1,
        class: "expand-icon placeholder"
      };
      const _hoisted_4$1 = ["innerHTML"];
      const _hoisted_5$1 = ["innerHTML"];
      const _hoisted_6$1 = ["innerHTML"];
      const _hoisted_7$1 = ["innerHTML"];
      const _hoisted_8$1 = { class: "name" };
      const _hoisted_9 = {
        key: 2,
        class: "count"
      };
      const _hoisted_10 = {
        key: 3,
        class: "node-header-extra"
      };
      const _hoisted_11 = {
        key: 2,
        class: "tree-children"
      };
      const _sfc_main$1 = /* @__PURE__ */ defineComponent({
        __name: "TreeNode",
        props: {
          node: {},
          tree: {},
          level: {},
          editingNodeId: {},
          showChildren: { type: Boolean, default: true },
          selection: {},
          activeNodeId: {},
          selectable: { type: Boolean, default: true },
          selectableFilter: {}
        },
        emits: ["select", "contextmenu", "rename"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const configStorage = ConfigStorage.getInstance();
          const currentLevel = computed(() => props.level || 0);
          const isDragOver = ref(false);
          const dropPosition = ref(null);
          const isEditing = computed(() => props.editingNodeId === props.node.id);
          const editingName = ref("");
          const inputRef = ref(null);
          const children = computed(() => {
            const allNodes = props.tree.nodes;
            return props.node.children.map((id) => allNodes[id]).filter(Boolean);
          });
          const hasChildren = computed(() => props.node.children.length > 0);
          const isSelected = computed(() => {
            var _a;
            return ((_a = props.selection) == null ? void 0 : _a.has(props.node.id)) || false;
          });
          const isActive = computed(() => props.activeNodeId === props.node.id);
          const isSelectable = computed(() => {
            if (!props.selectable) return false;
            return props.selectableFilter ? props.selectableFilter(props.node) : true;
          });
          const nodeIcon = computed(() => {
            const hasData = !!props.node.data;
            const hasKids = hasChildren.value;
            if (hasData) {
              return hasKids ? icons.files : icons.file;
            } else {
              return hasKids ? icons.folderFilled : icons.folderEmpty;
            }
          });
          const toggleExpanded = () => {
            props.node.expanded = !props.node.expanded;
          };
          const handleDragStart = (e) => {
            if (e.dataTransfer) {
              e.dataTransfer.setData("text/plain", props.node.id);
              e.dataTransfer.effectAllowed = "move";
            }
          };
          const handleDragEnd = () => {
            isDragOver.value = false;
            dropPosition.value = null;
          };
          const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "move";
            }
            const element = e.currentTarget;
            const rect = element.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;
            if (y < height * 0.25) {
              dropPosition.value = "before";
            } else if (y > height * 0.75) {
              dropPosition.value = "after";
            } else {
              dropPosition.value = "inside";
            }
            isDragOver.value = true;
          };
          const handleDragLeave = (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
              isDragOver.value = false;
              dropPosition.value = null;
            }
          };
          const handleDrop = (e) => {
            var _a;
            e.preventDefault();
            e.stopPropagation();
            const draggedNodeId = (_a = e.dataTransfer) == null ? void 0 : _a.getData("text/plain");
            if (!draggedNodeId) {
              isDragOver.value = false;
              dropPosition.value = null;
              return;
            }
            if (draggedNodeId === props.node.id) {
              isDragOver.value = false;
              dropPosition.value = null;
              return;
            }
            if (isDescendant(draggedNodeId, props.node.id)) {
              isDragOver.value = false;
              dropPosition.value = null;
              return;
            }
            const position = dropPosition.value;
            if (position === "inside") {
              configStorage.moveNode(props.tree, draggedNodeId, props.node.id);
              if (!props.node.expanded) {
                props.node.expanded = true;
              }
            } else {
              const parentId = props.node.parentId;
              const siblingIds = parentId ? props.tree.nodes[parentId].children : props.tree.rootIds;
              const currentIndex = siblingIds.indexOf(props.node.id);
              const insertIndex = position === "before" ? currentIndex : currentIndex + 1;
              configStorage.insertNodeAt(props.tree, draggedNodeId, parentId, insertIndex);
            }
            isDragOver.value = false;
            dropPosition.value = null;
          };
          const isDescendant = (ancestorId, targetId) => {
            let current = props.tree.nodes[targetId];
            while (current) {
              if (current.id === ancestorId) return true;
              if (!current.parentId) break;
              current = props.tree.nodes[current.parentId];
            }
            return false;
          };
          async function focusAndSelectInput() {
            editingName.value = props.node.name;
            await nextTick();
            setTimeout(() => {
              if (inputRef.value) {
                inputRef.value.focus();
                inputRef.value.select();
              }
            }, 0);
          }
          watch(isEditing, async (newValue) => {
            if (newValue) {
              await focusAndSelectInput();
            }
          }, { immediate: true });
          watch(() => props.editingNodeId, async (newId) => {
            if (newId === props.node.id) {
              await focusAndSelectInput();
            }
          });
          const saveEdit = () => {
            const newName = editingName.value.trim();
            if (newName && newName !== props.node.name) {
              emit("rename", props.node.id, newName);
            } else {
              emit("rename", props.node.id, props.node.name);
            }
          };
          const cancelEdit = () => {
            emit("rename", props.node.id, props.node.name);
          };
          const handleEditKeydown = (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          };
          const handleNodeClick = (e) => {
            if (isEditing.value) return;
            const target = e.target;
            if (target.closest("button, a, .action-icon")) {
              return;
            }
            const isInput = target.closest("input, textarea, select");
            if (isInput) {
              if (isSelectable.value && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                emit("select", props.node, e);
              }
              return;
            }
            if (isSelectable.value) {
              emit("select", props.node, e);
            }
          };
          const handleContextmenu = (event, node) => {
            if (isEditing.value) {
              return;
            }
            event.stopPropagation();
            emit("contextmenu", event, node);
          };
          return (_ctx, _cache) => {
            const _component_TreeNode = resolveComponent("TreeNode", true);
            return openBlock(), createElementBlock("div", _hoisted_1$1, [
              isDragOver.value && dropPosition.value === "before" ? (openBlock(), createElementBlock("div", {
                key: 0,
                class: "drop-indicator drop-indicator-before",
                style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + "px" })
              }, null, 4)) : createCommentVNode("", true),
              createElementVNode("div", {
                class: normalizeClass([
                  "tree-node-wrapper",
                  {
                    "drag-over": isDragOver.value,
                    "drag-over-inside": dropPosition.value === "inside"
                  }
                ]),
                draggable: "true",
                onDragstart: handleDragStart,
                onDragend: handleDragEnd,
                onDragover: handleDragOver,
                onDragleave: handleDragLeave,
                onDrop: handleDrop
              }, [
                createElementVNode("div", {
                  class: normalizeClass([
                    "node-item",
                    {
                      "has-custom-content": _ctx.$slots.default,
                      "is-editing": isEditing.value,
                      "selected": isSelected.value,
                      "active": isActive.value,
                      "selectable": isSelectable.value
                    }
                  ]),
                  onClick: handleNodeClick,
                  onContextmenu: _cache[3] || (_cache[3] = withModifiers(($event) => handleContextmenu($event, _ctx.node), ["prevent"]))
                }, [
                  createElementVNode("div", {
                    class: normalizeClass([
                      "tree-node-content",
                      {
                        "expanded": _ctx.node.expanded,
                        "has-children": hasChildren.value
                      }
                    ]),
                    style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + "px" })
                  }, [
                    isEditing.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                      _ctx.showChildren && hasChildren.value ? (openBlock(), createElementBlock("span", {
                        key: 0,
                        class: "expand-icon",
                        onClick: _cache[0] || (_cache[0] = withModifiers(($event) => toggleExpanded(), ["stop"])),
                        innerHTML: unref(withSize)(_ctx.node.expanded ? unref(icons).chevronDown : unref(icons).chevronRight, 12)
                      }, null, 8, _hoisted_2$1)) : (openBlock(), createElementBlock("span", _hoisted_3$1)),
                      createElementVNode("span", {
                        class: "icon",
                        innerHTML: unref(withSize)(nodeIcon.value, 16),
                        style: normalizeStyle({ color: _ctx.node.data ? "#94a3b8" : "#fbbf24" })
                      }, null, 12, _hoisted_4$1),
                      withDirectives(createElementVNode("input", {
                        ref_key: "inputRef",
                        ref: inputRef,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => editingName.value = $event),
                        class: "node-name-input",
                        onBlur: saveEdit,
                        onKeydown: handleEditKeydown
                      }, null, 544), [
                        [vModelText, editingName.value]
                      ])
                    ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      _ctx.showChildren && hasChildren.value ? (openBlock(), createElementBlock("div", {
                        key: 0,
                        class: "toggle-area",
                        onClick: _cache[2] || (_cache[2] = withModifiers(($event) => toggleExpanded(), ["stop"]))
                      }, [
                        createElementVNode("span", {
                          class: "expand-icon",
                          innerHTML: unref(withSize)(_ctx.node.expanded ? unref(icons).chevronDown : unref(icons).chevronRight, 12)
                        }, null, 8, _hoisted_5$1),
                        createElementVNode("span", {
                          class: "icon",
                          innerHTML: unref(withSize)(nodeIcon.value, 16),
                          style: normalizeStyle({ color: _ctx.node.data ? "#94a3b8" : "#fbbf24" })
                        }, null, 12, _hoisted_6$1)
                      ])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                        _cache[7] || (_cache[7] = createElementVNode("span", { class: "expand-icon placeholder" }, null, -1)),
                        createElementVNode("span", {
                          class: "icon",
                          innerHTML: unref(withSize)(nodeIcon.value, 16),
                          style: normalizeStyle({ color: _ctx.node.data ? "#94a3b8" : "#fbbf24" })
                        }, null, 12, _hoisted_7$1)
                      ], 64)),
                      createElementVNode("span", _hoisted_8$1, toDisplayString(_ctx.node.name), 1),
                      hasChildren.value ? (openBlock(), createElementBlock("span", _hoisted_9, "(" + toDisplayString(_ctx.node.children.length) + ")", 1)) : createCommentVNode("", true),
                      _ctx.$slots.header ? (openBlock(), createElementBlock("div", _hoisted_10, [
                        renderSlot(_ctx.$slots, "header", {
                          node: _ctx.node,
                          level: currentLevel.value
                        }, void 0, true)
                      ])) : createCommentVNode("", true)
                    ], 64))
                  ], 6),
                  _ctx.$slots.default ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    class: "node-custom-content",
                    style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + 36 + "px" })
                  }, [
                    renderSlot(_ctx.$slots, "default", {
                      node: _ctx.node,
                      level: currentLevel.value
                    }, void 0, true)
                  ], 4)) : createCommentVNode("", true)
                ], 34)
              ], 34),
              isDragOver.value && dropPosition.value === "after" ? (openBlock(), createElementBlock("div", {
                key: 1,
                class: "drop-indicator drop-indicator-after",
                style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + "px" })
              }, null, 4)) : createCommentVNode("", true),
              _ctx.showChildren && _ctx.node.expanded && hasChildren.value ? (openBlock(), createElementBlock("div", _hoisted_11, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(children.value, (child) => {
                  return openBlock(), createBlock(_component_TreeNode, {
                    key: child.id,
                    node: child,
                    tree: _ctx.tree,
                    level: currentLevel.value + 1,
                    "editing-node-id": _ctx.editingNodeId,
                    "show-children": _ctx.showChildren,
                    selection: _ctx.selection,
                    "active-node-id": _ctx.activeNodeId,
                    selectable: _ctx.selectable,
                    "selectable-filter": _ctx.selectableFilter,
                    onSelect: _cache[4] || (_cache[4] = (node, e) => emit("select", node, e)),
                    onContextmenu: _cache[5] || (_cache[5] = (e, n) => emit("contextmenu", e, n)),
                    onRename: _cache[6] || (_cache[6] = (nodeId, newName) => emit("rename", nodeId, newName))
                  }, createSlots({ _: 2 }, [
                    renderList(_ctx.$slots, (_, name) => {
                      return {
                        name,
                        fn: withCtx((slotData) => [
                          renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData), void 0, true)
                        ])
                      };
                    })
                  ]), 1032, ["node", "tree", "level", "editing-node-id", "show-children", "selection", "active-node-id", "selectable", "selectable-filter"]);
                }), 128))
              ])) : createCommentVNode("", true)
            ]);
          };
        }
      });
      const TreeNode = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-fbb1ef76"]]);
      const _hoisted_1 = {
        key: 0,
        class: "tree-search"
      };
      const _hoisted_2 = ["placeholder"];
      const _hoisted_3 = {
        key: 0,
        class: "tree-search-toolbar"
      };
      const _hoisted_4 = {
        key: 1,
        class: "search-results"
      };
      const _hoisted_5 = {
        key: 0,
        class: "search-results-list"
      };
      const _hoisted_6 = {
        key: 1,
        class: "search-empty"
      };
      const _hoisted_7 = {
        key: 0,
        class: "empty-state"
      };
      const _hoisted_8 = {
        key: 1,
        class: "tree-content"
      };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "Tree",
        props: {
          tree: {},
          parentId: {},
          mode: { default: "tree" },
          searchPlaceholder: {},
          searchFilter: {},
          customMenuItems: {},
          selectable: { type: Boolean, default: true },
          selectableFilter: {},
          onCreateFolder: {},
          onCreateItem: {},
          onRename: {},
          onDelete: {},
          onEdit: {}
        },
        emits: ["selectionChange"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const configStorage = ConfigStorage.getInstance();
          const searchText = ref("");
          const selection = ref(/* @__PURE__ */ new Set());
          const activeNodeId = ref(null);
          const anchorNodeId = ref(null);
          const isSearching = computed(() => searchText.value.trim().length > 0);
          const searchResults = computed(() => {
            if (!isSearching.value || !props.searchFilter) {
              return [];
            }
            const allNodes = Object.values(props.tree.nodes);
            return allNodes.filter((node) => props.searchFilter(node, searchText.value.trim()));
          });
          const hasSearchResults = computed(() => searchResults.value.length > 0);
          const contextMenu = ref({
            show: false,
            targetId: null,
            x: 0,
            y: 0
          });
          const editingNodeId = ref(null);
          const treeRootRef = ref(null);
          const handleGlobalClick = (e) => {
            if (!props.selectable || selection.value.size === 0) return;
            if (!treeRootRef.value) return;
            if (treeRootRef.value.contains(e.target)) return;
            clearSelection();
          };
          onMounted(() => {
            document.addEventListener("click", handleGlobalClick);
          });
          onUnmounted(() => {
            document.removeEventListener("click", handleGlobalClick);
          });
          const rootNodes = computed(() => {
            var _a;
            const allNodes = props.tree.nodes;
            if (props.mode === "list") {
              return Object.values(allNodes).filter((node) => node.data).sort((a, b) => b.updatedAt - a.updatedAt);
            }
            const ids = props.parentId ? ((_a = allNodes[props.parentId]) == null ? void 0 : _a.children) || [] : props.tree.rootIds;
            return ids.map((id) => allNodes[id]).filter(Boolean);
          });
          const targetNode = computed(() => {
            if (!contextMenu.value.targetId) return null;
            return props.tree.nodes[contextMenu.value.targetId];
          });
          function getVisibleCustomMenuItems(node) {
            if (!props.customMenuItems || props.customMenuItems.length === 0) {
              return [];
            }
            const selectedNodes = getSelectedNodes();
            return props.customMenuItems.filter(
              (item) => !item.show || item.show(node, selectedNodes)
            );
          }
          const visibleCustomMenuItems = computed(
            () => getVisibleCustomMenuItems(targetNode.value)
          );
          const visibleCustomMenuItemsForRoot = computed(
            () => getVisibleCustomMenuItems(null)
          );
          function appendCustomMenuItems(items, customItems, node, selectedNodes) {
            if (customItems.length === 0) return;
            if (items.length > 0) {
              items[items.length - 1].separator = true;
            }
            customItems.forEach((item) => {
              items.push({
                label: item.label,
                action: () => item.action(node, selectedNodes),
                danger: item.danger,
                separator: item.separator
              });
            });
          }
          function addBaseCreateItems(items) {
            if (props.mode === "tree") {
              items.push({
                label: "新建文件夹节点",
                action: handleCreateFolder
              });
            }
            items.push({
              label: "新建数据节点",
              action: handleCreateItem
            });
          }
          const menuItems = computed(() => {
            const items = [];
            const selectedNodes = getSelectedNodes();
            addBaseCreateItems(items);
            if (targetNode.value) {
              if (items.length > 0) {
                items[items.length - 1].separator = true;
              }
              items.push({
                label: "重命名",
                action: handleRename
              });
              if (targetNode.value.data && props.onEdit) {
                items.push({
                  label: "编辑",
                  action: handleEdit
                });
              }
              appendCustomMenuItems(items, visibleCustomMenuItems.value, targetNode.value, selectedNodes);
              if (items.length > 0) {
                items[items.length - 1].separator = true;
              }
              items.push({
                label: "删除",
                action: handleDelete,
                danger: true
              });
            } else {
              appendCustomMenuItems(items, visibleCustomMenuItemsForRoot.value, null, selectedNodes);
            }
            return items;
          });
          const getParentId = () => {
            if (!contextMenu.value.targetId) return null;
            const node = targetNode.value;
            if (!node) return null;
            return node.id;
          };
          const showContextMenu = (event, node) => {
            contextMenu.value = {
              show: true,
              targetId: (node == null ? void 0 : node.id) || null,
              x: event.clientX,
              y: event.clientY
            };
          };
          const handleCreateFolder = () => {
            var _a;
            const parentId = getParentId();
            const newNodeId = (_a = props.onCreateFolder) == null ? void 0 : _a.call(props, parentId);
            if (newNodeId) {
              editingNodeId.value = newNodeId;
            }
          };
          const handleCreateItem = () => {
            var _a;
            const parentId = getParentId();
            const newNodeId = (_a = props.onCreateItem) == null ? void 0 : _a.call(props, parentId);
            if (newNodeId) {
              editingNodeId.value = newNodeId;
            }
          };
          const handleEdit = () => {
            var _a;
            if (!contextMenu.value.targetId) return;
            (_a = props.onEdit) == null ? void 0 : _a.call(props, contextMenu.value.targetId);
          };
          const handleRename = () => {
            if (!contextMenu.value.targetId) return;
            editingNodeId.value = contextMenu.value.targetId;
          };
          const handleNodeRename = (nodeId, newName) => {
            var _a;
            (_a = props.onRename) == null ? void 0 : _a.call(props, nodeId, newName);
            editingNodeId.value = null;
          };
          const handleDelete = async () => {
            var _a;
            if (!contextMenu.value.targetId) return;
            try {
              await ((_a = props.onDelete) == null ? void 0 : _a.call(props, contextMenu.value.targetId));
            } catch (error) {
              console.debug("Delete cancelled or failed:", error);
            }
          };
          const isTreeDragOver = ref(false);
          const handleTreeDragOver = (e) => {
            const target = e.target;
            if (target.closest(".tree-node-wrapper")) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = "move";
            }
            isTreeDragOver.value = true;
          };
          const handleTreeDragLeave = (e) => {
            const target = e.target;
            if (!target.closest(".node-tree")) {
              isTreeDragOver.value = false;
            }
          };
          const handleTreeDrop = (e) => {
            var _a;
            const target = e.target;
            if (target.closest(".tree-node-wrapper")) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            const nodeId = (_a = e.dataTransfer) == null ? void 0 : _a.getData("text/plain");
            if (nodeId) {
              configStorage.moveNode(props.tree, nodeId, props.parentId || null);
            }
            isTreeDragOver.value = false;
          };
          const handleRootContextmenu = (e) => {
            if (e.target.closest(".tree-node-content")) {
              return;
            }
            clearSelection();
            showContextMenu(e, null);
          };
          const handleTreeClick = (e) => {
            const target = e.target;
            if (!target.closest(".node-item")) {
              if (selection.value.size > 0) {
                clearSelection();
              }
            }
          };
          const getVisibleNodes = () => {
            var _a;
            const result = [];
            const traverse = (nodeIds) => {
              for (const id of nodeIds) {
                const node = props.tree.nodes[id];
                if (!node) continue;
                result.push(node);
                if (node.expanded && node.children.length > 0) {
                  traverse(node.children);
                }
              }
            };
            if (props.mode === "list") {
              result.push(...rootNodes.value);
            } else if (isSearching.value) {
              result.push(...searchResults.value);
            } else {
              traverse(props.parentId ? ((_a = props.tree.nodes[props.parentId]) == null ? void 0 : _a.children) || [] : props.tree.rootIds);
            }
            return result;
          };
          const getSelectedNodes = () => {
            return Array.from(selection.value).map((id) => props.tree.nodes[id]).filter(Boolean);
          };
          const emitSelectionChange = () => {
            const selectedNodes = getSelectedNodes();
            emit("selectionChange", selectedNodes);
          };
          const handleSelection = (node, event) => {
            if (props.selectableFilter && !props.selectableFilter(node)) {
              return;
            }
            const isCtrl = (event == null ? void 0 : event.ctrlKey) || (event == null ? void 0 : event.metaKey);
            const isShift = event == null ? void 0 : event.shiftKey;
            const newSelection = new Set(selection.value);
            if (isShift && anchorNodeId.value) {
              const visibleNodes = getVisibleNodes();
              const anchorIndex = visibleNodes.findIndex((n) => n.id === anchorNodeId.value);
              const currentIndex = visibleNodes.findIndex((n) => n.id === node.id);
              if (anchorIndex !== -1 && currentIndex !== -1) {
                newSelection.clear();
                const startIndex = Math.min(anchorIndex, currentIndex);
                const endIndex = Math.max(anchorIndex, currentIndex);
                for (let i = startIndex; i <= endIndex; i++) {
                  const n = visibleNodes[i];
                  if (!props.selectableFilter || props.selectableFilter(n)) {
                    newSelection.add(n.id);
                  }
                }
                activeNodeId.value = node.id;
              }
            } else if (isCtrl) {
              if (newSelection.has(node.id)) {
                newSelection.delete(node.id);
                if (activeNodeId.value === node.id) {
                  activeNodeId.value = null;
                }
              } else {
                newSelection.add(node.id);
                activeNodeId.value = node.id;
                anchorNodeId.value = node.id;
              }
            } else {
              newSelection.clear();
              newSelection.add(node.id);
              activeNodeId.value = node.id;
              anchorNodeId.value = node.id;
            }
            selection.value = newSelection;
            emitSelectionChange();
          };
          const clearSelection = () => {
            selection.value = /* @__PURE__ */ new Set();
            activeNodeId.value = null;
            anchorNodeId.value = null;
            emitSelectionChange();
          };
          const handleContextmenu = (event, node) => {
            if (!selection.value.has(node.id)) {
              handleSelection(node);
            }
            showContextMenu(event, node);
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", {
              class: "tree-wrapper",
              ref_key: "treeRootRef",
              ref: treeRootRef
            }, [
              _ctx.searchFilter ? (openBlock(), createElementBlock("div", _hoisted_1, [
                withDirectives(createElementVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchText.value = $event),
                  type: "text",
                  placeholder: _ctx.searchPlaceholder || "搜索...",
                  class: "search-input"
                }, null, 8, _hoisted_2), [
                  [vModelText, searchText.value]
                ]),
                _ctx.$slots.toolbar ? (openBlock(), createElementBlock("div", _hoisted_3, [
                  renderSlot(_ctx.$slots, "toolbar", {}, void 0, true)
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              isSearching.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
                hasSearchResults.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(searchResults.value, (node) => {
                    return openBlock(), createBlock(TreeNode, {
                      key: node.id,
                      node,
                      tree: _ctx.tree,
                      level: 0,
                      "editing-node-id": editingNodeId.value,
                      "show-children": false,
                      selection: selection.value,
                      "active-node-id": activeNodeId.value,
                      selectable: _ctx.selectable,
                      "selectable-filter": _ctx.selectableFilter,
                      onSelect: handleSelection,
                      onContextmenu: handleContextmenu,
                      onRename: handleNodeRename
                    }, createSlots({ _: 2 }, [
                      renderList(_ctx.$slots, (_, name) => {
                        return {
                          name,
                          fn: withCtx((slotData) => [
                            renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData || {}), void 0, true)
                          ])
                        };
                      })
                    ]), 1032, ["node", "tree", "editing-node-id", "selection", "active-node-id", "selectable", "selectable-filter"]);
                  }), 128))
                ])) : (openBlock(), createElementBlock("div", _hoisted_6, " 没有找到匹配的结果 "))
              ])) : (openBlock(), createElementBlock("div", {
                key: 2,
                class: normalizeClass(["node-tree", { "tree-drag-over": isTreeDragOver.value }]),
                onContextmenu: withModifiers(handleRootContextmenu, ["prevent"]),
                onClick: handleTreeClick,
                onDragover: handleTreeDragOver,
                onDragleave: handleTreeDragLeave,
                onDrop: handleTreeDrop
              }, [
                rootNodes.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_7, " 暂无数据，右键新建 ")) : (openBlock(), createElementBlock("div", _hoisted_8, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(rootNodes.value, (node) => {
                    return openBlock(), createBlock(TreeNode, {
                      key: node.id,
                      node,
                      tree: _ctx.tree,
                      level: 0,
                      "editing-node-id": editingNodeId.value,
                      "show-children": _ctx.mode === "tree",
                      selection: selection.value,
                      "active-node-id": activeNodeId.value,
                      selectable: _ctx.selectable,
                      "selectable-filter": _ctx.selectableFilter,
                      onSelect: handleSelection,
                      onContextmenu: handleContextmenu,
                      onRename: handleNodeRename
                    }, createSlots({ _: 2 }, [
                      renderList(_ctx.$slots, (_, name) => {
                        return {
                          name,
                          fn: withCtx((slotData) => [
                            renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData || {}), void 0, true)
                          ])
                        };
                      })
                    ]), 1032, ["node", "tree", "editing-node-id", "show-children", "selection", "active-node-id", "selectable", "selectable-filter"]);
                  }), 128))
                ]))
              ], 34)),
              createVNode(ContextMenu, {
                show: contextMenu.value.show,
                x: contextMenu.value.x,
                y: contextMenu.value.y,
                items: menuItems.value,
                onClose: _cache[1] || (_cache[1] = ($event) => contextMenu.value.show = false)
              }, null, 8, ["show", "x", "y", "items"])
            ], 512);
          };
        }
      });
      const Tree = exports("T", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d653bc39"]]));
      function tagSearchFilter(node, searchText) {
        var _a;
        if (!((_a = node.data) == null ? void 0 : _a.tags)) return false;
        const lowerSearch = searchText.toLowerCase();
        const nodeName = node.name.toLowerCase();
        const tagsText = node.data.tags.join(" ").toLowerCase();
        return nodeName.includes(lowerSearch) || tagsText.includes(lowerSearch);
      }
      function itemDataSearchFilter(node, searchText) {
        var _a, _b, _c, _d, _e, _f;
        if (!((_a = node.data) == null ? void 0 : _a.authorName) && !((_b = node.data) == null ? void 0 : _b.itemUrl)) return false;
        const lowerSearch = searchText.toLowerCase();
        const nodeName = node.name.toLowerCase();
        const authorName = ((_d = (_c = node.data) == null ? void 0 : _c.authorName) == null ? void 0 : _d.toLowerCase()) || "";
        const itemUrl = ((_f = (_e = node.data) == null ? void 0 : _e.itemUrl) == null ? void 0 : _f.toLowerCase()) || "";
        return nodeName.includes(lowerSearch) || authorName.includes(lowerSearch) || itemUrl.includes(lowerSearch);
      }
      function useTreeTab(options) {
        const { renameNode, deleteNode } = useStorage();
        const modal = useModal();
        const selectedNodeId = ref(null);
        const tree = computed(
          () => typeof options.tree === "function" ? options.tree() : options.tree
        );
        function handleSelect(nodes) {
          if (nodes.length > 0) {
            selectedNodeId.value = nodes[0].id;
          }
        }
        function handleCreateFolder(parentId) {
          if (options.onCreateFolder) {
            return options.onCreateFolder(parentId);
          }
          const storage = useStorage();
          const newNode = storage.createNode(tree.value, "新建文件夹", void 0, parentId);
          return newNode.id;
        }
        function handleCreateItem(parentId) {
          if (options.onCreateItem) {
            return options.onCreateItem(parentId);
          }
          throw new Error("onCreateItem is required");
        }
        async function handleEditItem(nodeId) {
          if (options.onEditItem) {
            await options.onEditItem(nodeId);
          }
        }
        function handleRename(nodeId, newName) {
          const trimmedName = newName.trim();
          if (trimmedName) {
            renameNode(tree.value, nodeId, trimmedName);
          }
        }
        async function handleDelete(nodeId) {
          const node = tree.value.nodes[nodeId];
          if (!node) return;
          const confirmed = await modal.openModal({
            type: "delete",
            title: "确认删除",
            formData: { message: `确定要删除"${node.name}"吗？` }
          });
          if (confirmed) {
            deleteNode(tree.value, nodeId);
          }
        }
        return {
          selectedNodeId,
          tree,
          handleSelect,
          handleCreateFolder,
          handleCreateItem,
          handleEditItem,
          handleRename,
          handleDelete,
          modal
        };
      }

    })
  };
}));

System.register("./EditTab-BdJemFYU-u7Tc2tmU.js", ['vue', './useModal-Cv530RMh-DbZQZjC8.js', './__monkey.entry-CNjZeeHM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, ref, watch, onMounted, createElementBlock, openBlock, Fragment, createVNode, createCommentVNode, unref, withCtx, createElementVNode, withDirectives, createTextVNode, withKeys, vModelText, vModelSelect, toDisplayString, createBlock, renderList, normalizeStyle, normalizeClass, renderSlot, withModifiers, onUnmounted, vModelCheckbox, useSlots, TransitionGroup, useModal, _export_sfc, useStorage, getSelectedDiscountIndicatorTemplate, getSelectedDescriptionTemplate, getSelectedDiscountTemplate, toast, Modal, withSize, icons, createDefaultItemConfig, getSelectedNameTemplate;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      computed = module.computed;
      ref = module.ref;
      watch = module.watch;
      onMounted = module.onMounted;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      Fragment = module.Fragment;
      createVNode = module.createVNode;
      createCommentVNode = module.createCommentVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createElementVNode = module.createElementVNode;
      withDirectives = module.withDirectives;
      createTextVNode = module.createTextVNode;
      withKeys = module.withKeys;
      vModelText = module.vModelText;
      vModelSelect = module.vModelSelect;
      toDisplayString = module.toDisplayString;
      createBlock = module.createBlock;
      renderList = module.renderList;
      normalizeStyle = module.normalizeStyle;
      normalizeClass = module.normalizeClass;
      renderSlot = module.renderSlot;
      withModifiers = module.withModifiers;
      onUnmounted = module.onUnmounted;
      vModelCheckbox = module.vModelCheckbox;
      useSlots = module.useSlots;
      TransitionGroup = module.TransitionGroup;
    }, module => {
      useModal = module.u;
    }, module => {
      _export_sfc = module._;
      useStorage = module.u;
      getSelectedDiscountIndicatorTemplate = module.g;
      getSelectedDescriptionTemplate = module.b;
      getSelectedDiscountTemplate = module.c;
      toast = module.t;
      Modal = module.M;
      withSize = module.w;
      icons = module.i;
      createDefaultItemConfig = module.d;
      getSelectedNameTemplate = module.e;
    }],
    execute: (function () {

      const _hoisted_1$k = { class: "file-selector" };
      const _hoisted_2$k = ["onClick"];
      const _hoisted_3$j = { class: "be-text-sm be-font-medium" };
      const _hoisted_4$i = {
        key: 1,
        class: "empty-hint be-text-center be-text-secondary be-py-md"
      };
      const _sfc_main$k = /* @__PURE__ */ defineComponent({
        __name: "FileSelector",
        props: {
          files: {},
          selectedFileIds: {},
          emptyText: {},
          columns: {},
          maxHeight: {}
        },
        emits: ["update:selectedFileIds"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          function toggleFileSelection(fileId) {
            const currentSelection = [...props.selectedFileIds];
            const index = currentSelection.indexOf(fileId);
            if (index > -1) {
              currentSelection.splice(index, 1);
            } else {
              currentSelection.push(fileId);
            }
            emit("update:selectedFileIds", currentSelection);
          }
          function isFileSelected(fileId) {
            return props.selectedFileIds.includes(fileId);
          }
          const gridColumns = computed(() => props.columns || 2);
          const emptyHint = computed(() => props.emptyText || "暂无文件，请先上传文件");
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1$k, [
              _ctx.files.length > 0 ? (openBlock(), createElementBlock("div", {
                key: 0,
                class: "file-grid",
                style: normalizeStyle({
                  gridTemplateColumns: `repeat(${gridColumns.value}, 1fr)`,
                  maxHeight: _ctx.maxHeight || "300px"
                })
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.files, (file) => {
                  return openBlock(), createElementBlock("button", {
                    key: file.id,
                    class: normalizeClass(["file-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start", { "is-selected": isFileSelected(file.id) }]),
                    type: "button",
                    onClick: ($event) => toggleFileSelection(file.id)
                  }, [
                    createElementVNode("span", _hoisted_3$j, toDisplayString(file.name), 1)
                  ], 10, _hoisted_2$k);
                }), 128))
              ], 4)) : (openBlock(), createElementBlock("div", _hoisted_4$i, toDisplayString(emptyHint.value), 1))
            ]);
          };
        }
      });
      const FileSelector = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-43c71f00"]]);
      const _hoisted_1$j = { class: "preview-box be-flex be-flex-column be-gap-xs" };
      const _hoisted_2$j = {
        key: 0,
        class: "be-text-xs be-text-secondary"
      };
      const _hoisted_3$i = {
        key: 1,
        class: "be-text-secondary"
      };
      const _hoisted_4$h = {
        key: 2,
        class: "be-whitespace-pre-wrap be-break-words be-m-0"
      };
      const _hoisted_5$e = { key: 3 };
      const _sfc_main$j = /* @__PURE__ */ defineComponent({
        __name: "PreviewBox",
        props: {
          label: {},
          type: {},
          isEmpty: { type: Boolean },
          emptyText: {}
        },
        setup(__props) {
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1$j, [
              _ctx.label ? (openBlock(), createElementBlock("div", _hoisted_2$j, toDisplayString(_ctx.label), 1)) : createCommentVNode("", true),
              _ctx.isEmpty ? (openBlock(), createElementBlock("div", _hoisted_3$i, toDisplayString(_ctx.emptyText || "暂无内容"), 1)) : _ctx.type === "pre" ? (openBlock(), createElementBlock("pre", _hoisted_4$h, [
                _cache[0] || (_cache[0] = createTextVNode("      ", -1)),
                renderSlot(_ctx.$slots, "default", {}, void 0, true),
                _cache[1] || (_cache[1] = createTextVNode("\n    ", -1))
              ])) : (openBlock(), createElementBlock("div", _hoisted_5$e, [
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ]))
            ]);
          };
        }
      });
      const PreviewBox = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-93d09832"]]);
      const _hoisted_1$i = {
        key: 0,
        class: "section-header"
      };
      const _hoisted_2$i = {
        key: 0,
        class: "be-text-base be-font-bold"
      };
      const _hoisted_3$h = {
        key: 1,
        class: "actions"
      };
      const _hoisted_4$g = { class: "section-content" };
      const _sfc_main$i = /* @__PURE__ */ defineComponent({
        __name: "SectionHeader",
        props: {
          title: { default: "" },
          noBorder: { type: Boolean, default: false }
        },
        setup(__props) {
          const props = __props;
          const slots = useSlots();
          const hasHeader = computed(() => props.title || slots.title || slots.actions);
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("section", {
              class: normalizeClass(["section-header-container", { "no-header": !hasHeader.value, "no-border": _ctx.noBorder }])
            }, [
              hasHeader.value ? (openBlock(), createElementBlock("div", _hoisted_1$i, [
                _ctx.title || _ctx.$slots.title ? (openBlock(), createElementBlock("div", _hoisted_2$i, [
                  renderSlot(_ctx.$slots, "title", {}, () => [
                    createTextVNode(toDisplayString(_ctx.title), 1)
                  ], true)
                ])) : createCommentVNode("", true),
                _ctx.$slots.actions ? (openBlock(), createElementBlock("div", _hoisted_3$h, [
                  renderSlot(_ctx.$slots, "actions", {}, void 0, true)
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              createElementVNode("div", _hoisted_4$g, [
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ])
            ], 2);
          };
        }
      });
      const SectionHeader = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-5643104c"]]);
      const _hoisted_1$h = { class: "template-selector" };
      const _hoisted_2$h = {
        key: 0,
        class: "template-selector-label"
      };
      const _hoisted_3$g = ["value"];
      const _hoisted_4$f = {
        key: 2,
        class: "empty-hint"
      };
      const _sfc_main$h = /* @__PURE__ */ defineComponent({
        __name: "TemplateSelector",
        props: {
          modelValue: { default: "" },
          templates: { default: () => [] },
          label: { default: "选择模板" },
          placeholder: { default: "请选择模板" },
          emptyHint: { default: "暂无可用模板" }
        },
        emits: ["update:modelValue"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const selectedValue = computed({
            get() {
              return props.modelValue || "";
            },
            set(value) {
              emit("update:modelValue", value);
            }
          });
          function ensureValidSelection(templates) {
            if (!templates || templates.length === 0) {
              emit("update:modelValue", "");
              return;
            }
            const currentValue = props.modelValue || "";
            const currentExists = templates.some((t) => t.id === currentValue);
            if (!currentExists) {
              emit("update:modelValue", templates[0].id);
            }
          }
          watch(() => props.templates, ensureValidSelection, { immediate: true });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1$h, [
              _ctx.label ? (openBlock(), createElementBlock("label", _hoisted_2$h, toDisplayString(_ctx.label), 1)) : createCommentVNode("", true),
              _ctx.templates && _ctx.templates.length > 0 ? withDirectives((openBlock(), createElementBlock("select", {
                key: 1,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedValue.value = $event),
                class: "template-selector-select"
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.templates, (template) => {
                  return openBlock(), createElementBlock("option", {
                    key: template.id,
                    value: template.id
                  }, toDisplayString(template.name), 9, _hoisted_3$g);
                }), 128))
              ], 512)), [
                [vModelSelect, selectedValue.value]
              ]) : (openBlock(), createElementBlock("div", _hoisted_4$f, toDisplayString(_ctx.emptyHint), 1))
            ]);
          };
        }
      });
      const TemplateSelector = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-3d389fdb"]]);
      const _hoisted_1$g = ["onDragstart", "onDragover"];
      const _hoisted_2$g = { class: "card-actions" };
      const _hoisted_3$f = ["innerHTML", "onMousedown", "onTouchstart"];
      const _hoisted_4$e = { class: "card-number" };
      const _hoisted_5$d = { class: "actions-content" };
      const _hoisted_6$d = ["onClick"];
      const _hoisted_7$a = ["innerHTML"];
      const _hoisted_8$8 = { class: "card-content" };
      const DRAG_THRESHOLD = 10;
      const DEAD_ZONE = 5;
      const _sfc_main$g = /* @__PURE__ */ defineComponent({
        __name: "DraggableCardList",
        props: {
          items: {},
          keyExtractor: { type: Function, default: (item, index) => (item == null ? void 0 : item.id) ?? index },
          isItemLocked: { type: Function, default: () => false }
        },
        emits: ["remove", "reorder"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const containerRef = ref(null);
          const draggedIndex = ref(null);
          const dragOverIndex = ref(null);
          const isDragging = ref(false);
          const canDrag = ref(false);
          const isTransitioning = ref(false);
          const touchStartY = ref(0);
          const touchCurrentY = ref(0);
          const displayItems = computed(() => {
            const dragged = draggedIndex.value;
            const dragOver = dragOverIndex.value;
            if (dragged === null || dragOver === null || dragged === dragOver) {
              return props.items;
            }
            const items = [...props.items];
            const draggedItem = items[dragged];
            items.splice(dragged, 1);
            const insertIndex = dragOver > dragged ? dragOver - 1 : dragOver;
            items.splice(insertIndex, 0, draggedItem);
            return items;
          });
          function getOriginalIndex(item) {
            return props.items.indexOf(item);
          }
          function resetDragState() {
            draggedIndex.value = null;
            dragOverIndex.value = null;
            isDragging.value = false;
            canDrag.value = false;
            touchStartY.value = 0;
            touchCurrentY.value = 0;
          }
          function calculateInsertPosition(relativeY, height, targetOriginalIndex) {
            const midY = height / 2;
            if (relativeY < midY - DEAD_ZONE) {
              return targetOriginalIndex;
            }
            if (relativeY > midY + DEAD_ZONE) {
              return targetOriginalIndex + 1;
            }
            return null;
          }
          function tryUpdateDragOverIndex(newIndex) {
            var _a;
            if (newIndex === null || dragOverIndex.value === newIndex) {
              return;
            }
            if (newIndex < props.items.length) {
              const itemAtNewIndex = props.items[newIndex];
              if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, itemAtNewIndex, newIndex)) {
                return;
              }
            }
            dragOverIndex.value = newIndex;
          }
          function onHandleMouseDown(item, index) {
            var _a;
            if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, item, index)) {
              return;
            }
            canDrag.value = true;
          }
          function onHandleMouseUp() {
            canDrag.value = false;
          }
          function onDragStart(event, item, index) {
            var _a;
            if (!canDrag.value || ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, item, index))) {
              event.preventDefault();
              return;
            }
            draggedIndex.value = index;
            dragOverIndex.value = index;
          }
          function onDragEnd() {
            resetDragState();
          }
          function onDragOver(event, targetIndex) {
            var _a;
            event.preventDefault();
            if (draggedIndex.value === null) return;
            const targetItem = displayItems.value[targetIndex];
            const targetOriginalIndex = getOriginalIndex(targetItem);
            if (draggedIndex.value === targetOriginalIndex) return;
            if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, targetItem, targetOriginalIndex)) {
              return;
            }
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();
            const relativeY = event.clientY - rect.top;
            const newIndex = calculateInsertPosition(relativeY, rect.height, targetOriginalIndex);
            tryUpdateDragOverIndex(newIndex);
          }
          function handleDragComplete() {
            var _a;
            const dragged = draggedIndex.value;
            const dragOver = dragOverIndex.value;
            if (dragged === null || dragOver === null) {
              resetDragState();
              return;
            }
            const finalIndex = dragOver > dragged ? dragOver - 1 : dragOver;
            if (finalIndex < props.items.length && finalIndex !== dragged) {
              const itemAtFinalIndex = props.items[finalIndex];
              if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, itemAtFinalIndex, finalIndex)) {
                resetDragState();
                return;
              }
            }
            if (dragged !== finalIndex) {
              resetDragState();
              isTransitioning.value = true;
              emit("reorder", dragged, finalIndex);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  isTransitioning.value = false;
                });
              });
            } else {
              resetDragState();
            }
          }
          function onDrop(event) {
            event.preventDefault();
            handleDragComplete();
          }
          function onTouchStart(event, item, index) {
            var _a;
            if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, item, index)) {
              return;
            }
            const touch = event.touches[0];
            touchStartY.value = touch.clientY;
            touchCurrentY.value = touch.clientY;
            draggedIndex.value = index;
            dragOverIndex.value = index;
            isDragging.value = false;
          }
          function onTouchMove(event) {
            var _a;
            if (draggedIndex.value === null || !containerRef.value) return;
            const touch = event.touches[0];
            touchCurrentY.value = touch.clientY;
            const dragDistance = Math.abs(touchCurrentY.value - touchStartY.value);
            if (dragDistance > DRAG_THRESHOLD) {
              isDragging.value = true;
              event.preventDefault();
              const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
              const cardElement = elements.find((el) => el.classList.contains("draggable-card"));
              if (!cardElement) return;
              const rect = cardElement.getBoundingClientRect();
              const relativeY = touch.clientY - rect.top;
              const allCards = Array.from(containerRef.value.querySelectorAll(".draggable-card"));
              const targetIndex = allCards.indexOf(cardElement);
              if (targetIndex === -1 || targetIndex >= displayItems.value.length) return;
              const targetItem = displayItems.value[targetIndex];
              const targetOriginalIndex = getOriginalIndex(targetItem);
              if (draggedIndex.value === targetOriginalIndex) return;
              if ((_a = props.isItemLocked) == null ? void 0 : _a.call(props, targetItem, targetOriginalIndex)) {
                return;
              }
              const newIndex = calculateInsertPosition(relativeY, rect.height, targetOriginalIndex);
              tryUpdateDragOverIndex(newIndex);
            }
          }
          function onTouchEnd() {
            if (draggedIndex.value === null || !isDragging.value) {
              resetDragState();
              return;
            }
            handleDragComplete();
          }
          function handleRemove(index) {
            emit("remove", index);
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", {
              ref_key: "containerRef",
              ref: containerRef,
              class: "draggable-card-list"
            }, [
              createVNode(TransitionGroup, {
                name: isTransitioning.value ? "" : "drag-transition"
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(displayItems.value, (item, index) => {
                    var _a, _b, _c;
                    return openBlock(), createElementBlock("div", {
                      key: _ctx.keyExtractor(item, getOriginalIndex(item)),
                      class: normalizeClass(["draggable-card", {
                        "is-dragging": getOriginalIndex(item) === draggedIndex.value,
                        "is-drag-over": draggedIndex.value !== null && getOriginalIndex(item) !== draggedIndex.value
                      }]),
                      draggable: "true",
                      onDragstart: ($event) => onDragStart($event, item, getOriginalIndex(item)),
                      onDragend: onDragEnd,
                      onDragover: ($event) => onDragOver($event, index),
                      onDrop
                    }, [
                      createElementVNode("div", _hoisted_2$g, [
                        createElementVNode("span", {
                          class: normalizeClass(["drag-handle", { "is-locked": (_a = props.isItemLocked) == null ? void 0 : _a.call(props, item, getOriginalIndex(item)) }]),
                          innerHTML: ((_b = props.isItemLocked) == null ? void 0 : _b.call(props, item, getOriginalIndex(item))) ? unref(withSize)(unref(icons).lock, 14) : unref(withSize)(unref(icons).moreVertical, 14),
                          onMousedown: ($event) => onHandleMouseDown(item, getOriginalIndex(item)),
                          onMouseup: onHandleMouseUp,
                          onTouchstart: ($event) => onTouchStart($event, item, getOriginalIndex(item)),
                          onTouchmove: onTouchMove,
                          onTouchend: onTouchEnd
                        }, null, 42, _hoisted_3$f),
                        createElementVNode("span", _hoisted_4$e, "#" + toDisplayString(index + 1), 1),
                        createElementVNode("div", _hoisted_5$d, [
                          renderSlot(_ctx.$slots, "actions", {
                            item,
                            index: getOriginalIndex(item)
                          }, void 0, true)
                        ]),
                        !((_c = _ctx.isItemLocked) == null ? void 0 : _c.call(_ctx, item, getOriginalIndex(item))) ? (openBlock(), createElementBlock("button", {
                          key: 0,
                          class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                          onClick: withModifiers(($event) => handleRemove(getOriginalIndex(item)), ["stop"]),
                          title: "删除"
                        }, [
                          createElementVNode("span", {
                            innerHTML: unref(withSize)(unref(icons).trash, 14)
                          }, null, 8, _hoisted_7$a)
                        ], 8, _hoisted_6$d)) : createCommentVNode("", true)
                      ]),
                      createElementVNode("div", _hoisted_8$8, [
                        renderSlot(_ctx.$slots, "content", {
                          item,
                          index: getOriginalIndex(item)
                        }, void 0, true)
                      ])
                    ], 42, _hoisted_1$g);
                  }), 128))
                ]),
                _: 3
              }, 8, ["name"])
            ], 512);
          };
        }
      });
      const DraggableCardList = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-89529f85"]]);
      function useTemplateManager(options) {
        const { templates, defaultTemplate, minTemplates = 1 } = options;
        function addTemplate() {
          const templateArray = templates.value || (templates.value = []);
          const newTemplate = {
            id: crypto.randomUUID(),
            name: `模板 ${templateArray.length + 1}`,
            isDefault: false,
            ...defaultTemplate
          };
          templateArray.push(newTemplate);
        }
        function removeTemplate(index) {
          const templateArray = templates.value;
          if (!templateArray || templateArray.length <= minTemplates) return;
          templateArray.splice(index, 1);
        }
        function setDefaultTemplate(index) {
          const templateArray = templates.value;
          if (!templateArray) return;
          templateArray.forEach((t, i) => {
            t.isDefault = i === index;
          });
        }
        function onReorder(fromIndex, toIndex) {
          const templateArray = templates.value;
          if (!templateArray) return;
          const [removed] = templateArray.splice(fromIndex, 1);
          templateArray.splice(toIndex, 0, removed);
        }
        return {
          addTemplate,
          removeTemplate,
          setDefaultTemplate,
          onReorder
        };
      }
      function applyDiscount(originalPrice, discount) {
        if (!discount.enabled || discount.discountPercent === 0) {
          return originalPrice;
        }
        return Math.round(originalPrice * (1 - discount.discountPercent / 100));
      }
      function calculateVariationPrices(variations, pricing, discount) {
        variations.forEach((variation) => {
          const basePrice = variation.isFullset ? pricing.fullsetPrice : pricing.normalVariationPrice;
          variation.price = applyDiscount(basePrice, discount);
        });
      }
      function suggestFullsetPrice(normalPrice, totalSupport, discount) {
        const baseFullsetPrice = normalPrice * totalSupport;
        return applyDiscount(baseFullsetPrice, discount);
      }
      const TEMPLATE_VAR_MAP = {
        "商品名": "itemName",
        "支持数": "supportCount",
        "商品类型": "itemTypeName",
        "商品类型复数": "itemTypePlural",
        "变体数量": "variationCount",
        "首个变体名": "firstName",
        "智能标题": "smartTitle",
        "折扣标识": "discountIndicator",
        "原价": "originalPrice",
        "折扣价": "discountedPrice",
        "折扣百分比": "discountPercent",
        "Fullset原价": "fullsetOriginalPrice",
        "Fullset折扣价": "fullsetDiscountedPrice",
        "折扣开始时间": "startDate",
        "折扣结束时间": "endDate",
        "日期": "date",
        "内容": "content",
        "作者名": "authorName",
        "商品链接": "itemUrl"
      };
      const TEMPLATE_REGEX_MAP = Object.keys(TEMPLATE_VAR_MAP).reduce(
        (acc, chineseName) => {
          acc[chineseName] = new RegExp(`\\{${chineseName}\\}`, "g");
          return acc;
        },
        {}
      );
      function parseTemplate(template, variables) {
        let result = template;
        Object.entries(TEMPLATE_VAR_MAP).forEach(([chineseName, englishName]) => {
          const value = variables[englishName];
          if (value !== void 0 && value !== null) {
            result = result.replace(TEMPLATE_REGEX_MAP[chineseName], String(value));
          }
        });
        return result;
      }
      function formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}/${month}/${day}`;
      }
      function formatDateTime(isoString) {
        if (!isoString) return "";
        const date = new Date(isoString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${month}/${day} ${hour}:${minute}`;
      }
      function calculateTotalSupport(variations) {
        return variations.filter((v) => !v.isFullset).reduce((sum, v) => {
          if (!v.fileItemMap) return sum;
          const count = Object.keys(v.fileItemMap).filter((fileId) => v.fileItemMap[fileId]).length;
          return sum + count;
        }, 0);
      }
      function pluralize(word, count) {
        if (count === 1) return word;
        if (!word) return word;
        const lowerWord = word.toLowerCase();
        if (/[sxz]$|[cs]h$/.test(lowerWord)) {
          return word + "es";
        }
        if (/[^aeiou]y$/.test(lowerWord)) {
          return word.slice(0, -1) + "ies";
        }
        return word + "s";
      }
      function createSectionByType(type, globalTemplates) {
        var _a, _b, _c, _d;
        const id = crypto.randomUUID();
        switch (type) {
          case "normal":
            return {
              id,
              type: "normal",
              headline: "",
              body: ""
            };
          case "log":
            const firstLogTemplate = ((_b = (_a = globalTemplates.logTemplates) == null ? void 0 : _a[0]) == null ? void 0 : _b.id) || "";
            return {
              id,
              type: "log",
              headline: "更新日志",
              logEntries: [],
              logTemplateId: firstLogTemplate
            };
          case "iteminfo":
            const firstItemInfoTemplate = ((_d = (_c = globalTemplates.itemInfoTemplates) == null ? void 0 : _c[0]) == null ? void 0 : _d.id) || "";
            return {
              id,
              type: "iteminfo",
              headline: "対応アバター",
              itemInfoTemplateId: firstItemInfoTemplate
            };
        }
      }
      function createSectionFromTemplate(template, globalTemplates) {
        var _a, _b, _c, _d;
        const templateType = template.type || "normal";
        const id = crypto.randomUUID();
        switch (templateType) {
          case "iteminfo":
            const firstItemInfoTemplate = ((_b = (_a = globalTemplates.itemInfoTemplates) == null ? void 0 : _a[0]) == null ? void 0 : _b.id) || "";
            return {
              id,
              type: "iteminfo",
              headline: template.headline || "対応アバター",
              itemInfoTemplateId: firstItemInfoTemplate
            };
          case "log":
            const firstLogTemplate = ((_d = (_c = globalTemplates.logTemplates) == null ? void 0 : _c[0]) == null ? void 0 : _d.id) || "";
            return {
              id,
              type: "log",
              headline: template.headline || "更新日志",
              logEntries: [],
              logTemplateId: firstLogTemplate
            };
          default:
            return {
              id,
              type: "normal",
              templateId: template.id,
              headline: template.headline,
              body: template.body || ""
            };
        }
      }
      function resolveSectionContent(section, globalTemplates, context) {
        if (!section.type) {
          section.type = "normal";
        }
        switch (section.type) {
          case "normal":
            return resolveNormalSection(section, globalTemplates.sectionTemplates);
          case "log":
            return resolveLogSection(section, globalTemplates.logTemplates);
          case "iteminfo":
            return resolveItemInfoSection(
              section,
              globalTemplates.itemInfoTemplates,
              context
            );
          default:
            return { headline: section.headline || "", body: section.body || "" };
        }
      }
      function resolveNormalSection(section, templates) {
        if (section.templateId && templates) {
          const template = templates.find((t) => t.id === section.templateId);
          if (template) {
            return {
              headline: section.headline ?? template.headline,
              body: section.body ?? template.body ?? ""
            };
          }
        }
        return {
          headline: section.headline ?? "",
          body: section.body ?? ""
        };
      }
      function resolveLogSection(section, templates) {
        const headline = section.headline ?? "更新日志";
        const template = templates == null ? void 0 : templates.find((t) => t.id === section.logTemplateId);
        const templateStr = (template == null ? void 0 : template.template) || "{日期} - {内容}";
        const entries = section.logEntries.map((entry) => {
          return parseTemplate(templateStr, {
            date: formatDate(entry.date),
            content: entry.content
          });
        });
        const body = entries.join("\n\n");
        return { headline, body };
      }
      function resolveItemInfoSection(section, templates, context) {
        const headline = section.headline ?? "対応アバター";
        const template = templates == null ? void 0 : templates.find((t) => t.id === section.itemInfoTemplateId);
        const templateStr = (template == null ? void 0 : template.template) || "⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -";
        const items = collectItemsFromVariations(context.variations, context.itemTree);
        const body = formatItemInfoList(items, templateStr);
        return { headline, body };
      }
      function collectItemsFromVariations(variations, itemTree) {
        const items = [];
        const seen = /* @__PURE__ */ new Set();
        variations.forEach((variation) => {
          if (variation.fileItemMap) {
            Object.values(variation.fileItemMap).forEach((itemId) => {
              if (itemId && !seen.has(itemId)) {
                const node = itemTree.nodes[itemId];
                if (node == null ? void 0 : node.data) {
                  items.push(node.data);
                  seen.add(itemId);
                }
              }
            });
          }
        });
        return items;
      }
      function groupItemsByAuthor(items) {
        const grouped = /* @__PURE__ */ new Map();
        items.forEach((item) => {
          const author = item.authorName || "未知作者";
          if (!grouped.has(author)) {
            grouped.set(author, []);
          }
          grouped.get(author).push(item);
        });
        return grouped;
      }
      function formatItemInfoList(items, itemInfoTemplate) {
        const grouped = groupItemsByAuthor(items);
        const results = [];
        grouped.forEach((authorItems) => {
          authorItems.forEach((item) => {
            const formatted = parseTemplate(itemInfoTemplate, {
              authorName: item.authorName,
              itemName: item.itemName,
              itemUrl: item.itemUrl
            });
            results.push(formatted);
          });
        });
        return results.join("\n\n");
      }
      const TEMPLATE_HINTS = {
        // 基础模板变量提示（用于名称、描述、Section 模板）
        basic: "基础: {商品名}, {支持数}, {商品类型}, {商品类型复数}, {变体数量}, {首个变体名}",
        smart: "智能: {智能标题}, {折扣标识}",
        // Log 模板变量提示
        log: "可用变量: {日期}, {内容}",
        // 折扣模板变量提示
        discount: "可用变量: {原价}, {折扣价}, {折扣百分比}, {Fullset原价}, {Fullset折扣价}, {折扣开始时间}, {折扣结束时间}",
        // 完整的基础和智能变量提示
        get full() {
          return `${this.basic}
${this.smart}`;
        }
      };
      const BUTTON_CLASSES = {
        addButton: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
        closeButton: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
        saveButton: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
      };
      const _hoisted_1$f = ["innerHTML"];
      const _hoisted_2$f = ["innerHTML"];
      const _hoisted_3$e = ["onUpdate:modelValue"];
      const _hoisted_4$d = { class: "form-group" };
      const _hoisted_5$c = ["onUpdate:modelValue"];
      const _hoisted_6$c = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$f = /* @__PURE__ */ defineComponent({
        __name: "DescriptionTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const templates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).descriptionTemplates || (_a.descriptionTemplates = []);
            },
            set(value) {
              props.globalTemplates.descriptionTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "描述模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$f)
                ], 2)
              ]),
              default: withCtx(() => [
                createVNode(unref(SectionHeader), null, {
                  default: withCtx(() => [
                    createElementVNode("p", {
                      class: "form-hint",
                      innerHTML: unref(TEMPLATE_HINTS).full.replace("\n", "<br>")
                    }, null, 8, _hoisted_2$f),
                    _ctx.globalTemplates.descriptionTemplates && _ctx.globalTemplates.descriptionTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                      key: 0,
                      items: _ctx.globalTemplates.descriptionTemplates,
                      "key-extractor": (item) => item.id,
                      onRemove: unref(removeTemplate),
                      onReorder: unref(onReorder)
                    }, {
                      actions: withCtx(({ item }) => [
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": ($event) => item.name = $event,
                          type: "text",
                          placeholder: "输入模板名称",
                          style: { "flex": "1", "min-width": "0" }
                        }, null, 8, _hoisted_3$e), [
                          [vModelText, item.name]
                        ])
                      ]),
                      content: withCtx(({ item }) => [
                        createElementVNode("div", _hoisted_4$d, [
                          _cache[2] || (_cache[2] = createElementVNode("label", null, "模板内容", -1)),
                          withDirectives(createElementVNode("textarea", {
                            "onUpdate:modelValue": ($event) => item.template = $event,
                            rows: "1",
                            placeholder: "输入模板内容"
                          }, null, 8, _hoisted_5$c), [
                            [vModelText, item.template]
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_6$c, ' 暂无模板，点击"添加模板"创建 '))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$e = ["innerHTML"];
      const _hoisted_2$e = ["innerHTML"];
      const _sfc_main$e = /* @__PURE__ */ defineComponent({
        __name: "ItemDescriptionSection",
        props: {
          itemConfig: {},
          globalTemplates: {},
          templateVars: {},
          api: {},
          modal: {},
          currentItemId: {},
          onDescriptionUpdated: { type: Function }
        },
        emits: ["applied"],
        setup(__props, { expose: __expose, emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const previewDescription = computed(() => {
            const parts = [];
            const descTemplate = getSelectedDescriptionTemplate(props.globalTemplates, props.itemConfig);
            const templateDesc = parseTemplate(descTemplate, props.templateVars);
            if (templateDesc) parts.push(templateDesc);
            if (props.itemConfig.customDescription) {
              parts.push(props.itemConfig.customDescription);
            }
            if (props.itemConfig.discount.enabled) {
              const normalOriginalPrice = props.itemConfig.pricing.normalVariationPrice;
              const normalDiscountedPrice = applyDiscount(normalOriginalPrice, props.itemConfig.discount);
              const fullsetOriginalPrice = props.itemConfig.pricing.fullsetPrice;
              const fullsetDiscountedPrice = applyDiscount(fullsetOriginalPrice, props.itemConfig.discount);
              const discountTemplate = getSelectedDiscountTemplate(props.globalTemplates, props.itemConfig);
              const discountText = parseTemplate(discountTemplate, {
                ...props.templateVars,
                originalPrice: normalOriginalPrice,
                discountedPrice: normalDiscountedPrice,
                discountPercent: props.itemConfig.discount.discountPercent,
                fullsetOriginalPrice,
                fullsetDiscountedPrice,
                startDate: formatDateTime(props.itemConfig.discount.startDate),
                endDate: formatDateTime(props.itemConfig.discount.endDate)
              });
              parts.push(discountText);
            }
            return parts.join("\n\n");
          });
          async function handleEditDescription() {
            const result = await props.modal.openModal({
              type: "editDescription",
              title: "编辑描述",
              formData: {
                customDescription: props.itemConfig.customDescription
              }
            });
            if (result) {
              props.onDescriptionUpdated(result.customDescription);
            }
          }
          function applyDescription() {
            props.api.setDescription(previewDescription.value);
            toast.success("已应用描述");
            emit("applied");
          }
          __expose({
            applyDescription
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(unref(SectionHeader), { title: "商品描述" }, {
              actions: withCtx(() => [
                createElementVNode("button", {
                  class: "booth-btn booth-btn-sm booth-btn-secondary",
                  type: "button",
                  title: "编辑描述",
                  onClick: handleEditDescription
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).edit, 14)
                  }, null, 8, _hoisted_1$e)
                ]),
                createElementVNode("button", {
                  class: "booth-btn booth-btn-sm booth-btn-primary",
                  type: "button",
                  title: "应用到页面",
                  onClick: applyDescription
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).send, 14)
                  }, null, 8, _hoisted_2$e)
                ])
              ]),
              default: withCtx(() => [
                createVNode(unref(PreviewBox), {
                  label: "预览:",
                  type: "pre",
                  "is-empty": !previewDescription.value,
                  "empty-text": '暂无描述，点击"编辑描述"添加'
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(previewDescription.value), 1)
                  ]),
                  _: 1
                }, 8, ["is-empty"])
              ]),
              _: 1
            });
          };
        }
      });
      const _hoisted_1$d = ["innerHTML"];
      const _hoisted_2$d = ["onUpdate:modelValue"];
      const _hoisted_3$d = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_4$c = { class: "form-group" };
      const _hoisted_5$b = ["onUpdate:modelValue"];
      const _hoisted_6$b = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$d = /* @__PURE__ */ defineComponent({
        __name: "DiscountIndicatorTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const templates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).discountIndicatorTemplates || (_a.discountIndicatorTemplates = []);
            },
            set(value) {
              props.globalTemplates.discountIndicatorTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "[SALE] " }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "折扣标识模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$d)
                ], 2)
              ]),
              default: withCtx(() => [
                createVNode(unref(SectionHeader), null, {
                  default: withCtx(() => [
                    _cache[3] || (_cache[3] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary" }, " 配置折扣标识的显示样式，可用变量: {折扣百分比} ", -1)),
                    _ctx.globalTemplates.discountIndicatorTemplates && _ctx.globalTemplates.discountIndicatorTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                      key: 0,
                      items: _ctx.globalTemplates.discountIndicatorTemplates,
                      "key-extractor": (item) => item.id,
                      onRemove: unref(removeTemplate),
                      onReorder: unref(onReorder)
                    }, {
                      actions: withCtx(({ item: template }) => [
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": ($event) => template.name = $event,
                          type: "text",
                          placeholder: "输入模板名称",
                          style: { "flex": "1", "min-width": "0" }
                        }, null, 8, _hoisted_2$d), [
                          [vModelText, template.name]
                        ])
                      ]),
                      content: withCtx(({ item }) => [
                        createElementVNode("div", _hoisted_3$d, [
                          createElementVNode("div", _hoisted_4$c, [
                            _cache[2] || (_cache[2] = createElementVNode("label", null, "模板内容", -1)),
                            withDirectives(createElementVNode("input", {
                              "onUpdate:modelValue": ($event) => item.template = $event,
                              type: "text",
                              placeholder: "如: [SALE] 或 🔥 或 [-{折扣百分比}%]"
                            }, null, 8, _hoisted_5$b), [
                              [vModelText, item.template]
                            ])
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_6$b, ' 暂无模板，点击"添加模板"创建 '))
                  ]),
                  _: 1,
                  __: [3]
                })
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$c = ["innerHTML"];
      const _hoisted_2$c = ["innerHTML"];
      const _hoisted_3$c = ["innerHTML"];
      const _hoisted_4$b = ["onUpdate:modelValue"];
      const _hoisted_5$a = ["onClick"];
      const _hoisted_6$a = ["innerHTML"];
      const _hoisted_7$9 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_8$7 = { class: "form-group" };
      const _hoisted_9$7 = ["onUpdate:modelValue"];
      const _hoisted_10$5 = {
        key: 1,
        class: "empty-hint"
      };
      const _hoisted_11$5 = { class: "be-text-primary be-text-lg be-font-semibold" };
      const _hoisted_12$5 = ["innerHTML"];
      const _sfc_main$c = /* @__PURE__ */ defineComponent({
        __name: "NameTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {},
          itemConfig: {},
          itemTree: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showPreviewModal = ref(false);
          const previewTemplateIndex = ref(-1);
          const templates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).nameTemplates || (_a.nameTemplates = []);
            },
            set(value) {
              props.globalTemplates.nameTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "{smartTitle}" }
          });
          const showDiscountIndicatorModal = ref(false);
          const templateVars = computed(() => {
            const config = props.itemConfig;
            if (!config) return { itemName: "", supportCount: 0 };
            const normalVariations = config.variations.filter((v) => !v.isFullset);
            const firstVariation = normalVariations[0];
            const supportCount = calculateTotalSupport(config.variations);
            const itemTypeName = config.itemTypeName || "Item";
            const firstItemId = (firstVariation == null ? void 0 : firstVariation.fileItemMap) ? Object.values(firstVariation.fileItemMap)[0] : null;
            const getItemName = (itemId) => {
              const node = props.itemTree.nodes[itemId];
              if (!node) return "未知商品";
              const itemData = node.data;
              if (!itemData) return node.name;
              return itemData.itemName;
            };
            const firstName = (firstVariation == null ? void 0 : firstVariation.name) || firstItemId && getItemName(firstItemId) || config.itemName;
            const smartTitle = normalVariations.length > 1 || supportCount > 1 ? `${supportCount} ${pluralize(itemTypeName, supportCount)}` : firstName;
            const discountIndicatorTemplate = config.discount.enabled ? getSelectedDiscountIndicatorTemplate(props.globalTemplates, config) : "";
            const discountIndicator = parseTemplate(discountIndicatorTemplate, {
              discountPercent: config.discount.discountPercent
            });
            return {
              itemName: config.itemName || "",
              supportCount,
              itemTypeName,
              itemTypePlural: pluralize(itemTypeName, supportCount),
              variationCount: normalVariations.length,
              firstName,
              smartTitle,
              discountIndicator
            };
          });
          const previewTemplate = computed(() => {
            if (previewTemplateIndex.value < 0 || !templates.value[previewTemplateIndex.value]) {
              return "";
            }
            const template = templates.value[previewTemplateIndex.value];
            return parseTemplate(template.template, templateVars.value);
          });
          function handlePreview(index) {
            previewTemplateIndex.value = index;
            showPreviewModal.value = true;
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(Modal, {
                show: _ctx.show,
                title: "商品名模板配置",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[2] || (_cache[2] = ($event) => emit("close"))
              }, {
                "header-actions": withCtx(() => [
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                    onClick: _cache[0] || (_cache[0] = //@ts-ignore
                    (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                    title: "添加商品名模板",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).plus, 18)
                    }, null, 8, _hoisted_1$c)
                  ], 2),
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                    onClick: _cache[1] || (_cache[1] = ($event) => showDiscountIndicatorModal.value = true),
                    title: "折扣标识模板配置",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).settings, 18)
                    }, null, 8, _hoisted_2$c)
                  ], 2)
                ]),
                default: withCtx(() => [
                  createVNode(unref(SectionHeader), null, {
                    default: withCtx(() => [
                      createElementVNode("p", {
                        class: "form-hint",
                        innerHTML: unref(TEMPLATE_HINTS).full.replace("\n", "<br>")
                      }, null, 8, _hoisted_3$c),
                      _ctx.globalTemplates.nameTemplates && _ctx.globalTemplates.nameTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 0,
                        items: _ctx.globalTemplates.nameTemplates,
                        "key-extractor": (item) => item.id,
                        onRemove: unref(removeTemplate),
                        onReorder: unref(onReorder)
                      }, {
                        actions: withCtx(({ item: template, index }) => [
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => template.name = $event,
                            type: "text",
                            placeholder: "输入模板名称",
                            style: { "flex": "1", "min-width": "0" }
                          }, null, 8, _hoisted_4$b), [
                            [vModelText, template.name]
                          ]),
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                            type: "button",
                            title: "预览",
                            onClick: withModifiers(($event) => handlePreview(index), ["stop", "prevent"])
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(withSize)(unref(icons).eye, 14)
                            }, null, 8, _hoisted_6$a)
                          ], 8, _hoisted_5$a)
                        ]),
                        content: withCtx(({ item }) => [
                          createElementVNode("div", _hoisted_7$9, [
                            createElementVNode("div", _hoisted_8$7, [
                              _cache[6] || (_cache[6] = createElementVNode("label", null, "模板内容", -1)),
                              withDirectives(createElementVNode("textarea", {
                                "onUpdate:modelValue": ($event) => item.template = $event,
                                rows: "1",
                                placeholder: "输入模板内容"
                              }, null, 8, _hoisted_9$7), [
                                [vModelText, item.template]
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_10$5, ' 暂无模板，点击"添加模板"创建 '))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(_sfc_main$d, {
                show: showDiscountIndicatorModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[3] || (_cache[3] = ($event) => showDiscountIndicatorModal.value = false)
              }, null, 8, ["show", "global-templates"]),
              createVNode(Modal, {
                show: showPreviewModal.value,
                title: "商品名预览",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[5] || (_cache[5] = ($event) => showPreviewModal.value = false)
              }, {
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).closeButton),
                    onClick: _cache[4] || (_cache[4] = ($event) => showPreviewModal.value = false),
                    title: "关闭"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_12$5)
                  ], 2)
                ]),
                default: withCtx(() => [
                  createVNode(unref(PreviewBox), {
                    label: "预览结果:",
                    type: "text"
                  }, {
                    default: withCtx(() => [
                      createElementVNode("span", _hoisted_11$5, toDisplayString(previewTemplate.value), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["show"])
            ], 64);
          };
        }
      });
      const _hoisted_1$b = ["innerHTML"];
      const _hoisted_2$b = { class: "modal-content" };
      const _hoisted_3$b = { class: "form-group" };
      const _hoisted_4$a = { class: "form-group" };
      const _hoisted_5$9 = { class: "form-group" };
      const _hoisted_6$9 = { class: "form-group" };
      const _hoisted_7$8 = { class: "be-text-primary be-text-lg be-font-semibold" };
      const _hoisted_8$6 = ["innerHTML"];
      const _hoisted_9$6 = ["innerHTML"];
      const _sfc_main$b = /* @__PURE__ */ defineComponent({
        __name: "NameModal",
        props: {
          show: { type: Boolean },
          itemConfig: {},
          globalTemplates: {},
          totalSupport: {},
          itemTree: {}
        },
        emits: ["close", "save"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          function initializeSelectedTemplates() {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!props.itemConfig.selectedTemplates) {
              props.itemConfig.selectedTemplates = {
                nameTemplateId: ((_b = (_a = props.globalTemplates.nameTemplates) == null ? void 0 : _a[0]) == null ? void 0 : _b.id) || "",
                descriptionTemplateId: ((_d = (_c = props.globalTemplates.descriptionTemplates) == null ? void 0 : _c[0]) == null ? void 0 : _d.id) || "",
                discountTemplateId: ((_f = (_e = props.globalTemplates.discountTemplates) == null ? void 0 : _e[0]) == null ? void 0 : _f.id) || "",
                discountIndicatorTemplateId: ((_h = (_g = props.globalTemplates.discountIndicatorTemplates) == null ? void 0 : _g[0]) == null ? void 0 : _h.id) || ""
              };
            }
          }
          onMounted(initializeSelectedTemplates);
          const showTemplateModal = ref(false);
          const templateVars = computed(() => {
            const config = props.itemConfig;
            if (!config) return { itemName: "", supportCount: 0 };
            const normalVariations = config.variations.filter((v) => !v.isFullset);
            const firstVariation = normalVariations[0];
            const supportCount = calculateTotalSupport(config.variations);
            const itemTypeName = config.itemTypeName || "Item";
            const firstItemId = (firstVariation == null ? void 0 : firstVariation.fileItemMap) ? Object.values(firstVariation.fileItemMap)[0] : null;
            const getItemName = (itemId) => {
              const node = props.itemTree.nodes[itemId];
              if (!node) return "未知商品";
              const itemData = node.data;
              if (!itemData) return node.name;
              return itemData.itemName;
            };
            const firstName = (firstVariation == null ? void 0 : firstVariation.name) || firstItemId && getItemName(firstItemId) || config.itemName;
            const smartTitle = normalVariations.length > 1 || supportCount > 1 ? `${supportCount} ${pluralize(itemTypeName, supportCount)}` : firstName;
            const discountIndicatorTemplate = config.discount.enabled ? getSelectedDiscountIndicatorTemplate(props.globalTemplates, config) : "";
            const discountIndicator = parseTemplate(discountIndicatorTemplate, {
              discountPercent: config.discount.discountPercent
            });
            return {
              itemName: config.itemName || "",
              supportCount,
              itemTypeName,
              itemTypePlural: pluralize(itemTypeName, supportCount),
              variationCount: normalVariations.length,
              firstName,
              smartTitle,
              discountIndicator
            };
          });
          const previewName = computed(() => {
            const template = getSelectedNameTemplate(props.globalTemplates, props.itemConfig);
            return parseTemplate(template, templateVars.value);
          });
          function handleSave() {
            emit("save");
            emit("close");
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(Modal, {
                show: _ctx.show,
                title: "编辑商品名",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[7] || (_cache[7] = ($event) => emit("close"))
              }, {
                "header-actions": withCtx(() => [
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                    onClick: _cache[0] || (_cache[0] = ($event) => showTemplateModal.value = true),
                    title: "模板配置",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).settings, 18)
                    }, null, 8, _hoisted_1$b)
                  ], 2)
                ]),
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).closeButton),
                    onClick: _cache[6] || (_cache[6] = ($event) => emit("close")),
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_8$6)
                  ], 2),
                  createElementVNode("button", {
                    class: normalizeClass(unref(BUTTON_CLASSES).saveButton),
                    onClick: handleSave,
                    title: "保存"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_9$6)
                  ], 2)
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_2$b, [
                    createElementVNode("div", _hoisted_3$b, [
                      _cache[9] || (_cache[9] = createElementVNode("label", null, "商品基础名称", -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.itemConfig.itemName = $event),
                        type: "text",
                        placeholder: "输入商品名称"
                      }, null, 512), [
                        [vModelText, _ctx.itemConfig.itemName]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_4$a, [
                      _cache[11] || (_cache[11] = createElementVNode("label", null, "商品类型", -1)),
                      withDirectives(createElementVNode("select", {
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.itemConfig.itemType = $event)
                      }, _cache[10] || (_cache[10] = [
                        createElementVNode("option", { value: "normal" }, "普通商品", -1),
                        createElementVNode("option", { value: "adaptation" }, "适配商品", -1)
                      ]), 512), [
                        [vModelSelect, _ctx.itemConfig.itemType]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_5$9, [
                      _cache[12] || (_cache[12] = createElementVNode("label", null, [
                        createTextVNode("商品类型名称 "),
                        createElementVNode("span", { class: "label-hint" }, "(用于生成复数形式，如 Avatar → Avatars)")
                      ], -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.itemConfig.itemTypeName = $event),
                        type: "text",
                        placeholder: "如: Avatar, Model, Texture"
                      }, null, 512), [
                        [vModelText, _ctx.itemConfig.itemTypeName]
                      ])
                    ]),
                    createVNode(TemplateSelector, {
                      modelValue: _ctx.itemConfig.selectedTemplates.nameTemplateId,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.itemConfig.selectedTemplates.nameTemplateId = $event),
                      templates: _ctx.globalTemplates.nameTemplates,
                      label: "选择商品名模板",
                      "empty-hint": "请先在全局模板配置中添加商品名模板"
                    }, null, 8, ["modelValue", "templates"]),
                    createElementVNode("div", _hoisted_6$9, [
                      createVNode(TemplateSelector, {
                        modelValue: _ctx.itemConfig.selectedTemplates.discountIndicatorTemplateId,
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.itemConfig.selectedTemplates.discountIndicatorTemplateId = $event),
                        templates: _ctx.globalTemplates.discountIndicatorTemplates,
                        label: "折扣标识模板",
                        "empty-hint": "请先在商品名模板配置中添加折扣标识模板"
                      }, null, 8, ["modelValue", "templates"]),
                      _cache[13] || (_cache[13] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary be-mt-xs" }, " 折扣标识会在启用打折时自动显示（在 Variation 配置中启用） ", -1))
                    ]),
                    previewName.value ? (openBlock(), createBlock(unref(PreviewBox), {
                      key: 0,
                      label: "商品名预览:",
                      type: "text"
                    }, {
                      default: withCtx(() => [
                        createElementVNode("span", _hoisted_7$8, toDisplayString(previewName.value), 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ])
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(_sfc_main$c, {
                show: showTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                "item-config": _ctx.itemConfig,
                "item-tree": _ctx.itemTree,
                onClose: _cache[8] || (_cache[8] = ($event) => showTemplateModal.value = false)
              }, null, 8, ["show", "global-templates", "item-config", "item-tree"])
            ], 64);
          };
        }
      });
      const _hoisted_1$a = ["innerHTML"];
      const _hoisted_2$a = ["innerHTML"];
      const _hoisted_3$a = { class: "form-group" };
      const _hoisted_4$9 = { class: "be-text-primary" };
      const _sfc_main$a = /* @__PURE__ */ defineComponent({
        __name: "ItemNameSection",
        props: {
          itemConfig: {},
          globalTemplates: {},
          templateVars: {},
          api: {},
          totalSupport: {},
          itemTree: {}
        },
        emits: ["applied"],
        setup(__props, { expose: __expose, emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showNameModal = ref(false);
          const previewName = computed(() => {
            const template = getSelectedNameTemplate(props.globalTemplates, props.itemConfig);
            return parseTemplate(template, props.templateVars);
          });
          function applyName() {
            props.api.setName(previewName.value);
            toast.success("已应用商品名");
            emit("applied");
          }
          __expose({
            applyName
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(unref(SectionHeader), { title: "商品名称" }, {
                actions: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-secondary",
                    type: "button",
                    title: "模板设置",
                    onClick: _cache[0] || (_cache[0] = ($event) => showNameModal.value = true)
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).edit, 14)
                    }, null, 8, _hoisted_1$a)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-primary",
                    type: "button",
                    title: "应用到页面",
                    onClick: applyName
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).send, 14)
                    }, null, 8, _hoisted_2$a)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_3$a, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.itemConfig.itemName = $event),
                      type: "text",
                      placeholder: "输入商品名称"
                    }, null, 512), [
                      [vModelText, _ctx.itemConfig.itemName]
                    ])
                  ]),
                  previewName.value ? (openBlock(), createBlock(unref(PreviewBox), {
                    key: 0,
                    label: "预览:",
                    type: "text"
                  }, {
                    default: withCtx(() => [
                      createElementVNode("span", _hoisted_4$9, toDisplayString(previewName.value), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(_sfc_main$b, {
                show: showNameModal.value,
                "item-config": _ctx.itemConfig,
                "global-templates": _ctx.globalTemplates,
                "total-support": _ctx.totalSupport,
                "item-tree": _ctx.itemTree,
                onClose: _cache[2] || (_cache[2] = ($event) => showNameModal.value = false),
                onSave: _cache[3] || (_cache[3] = ($event) => showNameModal.value = false)
              }, null, 8, ["show", "item-config", "global-templates", "total-support", "item-tree"])
            ], 64);
          };
        }
      });
      const _hoisted_1$9 = ["innerHTML"];
      const _hoisted_2$9 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_3$9 = ["onUpdate:modelValue"];
      const _hoisted_4$8 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_5$8 = { class: "form-group" };
      const _hoisted_6$8 = ["onUpdate:modelValue"];
      const _hoisted_7$7 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$9 = /* @__PURE__ */ defineComponent({
        __name: "ItemInfoTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const itemInfoTemplates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).itemInfoTemplates || (_a.itemInfoTemplates = []);
            },
            set(value) {
              props.globalTemplates.itemInfoTemplates = value;
            }
          });
          const itemInfoManager = useTemplateManager({
            templates: itemInfoTemplates,
            defaultTemplate: { template: "⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "商品信息模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = ($event) => unref(itemInfoManager).addTemplate()),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$9)
                ], 2)
              ]),
              default: withCtx(() => [
                createElementVNode("div", _hoisted_2$9, [
                  createVNode(unref(SectionHeader), null, {
                    default: withCtx(() => [
                      _cache[3] || (_cache[3] = createElementVNode("p", { class: "form-hint" }, "可用变量: {作者名}, {商品名}, {商品链接}", -1)),
                      _cache[4] || (_cache[4] = createElementVNode("p", { class: "form-hint" }, "系统会自动按作者分组并循环渲染所有关联商品", -1)),
                      _cache[5] || (_cache[5] = createElementVNode("p", { class: "form-hint" }, "示例：⟡ {作者名}\\nʚ {商品名} ɞ\\n- {商品链接} -", -1)),
                      _ctx.globalTemplates.itemInfoTemplates && _ctx.globalTemplates.itemInfoTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 0,
                        items: _ctx.globalTemplates.itemInfoTemplates,
                        "key-extractor": (item) => item.id,
                        onRemove: unref(itemInfoManager).removeTemplate,
                        onReorder: unref(itemInfoManager).onReorder
                      }, {
                        actions: withCtx(({ item }) => [
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => item.name = $event,
                            type: "text",
                            placeholder: "输入模板名称",
                            style: { "flex": "1", "min-width": "0" }
                          }, null, 8, _hoisted_3$9), [
                            [vModelText, item.name]
                          ])
                        ]),
                        content: withCtx(({ item }) => [
                          createElementVNode("div", _hoisted_4$8, [
                            createElementVNode("div", _hoisted_5$8, [
                              _cache[2] || (_cache[2] = createElementVNode("label", null, "模板内容", -1)),
                              withDirectives(createElementVNode("textarea", {
                                "onUpdate:modelValue": ($event) => item.template = $event,
                                rows: "3",
                                placeholder: "输入模板内容"
                              }, null, 8, _hoisted_6$8), [
                                [vModelText, item.template]
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_7$7, ' 暂无模板，点击"添加模板"创建 '))
                    ]),
                    _: 1,
                    __: [3, 4, 5]
                  })
                ])
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$8 = ["innerHTML"];
      const _hoisted_2$8 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_3$8 = ["onUpdate:modelValue"];
      const _hoisted_4$7 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_5$7 = { class: "form-group" };
      const _hoisted_6$7 = ["onUpdate:modelValue"];
      const _hoisted_7$6 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$8 = /* @__PURE__ */ defineComponent({
        __name: "LogTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const logTemplates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).logTemplates || (_a.logTemplates = []);
            },
            set(value) {
              props.globalTemplates.logTemplates = value;
            }
          });
          const logManager = useTemplateManager({
            templates: logTemplates,
            defaultTemplate: { template: "⟡ {日期}\n　・ {内容}" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "日志模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = ($event) => unref(logManager).addTemplate()),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$8)
                ], 2)
              ]),
              default: withCtx(() => [
                createElementVNode("div", _hoisted_2$8, [
                  createVNode(unref(SectionHeader), null, {
                    default: withCtx(() => [
                      _cache[3] || (_cache[3] = createElementVNode("p", { class: "form-hint" }, "可用变量: {日期}, {内容}", -1)),
                      _cache[4] || (_cache[4] = createElementVNode("p", { class: "form-hint" }, "示例：⟡ {日期}\\n　・ {内容}", -1)),
                      _ctx.globalTemplates.logTemplates && _ctx.globalTemplates.logTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 0,
                        items: _ctx.globalTemplates.logTemplates,
                        "key-extractor": (item) => item.id,
                        onRemove: unref(logManager).removeTemplate,
                        onReorder: unref(logManager).onReorder
                      }, {
                        actions: withCtx(({ item }) => [
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => item.name = $event,
                            type: "text",
                            placeholder: "输入模板名称",
                            style: { "flex": "1", "min-width": "0" }
                          }, null, 8, _hoisted_3$8), [
                            [vModelText, item.name]
                          ])
                        ]),
                        content: withCtx(({ item }) => [
                          createElementVNode("div", _hoisted_4$7, [
                            createElementVNode("div", _hoisted_5$7, [
                              _cache[2] || (_cache[2] = createElementVNode("label", null, "模板内容", -1)),
                              withDirectives(createElementVNode("textarea", {
                                "onUpdate:modelValue": ($event) => item.template = $event,
                                rows: "2",
                                placeholder: "输入模板内容"
                              }, null, 8, _hoisted_6$7), [
                                [vModelText, item.template]
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_7$6, ' 暂无模板，点击"添加模板"创建 '))
                    ]),
                    _: 1,
                    __: [3, 4]
                  })
                ])
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$7 = ["innerHTML"];
      const _hoisted_2$7 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_3$7 = ["innerHTML"];
      const _hoisted_4$6 = ["onUpdate:modelValue"];
      const _hoisted_5$6 = ["onUpdate:modelValue"];
      const _hoisted_6$6 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_7$5 = { class: "form-group" };
      const _hoisted_8$5 = ["onUpdate:modelValue"];
      const _hoisted_9$5 = {
        key: 0,
        class: "form-group"
      };
      const _hoisted_10$4 = ["onUpdate:modelValue"];
      const _hoisted_11$4 = {
        key: 1,
        class: "form-hint be-text-xs be-text-secondary"
      };
      const _hoisted_12$4 = {
        key: 2,
        class: "form-hint be-text-xs be-text-secondary"
      };
      const _hoisted_13$4 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$7 = /* @__PURE__ */ defineComponent({
        __name: "SectionTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const sectionTemplates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).sectionTemplates || (_a.sectionTemplates = []);
            },
            set(value) {
              props.globalTemplates.sectionTemplates = value;
            }
          });
          const sectionManager = useTemplateManager({
            templates: sectionTemplates,
            defaultTemplate: { type: "normal", headline: "", body: "" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "Section 模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = ($event) => unref(sectionManager).addTemplate()),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$7)
                ], 2)
              ]),
              default: withCtx(() => [
                createElementVNode("div", _hoisted_2$7, [
                  createVNode(unref(SectionHeader), null, {
                    default: withCtx(() => [
                      createElementVNode("p", {
                        class: "form-hint",
                        innerHTML: unref(TEMPLATE_HINTS).full.replace("\n", "<br>")
                      }, null, 8, _hoisted_3$7),
                      _cache[5] || (_cache[5] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary" }, [
                        createElementVNode("strong", null, "模板类型说明："),
                        createElementVNode("br"),
                        createTextVNode(" • "),
                        createElementVNode("strong", null, "普通"),
                        createTextVNode("：常规 Section，可包含任意内容"),
                        createElementVNode("br"),
                        createTextVNode(" • "),
                        createElementVNode("strong", null, "日志"),
                        createTextVNode("：更新日志 Section，内容由日志条目动态生成（只需配置 Headline）"),
                        createElementVNode("br"),
                        createTextVNode(" • "),
                        createElementVNode("strong", null, "商品信息"),
                        createTextVNode("：自动从 Variations 关联的商品生成信息列表 ")
                      ], -1)),
                      _ctx.globalTemplates.sectionTemplates && _ctx.globalTemplates.sectionTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 0,
                        items: _ctx.globalTemplates.sectionTemplates,
                        "key-extractor": (item) => item.id,
                        onRemove: unref(sectionManager).removeTemplate,
                        onReorder: unref(sectionManager).onReorder
                      }, {
                        actions: withCtx(({ item }) => [
                          withDirectives(createElementVNode("select", {
                            "onUpdate:modelValue": ($event) => item.type = $event,
                            class: "be-p-xs be-px-sm be-text-base",
                            style: { "height": "28px", "width": "auto", "flex-shrink": "0" }
                          }, _cache[2] || (_cache[2] = [
                            createElementVNode("option", { value: "normal" }, "普通", -1),
                            createElementVNode("option", { value: "log" }, "日志", -1),
                            createElementVNode("option", { value: "iteminfo" }, "商品信息", -1)
                          ]), 8, _hoisted_4$6), [
                            [vModelSelect, item.type]
                          ]),
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => item.name = $event,
                            type: "text",
                            placeholder: "输入模板名称",
                            style: { "flex": "1", "min-width": "0" }
                          }, null, 8, _hoisted_5$6), [
                            [vModelText, item.name]
                          ])
                        ]),
                        content: withCtx(({ item }) => [
                          createElementVNode("div", _hoisted_6$6, [
                            createElementVNode("div", _hoisted_7$5, [
                              _cache[3] || (_cache[3] = createElementVNode("label", null, "Headline", -1)),
                              withDirectives(createElementVNode("input", {
                                "onUpdate:modelValue": ($event) => item.headline = $event,
                                type: "text",
                                placeholder: "输入 Headline"
                              }, null, 8, _hoisted_8$5), [
                                [vModelText, item.headline]
                              ])
                            ]),
                            item.type === "normal" || !item.type ? (openBlock(), createElementBlock("div", _hoisted_9$5, [
                              _cache[4] || (_cache[4] = createElementVNode("label", null, "Body", -1)),
                              withDirectives(createElementVNode("textarea", {
                                "onUpdate:modelValue": ($event) => item.body = $event,
                                rows: "1",
                                placeholder: "输入 Body"
                              }, null, 8, _hoisted_10$4), [
                                [vModelText, item.body]
                              ])
                            ])) : item.type === "log" ? (openBlock(), createElementBlock("p", _hoisted_11$4, " 日志类型的 Section 内容由日志条目动态生成，无需手动填写 Body ")) : item.type === "iteminfo" ? (openBlock(), createElementBlock("p", _hoisted_12$4, " 商品信息类型的 Section 内容将自动从 Variations 关联的商品生成，无需手动填写 Body ")) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 1
                      }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_13$4, ' 暂无模板，点击"添加模板"创建 '))
                    ]),
                    _: 1,
                    __: [5]
                  })
                ])
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$6 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_2$6 = { class: "template-grid" };
      const _hoisted_3$6 = { class: "be-flex be-align-center be-gap-xs" };
      const _hoisted_4$5 = ["innerHTML"];
      const _hoisted_5$5 = ["onClick"];
      const _hoisted_6$5 = {
        class: "be-flex be-flex-column",
        style: { "gap": "4px" }
      };
      const _hoisted_7$4 = { class: "be-flex be-align-center be-gap-xs" };
      const _hoisted_8$4 = { class: "be-text-sm be-font-medium" };
      const _hoisted_9$4 = {
        key: 0,
        class: "be-text-xs be-text-secondary be-truncate"
      };
      const _sfc_main$6 = /* @__PURE__ */ defineComponent({
        __name: "SectionTemplateSelectorModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close", "select"],
        setup(__props, { emit: __emit }) {
          const emit = __emit;
          const TYPE_STYLES = {
            normal: {
              background: "rgba(107, 114, 128, 0.1)",
              color: "#6b7280",
              label: "普通"
            },
            log: {
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              label: "日志"
            },
            iteminfo: {
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
              label: "商品信息"
            }
          };
          function getTypeStyle(type) {
            return TYPE_STYLES[type] || TYPE_STYLES.normal;
          }
          function handleSelectTemplate(template) {
            emit("select", template);
          }
          function handleCreateEmpty() {
            emit("select", null);
          }
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "选择 Section 模板",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[0] || (_cache[0] = ($event) => emit("close"))
            }, {
              default: withCtx(() => [
                createElementVNode("div", _hoisted_1$6, [
                  _cache[2] || (_cache[2] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary" }, " 点击创建空白 Section 或从模板快速创建 ", -1)),
                  createElementVNode("div", _hoisted_2$6, [
                    createElementVNode("button", {
                      class: "template-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start",
                      type: "button",
                      onClick: handleCreateEmpty
                    }, [
                      createElementVNode("div", _hoisted_3$6, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).plus, 14)
                        }, null, 8, _hoisted_4$5),
                        _cache[1] || (_cache[1] = createElementVNode("span", { class: "be-text-sm be-font-medium" }, "创建空 Section", -1))
                      ])
                    ]),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.globalTemplates.sectionTemplates, (template) => {
                      return openBlock(), createElementBlock("button", {
                        key: template.id,
                        class: "template-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start",
                        type: "button",
                        onClick: ($event) => handleSelectTemplate(template)
                      }, [
                        createElementVNode("div", _hoisted_6$5, [
                          createElementVNode("div", _hoisted_7$4, [
                            createElementVNode("span", _hoisted_8$4, toDisplayString(template.name || "未命名模板"), 1),
                            createElementVNode("span", {
                              class: "be-text-xs be-px-xs be-py-1 be-rounded",
                              style: normalizeStyle({
                                background: getTypeStyle(template.type).background,
                                color: getTypeStyle(template.type).color
                              })
                            }, toDisplayString(getTypeStyle(template.type).label), 5)
                          ]),
                          template.headline ? (openBlock(), createElementBlock("div", _hoisted_9$4, toDisplayString(template.headline), 1)) : createCommentVNode("", true)
                        ])
                      ], 8, _hoisted_5$5);
                    }), 128))
                  ])
                ])
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const SectionTemplateSelectorModal = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-70ec8f42"]]);
      const _hoisted_1$5 = ["innerHTML"];
      const _hoisted_2$5 = ["innerHTML"];
      const _hoisted_3$5 = ["innerHTML"];
      const _hoisted_4$4 = ["innerHTML"];
      const _hoisted_5$4 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_6$4 = ["value", "onChange"];
      const _hoisted_7$3 = ["onUpdate:modelValue"];
      const _hoisted_8$3 = ["innerHTML"];
      const _hoisted_9$3 = ["innerHTML"];
      const _hoisted_10$3 = ["onClick"];
      const _hoisted_11$3 = ["innerHTML"];
      const _hoisted_12$3 = {
        key: 0,
        class: "form-group"
      };
      const _hoisted_13$3 = ["onUpdate:modelValue"];
      const _hoisted_14$3 = {
        key: 1,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_15$3 = ["onClick"];
      const _hoisted_16$3 = ["innerHTML"];
      const _hoisted_17$3 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_18$3 = ["onUpdate:modelValue", "placeholder"];
      const _hoisted_19$3 = { class: "form-group" };
      const _hoisted_20$3 = ["onUpdate:modelValue"];
      const _hoisted_21$2 = {
        key: 2,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _sfc_main$5 = /* @__PURE__ */ defineComponent({
        __name: "SectionsListSection",
        props: {
          itemConfig: {},
          globalTemplates: {},
          templateVars: {},
          api: {},
          modal: {},
          itemTree: {}
        },
        emits: ["applied"],
        setup(__props, { expose: __expose, emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showSectionTemplateModal = ref(false);
          const showSectionTemplateSelectorModal = ref(false);
          const showLogTemplateModal = ref(false);
          const showItemInfoTemplateModal = ref(false);
          const resolvedSections = computed(() => {
            const context = {
              variations: props.itemConfig.variations,
              itemTree: props.itemTree
            };
            return props.itemConfig.sections.map((section) => {
              const resolved = resolveSectionContent(section, props.globalTemplates, context);
              return {
                headline: parseTemplate(resolved.headline, props.templateVars),
                body: parseTemplate(resolved.body, props.templateVars)
              };
            });
          });
          function importSections() {
            const pageSections = props.api.sections;
            if (pageSections.length === 0) {
              toast.info("页面没有 Sections");
              return;
            }
            props.itemConfig.sections = pageSections.map(
              () => createSectionByType("normal", props.globalTemplates)
            );
            pageSections.forEach((section, index) => {
              var _a, _b;
              const targetSection = props.itemConfig.sections[index];
              if (targetSection && targetSection.type === "normal") {
                targetSection.headline = ((_a = section.headlineInput) == null ? void 0 : _a.value) || "";
                targetSection.body = ((_b = section.bodyTextarea) == null ? void 0 : _b.value) || "";
              }
            });
            toast.success(`已导入 ${pageSections.length} 个 Sections`);
          }
          function addSection() {
            showSectionTemplateSelectorModal.value = true;
          }
          function handleTemplateSelect(template) {
            if (template === null) {
              const newSection = createSectionByType("normal", props.globalTemplates);
              props.itemConfig.sections.push(newSection);
            } else {
              const newSection = createSectionFromTemplate(template, props.globalTemplates);
              props.itemConfig.sections.push(newSection);
            }
            showSectionTemplateSelectorModal.value = false;
          }
          function removeSection(index) {
            props.itemConfig.sections.splice(index, 1);
          }
          function changeSectionType(index, newType) {
            const oldSection = props.itemConfig.sections[index];
            const newSection = createSectionByType(newType, props.globalTemplates);
            if (oldSection.headline) {
              newSection.headline = oldSection.headline;
            }
            props.itemConfig.sections.splice(index, 1, newSection);
          }
          function addLogEntry(sectionIndex) {
            const section = props.itemConfig.sections[sectionIndex];
            if (section.type !== "log") return;
            section.logEntries.unshift({
              id: crypto.randomUUID(),
              date: Date.now(),
              content: ""
            });
          }
          function removeLogEntry(sectionIndex, entryIndex) {
            const section = props.itemConfig.sections[sectionIndex];
            if (section.type !== "log") return;
            section.logEntries.splice(entryIndex, 1);
          }
          function onLogEntryReorder(sectionIndex, fromIndex, toIndex) {
            const section = props.itemConfig.sections[sectionIndex];
            if (section.type !== "log") return;
            const [removed] = section.logEntries.splice(fromIndex, 1);
            section.logEntries.splice(toIndex, 0, removed);
          }
          function handlePreviewSection(index) {
            props.modal.openModal({
              type: "alert",
              title: "Section 预览",
              formData: { sectionIndex: index }
            });
          }
          async function applySections() {
            const sectionsToApply = resolvedSections.value;
            const diff = sectionsToApply.length - props.api.sections.length;
            if (diff > 0) {
              for (let i = 0; i < diff; i++) {
                if (!await props.api.addSection()) {
                  toast.error(`添加 Section 失败`);
                  return;
                }
              }
            } else if (diff < 0) {
              for (let i = 0; i < -diff; i++) {
                if (!await props.api.removeSection(props.api.sections.length - 1)) {
                  toast.error(`删除 Section 失败`);
                  return;
                }
              }
            }
            sectionsToApply.forEach((section, index) => {
              props.api.updateSection(index, {
                headline: section.headline,
                body: section.body
              });
            });
            toast.success(`已应用 ${sectionsToApply.length} 个 Sections`);
            emit("applied");
          }
          function onSectionReorder(fromIndex, toIndex) {
            const [removed] = props.itemConfig.sections.splice(fromIndex, 1);
            props.itemConfig.sections.splice(toIndex, 0, removed);
          }
          function openLogTemplateModal() {
            showLogTemplateModal.value = true;
          }
          __expose({
            applySections
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(unref(SectionHeader), {
                title: `Sections (${_ctx.itemConfig.sections.length})`
              }, {
                actions: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-ghost",
                    type: "button",
                    title: "从页面导入",
                    onClick: importSections
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).download, 14)
                    }, null, 8, _hoisted_1$5)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-secondary",
                    type: "button",
                    title: "添加",
                    onClick: _cache[0] || (_cache[0] = ($event) => addSection())
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).plus, 14)
                    }, null, 8, _hoisted_2$5)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-secondary",
                    type: "button",
                    title: "模板配置",
                    onClick: _cache[1] || (_cache[1] = ($event) => showSectionTemplateModal.value = true)
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).edit, 14)
                    }, null, 8, _hoisted_3$5)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-primary",
                    type: "button",
                    title: "应用到页面",
                    onClick: applySections
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).send, 14)
                    }, null, 8, _hoisted_4$4)
                  ])
                ]),
                default: withCtx(() => [
                  _ctx.itemConfig.sections.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_5$4, ' 暂无 Sections，点击"添加"或"从页面导入" ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                    key: 1,
                    items: _ctx.itemConfig.sections,
                    "key-extractor": (item) => item.id,
                    onRemove: removeSection,
                    onReorder: onSectionReorder
                  }, {
                    actions: withCtx(({ item: section, index }) => [
                      createElementVNode("select", {
                        value: section.type,
                        class: "be-p-xs be-px-sm be-text-base",
                        style: { "height": "28px", "width": "auto", "flex-shrink": "0" },
                        onChange: ($event) => changeSectionType(index, $event.target.value)
                      }, _cache[8] || (_cache[8] = [
                        createElementVNode("option", { value: "normal" }, "普通", -1),
                        createElementVNode("option", { value: "log" }, "日志", -1),
                        createElementVNode("option", { value: "iteminfo" }, "商品信息", -1)
                      ]), 40, _hoisted_6$4),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": ($event) => section.headline = $event,
                        type: "text",
                        class: "be-flex-1 be-p-xs be-px-sm be-text-base be-min-w-0",
                        style: { "height": "28px" },
                        placeholder: "输入 Headline"
                      }, null, 8, _hoisted_7$3), [
                        [vModelText, section.headline]
                      ]),
                      section.type === "log" ? (openBlock(), createElementBlock("button", {
                        key: 0,
                        class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                        type: "button",
                        title: "配置日志模板",
                        onClick: _cache[2] || (_cache[2] = withModifiers(($event) => openLogTemplateModal(), ["stop", "prevent"]))
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_8$3)
                      ])) : createCommentVNode("", true),
                      section.type === "iteminfo" ? (openBlock(), createElementBlock("button", {
                        key: 1,
                        class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                        type: "button",
                        title: "配置商品信息模板",
                        onClick: _cache[3] || (_cache[3] = withModifiers(($event) => showItemInfoTemplateModal.value = true, ["stop", "prevent"]))
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_9$3)
                      ])) : createCommentVNode("", true),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                        type: "button",
                        title: "预览",
                        onClick: withModifiers(($event) => handlePreviewSection(index), ["stop", "prevent"])
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).eye, 14)
                        }, null, 8, _hoisted_11$3)
                      ], 8, _hoisted_10$3)
                    ]),
                    content: withCtx(({ item: section, index }) => [
                      section.type === "normal" ? (openBlock(), createElementBlock("div", _hoisted_12$3, [
                        withDirectives(createElementVNode("textarea", {
                          "onUpdate:modelValue": ($event) => section.body = $event,
                          rows: "1",
                          placeholder: "输入 Body"
                        }, null, 8, _hoisted_13$3), [
                          [vModelText, section.body]
                        ])
                      ])) : section.type === "log" ? (openBlock(), createElementBlock("div", _hoisted_14$3, [
                        createVNode(unref(SectionHeader), null, {
                          default: withCtx(() => [
                            createVNode(TemplateSelector, {
                              modelValue: section.logTemplateId,
                              "onUpdate:modelValue": ($event) => section.logTemplateId = $event,
                              templates: _ctx.globalTemplates.logTemplates,
                              label: "选择日志模板",
                              "empty-hint": "请先添加日志模板"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "templates"])
                          ]),
                          _: 2
                        }, 1024),
                        createVNode(unref(SectionHeader), { "no-border": "" }, {
                          title: withCtx(() => [
                            createTextVNode("日志条目 (" + toDisplayString(section.logEntries.length) + ")", 1)
                          ]),
                          actions: withCtx(() => [
                            createElementVNode("button", {
                              class: "booth-btn booth-btn-sm booth-btn-secondary",
                              type: "button",
                              title: "添加日志",
                              onClick: ($event) => addLogEntry(index)
                            }, [
                              createElementVNode("span", {
                                innerHTML: unref(withSize)(unref(icons).plus, 14)
                              }, null, 8, _hoisted_16$3)
                            ], 8, _hoisted_15$3)
                          ]),
                          default: withCtx(() => [
                            section.logEntries.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_17$3, ' 暂无日志，点击"添加日志"创建 ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                              key: 1,
                              items: section.logEntries,
                              "key-extractor": (item) => item.id,
                              onRemove: (entryIndex) => removeLogEntry(index, entryIndex),
                              onReorder: (from, to) => onLogEntryReorder(index, from, to)
                            }, {
                              actions: withCtx(({ item: entry }) => [
                                withDirectives(createElementVNode("input", {
                                  "onUpdate:modelValue": ($event) => entry.date = $event,
                                  type: "number",
                                  class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                                  style: { "height": "28px", "min-width": "120px" },
                                  placeholder: unref(formatDate)(Date.now())
                                }, null, 8, _hoisted_18$3), [
                                  [
                                    vModelText,
                                    entry.date,
                                    void 0,
                                    { number: true }
                                  ]
                                ])
                              ]),
                              content: withCtx(({ item: entry }) => [
                                createElementVNode("div", _hoisted_19$3, [
                                  withDirectives(createElementVNode("textarea", {
                                    "onUpdate:modelValue": ($event) => entry.content = $event,
                                    rows: "1",
                                    placeholder: "输入日志内容"
                                  }, null, 8, _hoisted_20$3), [
                                    [vModelText, entry.content]
                                  ])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["items", "key-extractor", "onRemove", "onReorder"]))
                          ]),
                          _: 2
                        }, 1024)
                      ])) : section.type === "iteminfo" ? (openBlock(), createElementBlock("div", _hoisted_21$2, [
                        createVNode(unref(SectionHeader), null, {
                          default: withCtx(() => [
                            createVNode(TemplateSelector, {
                              modelValue: section.itemInfoTemplateId,
                              "onUpdate:modelValue": ($event) => section.itemInfoTemplateId = $event,
                              templates: _ctx.globalTemplates.itemInfoTemplates,
                              label: "选择商品信息模板",
                              "empty-hint": "请先添加商品信息模板"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "templates"])
                          ]),
                          _: 2
                        }, 1024),
                        _cache[9] || (_cache[9] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary" }, " 商品信息会自动从 Variations 关联的商品中收集并按作者分组显示 ", -1))
                      ])) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }, 8, ["items", "key-extractor"]))
                ]),
                _: 1
              }, 8, ["title"]),
              createVNode(SectionTemplateSelectorModal, {
                show: showSectionTemplateSelectorModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[4] || (_cache[4] = ($event) => showSectionTemplateSelectorModal.value = false),
                onSelect: handleTemplateSelect
              }, null, 8, ["show", "global-templates"]),
              createVNode(_sfc_main$7, {
                show: showSectionTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[5] || (_cache[5] = ($event) => showSectionTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"]),
              createVNode(_sfc_main$8, {
                show: showLogTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[6] || (_cache[6] = ($event) => showLogTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"]),
              createVNode(_sfc_main$9, {
                show: showItemInfoTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[7] || (_cache[7] = ($event) => showItemInfoTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"])
            ], 64);
          };
        }
      });
      const SectionsListSection = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-cc57d61c"]]);
      const _hoisted_1$4 = ["innerHTML"];
      const _hoisted_2$4 = { class: "tag-badges-wrapper" };
      const _hoisted_3$4 = { class: "tag-text" };
      const _sfc_main$4 = /* @__PURE__ */ defineComponent({
        __name: "TagsSection",
        props: {
          itemConfig: {},
          api: {},
          itemTree: {},
          tagTree: {}
        },
        emits: ["applied"],
        setup(__props, { expose: __expose, emit: __emit }) {
          const props = __props;
          const emit = __emit;
          function extractTagsFromNodeIds(nodeIds) {
            var _a;
            const tagsSet = /* @__PURE__ */ new Set();
            for (const nodeId of nodeIds) {
              const node = props.tagTree.nodes[nodeId];
              if ((_a = node == null ? void 0 : node.data) == null ? void 0 : _a.tags) {
                node.data.tags.forEach((tag) => tagsSet.add(tag));
              }
            }
            return Array.from(tagsSet);
          }
          const allTags = computed(() => {
            return extractTagsFromNodeIds(props.itemConfig.tagNodeIds || []);
          });
          function smartFetchTags(silent = false) {
            var _a;
            const matchedNodeIds = /* @__PURE__ */ new Set();
            for (const variation of props.itemConfig.variations) {
              if (variation.isFullset || !variation.fileItemMap) continue;
              const itemIds = Object.values(variation.fileItemMap).filter(Boolean);
              for (const itemId of itemIds) {
                const itemNode = props.itemTree.nodes[itemId];
                if (!(itemNode == null ? void 0 : itemNode.data)) continue;
                const { itemName, authorName } = itemNode.data;
                const itemNameLower = (itemName == null ? void 0 : itemName.toLowerCase()) || "";
                const authorNameLower = (authorName == null ? void 0 : authorName.toLowerCase()) || "";
                if (!itemNameLower && !authorNameLower) continue;
                for (const nodeId in props.tagTree.nodes) {
                  const tagNode = props.tagTree.nodes[nodeId];
                  if (!((_a = tagNode.data) == null ? void 0 : _a.tags) || tagNode.data.tags.length === 0) continue;
                  const nodeName = tagNode.name.toLowerCase();
                  if (itemNameLower && nodeName.includes(itemNameLower) || authorNameLower && nodeName.includes(authorNameLower)) {
                    matchedNodeIds.add(nodeId);
                  }
                }
              }
            }
            const newIds = Array.from(matchedNodeIds);
            if (!props.itemConfig.tagNodeIds) {
              props.itemConfig.tagNodeIds = [];
            }
            props.itemConfig.tagNodeIds.splice(0, props.itemConfig.tagNodeIds.length, ...newIds);
            if (!silent && matchedNodeIds.size > 0) {
              toast.success(`已匹配 ${matchedNodeIds.size} 个标签节点`);
            }
          }
          watch(
            () => props.itemConfig.variations,
            () => {
              smartFetchTags(true);
            },
            { deep: true, immediate: true }
          );
          async function applyTags() {
            const tagsToApply = extractTagsFromNodeIds(props.itemConfig.tagNodeIds || []);
            if (tagsToApply.length === 0) {
              toast.info("没有可应用的标签");
              return;
            }
            const newTags = tagsToApply.filter((tag) => !props.api.hasTag(tag));
            if (newTags.length > 0) {
              await props.api.addTags(newTags);
              toast.success(`已添加 ${newTags.length} 个新标签`);
              emit("applied");
            } else {
              toast.info("所有标签已存在，无需添加");
            }
          }
          __expose({
            applyTags
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(unref(SectionHeader), { title: "Tags" }, {
              actions: withCtx(() => [
                createElementVNode("button", {
                  class: "booth-btn booth-btn-sm booth-btn-primary",
                  type: "button",
                  title: "应用到页面",
                  onClick: applyTags
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).send, 14)
                  }, null, 8, _hoisted_1$4)
                ])
              ]),
              default: withCtx(() => [
                createVNode(unref(PreviewBox), {
                  "is-empty": allTags.value.length === 0,
                  "empty-text": "标签会根据 Variations 中的商品自动匹配"
                }, {
                  default: withCtx(() => [
                    createElementVNode("div", _hoisted_2$4, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(allTags.value, (tag, index) => {
                        return openBlock(), createElementBlock("span", {
                          key: index,
                          class: "tag-badge"
                        }, [
                          createElementVNode("span", _hoisted_3$4, toDisplayString(tag), 1)
                        ]);
                      }), 128))
                    ])
                  ]),
                  _: 1
                }, 8, ["is-empty"])
              ]),
              _: 1
            });
          };
        }
      });
      const TagsSection = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-55e6e409"]]);
      const _hoisted_1$3 = ["innerHTML"];
      const _hoisted_2$3 = ["innerHTML"];
      const _hoisted_3$3 = ["onUpdate:modelValue"];
      const _hoisted_4$3 = { class: "form-group" };
      const _hoisted_5$3 = ["onUpdate:modelValue"];
      const _hoisted_6$3 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$3 = /* @__PURE__ */ defineComponent({
        __name: "DiscountTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const templates = computed({
            get() {
              var _a;
              return (_a = props.globalTemplates).discountTemplates || (_a.discountTemplates = []);
            },
            set(value) {
              props.globalTemplates.discountTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "折扣模板配置",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: normalizeClass(unref(BUTTON_CLASSES).addButton),
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$3)
                ], 2)
              ]),
              default: withCtx(() => [
                createVNode(unref(SectionHeader), null, {
                  default: withCtx(() => [
                    createElementVNode("p", {
                      class: "form-hint",
                      innerHTML: unref(TEMPLATE_HINTS).discount.replace("\n", "<br>")
                    }, null, 8, _hoisted_2$3),
                    _ctx.globalTemplates.discountTemplates && _ctx.globalTemplates.discountTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                      key: 0,
                      items: _ctx.globalTemplates.discountTemplates,
                      "key-extractor": (item) => item.id,
                      onRemove: unref(removeTemplate),
                      onReorder: unref(onReorder)
                    }, {
                      actions: withCtx(({ item }) => [
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": ($event) => item.name = $event,
                          type: "text",
                          placeholder: "输入模板名称",
                          style: { "flex": "1", "min-width": "0" }
                        }, null, 8, _hoisted_3$3), [
                          [vModelText, item.name]
                        ])
                      ]),
                      content: withCtx(({ item }) => [
                        createElementVNode("div", _hoisted_4$3, [
                          _cache[2] || (_cache[2] = createElementVNode("label", null, "模板内容", -1)),
                          withDirectives(createElementVNode("textarea", {
                            "onUpdate:modelValue": ($event) => item.template = $event,
                            rows: "3",
                            placeholder: "输入模板内容"
                          }, null, 8, _hoisted_5$3), [
                            [vModelText, item.template]
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_6$3, ' 暂无模板，点击"添加模板"创建 '))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$2 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_2$2 = { class: "form-group" };
      const _hoisted_3$2 = { class: "form-group" };
      const _hoisted_4$2 = { class: "form-hint" };
      const _hoisted_5$2 = { class: "be-flex be-gap-sm be-flex-wrap" };
      const _hoisted_6$2 = { class: "be-p-xs be-px-sm be-text-sm be-text-secondary" };
      const _hoisted_7$2 = { class: "be-flex be-align-center be-gap-sm" };
      const _hoisted_8$2 = {
        class: "booth-toggle",
        title: "启用打折功能"
      };
      const _hoisted_9$2 = ["innerHTML"];
      const _hoisted_10$2 = {
        key: 0,
        class: "discount-config"
      };
      const _hoisted_11$2 = { class: "form-group" };
      const _hoisted_12$2 = { class: "be-flex be-gap-sm" };
      const _hoisted_13$2 = { class: "form-group be-flex-1" };
      const _hoisted_14$2 = { class: "form-group be-flex-1" };
      const _hoisted_15$2 = { class: "be-flex be-flex-column be-gap-xs" };
      const _hoisted_16$2 = { class: "be-flex be-justify-between" };
      const _hoisted_17$2 = { class: "be-flex be-justify-between" };
      const _hoisted_18$2 = { class: "be-text-xs be-text-secondary be-mb-xs" };
      const _hoisted_19$2 = ["innerHTML"];
      const _hoisted_20$2 = ["innerHTML"];
      const _sfc_main$2 = /* @__PURE__ */ defineComponent({
        __name: "VariationConfigModal",
        props: {
          show: { type: Boolean },
          itemConfig: {},
          globalTemplates: {},
          availableFiles: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const tempCommonFiles = ref([]);
          const showDiscountTemplateModal = ref(false);
          watch(() => props.show, (show) => {
            if (show) {
              tempCommonFiles.value = [...props.itemConfig.commonFiles || []];
            }
          });
          function handleSave() {
            props.itemConfig.commonFiles = tempCommonFiles.value;
            emit("close");
          }
          const totalSupport = computed(
            () => calculateTotalSupport(props.itemConfig.variations)
          );
          const suggestedPrice = computed(
            () => suggestFullsetPrice(
              props.itemConfig.pricing.normalVariationPrice,
              totalSupport.value,
              props.itemConfig.discount
            )
          );
          const normalOriginalPrice = computed(
            () => props.itemConfig.pricing.normalVariationPrice
          );
          const normalDiscountedPrice = computed(
            () => applyDiscount(normalOriginalPrice.value, props.itemConfig.discount)
          );
          const fullsetOriginalPrice = computed(
            () => props.itemConfig.pricing.fullsetPrice
          );
          const fullsetDiscountedPrice = computed(
            () => applyDiscount(fullsetOriginalPrice.value, props.itemConfig.discount)
          );
          const discountPreview = computed(() => {
            if (!props.itemConfig.discount.enabled) return "";
            const discountTemplate = getSelectedDiscountTemplate(
              props.globalTemplates,
              props.itemConfig
            );
            return parseTemplate(discountTemplate, {
              originalPrice: normalOriginalPrice.value,
              discountedPrice: normalDiscountedPrice.value,
              discountPercent: props.itemConfig.discount.discountPercent,
              fullsetOriginalPrice: fullsetOriginalPrice.value,
              fullsetDiscountedPrice: fullsetDiscountedPrice.value,
              startDate: formatDateTime(props.itemConfig.discount.startDate),
              endDate: formatDateTime(props.itemConfig.discount.endDate)
            });
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(Modal, {
                show: _ctx.show,
                title: "Variation 配置",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[10] || (_cache[10] = ($event) => emit("close"))
              }, {
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    type: "button",
                    title: "取消",
                    onClick: _cache[9] || (_cache[9] = ($event) => emit("close"))
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_19$2)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    type: "button",
                    title: "保存",
                    onClick: handleSave
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_20$2)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_1$2, [
                    createVNode(unref(SectionHeader), { title: "价格配置" }, {
                      default: withCtx(() => [
                        createElementVNode("div", _hoisted_2$2, [
                          _cache[12] || (_cache[12] = createElementVNode("label", null, "普通 Variation 价格 (¥)", -1)),
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.itemConfig.pricing.normalVariationPrice = $event),
                            type: "number",
                            min: "0",
                            placeholder: "0"
                          }, null, 512), [
                            [
                              vModelText,
                              _ctx.itemConfig.pricing.normalVariationPrice,
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createElementVNode("div", _hoisted_3$2, [
                          _cache[13] || (_cache[13] = createElementVNode("label", null, "Fullset 价格 (¥)", -1)),
                          createElementVNode("p", _hoisted_4$2, "建议: ¥" + toDisplayString(suggestedPrice.value), 1),
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.itemConfig.pricing.fullsetPrice = $event),
                            type: "number",
                            min: "0",
                            placeholder: "0"
                          }, null, 512), [
                            [
                              vModelText,
                              _ctx.itemConfig.pricing.fullsetPrice,
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createElementVNode("div", _hoisted_5$2, [
                          createElementVNode("span", _hoisted_6$2, [
                            _cache[14] || (_cache[14] = createTextVNode(" 总支持数: ", -1)),
                            createElementVNode("strong", null, toDisplayString(totalSupport.value), 1)
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(unref(SectionHeader), { title: "折扣配置" }, {
                      default: withCtx(() => [
                        createElementVNode("div", _hoisted_7$2, [
                          createElementVNode("label", _hoisted_8$2, [
                            withDirectives(createElementVNode("input", {
                              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.itemConfig.discount.enabled = $event),
                              type: "checkbox"
                            }, null, 512), [
                              [vModelCheckbox, _ctx.itemConfig.discount.enabled]
                            ]),
                            _cache[15] || (_cache[15] = createElementVNode("span", { class: "toggle-slider" }, null, -1)),
                            _cache[16] || (_cache[16] = createElementVNode("span", { class: "toggle-label" }, "启用打折", -1))
                          ]),
                          _ctx.itemConfig.discount.enabled ? (openBlock(), createElementBlock("button", {
                            key: 0,
                            class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                            type: "button",
                            title: "配置折扣模板",
                            onClick: _cache[3] || (_cache[3] = ($event) => showDiscountTemplateModal.value = true)
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(withSize)(unref(icons).settings, 14)
                            }, null, 8, _hoisted_9$2)
                          ])) : createCommentVNode("", true)
                        ]),
                        _ctx.itemConfig.discount.enabled ? (openBlock(), createElementBlock("div", _hoisted_10$2, [
                          createVNode(TemplateSelector, {
                            modelValue: _ctx.itemConfig.selectedTemplates.discountTemplateId,
                            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.itemConfig.selectedTemplates.discountTemplateId = $event),
                            templates: _ctx.globalTemplates.discountTemplates,
                            label: "选择折扣模板",
                            "empty-hint": "请先在折扣模板配置中添加模板"
                          }, null, 8, ["modelValue", "templates"]),
                          createElementVNode("div", _hoisted_11$2, [
                            _cache[17] || (_cache[17] = createElementVNode("label", null, "折扣百分比 (%)", -1)),
                            withDirectives(createElementVNode("input", {
                              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.itemConfig.discount.discountPercent = $event),
                              type: "number",
                              min: "0",
                              max: "100",
                              placeholder: "0"
                            }, null, 512), [
                              [
                                vModelText,
                                _ctx.itemConfig.discount.discountPercent,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createElementVNode("div", _hoisted_12$2, [
                            createElementVNode("div", _hoisted_13$2, [
                              _cache[18] || (_cache[18] = createElementVNode("label", null, "折扣开始时间", -1)),
                              withDirectives(createElementVNode("input", {
                                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.itemConfig.discount.startDate = $event),
                                type: "datetime-local"
                              }, null, 512), [
                                [vModelText, _ctx.itemConfig.discount.startDate]
                              ])
                            ]),
                            createElementVNode("div", _hoisted_14$2, [
                              _cache[19] || (_cache[19] = createElementVNode("label", null, "折扣结束时间", -1)),
                              withDirectives(createElementVNode("input", {
                                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.itemConfig.discount.endDate = $event),
                                type: "datetime-local"
                              }, null, 512), [
                                [vModelText, _ctx.itemConfig.discount.endDate]
                              ])
                            ])
                          ]),
                          createVNode(unref(PreviewBox), {
                            label: "折扣描述预览:",
                            type: "pre"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(discountPreview.value), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(unref(PreviewBox), {
                            label: "价格预览:",
                            type: "text"
                          }, {
                            default: withCtx(() => [
                              createElementVNode("div", _hoisted_15$2, [
                                createElementVNode("div", _hoisted_16$2, [
                                  _cache[20] || (_cache[20] = createElementVNode("span", null, "普通 Variation:", -1)),
                                  createElementVNode("span", null, "¥" + toDisplayString(normalOriginalPrice.value) + " → ¥" + toDisplayString(normalDiscountedPrice.value), 1)
                                ]),
                                createElementVNode("div", _hoisted_17$2, [
                                  _cache[21] || (_cache[21] = createElementVNode("span", null, "Fullset:", -1)),
                                  createElementVNode("span", null, "¥" + toDisplayString(fullsetOriginalPrice.value) + " → ¥" + toDisplayString(fullsetDiscountedPrice.value), 1)
                                ])
                              ])
                            ]),
                            _: 1
                          })
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }),
                    createVNode(unref(SectionHeader), { title: "通用文件配置" }, {
                      default: withCtx(() => [
                        _cache[24] || (_cache[24] = createElementVNode("p", { class: "form-hint be-text-xs be-text-secondary be-mb-sm" }, " 选择所有 variation 共享的通用文件（如材质、配饰等），这些文件会在应用时自动添加到每个 variation ", -1)),
                        createElementVNode("div", _hoisted_18$2, [
                          _cache[22] || (_cache[22] = createTextVNode(" 已选择: ", -1)),
                          createElementVNode("strong", null, toDisplayString(tempCommonFiles.value.length), 1),
                          _cache[23] || (_cache[23] = createTextVNode(" 个文件 ", -1))
                        ]),
                        createVNode(unref(FileSelector), {
                          files: _ctx.availableFiles,
                          "selected-file-ids": tempCommonFiles.value,
                          "onUpdate:selectedFileIds": _cache[8] || (_cache[8] = ($event) => tempCommonFiles.value = $event)
                        }, null, 8, ["files", "selected-file-ids"])
                      ]),
                      _: 1,
                      __: [24]
                    })
                  ])
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(_sfc_main$3, {
                show: showDiscountTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[11] || (_cache[11] = ($event) => showDiscountTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"])
            ], 64);
          };
        }
      });
      const VariationConfigModal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-5862736f"]]);
      const _hoisted_1$1 = ["innerHTML"];
      const _hoisted_2$1 = ["innerHTML"];
      const _hoisted_3$1 = ["innerHTML"];
      const _hoisted_4$1 = ["innerHTML"];
      const _hoisted_5$1 = ["innerHTML"];
      const _hoisted_6$1 = {
        key: 0,
        class: "common-files-preview be-mb-sm"
      };
      const _hoisted_7$1 = {
        class: "be-flex be-align-center be-gap-xs be-flex-wrap be-p-xs be-px-sm",
        style: { "background": "var(--be-color-bg-secondary)", "border-radius": "var(--be-radius-sm)", "border": "1px solid var(--be-color-border)" }
      };
      const _hoisted_8$1 = {
        key: 1,
        class: "empty-hint"
      };
      const _hoisted_9$1 = {
        class: "be-flex be-align-center be-gap-sm",
        style: { "flex": "1" }
      };
      const _hoisted_10$1 = ["onUpdate:modelValue"];
      const _hoisted_11$1 = {
        key: 0,
        class: "booth-toggle",
        title: "将此 Variation 设为 Fullset（合集包）"
      };
      const _hoisted_12$1 = ["checked", "onChange"];
      const _hoisted_13$1 = ["onClick"];
      const _hoisted_14$1 = ["innerHTML"];
      const _hoisted_15$1 = { class: "be-flex be-flex-column be-gap-xs" };
      const _hoisted_16$1 = { class: "be-flex be-align-center be-gap-sm" };
      const _hoisted_17$1 = {
        key: 0,
        class: "be-text-base be-text-primary"
      };
      const _hoisted_18$1 = { class: "be-text-base be-text-primary be-flex-shrink-0" };
      const _hoisted_19$1 = {
        class: "booth-toggle be-flex-shrink-0",
        title: "自定义此 Variation 的价格"
      };
      const _hoisted_20$1 = ["onUpdate:modelValue"];
      const _hoisted_21$1 = ["onUpdate:modelValue"];
      const _hoisted_22$1 = { class: "be-text-sm be-text-secondary be-flex-shrink-0" };
      const _hoisted_23$1 = { class: "item-card-header" };
      const _hoisted_24$1 = { class: "item-card-title" };
      const _hoisted_25$1 = ["onClick"];
      const _hoisted_26$1 = ["innerHTML"];
      const _hoisted_27$1 = { class: "item-card-content" };
      const _hoisted_28$1 = ["onClick"];
      const _hoisted_29$1 = ["innerHTML"];
      const _hoisted_30$1 = { class: "item-select-text" };
      const _sfc_main$1 = /* @__PURE__ */ defineComponent({
        __name: "VariationsListSection",
        props: {
          itemConfig: {},
          globalTemplates: {},
          api: {},
          modal: {},
          itemTree: {}
        },
        emits: ["applied"],
        setup(__props, { expose: __expose, emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showPriceModal = ref(false);
          const selectedVariationIndex = ref(null);
          const selectingItemForFile = ref(null);
          const pageVariationNames = ref(/* @__PURE__ */ new Set());
          const hasFullset = computed(
            () => props.itemConfig.variations.some((v) => v.isFullset)
          );
          const availableFiles = computed(() => props.api.files);
          async function importVariations() {
            const pageVariations = props.api.variations;
            if (pageVariations.length === 0) {
              toast.info("页面没有 Variations");
              return;
            }
            props.itemConfig.variations = pageVariations.map((variation, index) => {
              var _a, _b;
              const name = ((_a = variation.nameInput) == null ? void 0 : _a.value) || "";
              const isFullset = name.toLowerCase().includes("fullset");
              const priceStr = ((_b = variation.priceInput) == null ? void 0 : _b.value) || "0";
              const price = parseInt(priceStr.replace(/\D/g, "")) || 0;
              const fileIds = props.api.getVariationFiles(index);
              return {
                name,
                price,
                isFullset,
                fileIds,
                // 导入已关联的文件
                fileItemMap: {}
                // 初始化为空对象，待自动匹配
              };
            });
            props.itemConfig.variations.forEach((variation, index) => {
              if (variation.fileIds && variation.fileIds.length > 0) {
                autoMatchItemsForFiles(index, variation.fileIds);
              }
            });
            const allFiles = /* @__PURE__ */ new Set();
            const mappedFiles = /* @__PURE__ */ new Set();
            props.itemConfig.variations.forEach((variation) => {
              var _a;
              (_a = variation.fileIds) == null ? void 0 : _a.forEach((fileId) => allFiles.add(fileId));
              if (variation.fileItemMap) {
                Object.entries(variation.fileItemMap).forEach(([fileId, itemId]) => {
                  if (itemId) mappedFiles.add(fileId);
                });
              }
            });
            const commonFiles = Array.from(allFiles).filter((fileId) => !mappedFiles.has(fileId));
            props.itemConfig.commonFiles = commonFiles;
            const messages = [`已导入 ${pageVariations.length} 个 Variations`];
            if (commonFiles.length > 0) {
              messages.push(`检测到 ${commonFiles.length} 个通用文件`);
            }
            toast.success(messages.join("，"));
            updatePageVariationNames();
          }
          function syncVariationOrderFromPage() {
            const pageVariations = props.api.variations;
            if (pageVariations.length === 0 || props.itemConfig.variations.length === 0) {
              return;
            }
            const pageNames = pageVariations.map((v) => {
              var _a, _b;
              return ((_b = (_a = v.nameInput) == null ? void 0 : _a.value) == null ? void 0 : _b.trim()) || "";
            });
            const pageNameSet = new Set(pageNames);
            const configInPageOrder = pageNames.map((pageName) => props.itemConfig.variations.find((v) => {
              var _a;
              return (((_a = v.name) == null ? void 0 : _a.trim()) || "") === pageName;
            })).filter((v) => v !== void 0);
            const configNotInPage = props.itemConfig.variations.filter(
              (v) => {
                var _a;
                return !pageNameSet.has(((_a = v.name) == null ? void 0 : _a.trim()) || "");
              }
            );
            const newOrder = [...configInPageOrder, ...configNotInPage];
            const currentOrder = props.itemConfig.variations.map((v) => {
              var _a;
              return ((_a = v.name) == null ? void 0 : _a.trim()) || "";
            });
            const targetOrder = newOrder.map((v) => {
              var _a;
              return ((_a = v.name) == null ? void 0 : _a.trim()) || "";
            });
            if (JSON.stringify(currentOrder) !== JSON.stringify(targetOrder)) {
              props.itemConfig.variations = newOrder;
            }
          }
          let variationObserver = null;
          function waitForVariationsReady(timeout = 5e3) {
            return new Promise((resolve) => {
              const startTime = Date.now();
              const checkVariations = () => {
                const variations = props.api.variations;
                if (variations && variations.length > 0) {
                  resolve(true);
                  return;
                }
                if (Date.now() - startTime > timeout) {
                  console.warn("[VariationsListSection] 等待 variations 数据超时，可能页面暂无 variation");
                  resolve(false);
                  return;
                }
                setTimeout(checkVariations, 100);
              };
              checkVariations();
            });
          }
          function findVariationListContainer() {
            var _a;
            const variations = props.api.variations;
            if (variations.length === 0) return null;
            const firstVariationElement = (_a = variations[0]) == null ? void 0 : _a.element;
            if (!firstVariationElement) return null;
            return firstVariationElement.parentElement;
          }
          async function startVariationOrderSync() {
            const hasVariations = await waitForVariationsReady();
            if (!hasVariations) {
              console.log("[VariationsListSection] 页面暂无 variations，跳过顺序同步");
              return;
            }
            syncVariationOrderFromPage();
            updatePageVariationInputsDisabledState();
            updatePageVariationNames();
            const variationListContainer = findVariationListContainer();
            if (!variationListContainer) {
              console.warn("[VariationsListSection] 无法找到 variation 列表容器，跳过 DOM 监听");
              return;
            }
            variationObserver = new MutationObserver((mutations) => {
              const hasOrderChange = mutations.some((mutation) => {
                return mutation.type === "childList" && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
              });
              if (hasOrderChange) {
                setTimeout(() => {
                  syncVariationOrderFromPage();
                  updatePageVariationInputsDisabledState();
                  updatePageVariationNames();
                }, 100);
              }
            });
            variationObserver.observe(variationListContainer, {
              childList: true,
              // 监听子节点添加/删除
              subtree: false
              // 不监听更深层级
            });
          }
          function stopVariationOrderSync() {
            if (variationObserver) {
              variationObserver.disconnect();
              variationObserver = null;
            }
          }
          function toggleInputLock(input, shouldLock, inputType) {
            const LOCKED_ICON_CLASS = "booth-enhancer-lock-icon";
            input.disabled = shouldLock;
            const parent = input.parentElement;
            if (!parent) return;
            const lockIcon = parent.querySelector(
              `.${LOCKED_ICON_CLASS}[data-for="${inputType}"]`
            );
            if (shouldLock) {
              if (getComputedStyle(parent).position === "static") {
                parent.style.position = "relative";
              }
              if (!lockIcon) {
                const icon = document.createElement("span");
                icon.className = LOCKED_ICON_CLASS;
                icon.setAttribute("data-for", inputType);
                icon.innerHTML = withSize(icons.lock, 14);
                icon.title = "此项由脚本管理，禁止手动编辑";
                parent.appendChild(icon);
              }
            } else {
              lockIcon == null ? void 0 : lockIcon.remove();
            }
          }
          function updatePageVariationInputsDisabledState() {
            const configNameSet = new Set(
              props.itemConfig.variations.map((v) => {
                var _a;
                return (_a = v.name) == null ? void 0 : _a.trim();
              }).filter(Boolean)
            );
            props.api.variations.forEach((pageVar) => {
              var _a, _b;
              const pageName = ((_b = (_a = pageVar.nameInput) == null ? void 0 : _a.value) == null ? void 0 : _b.trim()) || "";
              const shouldDisable = Boolean(pageName && configNameSet.has(pageName));
              if (pageVar.nameInput) {
                toggleInputLock(pageVar.nameInput, shouldDisable, "name");
              }
              if (pageVar.priceInput) {
                toggleInputLock(pageVar.priceInput, shouldDisable, "price");
              }
            });
          }
          onMounted(() => {
            props.api.onVariationAdded(() => {
              updatePageVariationNames();
              updatePageVariationInputsDisabledState();
            });
            startVariationOrderSync();
          });
          onUnmounted(() => {
            stopVariationOrderSync();
          });
          function autoCreateVariationsFromFiles() {
            var _a;
            const files = availableFiles.value;
            if (files.length === 0) {
              toast.info("暂无可用文件");
              return;
            }
            const existingNames = new Set(
              props.itemConfig.variations.map((v) => {
                var _a2;
                return (_a2 = v.name) == null ? void 0 : _a2.trim();
              }).filter(Boolean)
            );
            let createdCount = 0;
            let skippedCount = 0;
            const commonFiles = [];
            for (const file of files) {
              const matchedItemId = findBestMatchItem(file.name);
              if (matchedItemId) {
                const node = props.itemTree.nodes[matchedItemId];
                const itemName = (((_a = node == null ? void 0 : node.data) == null ? void 0 : _a.itemName) || (node == null ? void 0 : node.name) || file.name).trim();
                if (existingNames.has(itemName)) {
                  skippedCount++;
                  continue;
                }
                props.itemConfig.variations.push({
                  name: itemName,
                  price: 0,
                  isFullset: false,
                  fileIds: [file.id],
                  fileItemMap: { [file.id]: matchedItemId }
                });
                existingNames.add(itemName);
                createdCount++;
              } else {
                commonFiles.push(file.id);
              }
            }
            if (commonFiles.length > 0) {
              const existing = props.itemConfig.commonFiles || [];
              props.itemConfig.commonFiles = Array.from(/* @__PURE__ */ new Set([...existing, ...commonFiles]));
            }
            const messages = [];
            if (createdCount > 0) messages.push(`已创建 ${createdCount} 个 Variations`);
            if (skippedCount > 0) messages.push(`跳过 ${skippedCount} 个已存在`);
            if (commonFiles.length > 0) messages.push(`${commonFiles.length} 个文件划分为通用文件`);
            if (messages.length > 0) {
              toast.success(messages.join("，"));
            } else {
              toast.info("没有可创建的 Variations");
            }
          }
          function addVariation() {
            const price = applyDiscount(
              props.itemConfig.pricing.normalVariationPrice,
              props.itemConfig.discount
            );
            props.itemConfig.variations.push({
              name: "",
              price,
              isFullset: false,
              useCustomPrice: false,
              fileIds: [],
              fileItemMap: {}
            });
          }
          function removeVariation(index) {
            props.itemConfig.variations.splice(index, 1);
          }
          function onVariationReorder(fromIndex, toIndex) {
            const [removed] = props.itemConfig.variations.splice(fromIndex, 1);
            props.itemConfig.variations.splice(toIndex, 0, removed);
          }
          function toggleFullset(variation, index) {
            if (variation.isFullset) {
              variation.isFullset = false;
              return;
            }
            props.itemConfig.variations.forEach((v, i) => {
              if (i !== index && v.isFullset) {
                v.isFullset = false;
                if (!v.fileIds) {
                  v.fileIds = [];
                }
              }
            });
            variation.isFullset = true;
          }
          function getVariationPrice(variation) {
            const { pricing, discount } = props.itemConfig;
            if (variation.isFullset) {
              return applyDiscount(pricing.fullsetPrice, discount);
            }
            if (variation.useCustomPrice && variation.customPrice !== void 0) {
              return applyDiscount(variation.customPrice, discount);
            }
            return applyDiscount(pricing.normalVariationPrice, discount);
          }
          function getVariationSupportCount(variation) {
            if (variation.isFullset) return 1;
            if (!variation.fileItemMap) return 0;
            return Object.keys(variation.fileItemMap).filter((fileId) => variation.fileItemMap[fileId]).length;
          }
          async function selectFilesForVariation(variationIndex) {
            const variation = props.itemConfig.variations[variationIndex];
            if (availableFiles.value.length === 0) {
              toast.error("无法获取文件列表，请先上传文件");
              return;
            }
            selectedVariationIndex.value = variationIndex;
            const fileResult = await props.modal.openModal({
              type: "selectFile",
              title: "选择文件（可多选）",
              formData: {
                fileIds: variation.fileIds ?? []
              }
            });
            selectedVariationIndex.value = null;
            if (!(fileResult == null ? void 0 : fileResult.fileIds)) return;
            const selectedFileIds = fileResult.fileIds;
            const oldFileIds = variation.fileIds ?? [];
            const newFileIds = selectedFileIds.filter((id) => !oldFileIds.includes(id));
            variation.fileIds = selectedFileIds;
            if (newFileIds.length > 0) {
              autoMatchItemsForFiles(variationIndex, newFileIds);
            }
          }
          async function selectItemForFile(variationIndex, fileId) {
            var _a;
            const variation = props.itemConfig.variations[variationIndex];
            const currentItemId = (_a = variation.fileItemMap) == null ? void 0 : _a[fileId];
            selectingItemForFile.value = { variationIndex, fileId };
            const result = await props.modal.openModal({
              type: "selectItem",
              title: `为 ${getFileName(fileId)} 选择商品（单选）`,
              formData: {
                itemIds: currentItemId ? [currentItemId] : []
              }
            });
            selectingItemForFile.value = null;
            if (!(result == null ? void 0 : result.itemIds)) return;
            const selectedItemIds = result.itemIds;
            if (!variation.fileItemMap) {
              variation.fileItemMap = {};
            }
            if (selectedItemIds.length === 0) {
              delete variation.fileItemMap[fileId];
            } else {
              variation.fileItemMap[fileId] = selectedItemIds[0];
            }
          }
          function getFileName(fileId) {
            const file = availableFiles.value.find((f) => f.id === fileId);
            return file ? file.name : `File #${fileId}`;
          }
          function getFileItemId(variationIndex, fileId) {
            var _a;
            const variation = props.itemConfig.variations[variationIndex];
            return (_a = variation.fileItemMap) == null ? void 0 : _a[fileId];
          }
          function getFileItemName(variationIndex, fileId) {
            var _a;
            const itemId = getFileItemId(variationIndex, fileId);
            if (!itemId) return "";
            const node = props.itemTree.nodes[itemId];
            if (!node) return "未知商品";
            return ((_a = node.data) == null ? void 0 : _a.itemName) || node.name;
          }
          function removeFileFromVariation(variationIndex, fileId) {
            const variation = props.itemConfig.variations[variationIndex];
            if (variation.fileIds) {
              variation.fileIds = variation.fileIds.filter((id) => id !== fileId);
            }
            if (variation.fileItemMap) {
              delete variation.fileItemMap[fileId];
            }
          }
          function autoMatchItemsForFiles(variationIndex, fileIds) {
            const variation = props.itemConfig.variations[variationIndex];
            if (!variation.fileItemMap) {
              variation.fileItemMap = {};
            }
            for (const fileId of fileIds) {
              if (variation.fileItemMap[fileId]) {
                continue;
              }
              const file = availableFiles.value.find((f) => f.id === fileId);
              if (!file) continue;
              const matchedItemId = findBestMatchItem(file.name);
              if (matchedItemId) {
                variation.fileItemMap[fileId] = matchedItemId;
              }
            }
          }
          function findBestMatchItem(fileName) {
            var _a;
            if (!fileName || !props.itemTree) return null;
            const normalizedFileName = normalizeString(fileName);
            const MIN_SCORE_THRESHOLD = 0.4;
            let bestMatch = null;
            for (const [nodeId, node] of Object.entries(props.itemTree.nodes)) {
              const itemName = (_a = node.data) == null ? void 0 : _a.itemName;
              if (!itemName) continue;
              const normalizedItemName = normalizeString(itemName);
              const score = calculateMatchScore(normalizedFileName, normalizedItemName);
              if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { itemId: nodeId, score };
              }
            }
            return bestMatch && bestMatch.score >= MIN_SCORE_THRESHOLD ? bestMatch.itemId : null;
          }
          function normalizeString(str) {
            return str.toLowerCase().replace(/\.(zip|rar|7z|unitypackage)$/i, "").replace(/[_\-\s]?v?\d+[\._]\d+[\._]?\d*/gi, "").replace(/[(\[（【][^)\]）】]*[)\]）】]/g, "").replace(/[\s\-_\.]/g, "").trim();
          }
          function calculateMatchScore(fileName, itemName) {
            if (!itemName || !fileName) return 0;
            if (fileName === itemName) return 1;
            if (fileName.startsWith(itemName)) return 0.95;
            if (fileName.includes(itemName)) {
              const position = fileName.indexOf(itemName);
              const relativePosition = position / fileName.length;
              return 0.9 - relativePosition * 0.2;
            }
            if (itemName.includes(fileName)) return 0.6;
            const lcs = longestCommonSubstring(fileName, itemName);
            if (lcs.length === 0) return 0;
            const lcsRatio = lcs.length / itemName.length;
            if (lcsRatio >= 0.8) {
              return 0.5 + lcsRatio * 0.3;
            }
            const minLen = Math.min(itemName.length, fileName.length);
            return lcs.length / minLen * 0.5;
          }
          function longestCommonSubstring(str1, str2) {
            if (!str1 || !str2) return "";
            const m = str1.length;
            const n = str2.length;
            let maxLength = 0;
            let endIndex = 0;
            const dp = new Array(n + 1).fill(0);
            for (let i = 1; i <= m; i++) {
              let prev = 0;
              for (let j = 1; j <= n; j++) {
                const temp = dp[j];
                if (str1[i - 1] === str2[j - 1]) {
                  dp[j] = prev + 1;
                  if (dp[j] > maxLength) {
                    maxLength = dp[j];
                    endIndex = i;
                  }
                } else {
                  dp[j] = 0;
                }
                prev = temp;
              }
            }
            return maxLength > 0 ? str1.substring(endIndex - maxLength, endIndex) : "";
          }
          function fileIdsEqual(a, b) {
            if (a.length !== b.length) return false;
            const setA = new Set(a);
            const setB = new Set(b);
            if (setA.size !== a.length || setB.size !== b.length) return false;
            return Array.from(setA).every((id) => setB.has(id));
          }
          function updatePageVariationNames() {
            const names = props.api.variations.map((v) => {
              var _a, _b;
              return (_b = (_a = v.nameInput) == null ? void 0 : _a.value) == null ? void 0 : _b.trim();
            }).filter(Boolean);
            pageVariationNames.value = new Set(names);
          }
          function isVariationLocked(variation) {
            var _a;
            const configName = (_a = variation.name) == null ? void 0 : _a.trim();
            return configName ? pageVariationNames.value.has(configName) : false;
          }
          function getVariationFileIds(config) {
            return [
              ...config.fileIds || [],
              ...props.itemConfig.commonFiles || []
            ];
          }
          async function applyVariations() {
            var _a, _b;
            const configVariations = props.itemConfig.variations;
            const pageVariations = props.api.variations;
            const configNameCount = /* @__PURE__ */ new Map();
            configVariations.forEach((v) => {
              var _a2;
              const name = ((_a2 = v.name) == null ? void 0 : _a2.trim()) || "";
              if (name) {
                configNameCount.set(name, (configNameCount.get(name) || 0) + 1);
              }
            });
            const duplicates = Array.from(configNameCount.entries()).filter(([_, count]) => count > 1).map(([name]) => name);
            if (duplicates.length > 0) {
              toast.error(
                `配置中存在重复名称：${duplicates.join("、")}，请先修正`,
                5e3
              );
              return;
            }
            const pageNameMap = /* @__PURE__ */ new Map();
            pageVariations.forEach((v, idx) => {
              var _a2, _b2;
              const name = ((_b2 = (_a2 = v.nameInput) == null ? void 0 : _a2.value) == null ? void 0 : _b2.trim()) || "";
              if (name) pageNameMap.set(name, idx);
            });
            const toCreate = [];
            const toUpdate = [];
            configVariations.forEach((config) => {
              var _a2;
              const name = ((_a2 = config.name) == null ? void 0 : _a2.trim()) || "";
              if (!name) return;
              const pageIndex = pageNameMap.get(name);
              if (pageIndex !== void 0) {
                toUpdate.push({ config, pageIndex });
              } else {
                toCreate.push(config);
              }
            });
            const configNames = new Set(configVariations.map((v) => {
              var _a2;
              return (_a2 = v.name) == null ? void 0 : _a2.trim();
            }).filter(Boolean));
            const extraOnPage = pageVariations.filter((v) => {
              var _a2, _b2;
              const name = ((_b2 = (_a2 = v.nameInput) == null ? void 0 : _a2.value) == null ? void 0 : _b2.trim()) || "";
              return name && !configNames.has(name);
            });
            if (extraOnPage.length > 0) {
              toast.warning(
                `页面有 ${extraOnPage.length} 个配置中不存在的 Variation，请手动删除`,
                5e3
              );
            }
            let createdCount = 0;
            if (toCreate.length > 3) {
              toast.info(`正在创建 ${toCreate.length} 个 Variations...`, 3e3);
            }
            for (const config of toCreate) {
              const success = await props.api.addVariation();
              if (!success) {
                toast.error(`创建 Variation "${config.name}" 失败`);
                return;
              }
              const currentVariations = props.api.variations;
              const newIndex = currentVariations.length - 1;
              const targetPrice = getVariationPrice(config);
              props.api.updateVariation(newIndex, {
                name: config.name,
                price: targetPrice.toString()
              });
              const targetFileIds = getVariationFileIds(config);
              if (targetFileIds.length > 0) {
                await props.api.setVariationFiles(newIndex, targetFileIds, "replace");
              }
              createdCount++;
            }
            let updatedPriceCount = 0;
            let updatedFileCount = 0;
            for (const { config, pageIndex } of toUpdate) {
              const pageVar = props.api.variations[pageIndex];
              if (!pageVar) continue;
              const targetPrice = getVariationPrice(config);
              const currentPrice = ((_b = (_a = pageVar.priceInput) == null ? void 0 : _a.value) == null ? void 0 : _b.trim()) || "";
              if (currentPrice !== targetPrice.toString()) {
                props.api.updateVariation(pageIndex, { price: targetPrice.toString() });
                updatedPriceCount++;
              }
              const targetFileIds = getVariationFileIds(config);
              const currentFiles = props.api.getVariationFiles(pageIndex);
              if (!fileIdsEqual(currentFiles, targetFileIds) && targetFileIds.length > 0) {
                await props.api.setVariationFiles(pageIndex, targetFileIds, "replace");
                updatedFileCount++;
              }
            }
            const messages = [];
            if (createdCount > 0) messages.push(`创建 ${createdCount} 个`);
            if (updatedPriceCount > 0) messages.push(`更新 ${updatedPriceCount} 个价格`);
            if (updatedFileCount > 0) messages.push(`更新 ${updatedFileCount} 个文件`);
            if (messages.length > 0) {
              toast.success(`已应用：${messages.join("，")}`);
            } else {
              toast.success("所有 Variations 已是最新");
            }
            emit("applied");
          }
          __expose({
            applyVariations
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(unref(SectionHeader), {
                title: `Variations (${_ctx.itemConfig.variations.length})`,
                "no-border": ""
              }, {
                actions: withCtx(() => [
                  _ctx.itemConfig.variations.length === 0 ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-sm booth-btn-ghost",
                    type: "button",
                    title: "从页面导入",
                    onClick: importVariations
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).download, 14)
                    }, null, 8, _hoisted_1$1)
                  ])) : createCommentVNode("", true),
                  _ctx.itemConfig.variations.length === 0 ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-sm booth-btn-ghost",
                    type: "button",
                    title: "根据文件自动创建",
                    onClick: autoCreateVariationsFromFiles
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).magic, 14)
                    }, null, 8, _hoisted_2$1)
                  ])) : createCommentVNode("", true),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-secondary",
                    type: "button",
                    title: "添加",
                    onClick: addVariation
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).plus, 14)
                    }, null, 8, _hoisted_3$1)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-secondary",
                    type: "button",
                    title: "配置价格与通用文件",
                    onClick: _cache[0] || (_cache[0] = ($event) => showPriceModal.value = true)
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).edit, 14)
                    }, null, 8, _hoisted_4$1)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-sm booth-btn-primary",
                    type: "button",
                    title: "应用到页面",
                    onClick: applyVariations
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).send, 14)
                    }, null, 8, _hoisted_5$1)
                  ])
                ]),
                default: withCtx(() => [
                  _ctx.itemConfig.commonFiles && _ctx.itemConfig.commonFiles.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6$1, [
                    createElementVNode("div", _hoisted_7$1, [
                      _cache[2] || (_cache[2] = createElementVNode("span", { class: "be-text-xs be-text-secondary be-font-semibold" }, "通用文件:", -1)),
                      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.itemConfig.commonFiles, (fileId) => {
                        return openBlock(), createElementBlock("span", {
                          key: fileId,
                          class: "file-tag be-text-xs be-px-xs be-py-1",
                          style: { "background": "var(--be-color-bg)", "border": "1px solid var(--be-color-border)", "border-radius": "4px" }
                        }, toDisplayString(getFileName(fileId)), 1);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true),
                  _ctx.itemConfig.variations.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_8$1, ' 暂无 Variations，点击"添加"或"从页面导入" ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                    key: 2,
                    items: _ctx.itemConfig.variations,
                    "key-extractor": (item, index) => item.name || `variation-${index}`,
                    "is-item-locked": isVariationLocked,
                    onRemove: removeVariation,
                    onReorder: onVariationReorder
                  }, {
                    actions: withCtx(({ item: variation, index }) => [
                      createElementVNode("div", _hoisted_9$1, [
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": ($event) => variation.name = $event,
                          type: "text",
                          class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                          style: { "height": "28px" },
                          placeholder: "Variation 名称"
                        }, null, 8, _hoisted_10$1), [
                          [vModelText, variation.name]
                        ]),
                        !hasFullset.value || variation.isFullset ? (openBlock(), createElementBlock("label", _hoisted_11$1, [
                          createElementVNode("input", {
                            type: "checkbox",
                            checked: variation.isFullset,
                            onChange: ($event) => toggleFullset(variation, index)
                          }, null, 40, _hoisted_12$1),
                          _cache[3] || (_cache[3] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                        ])) : createCommentVNode("", true),
                        createElementVNode("button", {
                          class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                          type: "button",
                          title: "选择关联文件",
                          onClick: withModifiers(($event) => selectFilesForVariation(index), ["stop", "prevent"])
                        }, [
                          createElementVNode("span", {
                            innerHTML: unref(withSize)(unref(icons).folder, 14)
                          }, null, 8, _hoisted_14$1)
                        ], 8, _hoisted_13$1)
                      ])
                    ]),
                    content: withCtx(({ item: variation, index }) => [
                      createElementVNode("div", _hoisted_15$1, [
                        createElementVNode("div", _hoisted_16$1, [
                          variation.isFullset ? (openBlock(), createElementBlock("span", _hoisted_17$1, " ¥" + toDisplayString(getVariationPrice(variation)), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                            createElementVNode("span", _hoisted_18$1, " ¥" + toDisplayString(getVariationPrice(variation)), 1),
                            createElementVNode("label", _hoisted_19$1, [
                              withDirectives(createElementVNode("input", {
                                type: "checkbox",
                                "onUpdate:modelValue": ($event) => variation.useCustomPrice = $event
                              }, null, 8, _hoisted_20$1), [
                                [vModelCheckbox, variation.useCustomPrice]
                              ]),
                              _cache[4] || (_cache[4] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                            ]),
                            variation.useCustomPrice ? withDirectives((openBlock(), createElementBlock("input", {
                              key: 0,
                              "onUpdate:modelValue": ($event) => variation.customPrice = $event,
                              type: "number",
                              class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                              style: { "height": "28px", "min-width": "80px" },
                              min: "0",
                              placeholder: "价格"
                            }, null, 8, _hoisted_21$1)), [
                              [
                                vModelText,
                                variation.customPrice,
                                void 0,
                                { number: true }
                              ]
                            ]) : createCommentVNode("", true),
                            createElementVNode("span", _hoisted_22$1, " 支持数: " + toDisplayString(getVariationSupportCount(variation)), 1)
                          ], 64))
                        ]),
                        variation.fileIds && variation.fileIds.length > 0 ? (openBlock(), createElementBlock("div", {
                          key: 0,
                          class: normalizeClass(["item-cards-grid", { "single-item": variation.fileIds.length === 1 }])
                        }, [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(variation.fileIds, (fileId) => {
                            return openBlock(), createElementBlock("div", {
                              key: fileId,
                              class: "item-card"
                            }, [
                              createElementVNode("div", _hoisted_23$1, [
                                createElementVNode("span", _hoisted_24$1, toDisplayString(getFileName(fileId)), 1),
                                createElementVNode("button", {
                                  class: "item-card-delete-btn",
                                  type: "button",
                                  title: "取消关联",
                                  onClick: ($event) => removeFileFromVariation(index, fileId)
                                }, [
                                  createElementVNode("span", {
                                    innerHTML: unref(withSize)(unref(icons).close, 12)
                                  }, null, 8, _hoisted_26$1)
                                ], 8, _hoisted_25$1)
                              ]),
                              createElementVNode("div", _hoisted_27$1, [
                                createElementVNode("button", {
                                  class: normalizeClass(["item-select-btn", { "has-item": getFileItemId(index, fileId) }]),
                                  type: "button",
                                  onClick: withModifiers(($event) => selectItemForFile(index, fileId), ["stop"])
                                }, [
                                  createElementVNode("span", {
                                    innerHTML: unref(withSize)(unref(icons).file, 12)
                                  }, null, 8, _hoisted_29$1),
                                  createElementVNode("span", _hoisted_30$1, toDisplayString(getFileItemId(index, fileId) ? getFileItemName(index, fileId) : "选择商品"), 1)
                                ], 10, _hoisted_28$1)
                              ])
                            ]);
                          }), 128))
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ]),
                    _: 1
                  }, 8, ["items", "key-extractor"]))
                ]),
                _: 1
              }, 8, ["title"]),
              createVNode(VariationConfigModal, {
                show: showPriceModal.value,
                "item-config": _ctx.itemConfig,
                "global-templates": _ctx.globalTemplates,
                "available-files": availableFiles.value,
                onClose: _cache[1] || (_cache[1] = ($event) => showPriceModal.value = false)
              }, null, 8, ["show", "item-config", "global-templates", "available-files"])
            ], 64);
          };
        }
      });
      const VariationsListSection = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-cc98f3f8"]]);
      const _hoisted_1 = ["innerHTML"];
      const _hoisted_2 = { key: 0 };
      const _hoisted_3 = { class: "form-group" };
      const _hoisted_4 = { class: "form-group" };
      const _hoisted_5 = {
        key: 1,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_6 = { class: "form-group" };
      const _hoisted_7 = ["innerHTML"];
      const _hoisted_8 = ["disabled"];
      const _hoisted_9 = ["innerHTML"];
      const _hoisted_10 = ["innerHTML"];
      const _hoisted_11 = {
        key: 0,
        class: "empty-state"
      };
      const _hoisted_12 = ["innerHTML"];
      const _hoisted_13 = {
        key: 1,
        class: "empty-state"
      };
      const _hoisted_14 = ["innerHTML"];
      const _hoisted_15 = ["innerHTML"];
      const _hoisted_16 = {
        key: 2,
        class: "edit-tab"
      };
      const _hoisted_17 = { class: "edit-tab-scrollable" };
      const _hoisted_18 = { class: "be-text-primary be-font-bold be-mb-sm" };
      const _hoisted_19 = { class: "be-text-secondary" };
      const _hoisted_20 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_21 = { class: "form-hint be-text-xs be-text-secondary" };
      const _hoisted_22 = {
        key: 0,
        class: "item-select-list",
        style: { "display": "grid", "grid-template-columns": "repeat(2, 1fr)", "gap": "8px" }
      };
      const _hoisted_23 = ["onClick"];
      const _hoisted_24 = {
        class: "be-flex be-flex-column",
        style: { "gap": "2px" }
      };
      const _hoisted_25 = { class: "be-text-sm be-font-medium" };
      const _hoisted_26 = { class: "be-text-xs be-text-secondary" };
      const _hoisted_27 = {
        key: 1,
        class: "empty-hint"
      };
      const _hoisted_28 = ["innerHTML"];
      const _hoisted_29 = ["innerHTML"];
      const _hoisted_30 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_31 = { class: "form-hint be-text-xs be-text-secondary" };
      const _hoisted_32 = ["innerHTML"];
      const _hoisted_33 = ["innerHTML"];
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "EditTab",
        props: {
          api: {}
        },
        setup(__props, { expose: __expose }) {
          const { data } = useStorage();
          const modal = useModal();
          const modalState = computed(() => modal.state.value);
          const isPreviewModal = computed(() => {
            var _a;
            const state = modalState.value;
            return state.type === "alert" && ((_a = state.formData) == null ? void 0 : _a.sectionIndex) !== void 0;
          });
          const isGeneralModal = computed(
            () => !isPreviewModal.value && modalState.value.type !== "selectItem" && modalState.value.type !== "selectFile"
          );
          const previewSectionIndex = computed(
            () => {
              var _a;
              return (_a = modalState.value.formData) == null ? void 0 : _a.sectionIndex;
            }
          );
          const showDescTemplateModal = ref(false);
          const currentItemId = computed(() => {
            const match = window.location.pathname.match(/\/items\/(\d+)\/edit/);
            return match ? match[1] : null;
          });
          const currentItemConfig = computed(() => {
            if (!currentItemId.value) return null;
            return data.value.itemConfigs[currentItemId.value] || null;
          });
          const hasConfig = computed(() => currentItemConfig.value !== null);
          const globalTemplates = computed(() => data.value.globalTemplates);
          const totalSupport = computed(() => {
            if (!currentItemConfig.value) return 0;
            return calculateTotalSupport(currentItemConfig.value.variations);
          });
          const templateVars = computed(() => {
            const config = currentItemConfig.value;
            if (!config) return { itemName: "", supportCount: 0 };
            const normalVariations = config.variations.filter((v) => !v.isFullset);
            const firstVariation = normalVariations[0];
            const supportCount = totalSupport.value;
            const itemTypeName = config.itemTypeName || "Item";
            const firstItemId = (firstVariation == null ? void 0 : firstVariation.fileItemMap) ? Object.values(firstVariation.fileItemMap)[0] : null;
            const getItemName = (itemId) => {
              const node = data.value.itemTree.nodes[itemId];
              if (!node) return "未知商品";
              const itemData = node.data;
              if (!itemData) return node.name;
              return itemData.itemName;
            };
            const firstName = (firstVariation == null ? void 0 : firstVariation.name) || firstItemId && getItemName(firstItemId) || config.itemName;
            const smartTitle = normalVariations.length > 1 || supportCount > 1 ? `${supportCount} ${pluralize(itemTypeName, supportCount)}` : firstName;
            const discountIndicatorTemplate = config.discount.enabled ? getSelectedDiscountIndicatorTemplate(globalTemplates.value, config) : "";
            const discountIndicator = parseTemplate(discountIndicatorTemplate, {
              discountPercent: config.discount.discountPercent
            });
            return {
              itemName: config.itemName || "",
              supportCount,
              itemTypeName,
              itemTypePlural: pluralize(itemTypeName, supportCount),
              variationCount: normalVariations.length,
              firstName,
              smartTitle,
              discountIndicator
            };
          });
          const resolvedSections = computed(() => {
            if (!currentItemConfig.value) return [];
            const context = {
              variations: currentItemConfig.value.variations,
              itemTree: data.value.itemTree
            };
            return currentItemConfig.value.sections.map((section) => {
              const resolved = resolveSectionContent(section, globalTemplates.value, context);
              return {
                headline: parseTemplate(resolved.headline, templateVars.value),
                body: parseTemplate(resolved.body, templateVars.value)
              };
            });
          });
          const previewDescription = computed(() => {
            var _a;
            if (!currentItemConfig.value) return "";
            const parts = [];
            const descTemplate = getSelectedDescriptionTemplate(globalTemplates.value, currentItemConfig.value);
            const templateDesc = parseTemplate(descTemplate, templateVars.value);
            if (templateDesc) parts.push(templateDesc);
            const customDesc = modalState.value.type === "editDescription" ? (_a = modalState.value.formData) == null ? void 0 : _a.customDescription : currentItemConfig.value.customDescription;
            if (customDesc) {
              parts.push(customDesc);
            }
            if (currentItemConfig.value.discount.enabled) {
              const normalOriginalPrice = currentItemConfig.value.pricing.normalVariationPrice;
              const normalDiscountedPrice = applyDiscount(
                normalOriginalPrice,
                currentItemConfig.value.discount
              );
              const fullsetOriginalPrice = currentItemConfig.value.pricing.fullsetPrice;
              const fullsetDiscountedPrice = applyDiscount(
                fullsetOriginalPrice,
                currentItemConfig.value.discount
              );
              const discountTemplate = getSelectedDiscountTemplate(globalTemplates.value, currentItemConfig.value);
              const discountText = parseTemplate(
                discountTemplate,
                {
                  ...templateVars.value,
                  originalPrice: normalOriginalPrice,
                  discountedPrice: normalDiscountedPrice,
                  discountPercent: currentItemConfig.value.discount.discountPercent,
                  fullsetOriginalPrice,
                  fullsetDiscountedPrice,
                  startDate: formatDateTime(currentItemConfig.value.discount.startDate),
                  endDate: formatDateTime(currentItemConfig.value.discount.endDate)
                }
              );
              parts.push(discountText);
            }
            return parts.join("\n\n");
          });
          async function handleCreateItem() {
            var _a;
            const result = await modal.openModal({
              type: "createItem",
              title: "创建商品配置",
              formData: {
                itemName: "",
                itemType: "adaptation"
              }
            });
            if (((_a = result == null ? void 0 : result.itemName) == null ? void 0 : _a.trim()) && currentItemId.value) {
              const config = createDefaultItemConfig(currentItemId.value);
              config.itemName = result.itemName.trim();
              config.itemType = result.itemType;
              data.value.itemConfigs[currentItemId.value] = config;
              toast.success("已创建商品配置");
            }
          }
          function handleDescriptionUpdated(description) {
            if (currentItemId.value) {
              data.value.itemConfigs[currentItemId.value].customDescription = description;
            }
          }
          const tempSelectedItems = ref([]);
          const tempSelectedFileIds = ref([]);
          function toggleItemSelection(itemId) {
            const index = tempSelectedItems.value.indexOf(itemId);
            if (index > -1) {
              tempSelectedItems.value.splice(index, 1);
            } else {
              tempSelectedItems.value.push(itemId);
            }
          }
          function isItemSelected(itemId) {
            return tempSelectedItems.value.includes(itemId);
          }
          watch(() => modalState.value.show, (isOpen) => {
            if (!isOpen) {
              tempSelectedItems.value = [];
              tempSelectedFileIds.value = [];
              return;
            }
            const { type, formData } = modalState.value;
            if (type === "selectItem" && (formData == null ? void 0 : formData.itemIds)) {
              tempSelectedItems.value = [...formData.itemIds];
            }
            if (type === "selectFile" && (formData == null ? void 0 : formData.fileIds)) {
              tempSelectedFileIds.value = [...formData.fileIds];
            }
          });
          watch(
            () => {
              if (!currentItemConfig.value) return null;
              return {
                pricing: currentItemConfig.value.pricing,
                discount: currentItemConfig.value.discount
              };
            },
            () => {
              if (currentItemConfig.value) {
                calculateVariationPrices(
                  currentItemConfig.value.variations,
                  currentItemConfig.value.pricing,
                  currentItemConfig.value.discount
                );
              }
            },
            { deep: true }
          );
          onMounted(() => {
            if (!currentItemId.value) {
              toast.error("无法获取商品 ID");
            }
          });
          const itemNameSectionRef = ref(null);
          const itemDescriptionSectionRef = ref(null);
          const sectionsListSectionRef = ref(null);
          const tagsSectionRef = ref(null);
          const variationsListSectionRef = ref(null);
          async function applyAll() {
            var _a, _b, _c, _d, _e;
            if (!currentItemConfig.value) {
              toast.error("没有配置数据");
              return;
            }
            try {
              await ((_a = itemNameSectionRef.value) == null ? void 0 : _a.applyName());
              await ((_b = itemDescriptionSectionRef.value) == null ? void 0 : _b.applyDescription());
              await ((_c = sectionsListSectionRef.value) == null ? void 0 : _c.applySections());
              await ((_d = tagsSectionRef.value) == null ? void 0 : _d.applyTags());
              await ((_e = variationsListSectionRef.value) == null ? void 0 : _e.applyVariations());
              toast.success("所有配置应用完成");
            } catch (error) {
              console.error("应用配置失败:", error);
              toast.error("应用配置失败");
            }
          }
          __expose({
            applyAll
          });
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(unref(Modal), {
                show: modalState.value.show && isGeneralModal.value,
                title: modalState.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(modal).closeModal
              }, {
                "header-actions": withCtx(() => [
                  modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                    type: "button",
                    title: "模板配置",
                    onClick: _cache[0] || (_cache[0] = ($event) => showDescTemplateModal.value = true)
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).settings, 18)
                    }, null, 8, _hoisted_1)
                  ])) : createCommentVNode("", true)
                ]),
                footer: withCtx(() => {
                  var _a;
                  return [
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                      type: "button",
                      title: "取消",
                      onClick: _cache[5] || (_cache[5] = //@ts-ignore
                      (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).close, 18)
                      }, null, 8, _hoisted_7)
                    ]),
                    modalState.value.type === "createItem" ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      type: "button",
                      title: "创建配置",
                      disabled: !((_a = modalState.value.formData.itemName) == null ? void 0 : _a.trim()),
                      onClick: _cache[6] || (_cache[6] = ($event) => unref(modal).confirmModal(modalState.value.formData))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_9)
                    ], 8, _hoisted_8)) : modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("button", {
                      key: 1,
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      type: "button",
                      title: "保存",
                      onClick: _cache[7] || (_cache[7] = ($event) => unref(modal).confirmModal(modalState.value.formData))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_10)
                    ])) : createCommentVNode("", true)
                  ];
                }),
                default: withCtx(() => [
                  modalState.value.type === "createItem" ? (openBlock(), createElementBlock("div", _hoisted_2, [
                    _cache[17] || (_cache[17] = createElementVNode("p", { class: "hint-text" }, " 为当前商品创建编辑配置，配置后可以管理商品名称、描述、Sections 和 Variations。 ", -1)),
                    createElementVNode("div", _hoisted_3, [
                      _cache[14] || (_cache[14] = createElementVNode("label", null, [
                        createTextVNode("商品名称 "),
                        createElementVNode("span", { class: "required" }, "*")
                      ], -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => modalState.value.formData.itemName = $event),
                        type: "text",
                        placeholder: "输入商品名称",
                        onKeyup: _cache[2] || (_cache[2] = withKeys(($event) => unref(modal).confirmModal(modalState.value.formData), ["enter"]))
                      }, null, 544), [
                        [vModelText, modalState.value.formData.itemName]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_4, [
                      _cache[16] || (_cache[16] = createElementVNode("label", null, "商品类型", -1)),
                      withDirectives(createElementVNode("select", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => modalState.value.formData.itemType = $event)
                      }, _cache[15] || (_cache[15] = [
                        createElementVNode("option", { value: "normal" }, "普通商品", -1),
                        createElementVNode("option", { value: "adaptation" }, "适配商品", -1)
                      ]), 512), [
                        [vModelSelect, modalState.value.formData.itemType]
                      ])
                    ])
                  ])) : modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("div", _hoisted_5, [
                    createElementVNode("div", _hoisted_6, [
                      _cache[18] || (_cache[18] = createElementVNode("label", null, "自定义描述 (此商品专属)", -1)),
                      withDirectives(createElementVNode("textarea", {
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => modalState.value.formData.customDescription = $event),
                        rows: "8",
                        placeholder: "输入此商品的特殊说明..."
                      }, null, 512), [
                        [vModelText, modalState.value.formData.customDescription]
                      ])
                    ]),
                    createVNode(unref(PreviewBox), {
                      label: "最终描述预览",
                      type: "pre"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(previewDescription.value), 1)
                      ]),
                      _: 1
                    })
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"]),
              !currentItemId.value ? (openBlock(), createElementBlock("div", _hoisted_11, [
                createElementVNode("div", {
                  class: "empty-icon",
                  innerHTML: unref(withSize)(unref(icons).alertCircle, 48)
                }, null, 8, _hoisted_12),
                _cache[19] || (_cache[19] = createElementVNode("div", { class: "be-text-lg be-font-bold" }, "无法获取商品 ID", -1)),
                _cache[20] || (_cache[20] = createElementVNode("p", null, "请确保在商品编辑页面使用此功能", -1))
              ])) : !hasConfig.value ? (openBlock(), createElementBlock("div", _hoisted_13, [
                createElementVNode("div", {
                  class: "empty-icon",
                  innerHTML: unref(withSize)(unref(icons).file, 64)
                }, null, 8, _hoisted_14),
                _cache[22] || (_cache[22] = createElementVNode("div", { class: "be-text-lg be-font-bold" }, "未配置此商品", -1)),
                _cache[23] || (_cache[23] = createElementVNode("p", null, "为当前商品创建编辑配置，开始管理商品信息", -1)),
                createElementVNode("button", {
                  class: "booth-btn booth-btn-lg booth-btn-primary",
                  onClick: handleCreateItem
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 16)
                  }, null, 8, _hoisted_15),
                  _cache[21] || (_cache[21] = createTextVNode(" 创建商品配置 ", -1))
                ])
              ])) : currentItemConfig.value ? (openBlock(), createElementBlock("div", _hoisted_16, [
                createElementVNode("div", _hoisted_17, [
                  createVNode(_sfc_main$a, {
                    ref_key: "itemNameSectionRef",
                    ref: itemNameSectionRef,
                    "item-config": currentItemConfig.value,
                    "global-templates": globalTemplates.value,
                    "template-vars": templateVars.value,
                    api: _ctx.api,
                    "total-support": totalSupport.value,
                    "item-tree": unref(data).itemTree
                  }, null, 8, ["item-config", "global-templates", "template-vars", "api", "total-support", "item-tree"]),
                  createVNode(_sfc_main$e, {
                    ref_key: "itemDescriptionSectionRef",
                    ref: itemDescriptionSectionRef,
                    "item-config": currentItemConfig.value,
                    "global-templates": globalTemplates.value,
                    "template-vars": templateVars.value,
                    api: _ctx.api,
                    modal: unref(modal),
                    "current-item-id": currentItemId.value,
                    "on-description-updated": handleDescriptionUpdated
                  }, null, 8, ["item-config", "global-templates", "template-vars", "api", "modal", "current-item-id"]),
                  createVNode(SectionsListSection, {
                    ref_key: "sectionsListSectionRef",
                    ref: sectionsListSectionRef,
                    "item-config": currentItemConfig.value,
                    "global-templates": globalTemplates.value,
                    "template-vars": templateVars.value,
                    api: _ctx.api,
                    modal: unref(modal),
                    "item-tree": unref(data).itemTree
                  }, null, 8, ["item-config", "global-templates", "template-vars", "api", "modal", "item-tree"]),
                  createVNode(TagsSection, {
                    ref_key: "tagsSectionRef",
                    ref: tagsSectionRef,
                    "item-config": currentItemConfig.value,
                    api: _ctx.api,
                    "item-tree": unref(data).itemTree,
                    "tag-tree": unref(data).tagTree
                  }, null, 8, ["item-config", "api", "item-tree", "tag-tree"]),
                  createVNode(VariationsListSection, {
                    ref_key: "variationsListSectionRef",
                    ref: variationsListSectionRef,
                    "item-config": currentItemConfig.value,
                    "global-templates": globalTemplates.value,
                    api: _ctx.api,
                    modal: unref(modal),
                    "item-tree": unref(data).itemTree
                  }, null, 8, ["item-config", "global-templates", "api", "modal", "item-tree"])
                ]),
                createVNode(unref(Modal), {
                  show: modalState.value.show && isPreviewModal.value,
                  title: modalState.value.title,
                  "teleport-to": ".booth-enhancer-sidebar",
                  onClose: unref(modal).closeModal
                }, {
                  default: withCtx(() => [
                    previewSectionIndex.value !== void 0 && resolvedSections.value[previewSectionIndex.value] ? (openBlock(), createBlock(unref(PreviewBox), {
                      key: 0,
                      label: "Section 预览:",
                      type: "pre"
                    }, {
                      default: withCtx(() => [
                        createElementVNode("div", _hoisted_18, toDisplayString(resolvedSections.value[previewSectionIndex.value].headline), 1),
                        createElementVNode("div", _hoisted_19, toDisplayString(resolvedSections.value[previewSectionIndex.value].body), 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  _: 1
                }, 8, ["show", "title", "onClose"]),
                createVNode(unref(Modal), {
                  show: modalState.value.show && modalState.value.type === "selectItem",
                  title: modalState.value.title,
                  "teleport-to": ".booth-enhancer-sidebar",
                  onClose: unref(modal).closeModal
                }, {
                  footer: withCtx(() => [
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                      type: "button",
                      title: "取消",
                      onClick: _cache[8] || (_cache[8] = //@ts-ignore
                      (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).close, 18)
                      }, null, 8, _hoisted_28)
                    ]),
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      type: "button",
                      title: "确认",
                      onClick: _cache[9] || (_cache[9] = ($event) => unref(modal).confirmModal({ itemIds: tempSelectedItems.value }))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_29)
                    ])
                  ]),
                  default: withCtx(() => [
                    createElementVNode("div", _hoisted_20, [
                      createElementVNode("p", _hoisted_21, " 点击选择/取消商品关联（已选择: " + toDisplayString(tempSelectedItems.value.length) + "） ", 1),
                      Object.keys(unref(data).itemTree.nodes).filter((id) => unref(data).itemTree.nodes[id].data).length > 0 ? (openBlock(), createElementBlock("div", _hoisted_22, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(Object.keys(unref(data).itemTree.nodes).filter((id) => unref(data).itemTree.nodes[id].data), (nodeId) => {
                          var _a, _b;
                          return openBlock(), createElementBlock("button", {
                            key: nodeId,
                            class: "item-select-btn booth-btn booth-btn-sm booth-btn-ghost be-text-left",
                            type: "button",
                            style: normalizeStyle({
                              padding: "6px 8px",
                              backgroundColor: isItemSelected(nodeId) ? "rgba(59, 130, 246, 0.1)" : void 0,
                              borderColor: isItemSelected(nodeId) ? "rgba(59, 130, 246, 0.3)" : void 0
                            }),
                            onClick: ($event) => toggleItemSelection(nodeId)
                          }, [
                            createElementVNode("div", _hoisted_24, [
                              createElementVNode("span", _hoisted_25, toDisplayString(((_a = unref(data).itemTree.nodes[nodeId].data) == null ? void 0 : _a.itemName) || unref(data).itemTree.nodes[nodeId].name), 1),
                              createElementVNode("span", _hoisted_26, toDisplayString((_b = unref(data).itemTree.nodes[nodeId].data) == null ? void 0 : _b.authorName), 1)
                            ])
                          ], 12, _hoisted_23);
                        }), 128))
                      ])) : (openBlock(), createElementBlock("div", _hoisted_27, " 暂无商品数据，请先在 ItemTab 中添加 "))
                    ])
                  ]),
                  _: 1
                }, 8, ["show", "title", "onClose"]),
                createVNode(unref(Modal), {
                  show: modalState.value.show && modalState.value.type === "selectFile",
                  title: modalState.value.title,
                  "teleport-to": ".booth-enhancer-sidebar",
                  onClose: unref(modal).closeModal
                }, {
                  footer: withCtx(() => [
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                      type: "button",
                      title: "取消",
                      onClick: _cache[11] || (_cache[11] = //@ts-ignore
                      (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).close, 18)
                      }, null, 8, _hoisted_32)
                    ]),
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      type: "button",
                      title: "确认",
                      onClick: _cache[12] || (_cache[12] = ($event) => unref(modal).confirmModal({ fileIds: tempSelectedFileIds.value }))
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_33)
                    ])
                  ]),
                  default: withCtx(() => [
                    createElementVNode("div", _hoisted_30, [
                      createElementVNode("p", _hoisted_31, " 点击选择文件（可多选，已选择: " + toDisplayString(tempSelectedFileIds.value.length) + "） ", 1),
                      createVNode(unref(FileSelector), {
                        files: _ctx.api.files,
                        "selected-file-ids": tempSelectedFileIds.value,
                        "onUpdate:selectedFileIds": _cache[10] || (_cache[10] = ($event) => tempSelectedFileIds.value = $event)
                      }, null, 8, ["files", "selected-file-ids"])
                    ])
                  ]),
                  _: 1
                }, 8, ["show", "title", "onClose"]),
                createVNode(_sfc_main$f, {
                  show: showDescTemplateModal.value,
                  "global-templates": globalTemplates.value,
                  onClose: _cache[13] || (_cache[13] = ($event) => showDescTemplateModal.value = false)
                }, null, 8, ["show", "global-templates"])
              ])) : createCommentVNode("", true)
            ], 64);
          };
        }
      });
      const EditTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a3af0ecb"]]));

    })
  };
}));

System.register("./useModal-Cv530RMh-DbZQZjC8.js", ['vue'], (function (exports, module) {
  'use strict';
  var ref;
  return {
    setters: [module => {
      ref = module.ref;
    }],
    execute: (function () {

      exports("u", useModal);

      function useModal() {
        const state = ref({
          show: false,
          type: "",
          title: "",
          message: "",
          inputValue: "",
          placeholder: "",
          targetId: "",
          formData: {}
        });
        let resolvePromise = null;
        const openModal = (options) => {
          state.value = {
            show: true,
            type: options.type,
            title: options.title,
            message: options.message || "",
            inputValue: options.defaultValue || "",
            placeholder: options.placeholder || "",
            targetId: options.targetId || "",
            formData: options.formData || {}
          };
          return new Promise((resolve) => {
            resolvePromise = resolve;
          });
        };
        const closeModal = () => {
          state.value.show = false;
          if (resolvePromise) {
            resolvePromise(void 0);
            resolvePromise = null;
          }
        };
        const confirmModal = (result) => {
          state.value.show = false;
          if (resolvePromise) {
            resolvePromise(result !== void 0 ? result : state.value.inputValue);
            resolvePromise = null;
          }
        };
        const confirm = (title, message) => {
          return openModal({
            type: "delete",
            title,
            defaultValue: message || ""
          }).then((result) => !!result);
        };
        return {
          state,
          openModal,
          closeModal,
          confirmModal,
          confirm
        };
      }

    })
  };
}));

System.import("./__entry.js", "./");