// ==UserScript==
// @name               Booth ItemPage Enhancer
// @name:zh-CN         Booth 商品页面增强
// @namespace          yueby.booth
// @version            0.1.14
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

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const t=document.createElement("style");t.textContent=e,document.head.append(t)})(' .menu-fade-enter-active[data-v-4d60a255]{transition:opacity .15s ease-out,transform .15s ease-out}.menu-fade-leave-active[data-v-4d60a255]{transition:opacity .1s ease-in,transform .1s ease-in}.menu-fade-enter-from[data-v-4d60a255]{opacity:0;transform:scale(.95) translateY(-4px)}.menu-fade-leave-to[data-v-4d60a255]{opacity:0;transform:scale(.95)}.context-menu[data-v-4d60a255]{position:fixed;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 12px #00000026;z-index:10000;min-width:140px;overflow:hidden;padding:4px 0;transform-origin:top left}.context-menu.no-transition[data-v-4d60a255]{transition:none!important}.menu-item[data-v-4d60a255]{padding:8px 16px;cursor:pointer;transition:all .15s ease;font-size:12px;color:#374151;display:flex;align-items:center;gap:8px}.menu-item[data-v-4d60a255]:hover{background:#f3f4f6}.menu-item-danger[data-v-4d60a255]{color:#ef4444}.menu-item-danger[data-v-4d60a255]:hover{background:#fef2f2}.menu-item-disabled[data-v-4d60a255]{opacity:.5;cursor:not-allowed;pointer-events:none}.menu-icon[data-v-4d60a255]{display:flex;align-items:center;justify-content:center;color:#6b7280;flex-shrink:0}.menu-item-danger .menu-icon[data-v-4d60a255]{color:#ef4444}.menu-icon[data-v-4d60a255] svg{width:14px;height:14px}.menu-label[data-v-4d60a255]{flex:1}.menu-separator[data-v-4d60a255]{height:1px;background:#e5e7eb;margin:4px 0}.icon-btn[data-v-996dd7d2]{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:#64748b;border-radius:6px;cursor:pointer;transition:all .15s ease;padding:0}.icon-btn[data-v-996dd7d2] svg{width:18px;height:18px;stroke-width:2}.icon-btn[data-v-996dd7d2]:hover{background:#f1f5f9;color:#475569;border-color:#e2e8f0;transform:translateY(-1px)}.icon-btn[data-v-996dd7d2]:active{transform:translateY(1px)}.icon-btn.variant-danger[data-v-996dd7d2]{color:#64748b}.icon-btn.variant-danger[data-v-996dd7d2]:hover{background:#fef2f2;color:#ef4444;border-color:#fee2e2}.modal-overlay[data-v-abeda2bd]{position:fixed;top:0;right:0;bottom:0;left:0;background:#00000080;display:flex;align-items:flex-end;justify-content:center;z-index:10000;padding:0;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}.modal-overlay.modal-in-sidebar[data-v-abeda2bd]{position:absolute;z-index:2000}.modal-container[data-v-abeda2bd]{background:#fff;border-radius:16px 16px 0 0;box-shadow:0 10px 25px #0003;width:100%;max-width:500px;max-height:70vh;display:flex;flex-direction:column;overflow:hidden}.modal-overlay.modal-in-sidebar .modal-container[data-v-abeda2bd]{max-height:70%}.modal-header[data-v-abeda2bd]{padding:10px 12px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#f8fafc}.modal-title[data-v-abeda2bd]{margin:0;font-size:14px;font-weight:600;color:#374151}.modal-header-actions[data-v-abeda2bd]{display:flex;align-items:center;gap:4px}.modal-header .booth-btn[data-v-abeda2bd] svg{width:18px;height:18px;stroke-width:2}.modal-body[data-v-abeda2bd]{padding:8px;overflow-y:auto;flex:1;min-height:0;font-size:13px;color:#374151}.modal-footer[data-v-abeda2bd]{padding:10px 12px;border-top:1px solid #e5e7eb;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px;flex-shrink:0;background:#f8fafc}.modal-body[data-v-abeda2bd] .section-header-container{padding-left:0!important;padding-right:0!important}.modal-footer .booth-btn[data-v-abeda2bd]{width:100%}.modal-enter-active[data-v-abeda2bd],.modal-leave-active[data-v-abeda2bd]{transition:opacity .3s ease}.modal-enter-active .modal-container[data-v-abeda2bd],.modal-leave-active .modal-container[data-v-abeda2bd]{transition:transform .3s ease}.modal-enter-from[data-v-abeda2bd],.modal-leave-to[data-v-abeda2bd]{opacity:0}.modal-enter-from .modal-container[data-v-abeda2bd],.modal-leave-to .modal-container[data-v-abeda2bd]{transform:translateY(100%)}.modal-body[data-v-abeda2bd]::-webkit-scrollbar{width:6px}.modal-body[data-v-abeda2bd]::-webkit-scrollbar-track{background:#f5f5f5}.modal-body[data-v-abeda2bd]::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-body[data-v-abeda2bd]::-webkit-scrollbar-thumb:hover{background:#999}.section-header-container[data-v-bd8a2399]{padding:var(--be-space-sm);padding-bottom:8px;border-bottom:1px solid var(--be-color-border)}.section-header-container.no-header[data-v-bd8a2399]{padding-bottom:var(--be-space-sm)}.section-header-container.no-border[data-v-bd8a2399]{border-bottom:none;padding-bottom:var(--be-space-sm)}.section-header[data-v-bd8a2399]{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.actions[data-v-bd8a2399]{display:flex;gap:var(--be-space-sm);flex-wrap:nowrap;align-items:center}.tab-bar[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb}.tab-list[data-v-ee7eccb8]{display:flex;gap:2px}.tab-btn[data-v-ee7eccb8]{padding:6px 12px;border:1px solid transparent;background:transparent;cursor:pointer;font-size:12px;color:#6b7280;border-radius:6px;transition:all .15s ease;display:flex;align-items:center;gap:6px;font-weight:500}.tab-btn[data-v-ee7eccb8]:hover:not(.active){background:#f3f4f6;color:#374151}.tab-btn.active[data-v-ee7eccb8]{background:#fff;color:#3b82f6;font-weight:600;box-shadow:0 1px 2px #00000014}.tab-icon[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:center}.tab-icon[data-v-ee7eccb8] svg{width:13px;height:13px}.tab-label[data-v-ee7eccb8]{white-space:nowrap}.tab-actions[data-v-ee7eccb8]{display:flex;align-items:center;gap:4px}.tree-item[data-v-fbb1ef76]{-webkit-user-select:none;user-select:none}.tree-node-wrapper[data-v-fbb1ef76]{position:relative;transition:all .15s ease}.tree-node-wrapper[draggable=true][data-v-fbb1ef76]{cursor:move}.tree-node-wrapper[data-v-fbb1ef76]:active{cursor:grabbing}.tree-node-wrapper.drag-over-inside[data-v-fbb1ef76]{background:#eff6ff;border-radius:4px}.tree-node-wrapper.drag-over-inside[data-v-fbb1ef76]:before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;border:2px solid #3b82f6;border-radius:4px;pointer-events:none;animation:pulse-fbb1ef76 1s ease-in-out infinite}@keyframes pulse-fbb1ef76{0%,to{opacity:1}50%{opacity:.5}}.drop-indicator[data-v-fbb1ef76]{position:relative;height:2px;margin:2px 0;pointer-events:none}.drop-indicator[data-v-fbb1ef76]:before{content:"";position:absolute;left:0;right:0;height:2px;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.drop-indicator[data-v-fbb1ef76]:after{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.node-item[data-v-fbb1ef76]{position:relative;border-bottom:1px solid rgba(0,0,0,.06);transition:background .15s ease;cursor:pointer}.node-item.is-editing[data-v-fbb1ef76]{cursor:default}.node-item[data-v-fbb1ef76]:not(.is-editing):after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background-color:transparent;pointer-events:none;transition:background-color .1s ease;z-index:1}.node-item[data-v-fbb1ef76]:not(.is-editing):hover:after{background-color:#0000000a}.node-item.selected[data-v-fbb1ef76]{background:#bfdbfe}.tree-node-content[data-v-fbb1ef76]{display:flex;align-items:center;padding:4px 8px;min-height:28px;cursor:inherit;transition:background .15s ease}.node-item.has-custom-content .tree-node-content[data-v-fbb1ef76]{padding-bottom:2px}.node-item.is-editing .tree-node-content[data-v-fbb1ef76]{cursor:default}.toggle-area[data-v-fbb1ef76]{display:flex;align-items:center;cursor:pointer;position:relative;z-index:2;transition:opacity .15s ease;margin-right:8px}.toggle-area[data-v-fbb1ef76]:hover{opacity:.7}.toggle-area .expand-icon[data-v-fbb1ef76]{margin-right:4px}.toggle-area .icon[data-v-fbb1ef76]{margin-right:0}.expand-icon[data-v-fbb1ef76]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:4px;color:#6b7280;flex-shrink:0;transition:transform .2s ease,opacity .15s ease;position:relative;z-index:2}.expand-icon.placeholder[data-v-fbb1ef76]{visibility:hidden;cursor:default}.node-item.is-editing .expand-icon[data-v-fbb1ef76]:not(.placeholder){cursor:pointer}.node-item.is-editing .expand-icon[data-v-fbb1ef76]:not(.placeholder):hover{opacity:.7}.expand-icon[data-v-fbb1ef76] svg{width:12px;height:12px}.icon[data-v-fbb1ef76]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:8px;flex-shrink:0;position:relative;z-index:2}.icon[data-v-fbb1ef76] svg{display:block;width:16px;height:16px;stroke-width:2}.node-custom-content[data-v-fbb1ef76]{padding-top:2px;padding-bottom:4px;padding-right:8px}.node-custom-content[data-v-fbb1ef76]:empty{display:none;padding:0}.node-item.is-editing .node-custom-content[data-v-fbb1ef76]{opacity:.6;pointer-events:none}.node-name-input[data-v-fbb1ef76]{flex:1;padding:2px 6px;border-radius:3px;font-size:13px;font-family:inherit;line-height:1.4}.name[data-v-fbb1ef76]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:#374151;line-height:1.4}.count[data-v-fbb1ef76]{font-size:11px;color:#9ca3af;margin-left:6px;font-weight:400}.node-header-extra[data-v-fbb1ef76]{margin-left:auto;display:flex;align-items:center;gap:8px}.tree-wrapper[data-v-b7665db9]{display:flex;flex-direction:column;height:100%;overflow:hidden}.tree-search[data-v-b7665db9]{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;flex-shrink:0}.tree-toolbar[data-v-b7665db9]{padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;flex-shrink:0}.search-input[data-v-b7665db9]{flex:1;border:none;outline:none;background:transparent;font-size:12px;color:#374151}.tree-search-toolbar[data-v-b7665db9]{display:flex;align-items:center;gap:6px;margin-left:auto}.search-input[data-v-b7665db9]::placeholder{color:#9ca3af}.search-results[data-v-b7665db9]{flex:1;overflow-y:auto;min-height:0}.search-empty[data-v-b7665db9]{padding:40px 20px;text-align:center;color:#9ca3af;font-size:13px}.tree-toolbar[data-v-b7665db9]{padding:8px;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;background:#fff;min-height:40px}.node-tree[data-v-b7665db9]{-webkit-user-select:none;user-select:none;flex:1;overflow-y:auto;min-height:0;position:relative}.tree-content[data-v-b7665db9]{position:relative;z-index:1}.empty-state[data-v-b7665db9]{padding:40px 20px;text-align:center;color:#94a3b8;font-size:13px;border:1px dashed #cbd5e1;border-radius:4px;margin:8px;transition:all .15s ease}.draggable-card-list[data-v-b9ebef1f]{display:flex;flex-direction:column;gap:8px}.draggable-card[data-v-b9ebef1f]{padding:4px;background:var(--be-color-bg-secondary);border:1px solid var(--be-color-border);border-radius:var(--be-radius);cursor:move;transition:var(--be-transition-normal)}.draggable-card[data-v-b9ebef1f]:hover{border-color:var(--be-color-border-hover);box-shadow:var(--be-shadow-sm)}.card-actions[data-v-b9ebef1f]{display:flex;align-items:center;gap:var(--be-space-xs);padding:4px 0;border-bottom:1px solid var(--be-color-border);margin-bottom:4px;min-height:28px;flex-wrap:nowrap;overflow:hidden}.drag-handle[data-v-b9ebef1f]{cursor:grab;color:var(--be-color-text-muted);flex-shrink:0;display:flex;align-items:center}.drag-handle[data-v-b9ebef1f]:active{cursor:grabbing}.card-number[data-v-b9ebef1f]{font-size:var(--be-font-size-sm);font-weight:600;color:var(--be-color-text-secondary);flex-shrink:0}.actions-content[data-v-b9ebef1f]{flex:1;min-width:0;display:flex;align-items:center;gap:var(--be-space-xs);overflow:hidden}.card-content[data-v-b9ebef1f]{display:flex;flex-direction:column;gap:var(--be-space-sm)}:root{--be-color-primary: #3b82f6;--be-color-primary-hover: #2563eb;--be-color-primary-active: #1d4ed8;--be-color-success: #10b981;--be-color-success-hover: #059669;--be-color-danger: #ef4444;--be-color-danger-hover: #dc2626;--be-color-warning: #f59e0b;--be-color-info: #3b82f6;--be-color-gray-50: #f8fafc;--be-color-gray-100: #f3f4f6;--be-color-gray-200: #e5e7eb;--be-color-gray-300: #d1d5db;--be-color-gray-400: #9ca3af;--be-color-gray-500: #6b7280;--be-color-gray-600: #4b5563;--be-color-gray-700: #374151;--be-color-gray-800: #1f2937;--be-color-gray-900: #111827;--be-color-text: #374151;--be-color-text-secondary: #6b7280;--be-color-text-muted: #9ca3af;--be-color-text-inverse: #ffffff;--be-color-bg: #ffffff;--be-color-bg-secondary: #f8fafc;--be-color-bg-tertiary: #f3f4f6;--be-color-bg-hover: #f9fafb;--be-color-bg-active: #f3f4f6;--be-color-border: #e5e7eb;--be-color-border-hover: #d1d5db;--be-color-border-light: #f3f4f6;--be-shadow-sm: 0 1px 2px rgba(0, 0, 0, .05);--be-shadow-md: 0 4px 6px rgba(0, 0, 0, .1);--be-shadow-lg: 0 10px 15px rgba(0, 0, 0, .1);--be-shadow-xl: 0 20px 25px rgba(0, 0, 0, .15);--be-space-xs: 4px;--be-space-sm: 8px;--be-space-md: 16px;--be-space-lg: 24px;--be-space-xl: 32px;--be-radius-sm: 4px;--be-radius: 6px;--be-radius-md: 8px;--be-radius-lg: 12px;--be-radius-xl: 16px;--be-radius-full: 9999px;--be-font-size-xs: 10px;--be-font-size-sm: 11px;--be-font-size-base: 12px;--be-font-size-md: 13px;--be-font-size-lg: 14px;--be-font-size-xl: 16px;--be-font-size-2xl: 18px;--be-transition-fast: .1s ease;--be-transition-normal: .15s ease;--be-transition-slow: .3s ease;--be-z-dropdown: 1000;--be-z-modal: 1500;--be-z-toast: 2000;--be-z-tooltip: 2500}.booth-enhancer-sidebar *{box-sizing:border-box}.booth-enhancer-sidebar input,.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select,.booth-enhancer-sidebar button{font-family:inherit}.booth-btn{display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:6px;font-weight:500;cursor:pointer;transition:all .15s ease;text-decoration:none;white-space:nowrap;-webkit-user-select:none;user-select:none;position:relative;overflow:hidden;font-family:inherit;background:#f3f4f6;color:#374151;border:1px solid #d1d5db}.booth-btn:hover:not(:disabled){background:#e5e7eb;border-color:#9ca3af;transform:translateY(-1px)}.booth-btn:active:not(:disabled){background:#d1d5db;transform:translateY(1px)}.booth-btn:disabled{background:#f3f4f6;color:#9ca3af;cursor:not-allowed;box-shadow:none;opacity:.6}.booth-btn:disabled:hover{background:#f3f4f6;color:#9ca3af;box-shadow:none;transform:none}.booth-btn-sm{padding:4px 8px;font-size:11px;min-height:24px}.booth-btn-md{padding:6px 12px;font-size:12px;min-height:32px}.booth-btn-lg{padding:8px 16px;font-size:14px;min-height:40px}.booth-btn-primary{background:#3b82f6;color:#fff;box-shadow:0 1px 3px #3b82f64d;border:1px solid transparent}.booth-btn-primary:hover:not(:disabled){background:#2563eb;box-shadow:0 2px 4px #3b82f666}.booth-btn-primary:active:not(:disabled){background:#1d4ed8;transform:translateY(1px)}.booth-btn-secondary{background:#f3f4f6;color:#374151;border:1px solid #d1d5db}.booth-btn-secondary:hover:not(:disabled){background:#e5e7eb;border-color:#9ca3af}.booth-btn-secondary:active:not(:disabled){background:#d1d5db;transform:translateY(1px)}.booth-btn-success{background:#10b981;color:#fff;box-shadow:0 1px 3px #10b9814d;border:1px solid transparent}.booth-btn-success:hover:not(:disabled){background:#059669;box-shadow:0 2px 4px #10b98166}.booth-btn-success:active:not(:disabled){background:#047857;transform:translateY(1px)}.booth-btn-danger{background:#ef4444;color:#fff;box-shadow:0 1px 3px #ef44444d;border:1px solid transparent}.booth-btn-danger:hover:not(:disabled){background:#dc2626;box-shadow:0 2px 4px #ef444466}.booth-btn-danger:active:not(:disabled){background:#b91c1c;transform:translateY(1px)}.booth-btn-ghost{background:transparent;color:#64748b;border:1px solid transparent}.booth-btn-ghost:hover:not(:disabled){background:#f1f5f9;color:#475569;border-color:#e2e8f0}.booth-btn-ghost:active:not(:disabled){background:#e2e8f0;transform:translateY(1px)}.booth-btn-icon{padding:6px;min-width:32px;min-height:32px}.booth-btn-icon.booth-btn-sm{padding:4px;min-width:24px;min-height:24px}.booth-btn-icon.booth-btn-lg{padding:8px;min-width:40px;min-height:40px}.booth-btn:focus{outline:none;box-shadow:0 0 0 3px #3b82f61a}.booth-btn:focus:not(:focus-visible){box-shadow:none}.booth-btn-group{display:inline-flex;border-radius:6px;overflow:hidden;box-shadow:0 1px 2px #0000000d}.booth-btn-group .booth-btn{border-radius:0;border-right:1px solid rgba(255,255,255,.2)}.booth-btn-group .booth-btn:first-child{border-top-left-radius:6px;border-bottom-left-radius:6px}.booth-btn-group .booth-btn:last-child{border-top-right-radius:6px;border-bottom-right-radius:6px;border-right:none}.booth-btn-loading{position:relative;color:transparent}.booth-btn-loading:after{content:"";position:absolute;top:50%;left:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border:2px solid transparent;border-top-color:currentColor;border-radius:50%;animation:booth-btn-spin .6s linear infinite}@keyframes booth-btn-spin{to{transform:rotate(360deg)}}.booth-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;position:relative}.booth-toggle input[type=checkbox]{position:absolute;opacity:0;width:0;height:0}.booth-toggle .toggle-slider{position:relative;width:44px;height:24px;background:#d1d5db;border-radius:12px;transition:all .15s ease}.booth-toggle .toggle-slider:before{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .3s;box-shadow:0 2px 4px #0003}.booth-toggle input[type=checkbox]:checked+.toggle-slider{background:#10b981}.booth-toggle input[type=checkbox]:checked+.toggle-slider:before{transform:translate(20px)}.booth-toggle .toggle-label{font-size:14px;color:#374151;font-weight:400}.booth-toggle:hover .toggle-slider{background:#9ca3af;transform:translateY(-1px)}.booth-toggle:hover .toggle-label{color:#1f2937}.booth-toggle input[type=checkbox]:active+.toggle-slider{transform:translateY(1px)}.booth-toggle input[type=checkbox]:active+.toggle-slider:before{transform:translate(2px)}.booth-toggle input[type=checkbox]:checked:active+.toggle-slider:before{transform:translate(20px)}.booth-toggle-sm .toggle-slider{width:36px;height:20px}.booth-toggle-sm .toggle-slider:before{width:16px;height:16px}.booth-toggle-sm input[type=checkbox]:checked+.toggle-slider:before{transform:translate(16px)}.booth-toggle-lg .toggle-slider{width:52px;height:28px}.booth-toggle-lg .toggle-slider:before{width:24px;height:24px}.booth-toggle-lg input[type=checkbox]:checked+.toggle-slider:before{transform:translate(24px)}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]),.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select{width:100%;padding:6px 12px;margin:0;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;transition:all .15s ease;box-sizing:border-box;display:block;line-height:1.5;-webkit-appearance:none;-moz-appearance:none;appearance:none}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]):hover,.booth-enhancer-sidebar textarea:hover,.booth-enhancer-sidebar select:hover{border-color:#9ca3af}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]):focus,.booth-enhancer-sidebar textarea:focus,.booth-enhancer-sidebar select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.booth-enhancer-sidebar input::placeholder,.booth-enhancer-sidebar textarea::placeholder{color:#9ca3af}.booth-enhancer-sidebar textarea{min-height:1.25em;resize:vertical}.modal-content{display:flex;flex-direction:column;gap:var(--be-space-sm)}.modal-content p{margin:0;line-height:1.6;color:#6b7280}.form-group{margin-bottom:var(--be-space-sm)}.form-group:last-child{margin-bottom:0}.form-group label{display:block;margin-bottom:4px;font-size:12px;font-weight:500;color:#374151}.form-group .required{color:#ef4444;margin-left:4px}.label-hint{font-size:var(--be-font-size-xs);color:var(--be-color-text-muted);font-weight:400;font-style:italic}.form-hint{margin:2px 0 0;font-size:var(--be-font-size-xs);color:var(--be-color-text-secondary)}.empty-hint{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.hint-text{font-size:var(--be-font-size-base);color:var(--be-color-text-secondary)}.tab-nav{display:flex;gap:var(--be-space-xs);border-bottom:1px solid var(--be-color-border);margin-bottom:var(--be-space-sm)}.tab-btn{padding:var(--be-space-xs) var(--be-space-sm);font-size:var(--be-font-size-base);font-weight:500;color:var(--be-color-text-secondary);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:var(--be-transition-normal)}.tab-btn:hover{color:var(--be-color-text);background:var(--be-color-bg-secondary)}.tab-btn.active{color:var(--be-color-primary);border-bottom-color:var(--be-color-primary)}.tab-content{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:var(--be-space-sm)}.form-group input,.form-group textarea,.form-group select{width:100%;padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;box-sizing:border-box;line-height:1.5;transition:all .15s ease;-webkit-appearance:none;-moz-appearance:none;appearance:none}.form-group input:hover,.form-group textarea:hover,.form-group select:hover{border-color:#9ca3af}.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.form-group textarea{min-height:1.25em;resize:vertical}.booth-enhancer-sidebar ::-webkit-scrollbar{width:6px;height:6px}.booth-enhancer-sidebar ::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb:hover{background:#94a3b8}.be-m-0{margin:0!important}.be-mt-0{margin-top:0!important}.be-mr-0{margin-right:0!important}.be-mb-0{margin-bottom:0!important}.be-ml-0{margin-left:0!important}.be-m-xs{margin:var(--be-space-xs)!important}.be-m-sm{margin:var(--be-space-sm)!important}.be-m-md{margin:var(--be-space-md)!important}.be-m-lg{margin:var(--be-space-lg)!important}.be-p-0{padding:0!important}.be-pt-0{padding-top:0!important}.be-pr-0{padding-right:0!important}.be-pb-0{padding-bottom:0!important}.be-pl-0{padding-left:0!important}.be-p-xs{padding:var(--be-space-xs)!important}.be-p-sm{padding:var(--be-space-sm)!important}.be-p-md{padding:var(--be-space-md)!important}.be-p-lg{padding:var(--be-space-lg)!important}.be-px-xs{padding-left:var(--be-space-xs)!important;padding-right:var(--be-space-xs)!important}.be-px-sm{padding-left:var(--be-space-sm)!important;padding-right:var(--be-space-sm)!important}.be-px-md{padding-left:var(--be-space-md)!important;padding-right:var(--be-space-md)!important}.be-px-lg{padding-left:var(--be-space-lg)!important;padding-right:var(--be-space-lg)!important}.be-pt-xs{padding-top:var(--be-space-xs)!important}.be-pt-sm{padding-top:var(--be-space-sm)!important}.be-pt-md{padding-top:var(--be-space-md)!important}.be-pt-lg{padding-top:var(--be-space-lg)!important}.be-pb-xs{padding-bottom:var(--be-space-xs)!important}.be-pb-sm{padding-bottom:var(--be-space-sm)!important}.be-pb-md{padding-bottom:var(--be-space-md)!important}.be-pb-lg{padding-bottom:var(--be-space-lg)!important}.be-mb-xs{margin-bottom:var(--be-space-xs)!important}.be-mb-sm{margin-bottom:var(--be-space-sm)!important}.be-mb-md{margin-bottom:var(--be-space-md)!important}.be-mb-lg{margin-bottom:var(--be-space-lg)!important}.be-flex{display:flex!important}.be-flex-column{flex-direction:column!important}.be-flex-row{flex-direction:row!important}.be-justify-start{justify-content:flex-start!important}.be-justify-center{justify-content:center!important}.be-justify-end{justify-content:flex-end!important}.be-justify-between{justify-content:space-between!important}.be-align-start{align-items:flex-start!important}.be-align-center{align-items:center!important}.be-align-end{align-items:flex-end!important}.be-flex-1{flex:1!important}.be-flex-grow{flex-grow:1!important}.be-flex-shrink-0{flex-shrink:0!important}.be-min-w-0{min-width:0!important}.be-gap-xs{gap:var(--be-space-xs)!important}.be-gap-sm{gap:var(--be-space-sm)!important}.be-gap-md{gap:var(--be-space-md)!important}.be-gap-lg{gap:var(--be-space-lg)!important}.be-text-left{text-align:left!important}.be-text-center{text-align:center!important}.be-text-right{text-align:right!important}.be-text-xs{font-size:var(--be-font-size-xs)!important}.be-text-sm{font-size:var(--be-font-size-sm)!important}.be-text-md{font-size:var(--be-font-size-md)!important}.be-text-lg{font-size:var(--be-font-size-lg)!important}.be-font-normal{font-weight:400!important}.be-font-medium{font-weight:500!important}.be-font-bold{font-weight:600!important}.be-text-primary{color:var(--be-color-text)!important}.be-text-secondary{color:var(--be-color-text-secondary)!important}.be-text-muted{color:var(--be-color-text-muted)!important}.be-text-danger{color:var(--be-color-danger)!important}.be-text-success{color:var(--be-color-success)!important}.be-hidden{display:none!important}.be-visible{visibility:visible!important}.be-invisible{visibility:hidden!important}.be-block{display:block!important}.be-inline{display:inline!important}.be-inline-block{display:inline-block!important}.be-w-full{width:100%!important}.be-w-auto{width:auto!important}.be-h-full{height:100%!important}.be-grid{display:grid!important}.be-grid-cols-2{grid-template-columns:repeat(2,1fr)!important}.be-grid-cols-3{grid-template-columns:repeat(3,1fr)!important}.be-grid-cols-4{grid-template-columns:repeat(4,1fr)!important}.be-border{border:1px solid var(--be-color-border)!important}.be-border-0{border:none!important}.be-border-t{border-top:1px solid var(--be-color-border)!important}.be-border-r{border-right:1px solid var(--be-color-border)!important}.be-border-b{border-bottom:1px solid var(--be-color-border)!important}.be-border-l{border-left:1px solid var(--be-color-border)!important}.be-rounded-sm{border-radius:var(--be-radius-sm)!important}.be-rounded-md{border-radius:var(--be-radius-md)!important}.be-rounded-lg{border-radius:var(--be-radius-lg)!important}.be-rounded-full{border-radius:9999px!important}.be-bg{background:var(--be-color-bg)!important}.be-bg-secondary{background:var(--be-color-bg-secondary)!important}.be-bg-tertiary{background:var(--be-color-bg-tertiary)!important}.be-shadow-sm{box-shadow:var(--be-shadow-sm)!important}.be-shadow-md{box-shadow:var(--be-shadow-md)!important}.be-shadow-lg{box-shadow:var(--be-shadow-lg)!important}.be-shadow-none{box-shadow:none!important}.be-cursor-pointer{cursor:pointer!important}.be-cursor-default{cursor:default!important}.be-cursor-not-allowed{cursor:not-allowed!important}.be-overflow-hidden{overflow:hidden!important}.be-overflow-auto{overflow:auto!important}.be-overflow-scroll{overflow:scroll!important}.be-whitespace-nowrap{white-space:nowrap!important}.be-text-ellipsis{text-overflow:ellipsis!important;overflow:hidden!important}.be-relative{position:relative!important}.be-absolute{position:absolute!important}.be-fixed{position:fixed!important}.be-sticky{position:sticky!important}.be-transition{transition:all var(--be-transition-normal)!important}.be-transition-fast{transition:all var(--be-transition-fast)!important}.be-transition-slow{transition:all var(--be-transition-slow)!important}@media (max-width: 768px){.booth-btn-md{padding:5px 10px;font-size:11px;min-height:28px}.booth-btn-lg{padding:7px 14px;font-size:13px;min-height:36px}.booth-toggle .toggle-label{font-size:12px}.form-group label{font-size:11px}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]),.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select{font-size:11px}}@media (max-width: 480px){:root{--be-space-md: 12px;--be-space-lg: 16px}.booth-btn-sm{padding:3px 6px;font-size:10px;min-height:20px}.booth-btn-md{padding:4px 8px;font-size:10px;min-height:24px}.booth-btn-lg{padding:6px 12px;font-size:12px;min-height:32px}.booth-toggle .toggle-slider{width:36px;height:20px}.booth-toggle .toggle-slider:before{width:16px;height:16px}.booth-toggle input[type=checkbox]:checked+.toggle-slider:before{transform:translate(16px)}.booth-toggle .toggle-label{font-size:11px}}.booth-enhancer-sidebar[data-v-ef8b0a5f]{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:#fffffffa;border:1px solid #e0e0e0;border-radius:12px 0 0 12px;box-shadow:-4px 0 12px #0000001a;font-size:12px;color:#333;overflow:hidden}.sidebar-content[data-v-ef8b0a5f]{flex:1;overflow:hidden;display:flex;flex-direction:column;background:#fff;min-height:0;position:relative}.tab-slide-enter-active[data-v-ef8b0a5f]{transition:opacity .2s ease-out,transform .2s ease-out}.tab-slide-leave-active[data-v-ef8b0a5f]{transition:opacity .15s ease-in,transform .15s ease-in}.tab-slide-enter-from[data-v-ef8b0a5f]{opacity:0;transform:translate(15px)}.tab-slide-leave-to[data-v-ef8b0a5f]{opacity:0;transform:translate(-10px)}.tab-slide-enter-to[data-v-ef8b0a5f],.tab-slide-leave-from[data-v-ef8b0a5f]{opacity:1;transform:translate(0)}.sidebar-content[data-v-ef8b0a5f]>*{width:100%;height:100%}.tag-preset-tab[data-v-e495ea3c]{height:100%;display:flex;flex-direction:column;background:#fff}.toolbar[data-v-e495ea3c]{flex-shrink:0;background:#fff;border-bottom:1px solid #e0e0e0}.tree-container[data-v-e495ea3c]{flex:1;overflow-y:auto;padding:4px;min-height:0;scrollbar-width:thin;scrollbar-color:#cbd5e1 #f5f5f5}.tree-container[data-v-e495ea3c]::-webkit-scrollbar{width:6px}.tree-container[data-v-e495ea3c]::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.tree-container[data-v-e495ea3c]::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.tree-container[data-v-e495ea3c]::-webkit-scrollbar-thumb:hover{background:#94a3b8}.folder-content[data-v-e495ea3c]{display:flex;align-items:center;width:100%;padding:6px 8px}.folder-content .icon[data-v-e495ea3c]{color:#fbbf24;display:flex;align-items:center;justify-content:center;margin-right:8px;flex-shrink:0}.folder-content .name[data-v-e495ea3c]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#334155}.folder-content .count[data-v-e495ea3c]{font-size:12px;color:#94a3b8;margin-left:4px}.tag-custom-content[data-v-e495ea3c]{width:100%}.tag-badges-wrapper[data-v-e495ea3c]{display:flex;flex-wrap:wrap;gap:4px}.tag-badge[data-v-e495ea3c]{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:10px;color:#2563eb;line-height:1.2;white-space:nowrap;transition:all .15s ease}.tag-badge[data-v-e495ea3c]:hover{background:#dbeafe;border-color:#93c5fd}.tag-text[data-v-e495ea3c]{flex-shrink:0}.tag-delete-btn[data-v-e495ea3c]{flex-shrink:0;width:14px;height:14px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:50%;color:#3b82f6;font-size:16px;line-height:0;cursor:pointer;transition:all .15s ease;opacity:.7;font-family:Arial,sans-serif}.tag-delete-btn[data-v-e495ea3c]:hover{opacity:1;background:#3b82f6;color:#fff;transform:scale(1.1)}.modal-message[data-v-e495ea3c]{color:#6b7280;font-size:13px;line-height:1.6;margin:0}.modal-message-with-margin[data-v-e495ea3c]{color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 12px}.modal-textarea-code[data-v-e495ea3c]{font-family:Consolas,Monaco,monospace;line-height:1.5}.modal-textarea-code-small[data-v-e495ea3c]{font-family:Consolas,Monaco,monospace;line-height:1.5;font-size:11px}.form-hint-small[data-v-e495ea3c]{display:block;margin-top:6px;color:#6b7280;font-size:11px}.item-data-tab[data-v-6c6b3856]{height:100%;display:flex;flex-direction:column;background:#fff}.item-custom-content[data-v-6c6b3856]{display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;line-height:1.4}.item-field[data-v-6c6b3856]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.item-separator[data-v-6c6b3856]{flex-shrink:0}.modal-message[data-v-6c6b3856]{color:#6b7280;font-size:13px;line-height:1.6;margin:0}.modal-message-with-margin[data-v-6c6b3856]{color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 12px}.modal-textarea-code[data-v-6c6b3856]{font-family:Consolas,Monaco,monospace;line-height:1.5}.edit-tab-header[data-v-f59e0ed0]{display:flex;align-items:center;gap:var(--be-space-sm);padding:var(--be-space-md);border-bottom:1px solid var(--be-color-border);background:var(--be-color-bg)}.header-spacer[data-v-f59e0ed0]{flex:1}.empty-state[data-v-f59e0ed0]{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:var(--be-space-xl);text-align:center}.empty-icon[data-v-f59e0ed0]{color:var(--be-color-text-muted);margin-bottom:var(--be-space-lg);opacity:.5}.empty-state p[data-v-f59e0ed0]{margin:0 0 var(--be-space-lg);font-size:var(--be-font-size-base);color:var(--be-color-text-secondary);max-width:400px}.empty-hint[data-v-f59e0ed0]{padding:var(--be-space-md);text-align:center;color:var(--be-color-text-secondary);font-size:var(--be-font-size-md);background:var(--be-color-bg-secondary);border-radius:var(--be-radius)}.edit-tab[data-v-f59e0ed0]{display:flex;flex-direction:column;height:100%;position:relative}.edit-tab-scrollable[data-v-f59e0ed0]{flex:1;overflow-y:auto;display:flex;flex-direction:column}.section-preview[data-v-f59e0ed0]{padding:var(--be-space-sm);background:var(--be-color-bg);border:1px solid var(--be-color-border);border-radius:var(--be-radius-sm)}.preview-label[data-v-f59e0ed0]{font-size:var(--be-font-size-xs);font-weight:500;color:var(--be-color-text-muted);margin-bottom:4px}.preview-headline[data-v-f59e0ed0]{font-size:var(--be-font-size-base);font-weight:600;color:var(--be-color-text);margin-bottom:4px}.preview-body[data-v-f59e0ed0]{font-size:var(--be-font-size-sm);color:var(--be-color-text-secondary);white-space:pre-wrap;word-break:break-word}.variation-info[data-v-f59e0ed0]{display:flex;flex-direction:column;gap:var(--be-space-sm)}.variation-details[data-v-f59e0ed0]{display:flex;align-items:center;gap:var(--be-space-sm)}.variation-details .support[data-v-f59e0ed0]{font-size:var(--be-font-size-sm);color:var(--be-color-text-secondary);padding:2px 6px;background:var(--be-color-bg);border-radius:var(--be-radius-sm)}.variation-details .price[data-v-f59e0ed0]{font-size:var(--be-font-size-base);font-weight:600;color:var(--be-color-success)}.variation-details .badge[data-v-f59e0ed0]{font-size:var(--be-font-size-xs);font-weight:600;color:var(--be-color-primary);background:#dbeafe;padding:2px var(--be-space-sm);border-radius:var(--be-radius-full)}.error-state[data-v-f59e0ed0]{padding:40px 20px;text-align:center;color:var(--be-color-danger);font-size:var(--be-font-size-lg)} ');

System.addImportMap({ imports: {"vue":"user:vue"} });
System.set("user:vue", (()=>{const _=Vue;('default' in _)||(_.default=_);return _})());

System.register("./__entry.js", ['./__monkey.entry-xDA_xLW6.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {



		})
	};
}));

System.register("./__monkey.entry-xDA_xLW6.js", ['vue'], (function (exports, module) {
  'use strict';
  var createApp, ref, watch, defineComponent, defineAsyncComponent, computed, onMounted, onUnmounted, createElementBlock, openBlock, createVNode, createElementVNode, unref, withCtx, createTextVNode, toDisplayString, createBlock, resolveDynamicComponent, createCommentVNode, Fragment, renderList, normalizeClass, renderSlot, Teleport, Transition, normalizeStyle, nextTick;
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
      createTextVNode = module.createTextVNode;
      toDisplayString = module.toDisplayString;
      createBlock = module.createBlock;
      resolveDynamicComponent = module.resolveDynamicComponent;
      createCommentVNode = module.createCommentVNode;
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
        e: getSelectedChangelogTemplate,
        g: getSelectedNameTemplate,
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
            cancelable: true,
            view: window
          });
          element.dispatchEvent(mouseEvent);
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
            sections: [],
            variations: [],
            tags: [],
            tagElements: null
          });
          __publicField(this, "_newSectionCallback");
          __publicField(this, "_newVariationCallback");
          __publicField(this, "_nameChangeCallback");
          __publicField(this, "_descriptionChangeCallback");
          __publicField(this, "_sectionsChangeCallback");
          __publicField(this, "_variationsChangeCallback");
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
          this.loadSectionsAndVariations();
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
         * 加载 Section 和 Variation 列表
         */
        loadSectionsAndVariations() {
          this._data.sections = [];
          this._data.variations = [];
          const ulElements = document.querySelectorAll("ul.grid.gap-16");
          ulElements.forEach((ul) => {
            const container = ul;
            if (container.querySelector("li .variation-box-head")) {
              const items = Array.from(container.children).filter(
                (child) => child.tagName.toLowerCase() === "li"
              );
              const isSection = this.isSectionList(container);
              items.forEach((item) => {
                if (isSection) {
                  const headlineInput = item.querySelector(
                    "input.charcoal-text-field-input"
                  );
                  const bodyTextarea = item.querySelector(
                    "textarea.charcoal-text-area-textarea"
                  );
                  this._data.sections.push({
                    element: item,
                    container,
                    headlineInput,
                    bodyTextarea
                  });
                } else {
                  const nameContainer = item.querySelector(
                    'div[id^="variationName-"]'
                  );
                  const priceContainer = item.querySelector(
                    'div[id^="variationDigitalPrice-"]'
                  );
                  const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector(
                    "input.charcoal-text-field-input"
                  );
                  const digitalPriceInput = priceContainer == null ? void 0 : priceContainer.querySelector(
                    "input.charcoal-text-field-input"
                  );
                  this._data.variations.push({
                    element: item,
                    container,
                    nameInput,
                    priceInput: digitalPriceInput
                  });
                }
              });
            }
          });
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
         * 设置列表观察器，监听新增的列表
         */
        setupListObserver() {
          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              for (const node of Array.from(mutation.addedNodes)) {
                if (node instanceof HTMLElement) {
                  if (node.tagName === "UL" && node.classList.contains("grid") && node.classList.contains("gap-16") && node.querySelector("li .variation-box-head")) {
                    const container = node;
                    const items = Array.from(container.children).filter(
                      (child) => child.tagName.toLowerCase() === "li"
                    );
                    const isSection = this.isSectionList(container);
                    items.forEach((item) => {
                      var _a, _b;
                      if (isSection) {
                        const headlineInput = item.querySelector(
                          "input.charcoal-text-field-input"
                        );
                        const bodyTextarea = item.querySelector(
                          "textarea.charcoal-text-area-textarea"
                        );
                        const sectionElement = {
                          element: item,
                          container,
                          headlineInput,
                          bodyTextarea
                        };
                        this._data.sections.push(sectionElement);
                        (_a = this._newSectionCallback) == null ? void 0 : _a.call(this, sectionElement);
                      } else {
                        const nameContainer = item.querySelector(
                          'div[id^="variationName-"]'
                        );
                        const priceContainer = item.querySelector(
                          'div[id^="variationDigitalPrice-"]'
                        );
                        const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector(
                          "input.charcoal-text-field-input"
                        );
                        const priceInput = priceContainer == null ? void 0 : priceContainer.querySelector(
                          "input.charcoal-text-field-input"
                        );
                        const variationElement = {
                          element: item,
                          container,
                          nameInput,
                          priceInput
                        };
                        this._data.variations.push(variationElement);
                        (_b = this._newVariationCallback) == null ? void 0 : _b.call(this, variationElement);
                      }
                    });
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
          return { ...this._data };
        }
        /**
         * 获取所有 Section 元素
         */
        get sections() {
          return [...this._data.sections];
        }
        /**
         * 获取所有 Variation 元素
         */
        get variations() {
          return [...this._data.variations];
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
          const section = this._data.sections[index];
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
          const variation = this._data.variations[index];
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
          this._nameChangeCallback = callback;
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
          this._descriptionChangeCallback = callback;
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
          this._sectionsChangeCallback = callback;
          this._data.sections.forEach((section) => {
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
          this._variationsChangeCallback = callback;
          this._data.variations.forEach((variation) => {
            this.addInputListeners([variation.nameInput, variation.priceInput], callback);
          });
          const originalCallback = this._newVariationCallback;
          this._newVariationCallback = (variation) => {
            this.addInputListeners([variation.nameInput, variation.priceInput], callback);
            originalCallback == null ? void 0 : originalCallback(variation);
            callback();
          };
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
  </svg>`
      });
      const _hoisted_1$2 = { class: "modal-header" };
      const _hoisted_2$2 = { class: "modal-title" };
      const _hoisted_3$2 = { class: "modal-header-actions" };
      const _hoisted_4$2 = ["innerHTML"];
      const _hoisted_5$1 = { class: "modal-body" };
      const _hoisted_6$1 = {
        key: 0,
        class: "modal-footer"
      };
      const _hoisted_7 = ["onClick"];
      const _sfc_main$2 = /* @__PURE__ */ defineComponent({
        __name: "Modal",
        props: {
          show: { type: Boolean },
          title: {},
          width: {},
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
                    createElementVNode("div", {
                      class: "modal-container",
                      style: normalizeStyle({ width: _ctx.width || "400px" })
                    }, [
                      createElementVNode("div", _hoisted_1$2, [
                        createElementVNode("div", _hoisted_2$2, toDisplayString(_ctx.title || "提示"), 1),
                        createElementVNode("div", _hoisted_3$2, [
                          renderSlot(_ctx.$slots, "header-actions", {}, void 0, true),
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                            onClick: handleClose,
                            type: "button",
                            title: "关闭"
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(icons).close
                            }, null, 8, _hoisted_4$2)
                          ])
                        ])
                      ]),
                      createElementVNode("div", _hoisted_5$1, [
                        renderSlot(_ctx.$slots, "default", {}, void 0, true)
                      ]),
                      _ctx.$slots.footer || _ctx.buttons && _ctx.buttons.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6$1, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.buttons, (btn) => {
                            return openBlock(), createElementBlock("button", {
                              key: btn.action,
                              class: normalizeClass(["booth-btn booth-btn-md", [`booth-btn-${btn.variant || "secondary"}`]]),
                              onClick: ($event) => handleButtonClick(btn.action),
                              type: "button"
                            }, toDisplayString(btn.text), 11, _hoisted_7);
                          }), 128))
                        ], true)
                      ])) : createCommentVNode("", true)
                    ], 4)
                  ], 2)) : createCommentVNode("", true)
                ]),
                _: 3
              })
            ], 8, ["to", "disabled"]);
          };
        }
      });
      const Modal = exports("M", /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-abeda2bd"]]));
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
      const TabBar = exports("T", /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ee7eccb8"]]));
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
              template: "{itemName}",
              isDefault: true
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
              template: "【セール中】\n通常価格: ¥{originalPrice} → セール価格: ¥{discountedPrice} ({discountPercent}% OFF)",
              isDefault: true
            }
          ],
          changelogTemplates: [
            {
              id: "default-changelog",
              name: "默认更新日志",
              template: "◆ {date}\n{content}",
              isDefault: true
            }
          ],
          itemInfoTemplates: [
            {
              id: "default-item-info",
              name: "默认商品信息",
              template: "{authorName} - {itemName}",
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
          selectedTemplates: {
            nameTemplateId: "default-name",
            descriptionTemplateId: "default-desc",
            discountTemplateId: "default-discount",
            changelogTemplateId: "default-changelog"
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
          changelog: []
        };
      }
      function createDefaultItemConfig(itemId) {
        return createDefaultSingleItemConfig(itemId);
      }
      function getSelectedTemplate(templates, selectedTemplateId) {
        if (!templates || templates.length === 0) {
          return "";
        }
        let template;
        if (selectedTemplateId) {
          template = templates.find((t) => t.id === selectedTemplateId);
        }
        if (!template) {
          template = templates.find((t) => t.isDefault) || templates[0];
        }
        return (template == null ? void 0 : template.template) || "";
      }
      function getSelectedNameTemplate(config, itemConfig) {
        var _a;
        return getSelectedTemplate(
          config.nameTemplates,
          (_a = itemConfig.selectedTemplates) == null ? void 0 : _a.nameTemplateId
        );
      }
      function getSelectedDescriptionTemplate(config, itemConfig) {
        var _a;
        return getSelectedTemplate(
          config.descriptionTemplates,
          (_a = itemConfig.selectedTemplates) == null ? void 0 : _a.descriptionTemplateId
        );
      }
      function getSelectedDiscountTemplate(config, itemConfig) {
        var _a;
        return getSelectedTemplate(
          config.discountTemplates,
          (_a = itemConfig.selectedTemplates) == null ? void 0 : _a.discountTemplateId
        );
      }
      function getSelectedChangelogTemplate(config, itemConfig) {
        var _a;
        return getSelectedTemplate(
          config.changelogTemplates,
          (_a = itemConfig.selectedTemplates) == null ? void 0 : _a.changelogTemplateId
        );
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
              return JSON.parse(stored);
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

      /* Toast 容器在 body 中时 - 固定在右上角 */
      .booth-toast-container[data-position="fixed"] {
        position: fixed;
        top: 20px;
        right: 20px;
        flex-direction: column;
        z-index: 10001;
      }

      /* Toast 容器在其他元素中时 - 绝对定位在底部 */
      .booth-toast-container[data-position="relative"] {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        flex-direction: column-reverse;
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

      /* Toast 在固定容器中时从右侧滑入 */
      .booth-toast-container[data-position="fixed"] .booth-toast {
        transform: translateX(20px);
      }

      .booth-toast-container[data-position="fixed"] .booth-toast.show {
        opacity: 1;
        transform: translateX(0);
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
          // === 节点操作方法 ===
          createNode: (tree, name, data, parentId) => storage.createNode(tree, name, data, parentId),
          renameNode: (tree, nodeId, newName) => storage.renameNode(tree, nodeId, newName),
          deleteNode: (tree, nodeId) => storage.deleteNode(tree, nodeId),
          moveNode: (tree, nodeId, newParentId) => storage.moveNode(tree, nodeId, newParentId)
        };
      }
      var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
      function getDefaultExportFromCjs(x) {
        return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
      }
      function commonjsRequire(path) {
        throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
      }
      var jszip_min = { exports: {} };
      /*!

      JSZip v3.10.1 - A JavaScript class for generating and reading zip files
      <http://stuartk.com/jszip>

      (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
      Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

      JSZip uses the library pako released under the MIT license :
      https://github.com/nodeca/pako/blob/main/LICENSE
      */
      var hasRequiredJszip_min;
      function requireJszip_min() {
        if (hasRequiredJszip_min) return jszip_min.exports;
        hasRequiredJszip_min = 1;
        (function(module, exports) {
          !function(e) {
            module.exports = e();
          }(function() {
            return function s(a, o, h) {
              function u(r, e2) {
                if (!o[r]) {
                  if (!a[r]) {
                    var t = "function" == typeof commonjsRequire && commonjsRequire;
                    if (!e2 && t) return t(r, true);
                    if (l) return l(r, true);
                    var n = new Error("Cannot find module '" + r + "'");
                    throw n.code = "MODULE_NOT_FOUND", n;
                  }
                  var i = o[r] = { exports: {} };
                  a[r][0].call(i.exports, function(e3) {
                    var t2 = a[r][1][e3];
                    return u(t2 || e3);
                  }, i, i.exports, s, a, o, h);
                }
                return o[r].exports;
              }
              for (var l = "function" == typeof commonjsRequire && commonjsRequire, e = 0; e < h.length; e++) u(h[e]);
              return u;
            }({ 1: [function(e, t, r) {
              var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              r.encode = function(e2) {
                for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
                return h.join("");
              }, r.decode = function(e2) {
                var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
                if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
                var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
                if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
                for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
                return l;
              };
            }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
              var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
              function o(e2, t2, r2, n2, i2) {
                this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
              }
              o.prototype = { getContentWorker: function() {
                var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
                return e2.on("end", function() {
                  if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
                }), e2;
              }, getCompressedWorker: function() {
                return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
              } }, o.createWorkerFrom = function(e2, t2, r2) {
                return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
              }, t.exports = o;
            }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
              var n = e("./stream/GenericWorker");
              r.STORE = { magic: "\0\0", compressWorker: function() {
                return new n("STORE compression");
              }, uncompressWorker: function() {
                return new n("STORE decompression");
              } }, r.DEFLATE = e("./flate");
            }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
              var n = e("./utils");
              var o = function() {
                for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
                  e2 = r2;
                  for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
                  t2[r2] = e2;
                }
                return t2;
              }();
              t.exports = function(e2, t2) {
                return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? function(e3, t3, r2, n2) {
                  var i = o, s = n2 + r2;
                  e3 ^= -1;
                  for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
                  return -1 ^ e3;
                }(0 | t2, e2, e2.length, 0) : function(e3, t3, r2, n2) {
                  var i = o, s = n2 + r2;
                  e3 ^= -1;
                  for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
                  return -1 ^ e3;
                }(0 | t2, e2, e2.length, 0) : 0;
              };
            }, { "./utils": 32 }], 5: [function(e, t, r) {
              r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
            }, {}], 6: [function(e, t, r) {
              var n = null;
              n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
            }, { lie: 37 }], 7: [function(e, t, r) {
              var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
              function h(e2, t2) {
                a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
              }
              r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
                this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
              }, h.prototype.flush = function() {
                a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
              }, h.prototype.cleanUp = function() {
                a.prototype.cleanUp.call(this), this._pako = null;
              }, h.prototype._createPako = function() {
                this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
                var t2 = this;
                this._pako.onData = function(e2) {
                  t2.push({ data: e2, meta: t2.meta });
                };
              }, r.compressWorker = function(e2) {
                return new h("Deflate", e2);
              }, r.uncompressWorker = function() {
                return new h("Inflate", {});
              };
            }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
              function A(e2, t2) {
                var r2, n2 = "";
                for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
                return n2;
              }
              function n(e2, t2, r2, n2, i2, s2) {
                var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
                var S = 0;
                t2 && (S |= 8), l || !_ && !g || (S |= 2048);
                var z = 0, C = 0;
                w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= function(e3, t3) {
                  var r3 = e3;
                  return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
                }(h.unixPermissions, w)) : (C = 20, z |= function(e3) {
                  return 63 & (e3 || 0);
                }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
                var E = "";
                return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
              }
              var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
              function s(e2, t2, r2, n2) {
                i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
              }
              I.inherits(s, i), s.prototype.push = function(e2) {
                var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
                this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
              }, s.prototype.openedSource = function(e2) {
                this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
                var t2 = this.streamFiles && !e2.file.dir;
                if (t2) {
                  var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                  this.push({ data: r2.fileRecord, meta: { percent: 0 } });
                } else this.accumulate = true;
              }, s.prototype.closedSource = function(e2) {
                this.accumulate = false;
                var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: function(e3) {
                  return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
                }(e2), meta: { percent: 100 } });
                else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
                this.currentFile = null;
              }, s.prototype.flush = function() {
                for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
                var r2 = this.bytesWritten - e2, n2 = function(e3, t3, r3, n3, i2) {
                  var s2 = I.transformTo("string", i2(n3));
                  return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
                }(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
                this.push({ data: n2, meta: { percent: 100 } });
              }, s.prototype.prepareNextSource = function() {
                this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
              }, s.prototype.registerPrevious = function(e2) {
                this._sources.push(e2);
                var t2 = this;
                return e2.on("data", function(e3) {
                  t2.processChunk(e3);
                }), e2.on("end", function() {
                  t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
                }), e2.on("error", function(e3) {
                  t2.error(e3);
                }), this;
              }, s.prototype.resume = function() {
                return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
              }, s.prototype.error = function(e2) {
                var t2 = this._sources;
                if (!i.prototype.error.call(this, e2)) return false;
                for (var r2 = 0; r2 < t2.length; r2++) try {
                  t2[r2].error(e2);
                } catch (e3) {
                }
                return true;
              }, s.prototype.lock = function() {
                i.prototype.lock.call(this);
                for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
              }, t.exports = s;
            }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
              var u = e("../compressions"), n = e("./ZipFileWorker");
              r.generateWorker = function(e2, a, t2) {
                var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
                try {
                  e2.forEach(function(e3, t3) {
                    h++;
                    var r2 = function(e4, t4) {
                      var r3 = e4 || t4, n3 = u[r3];
                      if (!n3) throw new Error(r3 + " is not a valid compression method !");
                      return n3;
                    }(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
                    t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
                  }), o.entriesCount = h;
                } catch (e3) {
                  o.error(e3);
                }
                return o;
              };
            }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
              function n() {
                if (!(this instanceof n)) return new n();
                if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
                this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
                  var e2 = new n();
                  for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
                  return e2;
                };
              }
              (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
                return new n().loadAsync(e2, t2);
              }, n.external = e("./external"), t.exports = n;
            }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
              var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
              function f(n2) {
                return new i.Promise(function(e2, t2) {
                  var r2 = n2.decompressed.getContentWorker().pipe(new a());
                  r2.on("error", function(e3) {
                    t2(e3);
                  }).on("end", function() {
                    r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
                  }).resume();
                });
              }
              t.exports = function(e2, o) {
                var h = this;
                return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
                  var t2 = new s(o);
                  return t2.load(e3), t2;
                }).then(function(e3) {
                  var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
                  if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
                  return i.Promise.all(t2);
                }).then(function(e3) {
                  for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
                    var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
                    h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
                  }
                  return t2.zipComment.length && (h.comment = t2.zipComment), h;
                });
              };
            }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
              var n = e("../utils"), i = e("../stream/GenericWorker");
              function s(e2, t2) {
                i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
              }
              n.inherits(s, i), s.prototype._bindStream = function(e2) {
                var t2 = this;
                (this._stream = e2).pause(), e2.on("data", function(e3) {
                  t2.push({ data: e3, meta: { percent: 0 } });
                }).on("error", function(e3) {
                  t2.isPaused ? this.generatedError = e3 : t2.error(e3);
                }).on("end", function() {
                  t2.isPaused ? t2._upstreamEnded = true : t2.end();
                });
              }, s.prototype.pause = function() {
                return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
              }, s.prototype.resume = function() {
                return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
              }, t.exports = s;
            }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
              var i = e("readable-stream").Readable;
              function n(e2, t2, r2) {
                i.call(this, t2), this._helper = e2;
                var n2 = this;
                e2.on("data", function(e3, t3) {
                  n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
                }).on("error", function(e3) {
                  n2.emit("error", e3);
                }).on("end", function() {
                  n2.push(null);
                });
              }
              e("../utils").inherits(n, i), n.prototype._read = function() {
                this._helper.resume();
              }, t.exports = n;
            }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
              t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
                if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
                if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
                return new Buffer(e2, t2);
              }, allocBuffer: function(e2) {
                if (Buffer.alloc) return Buffer.alloc(e2);
                var t2 = new Buffer(e2);
                return t2.fill(0), t2;
              }, isBuffer: function(e2) {
                return Buffer.isBuffer(e2);
              }, isStream: function(e2) {
                return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
              } };
            }, {}], 15: [function(e, t, r) {
              function s(e2, t2, r2) {
                var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
                s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
                var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
                r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
                var o2 = null;
                o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
                var h2 = new d(e2, o2, s2);
                this.files[e2] = h2;
              }
              var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
                "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
                var t2 = e2.lastIndexOf("/");
                return 0 < t2 ? e2.substring(0, t2) : "";
              }, g = function(e2) {
                return "/" !== e2.slice(-1) && (e2 += "/"), e2;
              }, b = function(e2, t2) {
                return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
              };
              function h(e2) {
                return "[object RegExp]" === Object.prototype.toString.call(e2);
              }
              var n = { load: function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, forEach: function(e2) {
                var t2, r2, n2;
                for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
              }, filter: function(r2) {
                var n2 = [];
                return this.forEach(function(e2, t2) {
                  r2(e2, t2) && n2.push(t2);
                }), n2;
              }, file: function(e2, t2, r2) {
                if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
                if (h(e2)) {
                  var n2 = e2;
                  return this.filter(function(e3, t3) {
                    return !t3.dir && n2.test(e3);
                  });
                }
                var i2 = this.files[this.root + e2];
                return i2 && !i2.dir ? i2 : null;
              }, folder: function(r2) {
                if (!r2) return this;
                if (h(r2)) return this.filter(function(e3, t3) {
                  return t3.dir && r2.test(e3);
                });
                var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
                return n2.root = t2.name, n2;
              }, remove: function(r2) {
                r2 = this.root + r2;
                var e2 = this.files[r2];
                if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
                else for (var t2 = this.filter(function(e3, t3) {
                  return t3.name.slice(0, r2.length) === r2;
                }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
                return this;
              }, generate: function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, generateInternalStream: function(e2) {
                var t2, r2 = {};
                try {
                  if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
                  u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
                  var n2 = r2.comment || this.comment || "";
                  t2 = o.generateWorker(this, r2, n2);
                } catch (e3) {
                  (t2 = new l("error")).error(e3);
                }
                return new a(t2, r2.type || "string", r2.mimeType);
              }, generateAsync: function(e2, t2) {
                return this.generateInternalStream(e2).accumulate(t2);
              }, generateNodeStream: function(e2, t2) {
                return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
              } };
              t.exports = n;
            }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
              t.exports = e("stream");
            }, { stream: void 0 }], 17: [function(e, t, r) {
              var n = e("./DataReader");
              function i(e2) {
                n.call(this, e2);
                for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
              }
              e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
                return this.data[this.zero + e2];
              }, i.prototype.lastIndexOfSignature = function(e2) {
                for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
                return -1;
              }, i.prototype.readAndCheckSignature = function(e2) {
                var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
                return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
              }, i.prototype.readData = function(e2) {
                if (this.checkOffset(e2), 0 === e2) return [];
                var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
                return this.index += e2, t2;
              }, t.exports = i;
            }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
              var n = e("../utils");
              function i(e2) {
                this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
              }
              i.prototype = { checkOffset: function(e2) {
                this.checkIndex(this.index + e2);
              }, checkIndex: function(e2) {
                if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
              }, setIndex: function(e2) {
                this.checkIndex(e2), this.index = e2;
              }, skip: function(e2) {
                this.setIndex(this.index + e2);
              }, byteAt: function() {
              }, readInt: function(e2) {
                var t2, r2 = 0;
                for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
                return this.index += e2, r2;
              }, readString: function(e2) {
                return n.transformTo("string", this.readData(e2));
              }, readData: function() {
              }, lastIndexOfSignature: function() {
              }, readAndCheckSignature: function() {
              }, readDate: function() {
                var e2 = this.readInt(4);
                return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
              } }, t.exports = i;
            }, { "../utils": 32 }], 19: [function(e, t, r) {
              var n = e("./Uint8ArrayReader");
              function i(e2) {
                n.call(this, e2);
              }
              e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
                this.checkOffset(e2);
                var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
                return this.index += e2, t2;
              }, t.exports = i;
            }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
              var n = e("./DataReader");
              function i(e2) {
                n.call(this, e2);
              }
              e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
                return this.data.charCodeAt(this.zero + e2);
              }, i.prototype.lastIndexOfSignature = function(e2) {
                return this.data.lastIndexOf(e2) - this.zero;
              }, i.prototype.readAndCheckSignature = function(e2) {
                return e2 === this.readData(4);
              }, i.prototype.readData = function(e2) {
                this.checkOffset(e2);
                var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
                return this.index += e2, t2;
              }, t.exports = i;
            }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
              var n = e("./ArrayReader");
              function i(e2) {
                n.call(this, e2);
              }
              e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
                if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
                var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
                return this.index += e2, t2;
              }, t.exports = i;
            }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
              var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
              t.exports = function(e2) {
                var t2 = n.getTypeOf(e2);
                return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
              };
            }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
              r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
            }, {}], 24: [function(e, t, r) {
              var n = e("./GenericWorker"), i = e("../utils");
              function s(e2) {
                n.call(this, "ConvertWorker to " + e2), this.destType = e2;
              }
              i.inherits(s, n), s.prototype.processChunk = function(e2) {
                this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
              }, t.exports = s;
            }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
              var n = e("./GenericWorker"), i = e("../crc32");
              function s() {
                n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
                this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
              }, t.exports = s;
            }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
              var n = e("../utils"), i = e("./GenericWorker");
              function s(e2) {
                i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
              }
              n.inherits(s, i), s.prototype.processChunk = function(e2) {
                if (e2) {
                  var t2 = this.streamInfo[this.propName] || 0;
                  this.streamInfo[this.propName] = t2 + e2.data.length;
                }
                i.prototype.processChunk.call(this, e2);
              }, t.exports = s;
            }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
              var n = e("../utils"), i = e("./GenericWorker");
              function s(e2) {
                i.call(this, "DataWorker");
                var t2 = this;
                this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
                  t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
                }, function(e3) {
                  t2.error(e3);
                });
              }
              n.inherits(s, i), s.prototype.cleanUp = function() {
                i.prototype.cleanUp.call(this), this.data = null;
              }, s.prototype.resume = function() {
                return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
              }, s.prototype._tickAndRepeat = function() {
                this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
              }, s.prototype._tick = function() {
                if (this.isPaused || this.isFinished) return false;
                var e2 = null, t2 = Math.min(this.max, this.index + 16384);
                if (this.index >= this.max) return this.end();
                switch (this.type) {
                  case "string":
                    e2 = this.data.substring(this.index, t2);
                    break;
                  case "uint8array":
                    e2 = this.data.subarray(this.index, t2);
                    break;
                  case "array":
                  case "nodebuffer":
                    e2 = this.data.slice(this.index, t2);
                }
                return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
              }, t.exports = s;
            }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
              function n(e2) {
                this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
              }
              n.prototype = { push: function(e2) {
                this.emit("data", e2);
              }, end: function() {
                if (this.isFinished) return false;
                this.flush();
                try {
                  this.emit("end"), this.cleanUp(), this.isFinished = true;
                } catch (e2) {
                  this.emit("error", e2);
                }
                return true;
              }, error: function(e2) {
                return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
              }, on: function(e2, t2) {
                return this._listeners[e2].push(t2), this;
              }, cleanUp: function() {
                this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
              }, emit: function(e2, t2) {
                if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
              }, pipe: function(e2) {
                return e2.registerPrevious(this);
              }, registerPrevious: function(e2) {
                if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
                this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
                var t2 = this;
                return e2.on("data", function(e3) {
                  t2.processChunk(e3);
                }), e2.on("end", function() {
                  t2.end();
                }), e2.on("error", function(e3) {
                  t2.error(e3);
                }), this;
              }, pause: function() {
                return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
              }, resume: function() {
                if (!this.isPaused || this.isFinished) return false;
                var e2 = this.isPaused = false;
                return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
              }, flush: function() {
              }, processChunk: function(e2) {
                this.push(e2);
              }, withStreamInfo: function(e2, t2) {
                return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
              }, mergeStreamInfo: function() {
                for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
              }, lock: function() {
                if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
                this.isLocked = true, this.previous && this.previous.lock();
              }, toString: function() {
                var e2 = "Worker " + this.name;
                return this.previous ? this.previous + " -> " + e2 : e2;
              } }, t.exports = n;
            }, {}], 29: [function(e, t, r) {
              var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
              if (n.nodestream) try {
                o = e("../nodejs/NodejsStreamOutputAdapter");
              } catch (e2) {
              }
              function l(e2, o2) {
                return new a.Promise(function(t2, r2) {
                  var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
                  e2.on("data", function(e3, t3) {
                    n2.push(e3), o2 && o2(t3);
                  }).on("error", function(e3) {
                    n2 = [], r2(e3);
                  }).on("end", function() {
                    try {
                      var e3 = function(e4, t3, r3) {
                        switch (e4) {
                          case "blob":
                            return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                          case "base64":
                            return u.encode(t3);
                          default:
                            return h.transformTo(e4, t3);
                        }
                      }(s2, function(e4, t3) {
                        var r3, n3 = 0, i3 = null, s3 = 0;
                        for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                        switch (e4) {
                          case "string":
                            return t3.join("");
                          case "array":
                            return Array.prototype.concat.apply([], t3);
                          case "uint8array":
                            for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                            return i3;
                          case "nodebuffer":
                            return Buffer.concat(t3);
                          default:
                            throw new Error("concat : unsupported type '" + e4 + "'");
                        }
                      }(i2, n2), a2);
                      t2(e3);
                    } catch (e4) {
                      r2(e4);
                    }
                    n2 = [];
                  }).resume();
                });
              }
              function f(e2, t2, r2) {
                var n2 = t2;
                switch (t2) {
                  case "blob":
                  case "arraybuffer":
                    n2 = "uint8array";
                    break;
                  case "base64":
                    n2 = "string";
                }
                try {
                  this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
                } catch (e3) {
                  this._worker = new s("error"), this._worker.error(e3);
                }
              }
              f.prototype = { accumulate: function(e2) {
                return l(this, e2);
              }, on: function(e2, t2) {
                var r2 = this;
                return "data" === e2 ? this._worker.on(e2, function(e3) {
                  t2.call(r2, e3.data, e3.meta);
                }) : this._worker.on(e2, function() {
                  h.delay(t2, arguments, r2);
                }), this;
              }, resume: function() {
                return h.delay(this._worker.resume, [], this._worker), this;
              }, pause: function() {
                return this._worker.pause(), this;
              }, toNodejsStream: function(e2) {
                if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
                return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
              } }, t.exports = f;
            }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
              if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
              else {
                var n = new ArrayBuffer(0);
                try {
                  r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
                } catch (e2) {
                  try {
                    var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                    i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
                  } catch (e3) {
                    r.blob = false;
                  }
                }
              }
              try {
                r.nodestream = !!e("readable-stream").Readable;
              } catch (e2) {
                r.nodestream = false;
              }
            }, { "readable-stream": 16 }], 31: [function(e, t, s) {
              for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
              u[254] = u[254] = 1;
              function a() {
                n.call(this, "utf-8 decode"), this.leftOver = null;
              }
              function l() {
                n.call(this, "utf-8 encode");
              }
              s.utf8encode = function(e2) {
                return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : function(e3) {
                  var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
                  for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
                  for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
                  return t2;
                }(e2);
              }, s.utf8decode = function(e2) {
                return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : function(e3) {
                  var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
                  for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
                  else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
                  else {
                    for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
                    1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
                  }
                  return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
                }(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
              }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
                var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
                if (this.leftOver && this.leftOver.length) {
                  if (h.uint8array) {
                    var r2 = t2;
                    (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
                  } else t2 = this.leftOver.concat(t2);
                  this.leftOver = null;
                }
                var n2 = function(e3, t3) {
                  var r3;
                  for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
                  return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
                }(t2), i2 = t2;
                n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
              }, a.prototype.flush = function() {
                this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
              }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
                this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
              }, s.Utf8EncodeWorker = l;
            }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
              var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
              function n(e2) {
                return e2;
              }
              function l(e2, t2) {
                for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
                return t2;
              }
              e("setimmediate"), a.newBlob = function(t2, r2) {
                a.checkSupport("blob");
                try {
                  return new Blob([t2], { type: r2 });
                } catch (e2) {
                  try {
                    var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                    return n2.append(t2), n2.getBlob(r2);
                  } catch (e3) {
                    throw new Error("Bug : can't construct the Blob.");
                  }
                }
              };
              var i = { stringifyByChunk: function(e2, t2, r2) {
                var n2 = [], i2 = 0, s2 = e2.length;
                if (s2 <= r2) return String.fromCharCode.apply(null, e2);
                for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
                return n2.join("");
              }, stringifyByChar: function(e2) {
                for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
                return t2;
              }, applyCanBeUsed: { uint8array: function() {
                try {
                  return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
                } catch (e2) {
                  return false;
                }
              }(), nodebuffer: function() {
                try {
                  return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
                } catch (e2) {
                  return false;
                }
              }() } };
              function s(e2) {
                var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
                if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
                  return i.stringifyByChunk(e2, r2, t2);
                } catch (e3) {
                  t2 = Math.floor(t2 / 2);
                }
                return i.stringifyByChar(e2);
              }
              function f(e2, t2) {
                for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
                return t2;
              }
              a.applyFromCharCode = s;
              var c = {};
              c.string = { string: n, array: function(e2) {
                return l(e2, new Array(e2.length));
              }, arraybuffer: function(e2) {
                return c.string.uint8array(e2).buffer;
              }, uint8array: function(e2) {
                return l(e2, new Uint8Array(e2.length));
              }, nodebuffer: function(e2) {
                return l(e2, r.allocBuffer(e2.length));
              } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
                return new Uint8Array(e2).buffer;
              }, uint8array: function(e2) {
                return new Uint8Array(e2);
              }, nodebuffer: function(e2) {
                return r.newBufferFrom(e2);
              } }, c.arraybuffer = { string: function(e2) {
                return s(new Uint8Array(e2));
              }, array: function(e2) {
                return f(new Uint8Array(e2), new Array(e2.byteLength));
              }, arraybuffer: n, uint8array: function(e2) {
                return new Uint8Array(e2);
              }, nodebuffer: function(e2) {
                return r.newBufferFrom(new Uint8Array(e2));
              } }, c.uint8array = { string: s, array: function(e2) {
                return f(e2, new Array(e2.length));
              }, arraybuffer: function(e2) {
                return e2.buffer;
              }, uint8array: n, nodebuffer: function(e2) {
                return r.newBufferFrom(e2);
              } }, c.nodebuffer = { string: s, array: function(e2) {
                return f(e2, new Array(e2.length));
              }, arraybuffer: function(e2) {
                return c.nodebuffer.uint8array(e2).buffer;
              }, uint8array: function(e2) {
                return f(e2, new Uint8Array(e2.length));
              }, nodebuffer: n }, a.transformTo = function(e2, t2) {
                if (t2 = t2 || "", !e2) return t2;
                a.checkSupport(e2);
                var r2 = a.getTypeOf(t2);
                return c[r2][e2](t2);
              }, a.resolve = function(e2) {
                for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
                  var i2 = t2[n2];
                  "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
                }
                return r2.join("/");
              }, a.getTypeOf = function(e2) {
                return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
              }, a.checkSupport = function(e2) {
                if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
              }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
                var t2, r2, n2 = "";
                for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
                return n2;
              }, a.delay = function(e2, t2, r2) {
                setImmediate(function() {
                  e2.apply(r2 || null, t2 || []);
                });
              }, a.inherits = function(e2, t2) {
                function r2() {
                }
                r2.prototype = t2.prototype, e2.prototype = new r2();
              }, a.extend = function() {
                var e2, t2, r2 = {};
                for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
                return r2;
              }, a.prepareContent = function(r2, e2, n2, i2, s2) {
                return u.Promise.resolve(e2).then(function(n3) {
                  return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
                    var e3 = new FileReader();
                    e3.onload = function(e4) {
                      t2(e4.target.result);
                    }, e3.onerror = function(e4) {
                      r3(e4.target.error);
                    }, e3.readAsArrayBuffer(n3);
                  }) : n3;
                }).then(function(e3) {
                  var t2 = a.getTypeOf(e3);
                  return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = function(e4) {
                    return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
                  }(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
                });
              };
            }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
              var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
              function h(e2) {
                this.files = [], this.loadOptions = e2;
              }
              h.prototype = { checkSignature: function(e2) {
                if (!this.reader.readAndCheckSignature(e2)) {
                  this.reader.index -= 4;
                  var t2 = this.reader.readString(4);
                  throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
                }
              }, isSignature: function(e2, t2) {
                var r2 = this.reader.index;
                this.reader.setIndex(e2);
                var n2 = this.reader.readString(4) === t2;
                return this.reader.setIndex(r2), n2;
              }, readBlockEndOfCentral: function() {
                this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
                var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
                this.zipComment = this.loadOptions.decodeFileName(r2);
              }, readBlockZip64EndOfCentral: function() {
                this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
                for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
              }, readBlockZip64EndOfCentralLocator: function() {
                if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
              }, readLocalFiles: function() {
                var e2, t2;
                for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
              }, readCentralDir: function() {
                var e2;
                for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
                if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
              }, readEndOfCentral: function() {
                var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
                if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
                this.reader.setIndex(e2);
                var t2 = e2;
                if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
                  if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
                  if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                  this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
                }
                var r2 = this.centralDirOffset + this.centralDirSize;
                this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
                var n2 = t2 - r2;
                if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
                else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
              }, prepareReader: function(e2) {
                this.reader = n(e2);
              }, load: function(e2) {
                this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
              } }, t.exports = h;
            }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
              var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
              function l(e2, t2) {
                this.options = e2, this.loadOptions = t2;
              }
              l.prototype = { isEncrypted: function() {
                return 1 == (1 & this.bitFlag);
              }, useUTF8: function() {
                return 2048 == (2048 & this.bitFlag);
              }, readLocalPart: function(e2) {
                var t2, r2;
                if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
                if (null === (t2 = function(e3) {
                  for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
                  return null;
                }(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
                this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
              }, readCentralPart: function(e2) {
                this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
                var t2 = e2.readInt(2);
                if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
                e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
              }, processAttributes: function() {
                this.unixPermissions = null, this.dosPermissions = null;
                var e2 = this.versionMadeBy >> 8;
                this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
              }, parseZIP64ExtraField: function() {
                if (this.extraFields[1]) {
                  var e2 = n(this.extraFields[1].value);
                  this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
                }
              }, readExtraFields: function(e2) {
                var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
                for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
                e2.setIndex(i2);
              }, handleUTF8: function() {
                var e2 = u.uint8array ? "uint8array" : "array";
                if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
                else {
                  var t2 = this.findExtraFieldUnicodePath();
                  if (null !== t2) this.fileNameStr = t2;
                  else {
                    var r2 = s.transformTo(e2, this.fileName);
                    this.fileNameStr = this.loadOptions.decodeFileName(r2);
                  }
                  var n2 = this.findExtraFieldUnicodeComment();
                  if (null !== n2) this.fileCommentStr = n2;
                  else {
                    var i2 = s.transformTo(e2, this.fileComment);
                    this.fileCommentStr = this.loadOptions.decodeFileName(i2);
                  }
                }
              }, findExtraFieldUnicodePath: function() {
                var e2 = this.extraFields[28789];
                if (e2) {
                  var t2 = n(e2.value);
                  return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
                }
                return null;
              }, findExtraFieldUnicodeComment: function() {
                var e2 = this.extraFields[25461];
                if (e2) {
                  var t2 = n(e2.value);
                  return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
                }
                return null;
              } }, t.exports = l;
            }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
              function n(e2, t2, r2) {
                this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
              }
              var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
              n.prototype = { internalStream: function(e2) {
                var t2 = null, r2 = "string";
                try {
                  if (!e2) throw new Error("No output type specified.");
                  var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
                  "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
                  var i2 = !this._dataBinary;
                  i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
                } catch (e3) {
                  (t2 = new h("error")).error(e3);
                }
                return new s(t2, r2, "");
              }, async: function(e2, t2) {
                return this.internalStream(e2).accumulate(t2);
              }, nodeStream: function(e2, t2) {
                return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
              }, _compressWorker: function(e2, t2) {
                if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
                var r2 = this._decompressWorker();
                return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
              }, _decompressWorker: function() {
                return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
              } };
              for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
              t.exports = n;
            }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
              (function(t2) {
                var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
                if (e2) {
                  var i = 0, s = new e2(u), a = t2.document.createTextNode("");
                  s.observe(a, { characterData: true }), r = function() {
                    a.data = i = ++i % 2;
                  };
                } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
                  var e3 = t2.document.createElement("script");
                  e3.onreadystatechange = function() {
                    u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
                  }, t2.document.documentElement.appendChild(e3);
                } : function() {
                  setTimeout(u, 0);
                };
                else {
                  var o = new t2.MessageChannel();
                  o.port1.onmessage = u, r = function() {
                    o.port2.postMessage(0);
                  };
                }
                var h = [];
                function u() {
                  var e3, t3;
                  n = true;
                  for (var r2 = h.length; r2; ) {
                    for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
                    r2 = h.length;
                  }
                  n = false;
                }
                l.exports = function(e3) {
                  1 !== h.push(e3) || n || r();
                };
              }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
            }, {}], 37: [function(e, t, r) {
              var i = e("immediate");
              function u() {
              }
              var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
              function o(e2) {
                if ("function" != typeof e2) throw new TypeError("resolver must be a function");
                this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
              }
              function h(e2, t2, r2) {
                this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
              }
              function f(t2, r2, n2) {
                i(function() {
                  var e2;
                  try {
                    e2 = r2(n2);
                  } catch (e3) {
                    return l.reject(t2, e3);
                  }
                  e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
                });
              }
              function c(e2) {
                var t2 = e2 && e2.then;
                if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
                  t2.apply(e2, arguments);
                };
              }
              function d(t2, e2) {
                var r2 = false;
                function n2(e3) {
                  r2 || (r2 = true, l.reject(t2, e3));
                }
                function i2(e3) {
                  r2 || (r2 = true, l.resolve(t2, e3));
                }
                var s2 = p(function() {
                  e2(i2, n2);
                });
                "error" === s2.status && n2(s2.value);
              }
              function p(e2, t2) {
                var r2 = {};
                try {
                  r2.value = e2(t2), r2.status = "success";
                } catch (e3) {
                  r2.status = "error", r2.value = e3;
                }
                return r2;
              }
              (t.exports = o).prototype.finally = function(t2) {
                if ("function" != typeof t2) return this;
                var r2 = this.constructor;
                return this.then(function(e2) {
                  return r2.resolve(t2()).then(function() {
                    return e2;
                  });
                }, function(e2) {
                  return r2.resolve(t2()).then(function() {
                    throw e2;
                  });
                });
              }, o.prototype.catch = function(e2) {
                return this.then(null, e2);
              }, o.prototype.then = function(e2, t2) {
                if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
                var r2 = new this.constructor(u);
                this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
                return r2;
              }, h.prototype.callFulfilled = function(e2) {
                l.resolve(this.promise, e2);
              }, h.prototype.otherCallFulfilled = function(e2) {
                f(this.promise, this.onFulfilled, e2);
              }, h.prototype.callRejected = function(e2) {
                l.reject(this.promise, e2);
              }, h.prototype.otherCallRejected = function(e2) {
                f(this.promise, this.onRejected, e2);
              }, l.resolve = function(e2, t2) {
                var r2 = p(c, t2);
                if ("error" === r2.status) return l.reject(e2, r2.value);
                var n2 = r2.value;
                if (n2) d(e2, n2);
                else {
                  e2.state = a, e2.outcome = t2;
                  for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
                }
                return e2;
              }, l.reject = function(e2, t2) {
                e2.state = s, e2.outcome = t2;
                for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
                return e2;
              }, o.resolve = function(e2) {
                if (e2 instanceof this) return e2;
                return l.resolve(new this(u), e2);
              }, o.reject = function(e2) {
                var t2 = new this(u);
                return l.reject(t2, e2);
              }, o.all = function(e2) {
                var r2 = this;
                if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
                var n2 = e2.length, i2 = false;
                if (!n2) return this.resolve([]);
                var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
                for (; ++t2 < n2; ) h2(e2[t2], t2);
                return o2;
                function h2(e3, t3) {
                  r2.resolve(e3).then(function(e4) {
                    s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
                  }, function(e4) {
                    i2 || (i2 = true, l.reject(o2, e4));
                  });
                }
              }, o.race = function(e2) {
                var t2 = this;
                if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
                var r2 = e2.length, n2 = false;
                if (!r2) return this.resolve([]);
                var i2 = -1, s2 = new this(u);
                for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
                  n2 || (n2 = true, l.resolve(s2, e3));
                }, function(e3) {
                  n2 || (n2 = true, l.reject(s2, e3));
                });
                var a2;
                return s2;
              };
            }, { immediate: 36 }], 38: [function(e, t, r) {
              var n = {};
              (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
            }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
              var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
              function p(e2) {
                if (!(this instanceof p)) return new p(e2);
                this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
                var t2 = this.options;
                t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
                var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
                if (r2 !== l) throw new Error(i[r2]);
                if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
                  var n2;
                  if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
                  this._dict_set = true;
                }
              }
              function n(e2, t2) {
                var r2 = new p(t2);
                if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
                return r2.result;
              }
              p.prototype.push = function(e2, t2) {
                var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
                if (this.ended) return false;
                n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
                do {
                  if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
                  0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
                } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
                return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
              }, p.prototype.onData = function(e2) {
                this.chunks.push(e2);
              }, p.prototype.onEnd = function(e2) {
                e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
              }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
                return (t2 = t2 || {}).raw = true, n(e2, t2);
              }, r.gzip = function(e2, t2) {
                return (t2 = t2 || {}).gzip = true, n(e2, t2);
              };
            }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
              var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
              function a(e2) {
                if (!(this instanceof a)) return new a(e2);
                this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
                var t2 = this.options;
                t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
                var r2 = c.inflateInit2(this.strm, t2.windowBits);
                if (r2 !== m.Z_OK) throw new Error(n[r2]);
                this.header = new s(), c.inflateGetHeader(this.strm, this.header);
              }
              function o(e2, t2) {
                var r2 = new a(t2);
                if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
                return r2.result;
              }
              a.prototype.push = function(e2, t2) {
                var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
                if (this.ended) return false;
                n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
                do {
                  if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
                  h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
                } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
                return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
              }, a.prototype.onData = function(e2) {
                this.chunks.push(e2);
              }, a.prototype.onEnd = function(e2) {
                e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
              }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
                return (t2 = t2 || {}).raw = true, o(e2, t2);
              }, r.ungzip = o;
            }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
              var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
              r.assign = function(e2) {
                for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
                  var r2 = t2.shift();
                  if (r2) {
                    if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
                    for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
                  }
                }
                return e2;
              }, r.shrinkBuf = function(e2, t2) {
                return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
              };
              var i = { arraySet: function(e2, t2, r2, n2, i2) {
                if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
                else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
              }, flattenChunks: function(e2) {
                var t2, r2, n2, i2, s2, a;
                for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
                for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
                return a;
              } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
                for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
              }, flattenChunks: function(e2) {
                return [].concat.apply([], e2);
              } };
              r.setTyped = function(e2) {
                e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
              }, r.setTyped(n);
            }, {}], 42: [function(e, t, r) {
              var h = e("./common"), i = true, s = true;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch (e2) {
                i = false;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch (e2) {
                s = false;
              }
              for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
              function l(e2, t2) {
                if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
                for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
                return r2;
              }
              u[254] = u[254] = 1, r.string2buf = function(e2) {
                var t2, r2, n2, i2, s2, a = e2.length, o = 0;
                for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
                for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
                return t2;
              }, r.buf2binstring = function(e2) {
                return l(e2, e2.length);
              }, r.binstring2buf = function(e2) {
                for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
                return t2;
              }, r.buf2string = function(e2, t2) {
                var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
                for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
                else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
                else {
                  for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
                  1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
                }
                return l(o, n2);
              }, r.utf8border = function(e2, t2) {
                var r2;
                for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
                return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
              };
            }, { "./common": 41 }], 43: [function(e, t, r) {
              t.exports = function(e2, t2, r2, n) {
                for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
                  for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
                  i %= 65521, s %= 65521;
                }
                return i | s << 16 | 0;
              };
            }, {}], 44: [function(e, t, r) {
              t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
            }, {}], 45: [function(e, t, r) {
              var o = function() {
                for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
                  e2 = r2;
                  for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
                  t2[r2] = e2;
                }
                return t2;
              }();
              t.exports = function(e2, t2, r2, n) {
                var i = o, s = n + r2;
                e2 ^= -1;
                for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
                return -1 ^ e2;
              };
            }, {}], 46: [function(e, t, r) {
              var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
              function R(e2, t2) {
                return e2.msg = n[t2], t2;
              }
              function T(e2) {
                return (e2 << 1) - (4 < e2 ? 9 : 0);
              }
              function D(e2) {
                for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
              }
              function F(e2) {
                var t2 = e2.state, r2 = t2.pending;
                r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
              }
              function N(e2, t2) {
                u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
              }
              function U(e2, t2) {
                e2.pending_buf[e2.pending++] = t2;
              }
              function P(e2, t2) {
                e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
              }
              function L(e2, t2) {
                var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
                e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
                do {
                  if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
                    s2 += 2, r2++;
                    do {
                    } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
                    if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                      if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                      d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
                    }
                  }
                } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
                return a2 <= e2.lookahead ? a2 : e2.lookahead;
              }
              function j(e2) {
                var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
                do {
                  if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
                    for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                    for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                    i2 += f2;
                  }
                  if (0 === e2.strm.avail_in) break;
                  if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
                } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
              }
              function Z(e2, t2) {
                for (var r2, n2; ; ) {
                  if (e2.lookahead < z) {
                    if (j(e2), e2.lookahead < z && t2 === l) return A;
                    if (0 === e2.lookahead) break;
                  }
                  if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
                    for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
                    e2.strstart++;
                  } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
                  else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
                  if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
                }
                return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
              }
              function W(e2, t2) {
                for (var r2, n2, i2; ; ) {
                  if (e2.lookahead < z) {
                    if (j(e2), e2.lookahead < z && t2 === l) return A;
                    if (0 === e2.lookahead) break;
                  }
                  if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
                    for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
                    if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
                  } else if (e2.match_available) {
                    if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
                  } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
                }
                return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
              }
              function M(e2, t2, r2, n2, i2) {
                this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
              }
              function H() {
                this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
              }
              function G(e2) {
                var t2;
                return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
              }
              function K(e2) {
                var t2 = G(e2);
                return t2 === m && function(e3) {
                  e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
                }(e2.state), t2;
              }
              function Y(e2, t2, r2, n2, i2, s2) {
                if (!e2) return _;
                var a2 = 1;
                if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
                8 === n2 && (n2 = 9);
                var o2 = new H();
                return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
              }
              h = [new M(0, 0, 0, 0, function(e2, t2) {
                var r2 = 65535;
                for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
                  if (e2.lookahead <= 1) {
                    if (j(e2), 0 === e2.lookahead && t2 === l) return A;
                    if (0 === e2.lookahead) break;
                  }
                  e2.strstart += e2.lookahead, e2.lookahead = 0;
                  var n2 = e2.block_start + r2;
                  if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
                  if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
                }
                return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
              }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
                return Y(e2, t2, v, 15, 8, 0);
              }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
                return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
              }, r.deflate = function(e2, t2) {
                var r2, n2, i2, s2;
                if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
                if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
                if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
                else {
                  var a2 = v + (n2.w_bits - 8 << 4) << 8;
                  a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
                }
                if (69 === n2.status) if (n2.gzhead.extra) {
                  for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
                  n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
                } else n2.status = 73;
                if (73 === n2.status) if (n2.gzhead.name) {
                  i2 = n2.pending;
                  do {
                    if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                      s2 = 1;
                      break;
                    }
                    s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
                  } while (0 !== s2);
                  n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
                } else n2.status = 91;
                if (91 === n2.status) if (n2.gzhead.comment) {
                  i2 = n2.pending;
                  do {
                    if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                      s2 = 1;
                      break;
                    }
                    s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
                  } while (0 !== s2);
                  n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
                } else n2.status = 103;
                if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
                  if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
                } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
                if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
                if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
                  var o2 = 2 === n2.strategy ? function(e3, t3) {
                    for (var r3; ; ) {
                      if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                        if (t3 === l) return A;
                        break;
                      }
                      if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                    }
                    return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
                  }(n2, t2) : 3 === n2.strategy ? function(e3, t3) {
                    for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                      if (e3.lookahead <= S) {
                        if (j(e3), e3.lookahead <= S && t3 === l) return A;
                        if (0 === e3.lookahead) break;
                      }
                      if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                        s3 = e3.strstart + S;
                        do {
                        } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                        e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                      }
                      if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                    }
                    return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
                  }(n2, t2) : h[n2.level].func(n2, t2);
                  if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
                  if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
                }
                return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
              }, r.deflateEnd = function(e2) {
                var t2;
                return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
              }, r.deflateSetDictionary = function(e2, t2) {
                var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
                if (!e2 || !e2.state) return _;
                if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
                for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
                  for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
                  r2.strstart = n2, r2.lookahead = x - 1, j(r2);
                }
                return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
              }, r.deflateInfo = "pako deflate (from Nodeca project)";
            }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
              t.exports = function() {
                this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
              };
            }, {}], 48: [function(e, t, r) {
              t.exports = function(e2, t2) {
                var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
                r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
                e: do {
                  p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
                  t: for (; ; ) {
                    if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
                    else {
                      if (!(16 & y)) {
                        if (0 == (64 & y)) {
                          v = m[(65535 & v) + (d & (1 << y) - 1)];
                          continue t;
                        }
                        if (32 & y) {
                          r2.mode = 12;
                          break e;
                        }
                        e2.msg = "invalid literal/length code", r2.mode = 30;
                        break e;
                      }
                      w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                      r: for (; ; ) {
                        if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                          if (0 == (64 & y)) {
                            v = _[(65535 & v) + (d & (1 << y) - 1)];
                            continue r;
                          }
                          e2.msg = "invalid distance code", r2.mode = 30;
                          break e;
                        }
                        if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                          e2.msg = "invalid distance too far back", r2.mode = 30;
                          break e;
                        }
                        if (d >>>= y, p -= y, (y = s - a) < k) {
                          if (l < (y = k - y) && r2.sane) {
                            e2.msg = "invalid distance too far back", r2.mode = 30;
                            break e;
                          }
                          if (S = c, (x = 0) === f) {
                            if (x += u - y, y < w) {
                              for (w -= y; C[s++] = c[x++], --y; ) ;
                              x = s - k, S = C;
                            }
                          } else if (f < y) {
                            if (x += u + f - y, (y -= f) < w) {
                              for (w -= y; C[s++] = c[x++], --y; ) ;
                              if (x = 0, f < w) {
                                for (w -= y = f; C[s++] = c[x++], --y; ) ;
                                x = s - k, S = C;
                              }
                            }
                          } else if (x += f - y, y < w) {
                            for (w -= y; C[s++] = c[x++], --y; ) ;
                            x = s - k, S = C;
                          }
                          for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                          w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                        } else {
                          for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                          w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                        }
                        break;
                      }
                    }
                    break;
                  }
                } while (n < i && s < o);
                n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
              };
            }, {}], 49: [function(e, t, r) {
              var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
              function L(e2) {
                return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
              }
              function s() {
                this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
              }
              function a(e2) {
                var t2;
                return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
              }
              function o(e2) {
                var t2;
                return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
              }
              function h(e2, t2) {
                var r2, n2;
                return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
              }
              function u(e2, t2) {
                var r2, n2;
                return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
              }
              var l, f, c = true;
              function j(e2) {
                if (c) {
                  var t2;
                  for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
                  for (; t2 < 256; ) e2.lens[t2++] = 9;
                  for (; t2 < 280; ) e2.lens[t2++] = 7;
                  for (; t2 < 288; ) e2.lens[t2++] = 8;
                  for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
                  T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
                }
                e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
              }
              function Z(e2, t2, r2, n2) {
                var i2, s2 = e2.state;
                return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
              }
              r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
                return u(e2, 15);
              }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
                var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
                12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
                e: for (; ; ) switch (r2.mode) {
                  case P:
                    if (0 === r2.wrap) {
                      r2.mode = 13;
                      break;
                    }
                    for (; l2 < 16; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (2 & r2.wrap && 35615 === u2) {
                      E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                      break;
                    }
                    if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                      e2.msg = "incorrect header check", r2.mode = 30;
                      break;
                    }
                    if (8 != (15 & u2)) {
                      e2.msg = "unknown compression method", r2.mode = 30;
                      break;
                    }
                    if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
                    else if (k > r2.wbits) {
                      e2.msg = "invalid window size", r2.mode = 30;
                      break;
                    }
                    r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                    break;
                  case 2:
                    for (; l2 < 16; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (r2.flags = u2, 8 != (255 & r2.flags)) {
                      e2.msg = "unknown compression method", r2.mode = 30;
                      break;
                    }
                    if (57344 & r2.flags) {
                      e2.msg = "unknown header flags set", r2.mode = 30;
                      break;
                    }
                    r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
                  case 3:
                    for (; l2 < 32; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
                  case 4:
                    for (; l2 < 16; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
                  case 5:
                    if (1024 & r2.flags) {
                      for (; l2 < 16; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                    } else r2.head && (r2.head.extra = null);
                    r2.mode = 6;
                  case 6:
                    if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
                    r2.length = 0, r2.mode = 7;
                  case 7:
                    if (2048 & r2.flags) {
                      if (0 === o2) break e;
                      for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                      if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                    } else r2.head && (r2.head.name = null);
                    r2.length = 0, r2.mode = 8;
                  case 8:
                    if (4096 & r2.flags) {
                      if (0 === o2) break e;
                      for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                      if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                    } else r2.head && (r2.head.comment = null);
                    r2.mode = 9;
                  case 9:
                    if (512 & r2.flags) {
                      for (; l2 < 16; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (u2 !== (65535 & r2.check)) {
                        e2.msg = "header crc mismatch", r2.mode = 30;
                        break;
                      }
                      l2 = u2 = 0;
                    }
                    r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
                    break;
                  case 10:
                    for (; l2 < 32; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
                  case 11:
                    if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                    e2.adler = r2.check = 1, r2.mode = 12;
                  case 12:
                    if (5 === t2 || 6 === t2) break e;
                  case 13:
                    if (r2.last) {
                      u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                      break;
                    }
                    for (; l2 < 3; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                      case 0:
                        r2.mode = 14;
                        break;
                      case 1:
                        if (j(r2), r2.mode = 20, 6 !== t2) break;
                        u2 >>>= 2, l2 -= 2;
                        break e;
                      case 2:
                        r2.mode = 17;
                        break;
                      case 3:
                        e2.msg = "invalid block type", r2.mode = 30;
                    }
                    u2 >>>= 2, l2 -= 2;
                    break;
                  case 14:
                    for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                      e2.msg = "invalid stored block lengths", r2.mode = 30;
                      break;
                    }
                    if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
                  case 15:
                    r2.mode = 16;
                  case 16:
                    if (d = r2.length) {
                      if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                      I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                      break;
                    }
                    r2.mode = 12;
                    break;
                  case 17:
                    for (; l2 < 14; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                      e2.msg = "too many length or distance symbols", r2.mode = 30;
                      break;
                    }
                    r2.have = 0, r2.mode = 18;
                  case 18:
                    for (; r2.have < r2.ncode; ) {
                      for (; l2 < 3; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                    }
                    for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
                    if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                      e2.msg = "invalid code lengths set", r2.mode = 30;
                      break;
                    }
                    r2.have = 0, r2.mode = 19;
                  case 19:
                    for (; r2.have < r2.nlen + r2.ndist; ) {
                      for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                      else {
                        if (16 === b) {
                          for (z = _ + 2; l2 < z; ) {
                            if (0 === o2) break e;
                            o2--, u2 += n2[s2++] << l2, l2 += 8;
                          }
                          if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                            e2.msg = "invalid bit length repeat", r2.mode = 30;
                            break;
                          }
                          k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                        } else if (17 === b) {
                          for (z = _ + 3; l2 < z; ) {
                            if (0 === o2) break e;
                            o2--, u2 += n2[s2++] << l2, l2 += 8;
                          }
                          l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                        } else {
                          for (z = _ + 7; l2 < z; ) {
                            if (0 === o2) break e;
                            o2--, u2 += n2[s2++] << l2, l2 += 8;
                          }
                          l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                        }
                        if (r2.have + d > r2.nlen + r2.ndist) {
                          e2.msg = "invalid bit length repeat", r2.mode = 30;
                          break;
                        }
                        for (; d--; ) r2.lens[r2.have++] = k;
                      }
                    }
                    if (30 === r2.mode) break;
                    if (0 === r2.lens[256]) {
                      e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                      break;
                    }
                    if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                      e2.msg = "invalid literal/lengths set", r2.mode = 30;
                      break;
                    }
                    if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                      e2.msg = "invalid distances set", r2.mode = 30;
                      break;
                    }
                    if (r2.mode = 20, 6 === t2) break e;
                  case 20:
                    r2.mode = 21;
                  case 21:
                    if (6 <= o2 && 258 <= h2) {
                      e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                      break;
                    }
                    for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (g && 0 == (240 & g)) {
                      for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      u2 >>>= v, l2 -= v, r2.back += v;
                    }
                    if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                      r2.mode = 26;
                      break;
                    }
                    if (32 & g) {
                      r2.back = -1, r2.mode = 12;
                      break;
                    }
                    if (64 & g) {
                      e2.msg = "invalid literal/length code", r2.mode = 30;
                      break;
                    }
                    r2.extra = 15 & g, r2.mode = 22;
                  case 22:
                    if (r2.extra) {
                      for (z = r2.extra; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                    }
                    r2.was = r2.length, r2.mode = 23;
                  case 23:
                    for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (0 == (240 & g)) {
                      for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      u2 >>>= v, l2 -= v, r2.back += v;
                    }
                    if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                      e2.msg = "invalid distance code", r2.mode = 30;
                      break;
                    }
                    r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
                  case 24:
                    if (r2.extra) {
                      for (z = r2.extra; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                    }
                    if (r2.offset > r2.dmax) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break;
                    }
                    r2.mode = 25;
                  case 25:
                    if (0 === h2) break e;
                    if (d = c2 - h2, r2.offset > d) {
                      if ((d = r2.offset - d) > r2.whave && r2.sane) {
                        e2.msg = "invalid distance too far back", r2.mode = 30;
                        break;
                      }
                      p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
                    } else m = i2, p = a2 - r2.offset, d = r2.length;
                    for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
                    0 === r2.length && (r2.mode = 21);
                    break;
                  case 26:
                    if (0 === h2) break e;
                    i2[a2++] = r2.length, h2--, r2.mode = 21;
                    break;
                  case 27:
                    if (r2.wrap) {
                      for (; l2 < 32; ) {
                        if (0 === o2) break e;
                        o2--, u2 |= n2[s2++] << l2, l2 += 8;
                      }
                      if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                        e2.msg = "incorrect data check", r2.mode = 30;
                        break;
                      }
                      l2 = u2 = 0;
                    }
                    r2.mode = 28;
                  case 28:
                    if (r2.wrap && r2.flags) {
                      for (; l2 < 32; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (u2 !== (4294967295 & r2.total)) {
                        e2.msg = "incorrect length check", r2.mode = 30;
                        break;
                      }
                      l2 = u2 = 0;
                    }
                    r2.mode = 29;
                  case 29:
                    x = 1;
                    break e;
                  case 30:
                    x = -3;
                    break e;
                  case 31:
                    return -4;
                  case 32:
                  default:
                    return U;
                }
                return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
              }, r.inflateEnd = function(e2) {
                if (!e2 || !e2.state) return U;
                var t2 = e2.state;
                return t2.window && (t2.window = null), e2.state = null, N;
              }, r.inflateGetHeader = function(e2, t2) {
                var r2;
                return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
              }, r.inflateSetDictionary = function(e2, t2) {
                var r2, n2 = t2.length;
                return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
              }, r.inflateInfo = "pako inflate (from Nodeca project)";
            }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
              var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
              t.exports = function(e2, t2, r2, n, i, s, a, o) {
                var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
                for (b = 0; b <= 15; b++) O[b] = 0;
                for (v = 0; v < n; v++) O[t2[r2 + v]]++;
                for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
                if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
                for (y = 1; y < w && 0 === O[y]; y++) ;
                for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
                if (0 < z && (0 === e2 || 1 !== w)) return -1;
                for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
                for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
                if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
                for (; ; ) {
                  for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
                  for (h = 1 << b - 1; E & h; ) h >>= 1;
                  if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
                    if (b === w) break;
                    b = t2[r2 + a[v]];
                  }
                  if (k < b && (E & f) !== l) {
                    for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
                    if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
                    i[l = E & f] = k << 24 | x << 16 | c - s | 0;
                  }
                }
                return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
              };
            }, { "../utils/common": 41 }], 51: [function(e, t, r) {
              t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
            }, {}], 52: [function(e, t, r) {
              var i = e("../utils/common"), o = 0, h = 1;
              function n(e2) {
                for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
              }
              var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
              n(z);
              var C = new Array(2 * f);
              n(C);
              var E = new Array(512);
              n(E);
              var A = new Array(256);
              n(A);
              var I = new Array(a);
              n(I);
              var O, B, R, T = new Array(f);
              function D(e2, t2, r2, n2, i2) {
                this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
              }
              function F(e2, t2) {
                this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
              }
              function N(e2) {
                return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
              }
              function U(e2, t2) {
                e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
              }
              function P(e2, t2, r2) {
                e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
              }
              function L(e2, t2, r2) {
                P(e2, r2[2 * t2], r2[2 * t2 + 1]);
              }
              function j(e2, t2) {
                for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
                return r2 >>> 1;
              }
              function Z(e2, t2, r2) {
                var n2, i2, s2 = new Array(g + 1), a2 = 0;
                for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
                for (i2 = 0; i2 <= t2; i2++) {
                  var o2 = e2[2 * i2 + 1];
                  0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
                }
              }
              function W(e2) {
                var t2;
                for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
                for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
                for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
                e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
              }
              function M(e2) {
                8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
              }
              function H(e2, t2, r2, n2) {
                var i2 = 2 * t2, s2 = 2 * r2;
                return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
              }
              function G(e2, t2, r2) {
                for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
                e2.heap[r2] = n2;
              }
              function K(e2, t2, r2) {
                var n2, i2, s2, a2, o2 = 0;
                if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
                L(e2, m, t2);
              }
              function Y(e2, t2) {
                var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
                for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
                for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
                for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
                for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
                e2.heap[--e2.heap_max] = e2.heap[1], function(e3, t3) {
                  var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
                  for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
                  for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
                  if (0 !== m2) {
                    do {
                      for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                      e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
                    } while (0 < m2);
                    for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
                  }
                }(e2, t2), Z(s2, u2, e2.bl_count);
              }
              function X(e2, t2, r2) {
                var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
                for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
              }
              function V(e2, t2, r2) {
                var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
                for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
                  if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
                  else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
                  s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
                }
              }
              n(T);
              var q = false;
              function J(e2, t2, r2, n2) {
                P(e2, (s << 1) + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
                  M(e3), U(e3, r3), U(e3, ~r3), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
                }(e2, t2, r2);
              }
              r._tr_init = function(e2) {
                q || (function() {
                  var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
                  for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
                  for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
                  for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
                  for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
                  for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
                  for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
                  for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
                  for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
                  for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
                  O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
                }(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
              }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
                var i2, s2, a2 = 0;
                0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = function(e3) {
                  var t3, r3 = 4093624447;
                  for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
                  if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
                  for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
                  return o;
                }(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = function(e3) {
                  var t3;
                  for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
                  return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
                }(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
                  var i3;
                  for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
                  V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
                }(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
              }, r._tr_tally = function(e2, t2, r2) {
                return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
              }, r._tr_align = function(e2) {
                P(e2, 2, 3), L(e2, m, z), function(e3) {
                  16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
                }(e2);
              };
            }, { "../utils/common": 41 }], 53: [function(e, t, r) {
              t.exports = function() {
                this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
              };
            }, {}], 54: [function(e, t, r) {
              (function(e2) {
                !function(r2, n) {
                  if (!r2.setImmediate) {
                    var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
                    e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                      process.nextTick(function() {
                        c(e4);
                      });
                    } : function() {
                      if (r2.postMessage && !r2.importScripts) {
                        var e4 = true, t3 = r2.onmessage;
                        return r2.onmessage = function() {
                          e4 = false;
                        }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                      }
                    }() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                      r2.postMessage(a + e4, "*");
                    }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                      c(e4.data);
                    }, function(e4) {
                      t2.port2.postMessage(e4);
                    }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                      var t3 = l.createElement("script");
                      t3.onreadystatechange = function() {
                        c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                      }, s.appendChild(t3);
                    }) : function(e4) {
                      setTimeout(c, 0, e4);
                    }, e3.setImmediate = function(e4) {
                      "function" != typeof e4 && (e4 = new Function("" + e4));
                      for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                      var n2 = { callback: e4, args: t3 };
                      return h[o] = n2, i(o), o++;
                    }, e3.clearImmediate = f;
                  }
                  function f(e4) {
                    delete h[e4];
                  }
                  function c(e4) {
                    if (u) setTimeout(c, 0, e4);
                    else {
                      var t3 = h[e4];
                      if (t3) {
                        u = true;
                        try {
                          !function(e5) {
                            var t4 = e5.callback, r3 = e5.args;
                            switch (r3.length) {
                              case 0:
                                t4();
                                break;
                              case 1:
                                t4(r3[0]);
                                break;
                              case 2:
                                t4(r3[0], r3[1]);
                                break;
                              case 3:
                                t4(r3[0], r3[1], r3[2]);
                                break;
                              default:
                                t4.apply(n, r3);
                            }
                          }(t3);
                        } finally {
                          f(e4), u = false;
                        }
                      }
                    }
                  }
                  function d(e4) {
                    e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
                  }
                }("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
              }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
            }, {}] }, {}, [10])(10);
          });
        })(jszip_min);
        return jszip_min.exports;
      }
      var jszip_minExports = requireJszip_min();
      const JSZip = /* @__PURE__ */ getDefaultExportFromCjs(jszip_minExports);
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
      async function downloadZIP(files, zipFilename) {
        const zip = new JSZip();
        for (const [filename, data] of Object.entries(files)) {
          const json = JSON.stringify(data, null, 2);
          zip.file(filename, json);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        triggerDownload(blob, zipFilename);
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
      async function readZIPFile(file) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        const result = {};
        for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
          if (!zipEntry.dir) {
            const text = await zipEntry.async("text");
            try {
              result[filename] = JSON.parse(text);
            } catch (error) {
              console.warn(`无法解析 ${filename}:`, error);
            }
          }
        }
        return result;
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
          const TagTab = defineAsyncComponent(() => __vitePreload(() => module.import('./TagTab-BV8fV_L1-D0KkjHLa.js'), void 0 ));
          const ItemTab = defineAsyncComponent(() => __vitePreload(() => module.import('./ItemTab-H_z0Yqg_-Chwuwi-1.js'), void 0 ));
          const EditTab = defineAsyncComponent(() => __vitePreload(() => module.import('./EditTab-BxXSkDY2-CzUOF7Zy.js'), void 0 ));
          const {
            data,
            exportTags,
            exportItems,
            exportTemplates,
            exportAllItems,
            importAllFromZip,
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
              const files = {
                "tags.json": exportTags(),
                "items.json": exportItems(),
                "templates.json": exportTemplates()
              };
              const allItems = exportAllItems();
              for (const [itemId, config] of Object.entries(allItems)) {
                files[`item-${itemId}.json`] = config;
              }
              await downloadZIP(files, `booth-backup-${generateTimestamp()}.zip`);
              toast.success("导出成功");
            } catch (error) {
              console.error("导出失败:", error);
              toast.error("导出失败：" + error.message);
            }
          };
          const handleImport = () => {
            triggerFileInput(".zip,application/zip", async (file) => {
              try {
                const files = await readZIPFile(file);
                importAllFromZip(files);
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
          function handleEditImport() {
            triggerFileInput(".json,application/json", async (file) => {
              try {
                const config = await readJSONFile(file);
                const success = importSingleItem(config, { replace: false });
                if (!success) {
                  pendingImportConfig.value = config;
                  showImportConflictDialog.value = true;
                } else {
                  toast.success("商品配置导入成功");
                }
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
            return [
              {
                label: "导出完整备份 (ZIP)",
                icon: withSize(icons.upload, 14),
                action: handleExport
              },
              {
                label: "导入完整备份 (ZIP)",
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
                label: isEditTab ? "导出当前商品 (JSON)" : `导出${currentTabLabel.value}数据 (JSON)`,
                icon: withSize(icons.upload, 14),
                action: isEditTab ? handleEditExport : handleTabExport
              },
              {
                label: isEditTab ? "导入商品配置 (JSON)" : `导入${currentTabLabel.value}数据 (JSON)`,
                icon: withSize(icons.download, 14),
                action: isEditTab ? handleEditImport : handleTabImport
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
                onClose: cancelImport,
                width: "400px"
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
                  key: unref(data).ui.activeTab + "-" + Date.now(),
                  api: props.api
                }, null, 8, ["api"]))
              ])
            ], 512);
          };
        }
      });
      const AppVue = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ef8b0a5f"]]);
      class PageModule {
        constructor(api) {
          __publicField(this, "api");
          this.api = api;
          this.api.onReady((api2) => {
            this.initialize(api2);
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
        initialize(api) {
          const containers = /* @__PURE__ */ new Set();
          api.sections.forEach((section) => containers.add(section.container));
          api.variations.forEach((variation) => containers.add(variation.container));
          containers.forEach((container) => {
            this.addNumbersToList(container);
          });
          api.onSectionAdded((section) => {
            if (!this.observedContainers.has(section.container)) {
              this.addNumbersToList(section.container);
            }
          });
          api.onVariationAdded((variation) => {
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
        initialize(api) {
          this.waitForTagContainer(api);
        }
        /**
         * 等待标签容器出现
         */
        waitForTagContainer(api) {
          const tagElements = api.tagElements;
          if (tagElements) {
            this.addTagButtons(tagElements.inputContainer);
            return;
          }
          const observer = new MutationObserver(() => {
            const elements = api.tagElements;
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
        updateSidebarState(isOpen, chevronRight, chevronLeft) {
          if (this.toggleBtn) {
            this.toggleBtn.innerHTML = isOpen ? chevronRight : chevronLeft;
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
          const chevronLeft = withSize(icons.chevronLeft, 20, 2.5);
          const chevronRight = withSize(icons.chevronRight, 20, 2.5);
          this.toggleBtn.innerHTML = chevronLeft;
          this.toggleBtn.addEventListener("click", () => {
            const storage = ConfigStorage.getInstance();
            const isOpen = !storage.data.value.ui.sidebarOpen;
            storage.data.value.ui.sidebarOpen = isOpen;
            this.updateSidebarState(isOpen, chevronRight, chevronLeft);
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
            const chevronRight = withSize(icons.chevronRight, 20, 2.5);
            const chevronLeft = withSize(icons.chevronLeft, 20, 2.5);
            this.updateSidebarState(sidebarOpen, chevronRight, chevronLeft);
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
         * 解析变体列表（数据+元素）
         */
        parseVariations(element) {
          const variations = [];
          const rows = element.querySelectorAll(".dashboard-items-variation .row");
          rows.forEach((row) => {
            var _a, _b, _c, _d;
            const labelEl = row.querySelector(".dashboard-items-variation-label");
            let name = "";
            if (labelEl) {
              const textContent = labelEl.textContent || "";
              const match = textContent.match(/#\d+\s*(.+)/);
              name = match ? match[1].trim() : textContent.trim();
            }
            const priceEl = row.querySelector(".price");
            const priceText = ((_a = priceEl == null ? void 0 : priceEl.textContent) == null ? void 0 : _a.trim()) || "0";
            const price = parseInt(priceText.replace(/[^\d]/g, ""), 10) || 0;
            const salesText = ((_c = (_b = row.querySelector(".sales_quantity .count")) == null ? void 0 : _b.textContent) == null ? void 0 : _c.trim()) || "0";
            const salesCount = parseInt(salesText, 10) || 0;
            const revenueEl = row.querySelector(".sales_subtotal");
            const revenueText = ((_d = revenueEl == null ? void 0 : revenueEl.textContent) == null ? void 0 : _d.trim()) || "0";
            const revenue = parseInt(revenueText.replace(/[^\d]/g, ""), 10) || 0;
            variations.push({
              data: { name, price, salesCount, revenue },
              element: row
            });
          });
          return variations;
        }
        /**
         * 解析标签列表（文本+元素）
         */
        parseTags(element) {
          const tags = [];
          const tagElements = element.querySelectorAll(".dashboard-items-tags li");
          tagElements.forEach((li) => {
            var _a;
            const textEl = li.querySelector(".tag-text");
            const text = (_a = textEl == null ? void 0 : textEl.textContent) == null ? void 0 : _a.trim();
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
         * 解析单个商品（只返回数据）
         */
        parseItem(element) {
          var _a, _b, _c, _d;
          try {
            const id = this.extractId(element);
            if (!id) return null;
            const name = ((_b = (_a = element.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "";
            const url = ((_c = element.querySelector(".nav")) == null ? void 0 : _c.getAttribute("href")) || "";
            const thumbnail = ((_d = element.querySelector(".thumbnail img")) == null ? void 0 : _d.src) || "";
            const tags = this.parseTags(element).map((t) => t.text);
            const variations = this.parseVariations(element).map((v) => v.data);
            const favElement = element.querySelector(".item-stat.favs .count");
            const favoritesCount = favElement ? parseInt(favElement.textContent || "0", 10) || 0 : 0;
            return {
              id,
              name,
              url,
              thumbnail,
              tags,
              variations,
              favoritesCount
            };
          } catch (error) {
            console.error("解析商品失败:", error);
            return null;
          }
        }
      }
      class ItemManageAPI extends BaseAPI {
        constructor() {
          super();
          __publicField(this, "_items", []);
          __publicField(this, "_parser");
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
            if (document.querySelector(".item-wrapper")) {
              resolve();
              return;
            }
            const timer = setTimeout(() => {
              observer.disconnect();
              reject(new Error("等待商品元素超时"));
            }, timeout);
            const observer = new MutationObserver(() => {
              if (document.querySelector(".item-wrapper")) {
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
         * 加载商品数据
         * 等待商品元素出现后再加载
         */
        async load() {
          await this.waitForElements();
          this._items = [];
          const elements = document.querySelectorAll(".item-wrapper");
          elements.forEach((element) => {
            const htmlElement = element;
            const data = this._parser.parseItem(element);
            if (data) {
              const variationsUl = htmlElement.querySelector(".dashboard-items-variation");
              const tagsUl = htmlElement.querySelector(".dashboard-items-tags");
              const variations = this._parser.parseVariations(htmlElement);
              const tags = this._parser.parseTags(htmlElement);
              this._items.push({
                data,
                element: htmlElement,
                variationsUl,
                tagsUl,
                variations,
                tags
              });
            }
          });
        }
        /**
         * 获取所有商品（包含数据和DOM元素）
         */
        getItems() {
          return [...this._items];
        }
        /**
         * 获取所有商品数据（只返回数据，不含DOM元素）
         */
        getItemsData() {
          return this._items.map((item) => item.data);
        }
        /**
         * 根据ID获取商品（包含数据和DOM元素）
         */
        getItem(id) {
          return this._items.find((item) => item.data.id === id);
        }
        /**
         * 根据ID获取商品数据（只返回数据）
         */
        getItemData(id) {
          var _a;
          return (_a = this._items.find((item) => item.data.id === id)) == null ? void 0 : _a.data;
        }
        /**
         * 根据ID获取DOM元素
         */
        getItemElement(id) {
          var _a;
          return (_a = this._items.find((item) => item.data.id === id)) == null ? void 0 : _a.element;
        }
        /**
         * 刷新数据（重新解析DOM）
         */
        refresh() {
          this.load();
        }
        /**
         * 复制商品标签到剪贴板
         * @param itemId 商品ID
         * @returns 是否复制成功
         */
        async copyItemTags(itemId) {
          const item = this.getItem(itemId);
          if (!item) {
            console.error(`未找到商品: ${itemId}`);
            return false;
          }
          const tags = item.data.tags;
          if (tags.length === 0) {
            alert("没有找到标签");
            return false;
          }
          try {
            await navigator.clipboard.writeText(JSON.stringify(tags));
            return true;
          } catch (error) {
            console.error("复制标签失败:", error);
            return false;
          }
        }
      }
      class ItemActions extends PageModule {
        constructor(api) {
          super(api);
        }
        initialize(api) {
          const items = api.getItems();
          items.forEach((item) => {
            this.addToItem(item.element);
          });
        }
        /**
         * 为商品添加操作按钮
         * @param item 商品元素
         */
        addToItem(item) {
          try {
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
      class ItemCollapse extends PageModule {
        constructor(api) {
          super(api);
          __publicField(this, "_processedItems");
          __publicField(this, "stylesInjected", false);
        }
        get processedItems() {
          if (!this._processedItems) {
            this._processedItems = /* @__PURE__ */ new Set();
          }
          return this._processedItems;
        }
        initialize(api) {
          this.injectStyles();
          const items = api.getItems();
          items.forEach((itemElement) => {
            this.addToItem(itemElement);
          });
        }
        /**
         * 为商品添加折叠功能
         * @param itemElement API 提供的商品元素
         */
        addToItem(itemElement) {
          var _a, _b;
          try {
            const { element, variationsUl, tagsUl, variations } = itemElement;
            if (this.processedItems.has(element)) return;
            this.processedItems.add(element);
            const headers = [];
            if (variationsUl && variations.length > 0 && !((_a = variationsUl.previousElementSibling) == null ? void 0 : _a.classList.contains("item-collapse-header"))) {
              const header = this.createVariationHeader(itemElement);
              headers.push({ header, target: variationsUl });
            }
            if (tagsUl && itemElement.tags.length > 0 && !((_b = tagsUl.previousElementSibling) == null ? void 0 : _b.classList.contains("item-collapse-header"))) {
              const header = this.createTagHeader(tagsUl);
              headers.push({ header, target: tagsUl });
            }
            headers.forEach(({ header, target }) => {
              var _a2;
              (_a2 = target.parentElement) == null ? void 0 : _a2.insertBefore(header, target);
              target.classList.add("item-collapsible", "collapsed");
            });
          } catch (error) {
            handleError(error);
          }
        }
        /**
         * 设置折叠功能
         */
        setupCollapseToggle(header, target) {
          const icon = header.querySelector(".item-collapse-icon");
          let isCollapsed = true;
          header.onclick = () => {
            isCollapsed = !isCollapsed;
            target.classList.toggle("collapsed", isCollapsed);
            icon.classList.toggle("collapsed", isCollapsed);
          };
        }
        /**
         * 创建基础折叠标题
         */
        createBaseHeader(title, badgesHTML) {
          const header = document.createElement("div");
          header.className = "item-collapse-header";
          const titleSection = document.createElement("div");
          titleSection.className = "item-collapse-title";
          titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>${title}</span>
        `;
          header.appendChild(titleSection);
          if (badgesHTML) {
            const badgesContainer = document.createElement("div");
            badgesContainer.className = "item-collapse-badges";
            badgesContainer.innerHTML = badgesHTML;
            header.appendChild(badgesContainer);
          }
          return header;
        }
        /**
         * 创建变体列表折叠标题（使用 API 数据）
         */
        createVariationHeader(itemElement) {
          const { variations, variationsUl } = itemElement;
          const count = variations.length;
          const totalSales = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
          const totalRevenue = variations.reduce((sum, v) => sum + v.data.revenue, 0);
          const badgesHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${totalRevenue.toLocaleString()}</strong></span>
        `;
          const header = this.createBaseHeader("变体列表", badgesHTML);
          this.setupCollapseToggle(header, variationsUl);
          return header;
        }
        /**
         * 创建标签列表折叠标题
         */
        createTagHeader(tagsUl) {
          const header = this.createBaseHeader("标签列表");
          this.setupCollapseToggle(header, tagsUl);
          return header;
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
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                margin-right: 6px;
                font-size: 10px;
                color: #666;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }

            .item-collapse-icon.collapsed {
                transform: rotate(-90deg);
            }

            /* 折叠容器样式 - 使用 GPU 加速属性 */
            .item-collapsible {
                overflow: hidden;
                max-height: 5000px;
                will-change: max-height, opacity; /* 提示浏览器优化 */
                contain: layout style paint; /* 限制重排范围 */
            }

            .item-collapsible.collapsed {
                max-height: 0 !important;
                opacity: 0;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                /* 使用 transform 代替部分属性，GPU 加速 */
                transform: translateZ(0);
            }

            /* 折叠标题容器 */
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
                transition: background-color 0.2s ease;
                gap: 12px;
            }
            
            .item-collapse-header:hover {
                background-color: #f5f5f5;
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
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 400;
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
        constructor(api) {
          super(api);
          __publicField(this, "navigationContainer", null);
          __publicField(this, "toggleButton", null);
          __publicField(this, "items", []);
          __publicField(this, "isExpanded", false);
          __publicField(this, "searchInput", null);
          __publicField(this, "filteredItems", []);
          __publicField(this, "isScrolling", false);
          __publicField(this, "scrollTimeout", null);
          __publicField(this, "hoverTimeout", null);
        }
        initialize(api) {
          this.items = api.getItems();
          this.injectStyles();
          setTimeout(() => {
            this.createNavigation();
          }, 1e3);
        }
        /**
         * 创建商品导航栏
         */
        createNavigation() {
          try {
            if (document.querySelector(".item-navigation")) return;
            if (this.items.length === 0) return;
            this.injectStyles();
            this.createToggleButton();
            this.createNavigationContainer();
            this.createNavigationItems();
            this.setupScrollListener();
          } catch (error) {
            handleError(error);
          }
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
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                display: flex;
                align-items: flex-start;
                gap: 8px;
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
          this.isExpanded = false;
          if (this.toggleButton) {
            this.toggleButton.innerHTML = "◀";
          }
        }
        /**
         * 创建导航项（使用 API 数据）
         */
        createNavigationItems() {
          var _a;
          if (!this.navigationContainer) return;
          const itemsContainer = this.navigationContainer.querySelector(".navigation-items-container");
          if (!itemsContainer) return;
          itemsContainer.innerHTML = "";
          const itemsToShow = this.filteredItems.length > 0 ? this.filteredItems : this.items;
          if (itemsToShow.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.className = "navigation-empty-state";
            emptyState.textContent = ((_a = this.searchInput) == null ? void 0 : _a.value) ? "未找到匹配的商品" : "暂无商品";
            itemsContainer.appendChild(emptyState);
            return;
          }
          itemsToShow.forEach((itemElement, index) => {
            const { data, element, variations } = itemElement;
            const variationCount = variations.length;
            const salesCount = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
            const favoritesCount = data.favoritesCount;
            const navItem = document.createElement("div");
            navItem.className = "navigation-item";
            navItem.setAttribute("data-item-id", data.id);
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
            itemsContainer.appendChild(navItem);
          });
        }
        /**
         * 过滤商品（使用 API 数据）
         */
        filterItems() {
          if (!this.searchInput) return;
          const searchTerm = this.searchInput.value.toLowerCase().trim();
          if (searchTerm === "") {
            this.filteredItems = [];
          } else {
            this.filteredItems = this.items.filter((itemElement) => {
              const { data } = itemElement;
              return data.name.toLowerCase().includes(searchTerm) || data.id.includes(searchTerm);
            });
          }
          this.createNavigationItems();
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
      class VariationNumbers extends PageModule {
        constructor(api) {
          super(api);
        }
        initialize(api) {
          const items = api.getItems();
          items.forEach((itemElement) => {
            this.addToItem(itemElement);
          });
        }
        /**
         * 为商品添加变体序号（使用 API 数据）
         * @param itemElement API 提供的商品元素
         */
        addToItem(itemElement) {
          try {
            const { element, variationsUl, variations } = itemElement;
            if (!variationsUl || !variations.length) return;
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
        }
        shouldExecute() {
          return this.path === "/items" || this.path === "/items/";
        }
        createAPI() {
          return new ItemManageAPI();
        }
        async initialize() {
          if (this.api) {
            this.modules.push(
              new ItemNavigation(this.api),
              new ItemActions(this.api),
              new ItemCollapse(this.api),
              new VariationNumbers(this.api)
            );
          }
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

System.register("./TagTab-BV8fV_L1-D0KkjHLa.js", ['vue', './useTreeTab-C9m3nt2O-gtVEFu7Y.js', './__monkey.entry-xDA_xLW6.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createCommentVNode, createElementVNode, Fragment, renderList, toDisplayString, withModifiers, withDirectives, withKeys, vModelText, createTextVNode, useTreeTab, Tree, tagSearchFilter, _export_sfc, useStorage, Modal, withSize, icons;
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
      Modal = module.M;
      withSize = module.w;
      icons = module.i;
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
      const _hoisted_6 = { key: 0 };
      const _hoisted_7 = { key: 1 };
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
        __name: "TagTab",
        props: {
          api: {}
        },
        setup(__props) {
          const props = __props;
          const { data, createNode, renameNode } = useStorage();
          const tree = computed(() => data.value.tagTree);
          function hasTagsRecursive(node) {
            var _a;
            if (!node) return false;
            const hasTags = ((_a = node.data) == null ? void 0 : _a.tags) && Array.isArray(node.data.tags) && node.data.tags.length > 0;
            if (hasTags) return true;
            if (!node.children || node.children.length === 0) return false;
            return node.children.some((childId) => {
              const childNode = tree.value.nodes[childId];
              return childNode && hasTagsRecursive(childNode);
            });
          }
          function extractTagsRecursive(node, tagsSet) {
            var _a;
            if (((_a = node.data) == null ? void 0 : _a.tags) && Array.isArray(node.data.tags)) {
              node.data.tags.forEach((tag) => tagsSet.add(tag));
            }
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
              label: "应用标签",
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
              show: (node, selection) => {
                if (selection && selection.length > 0) {
                  return selection.some(hasTagsRecursive);
                }
                return hasTagsRecursive(node);
              }
            },
            {
              label: "移除标签",
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
              show: (node, selection) => {
                if (selection && selection.length > 0) {
                  return selection.some(hasTagsRecursive);
                }
                return hasTagsRecursive(node);
              },
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
                            }, " × ", 8, _hoisted_5)
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
                    }, null, 8, _hoisted_21)
                  ])) : createCommentVNode("", true),
                  unref(treeTab).modal.state.value.type === "createTag" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[10] || (_cache[10] = ($event) => unref(treeTab).modal.confirmModal(unref(treeTab).modal.state.value.formData)),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_22)
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-danger",
                    onClick: _cache[11] || (_cache[11] = ($event) => unref(treeTab).modal.confirmModal(true)),
                    title: "删除"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).trash, 18)
                    }, null, 8, _hoisted_23)
                  ])) : unref(treeTab).modal.state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[12] || (_cache[12] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_24)
                  ])) : (openBlock(), createElementBlock("button", {
                    key: 4,
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[13] || (_cache[13] = ($event) => unref(treeTab).modal.confirmModal()),
                    title: "确定"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_25)
                  ]))
                ]),
                default: withCtx(() => [
                  unref(treeTab).modal.state.value.type === "createFolder" ? (openBlock(), createElementBlock("div", _hoisted_6, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "文件夹名称",
                      onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "createTag" ? (openBlock(), createElementBlock("div", _hoisted_7, [
                    createElementVNode("div", _hoisted_8, [
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
                    createElementVNode("div", _hoisted_9, [
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
                  ])) : unref(treeTab).modal.state.value.type === "rename" ? (openBlock(), createElementBlock("div", _hoisted_10, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: "新名称",
                      onKeyup: _cache[5] || (_cache[5] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    createElementVNode("p", _hoisted_12, toDisplayString(unref(treeTab).modal.state.value.formData.message), 1)
                  ])) : unref(treeTab).modal.state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_13, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_14, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
                      type: "text",
                      placeholder: unref(treeTab).modal.state.value.placeholder,
                      onKeyup: _cache[7] || (_cache[7] = withKeys(($event) => unref(treeTab).modal.confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_15), [
                      [vModelText, unref(treeTab).modal.state.value.inputValue]
                    ])
                  ])) : unref(treeTab).modal.state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_16, [
                    unref(treeTab).modal.state.value.message ? (openBlock(), createElementBlock("p", _hoisted_17, toDisplayString(unref(treeTab).modal.state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(treeTab).modal.state.value.inputValue = $event),
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
      const TagTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e495ea3c"]]));

    })
  };
}));

System.register("./ItemTab-H_z0Yqg_-Chwuwi-1.js", ['vue', './useTreeTab-C9m3nt2O-gtVEFu7Y.js', './__monkey.entry-xDA_xLW6.js'], (function (exports, module) {
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

System.register("./useTreeTab-C9m3nt2O-gtVEFu7Y.js", ['vue', './__monkey.entry-xDA_xLW6.js', './useModal-Cv530RMh-DbZQZjC8.js'], (function (exports, module) {
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
              action: handleCreateItem,
              separator: true
            });
          }
          const menuItems = computed(() => {
            const items = [];
            const selectedNodes = getSelectedNodes();
            addBaseCreateItems(items);
            if (targetNode.value) {
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
      const Tree = exports("T", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b7665db9"]]));
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

System.register("./EditTab-BxXSkDY2-CzUOF7Zy.js", ['vue', './useModal-Cv530RMh-DbZQZjC8.js', './__monkey.entry-xDA_xLW6.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, ref, watch, onMounted, createElementBlock, openBlock, Fragment, createBlock, createCommentVNode, unref, withCtx, createElementVNode, withDirectives, createTextVNode, withKeys, vModelText, vModelSelect, createVNode, toDisplayString, withModifiers, nextTick, renderList, normalizeClass, vModelCheckbox, useSlots, renderSlot, useModal, _export_sfc, useStorage, getSelectedNameTemplate, getSelectedDescriptionTemplate, getSelectedDiscountTemplate, toast, Modal, withSize, icons, createDefaultItemConfig, getSelectedChangelogTemplate, TabBar;
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
      createBlock = module.createBlock;
      createCommentVNode = module.createCommentVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createElementVNode = module.createElementVNode;
      withDirectives = module.withDirectives;
      createTextVNode = module.createTextVNode;
      withKeys = module.withKeys;
      vModelText = module.vModelText;
      vModelSelect = module.vModelSelect;
      createVNode = module.createVNode;
      toDisplayString = module.toDisplayString;
      withModifiers = module.withModifiers;
      nextTick = module.nextTick;
      renderList = module.renderList;
      normalizeClass = module.normalizeClass;
      vModelCheckbox = module.vModelCheckbox;
      useSlots = module.useSlots;
      renderSlot = module.renderSlot;
    }, module => {
      useModal = module.u;
    }, module => {
      _export_sfc = module._;
      useStorage = module.u;
      getSelectedNameTemplate = module.g;
      getSelectedDescriptionTemplate = module.b;
      getSelectedDiscountTemplate = module.c;
      toast = module.t;
      Modal = module.M;
      withSize = module.w;
      icons = module.i;
      createDefaultItemConfig = module.d;
      getSelectedChangelogTemplate = module.e;
      TabBar = module.T;
    }],
    execute: (function () {

      const _hoisted_1$8 = {
        key: 0,
        class: "section-header"
      };
      const _hoisted_2$8 = {
        key: 0,
        class: "be-text-base be-font-bold"
      };
      const _hoisted_3$8 = {
        key: 1,
        class: "actions"
      };
      const _hoisted_4$8 = { class: "section-content" };
      const _sfc_main$8 = /* @__PURE__ */ defineComponent({
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
              hasHeader.value ? (openBlock(), createElementBlock("div", _hoisted_1$8, [
                _ctx.title || _ctx.$slots.title ? (openBlock(), createElementBlock("div", _hoisted_2$8, [
                  renderSlot(_ctx.$slots, "title", {}, () => [
                    createTextVNode(toDisplayString(_ctx.title), 1)
                  ], true)
                ])) : createCommentVNode("", true),
                _ctx.$slots.actions ? (openBlock(), createElementBlock("div", _hoisted_3$8, [
                  renderSlot(_ctx.$slots, "actions", {}, void 0, true)
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              createElementVNode("div", _hoisted_4$8, [
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ])
            ], 2);
          };
        }
      });
      const SectionHeader = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-bd8a2399"]]);
      const _hoisted_1$7 = { class: "draggable-card-list" };
      const _hoisted_2$7 = ["onDragstart", "onDrop"];
      const _hoisted_3$7 = { class: "card-actions" };
      const _hoisted_4$7 = ["innerHTML"];
      const _hoisted_5$7 = { class: "card-number" };
      const _hoisted_6$7 = { class: "actions-content" };
      const _hoisted_7$7 = ["onClick"];
      const _hoisted_8$6 = ["innerHTML"];
      const _hoisted_9$6 = { class: "card-content" };
      const _sfc_main$7 = /* @__PURE__ */ defineComponent({
        __name: "DraggableCardList",
        props: {
          items: {},
          keyExtractor: { type: Function, default: (item, index) => {
            return (item == null ? void 0 : item.id) !== void 0 ? item.id : index;
          } }
        },
        emits: ["remove", "reorder"],
        setup(__props, { emit: __emit }) {
          const emit = __emit;
          const draggedIndex = ref(null);
          function onDragStart(index) {
            draggedIndex.value = index;
          }
          function onDragOver(event) {
            event.preventDefault();
          }
          function onDrop(event, targetIndex) {
            event.preventDefault();
            if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
              draggedIndex.value = null;
              return;
            }
            emit("reorder", draggedIndex.value, targetIndex);
            draggedIndex.value = null;
          }
          function handleRemove(index) {
            emit("remove", index);
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1$7, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.items, (item, index) => {
                return openBlock(), createElementBlock("div", {
                  key: _ctx.keyExtractor(item, index),
                  class: "draggable-card",
                  draggable: "true",
                  onDragstart: ($event) => onDragStart(index),
                  onDragover: onDragOver,
                  onDrop: ($event) => onDrop($event, index)
                }, [
                  createElementVNode("div", _hoisted_3$7, [
                    createElementVNode("span", {
                      class: "drag-handle",
                      innerHTML: unref(withSize)(unref(icons).moreVertical, 14)
                    }, null, 8, _hoisted_4$7),
                    createElementVNode("span", _hoisted_5$7, "#" + toDisplayString(index + 1), 1),
                    createElementVNode("div", _hoisted_6$7, [
                      renderSlot(_ctx.$slots, "actions", {
                        item,
                        index
                      }, void 0, true)
                    ]),
                    createElementVNode("button", {
                      class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                      onClick: ($event) => handleRemove(index),
                      title: "删除"
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).trash, 14)
                      }, null, 8, _hoisted_8$6)
                    ], 8, _hoisted_7$7)
                  ]),
                  createElementVNode("div", _hoisted_9$6, [
                    renderSlot(_ctx.$slots, "content", {
                      item,
                      index
                    }, void 0, true)
                  ])
                ], 40, _hoisted_2$7);
              }), 128))
            ]);
          };
        }
      });
      const DraggableCardList = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-b9ebef1f"]]);
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
      function resolveSectionContent(instance, templates) {
        if (instance.templateId) {
          const template = templates.find((t) => t.id === instance.templateId);
          if (template) {
            return {
              headline: instance.headline ?? template.headline,
              body: instance.body ?? template.body
            };
          }
        }
        return {
          headline: instance.headline ?? "",
          body: instance.body ?? ""
        };
      }
      function createSectionFromTemplate(template) {
        return {
          id: crypto.randomUUID(),
          templateId: template.id
        };
      }
      function parseTemplate(template, variables) {
        let result = template;
        Object.entries(variables).forEach(([key, value]) => {
          if (value !== void 0) {
            const regex = new RegExp(`\\{${key}\\}`, "g");
            result = result.replace(regex, String(value));
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
      function calculateTotalSupport(variations) {
        return variations.filter((v) => !v.isFullset).reduce((sum, v) => sum + Number(v.supportCount), 0);
      }
      const _hoisted_1$6 = ["innerHTML"];
      const _hoisted_2$6 = ["onUpdate:modelValue"];
      const _hoisted_3$6 = {
        class: "booth-toggle",
        title: "设为默认"
      };
      const _hoisted_4$6 = ["checked", "onChange"];
      const _hoisted_5$6 = { class: "form-group" };
      const _hoisted_6$6 = ["onUpdate:modelValue"];
      const _hoisted_7$6 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$6 = /* @__PURE__ */ defineComponent({
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
            get: () => {
              var _a;
              return (_a = props.globalTemplates).descriptionTemplates || (_a.descriptionTemplates = []);
            },
            set: (value) => {
              props.globalTemplates.descriptionTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, setDefaultTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "描述模板配置",
              width: "600px",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$6)
                ])
              ]),
              default: withCtx(() => [
                createVNode(unref(SectionHeader), null, {
                  default: withCtx(() => [
                    _cache[4] || (_cache[4] = createElementVNode("p", { class: "form-hint" }, "可用变量: {itemName}, {supportCount}", -1)),
                    _ctx.globalTemplates.descriptionTemplates && _ctx.globalTemplates.descriptionTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                      key: 0,
                      items: _ctx.globalTemplates.descriptionTemplates,
                      "key-extractor": (item) => item.id,
                      onRemove: unref(removeTemplate),
                      onReorder: unref(onReorder)
                    }, {
                      actions: withCtx(({ item, index }) => [
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": ($event) => item.name = $event,
                          type: "text",
                          placeholder: "输入模板名称",
                          style: { "flex": "1", "min-width": "0" }
                        }, null, 8, _hoisted_2$6), [
                          [vModelText, item.name]
                        ]),
                        createElementVNode("label", _hoisted_3$6, [
                          createElementVNode("input", {
                            type: "checkbox",
                            checked: item.isDefault,
                            onChange: ($event) => unref(setDefaultTemplate)(index)
                          }, null, 40, _hoisted_4$6),
                          _cache[2] || (_cache[2] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                        ])
                      ]),
                      content: withCtx(({ item }) => [
                        createElementVNode("div", _hoisted_5$6, [
                          _cache[3] || (_cache[3] = createElementVNode("label", null, "模板内容", -1)),
                          withDirectives(createElementVNode("textarea", {
                            "onUpdate:modelValue": ($event) => item.template = $event,
                            rows: "1",
                            placeholder: "输入模板内容"
                          }, null, 8, _hoisted_6$6), [
                            [vModelText, item.template]
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_7$6, ' 暂无模板，点击"添加模板"创建 '))
                  ]),
                  _: 1,
                  __: [4]
                })
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$5 = ["innerHTML"];
      const _hoisted_2$5 = {
        class: "booth-toggle",
        title: "设为默认"
      };
      const _hoisted_3$5 = ["checked", "onChange"];
      const _hoisted_4$5 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_5$5 = { class: "form-group" };
      const _hoisted_6$5 = ["onUpdate:modelValue"];
      const _hoisted_7$5 = { class: "form-group" };
      const _hoisted_8$5 = ["onUpdate:modelValue"];
      const _hoisted_9$5 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$5 = /* @__PURE__ */ defineComponent({
        __name: "NameTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const templates = computed({
            get: () => {
              var _a;
              return (_a = props.globalTemplates).nameTemplates || (_a.nameTemplates = []);
            },
            set: (value) => {
              props.globalTemplates.nameTemplates = value;
            }
          });
          const { addTemplate, removeTemplate, setDefaultTemplate, onReorder } = useTemplateManager({
            templates,
            defaultTemplate: { template: "{itemName}" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "商品名模板配置",
              width: "600px",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(addTemplate) && unref(addTemplate)(...args)),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$5)
                ])
              ]),
              default: withCtx(() => [
                createVNode(unref(SectionHeader), null, {
                  default: withCtx(() => [
                    _cache[5] || (_cache[5] = createElementVNode("p", { class: "form-hint" }, "可用变量: {itemName}, {supportCount}", -1)),
                    _ctx.globalTemplates.nameTemplates && _ctx.globalTemplates.nameTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                      key: 0,
                      items: _ctx.globalTemplates.nameTemplates,
                      "key-extractor": (item) => item.id,
                      onRemove: unref(removeTemplate),
                      onReorder: unref(onReorder)
                    }, {
                      actions: withCtx(({ item: template, index }) => [
                        createElementVNode("label", _hoisted_2$5, [
                          createElementVNode("input", {
                            type: "checkbox",
                            checked: template.isDefault,
                            onChange: ($event) => unref(setDefaultTemplate)(index)
                          }, null, 40, _hoisted_3$5),
                          _cache[2] || (_cache[2] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                        ])
                      ]),
                      content: withCtx(({ item }) => [
                        createElementVNode("div", _hoisted_4$5, [
                          createElementVNode("div", _hoisted_5$5, [
                            _cache[3] || (_cache[3] = createElementVNode("label", null, "模板名称", -1)),
                            withDirectives(createElementVNode("input", {
                              "onUpdate:modelValue": ($event) => item.name = $event,
                              type: "text",
                              placeholder: "输入模板名称"
                            }, null, 8, _hoisted_6$5), [
                              [vModelText, item.name]
                            ])
                          ]),
                          createElementVNode("div", _hoisted_7$5, [
                            _cache[4] || (_cache[4] = createElementVNode("label", null, "模板内容", -1)),
                            withDirectives(createElementVNode("textarea", {
                              "onUpdate:modelValue": ($event) => item.template = $event,
                              rows: "1",
                              placeholder: "输入模板内容"
                            }, null, 8, _hoisted_8$5), [
                              [vModelText, item.template]
                            ])
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_9$5, ' 暂无模板，点击"添加模板"创建 '))
                  ]),
                  _: 1,
                  __: [5]
                })
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$4 = ["innerHTML"];
      const _hoisted_2$4 = { class: "modal-content" };
      const _hoisted_3$4 = { class: "form-group" };
      const _hoisted_4$4 = { class: "be-flex be-justify-between be-align-center" };
      const _hoisted_5$4 = { class: "be-text-xs be-text-secondary" };
      const _hoisted_6$4 = { class: "form-group" };
      const _hoisted_7$4 = {
        key: 0,
        class: "form-group"
      };
      const _hoisted_8$4 = ["value"];
      const _hoisted_9$4 = {
        key: 1,
        class: "form-group"
      };
      const _hoisted_10$4 = ["value"];
      const _hoisted_11$4 = {
        key: 2,
        class: "empty-hint"
      };
      const _hoisted_12$4 = ["innerHTML"];
      const _hoisted_13$4 = ["innerHTML"];
      const _sfc_main$4 = /* @__PURE__ */ defineComponent({
        __name: "NameModal",
        props: {
          show: { type: Boolean },
          itemConfig: {},
          globalTemplates: {},
          totalSupport: {}
        },
        emits: ["close", "save"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showTemplateModal = ref(false);
          const templateVars = computed(() => ({
            itemName: props.itemConfig.itemName,
            supportCount: props.totalSupport
          }));
          const selectedTemplate = computed(
            () => getSelectedNameTemplate(props.globalTemplates, props.itemConfig)
          );
          const previewName = computed(
            () => parseTemplate(selectedTemplate.value, templateVars.value)
          );
          function updateCurrentTemplate(event) {
            if (!props.globalTemplates.nameTemplates || !props.itemConfig.selectedTemplates || !props.itemConfig.selectedTemplates.nameTemplateId) return;
            const target = event.target;
            const template = props.globalTemplates.nameTemplates.find(
              (t) => t.id === props.itemConfig.selectedTemplates.nameTemplateId
            );
            if (template) {
              template.template = target.value;
            }
          }
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
                onClose: _cache[6] || (_cache[6] = ($event) => emit("close")),
                width: "500px"
              }, {
                "header-actions": withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                    onClick: _cache[0] || (_cache[0] = ($event) => showTemplateModal.value = true),
                    title: "模板配置",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).settings, 18)
                    }, null, 8, _hoisted_1$4)
                  ])
                ]),
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: _cache[5] || (_cache[5] = ($event) => emit("close")),
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_12$4)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: handleSave,
                    title: "保存"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_13$4)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_2$4, [
                    createElementVNode("div", _hoisted_3$4, [
                      createElementVNode("div", _hoisted_4$4, [
                        _cache[8] || (_cache[8] = createElementVNode("label", null, "商品基础名称", -1)),
                        createElementVNode("span", _hoisted_5$4, toDisplayString(previewName.value), 1)
                      ]),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.itemConfig.itemName = $event),
                        type: "text",
                        placeholder: "输入商品名称"
                      }, null, 512), [
                        [vModelText, _ctx.itemConfig.itemName]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_6$4, [
                      _cache[10] || (_cache[10] = createElementVNode("label", null, "商品类型", -1)),
                      withDirectives(createElementVNode("select", {
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.itemConfig.itemType = $event)
                      }, _cache[9] || (_cache[9] = [
                        createElementVNode("option", { value: "normal" }, "普通商品", -1),
                        createElementVNode("option", { value: "adaptation" }, "适配商品", -1)
                      ]), 512), [
                        [vModelSelect, _ctx.itemConfig.itemType]
                      ])
                    ]),
                    _ctx.globalTemplates.nameTemplates && _ctx.globalTemplates.nameTemplates.length > 0 && _ctx.itemConfig.selectedTemplates ? (openBlock(), createElementBlock("div", _hoisted_7$4, [
                      _cache[11] || (_cache[11] = createElementVNode("label", null, "选择模板", -1)),
                      withDirectives(createElementVNode("select", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.itemConfig.selectedTemplates.nameTemplateId = $event)
                      }, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.globalTemplates.nameTemplates, (template) => {
                          return openBlock(), createElementBlock("option", {
                            key: template.id,
                            value: template.id
                          }, toDisplayString(template.name), 9, _hoisted_8$4);
                        }), 128))
                      ], 512), [
                        [vModelSelect, _ctx.itemConfig.selectedTemplates.nameTemplateId]
                      ])
                    ])) : createCommentVNode("", true),
                    _ctx.globalTemplates.nameTemplates && _ctx.globalTemplates.nameTemplates.length > 0 && _ctx.itemConfig.selectedTemplates ? (openBlock(), createElementBlock("div", _hoisted_9$4, [
                      _cache[12] || (_cache[12] = createElementVNode("label", null, [
                        createTextVNode("模板内容 "),
                        createElementVNode("span", { class: "label-hint" }, "(编辑当前选中模板)")
                      ], -1)),
                      _cache[13] || (_cache[13] = createElementVNode("p", { class: "form-hint" }, "支持变量: {itemName}, {supportCount}", -1)),
                      createElementVNode("input", {
                        value: selectedTemplate.value,
                        onInput: _cache[4] || (_cache[4] = ($event) => updateCurrentTemplate($event)),
                        type: "text",
                        placeholder: "如: {itemName} ({supportCount}体対応)"
                      }, null, 40, _hoisted_10$4)
                    ])) : (openBlock(), createElementBlock("div", _hoisted_11$4, " 请先在全局模板配置中添加商品名模板 "))
                  ])
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(_sfc_main$5, {
                show: showTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[7] || (_cache[7] = ($event) => showTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"])
            ], 64);
          };
        }
      });
      const _hoisted_1$3 = ["innerHTML"];
      const _hoisted_2$3 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_3$3 = {
        key: 0,
        class: "tab-content"
      };
      const _hoisted_4$3 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_5$3 = { class: "form-group" };
      const _hoisted_6$3 = ["onUpdate:modelValue"];
      const _hoisted_7$3 = { class: "form-group" };
      const _hoisted_8$3 = ["onUpdate:modelValue"];
      const _hoisted_9$3 = { class: "form-group" };
      const _hoisted_10$3 = ["onUpdate:modelValue"];
      const _hoisted_11$3 = {
        key: 1,
        class: "empty-hint"
      };
      const _hoisted_12$3 = {
        key: 1,
        class: "tab-content"
      };
      const _hoisted_13$3 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_14$3 = { class: "form-group" };
      const _hoisted_15$3 = ["onUpdate:modelValue"];
      const _hoisted_16$3 = { class: "form-group" };
      const _hoisted_17$3 = ["onUpdate:modelValue"];
      const _hoisted_18$3 = { class: "be-flex be-align-center be-gap-sm be-pt-xs" };
      const _hoisted_19$3 = {
        class: "booth-toggle",
        title: "设为默认"
      };
      const _hoisted_20$3 = ["checked", "onChange"];
      const _hoisted_21$3 = {
        key: 1,
        class: "empty-hint"
      };
      const _sfc_main$3 = /* @__PURE__ */ defineComponent({
        __name: "SectionTemplateModal",
        props: {
          show: { type: Boolean },
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const activeTab = ref("section");
          const tabs = [
            { id: "section", label: "Section" },
            { id: "changelog", label: "更新日志" }
          ];
          const sectionTemplates = computed({
            get: () => {
              var _a;
              return (_a = props.globalTemplates).sectionTemplates || (_a.sectionTemplates = []);
            },
            set: (value) => {
              props.globalTemplates.sectionTemplates = value;
            }
          });
          const sectionManager = useTemplateManager({
            templates: sectionTemplates,
            defaultTemplate: { headline: "", body: "" }
          });
          const changelogTemplates = computed({
            get: () => {
              var _a;
              return (_a = props.globalTemplates).changelogTemplates || (_a.changelogTemplates = []);
            },
            set: (value) => {
              props.globalTemplates.changelogTemplates = value;
            }
          });
          const changelogManager = useTemplateManager({
            templates: changelogTemplates,
            defaultTemplate: { template: "◆ {date}\n{content}" }
          });
          return (_ctx, _cache) => {
            return openBlock(), createBlock(Modal, {
              show: _ctx.show,
              title: "Section 模板配置",
              width: "700px",
              "teleport-to": ".booth-enhancer-sidebar",
              onClose: _cache[2] || (_cache[2] = ($event) => emit("close"))
            }, {
              "header-actions": withCtx(() => [
                createElementVNode("button", {
                  class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                  onClick: _cache[0] || (_cache[0] = ($event) => activeTab.value === "section" ? unref(sectionManager).addTemplate() : unref(changelogManager).addTemplate()),
                  title: "添加模板",
                  type: "button"
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 18)
                  }, null, 8, _hoisted_1$3)
                ])
              ]),
              default: withCtx(() => [
                createElementVNode("div", _hoisted_2$3, [
                  createVNode(unref(TabBar), {
                    "active-tab": activeTab.value,
                    tabs,
                    "onUpdate:activeTab": _cache[1] || (_cache[1] = ($event) => activeTab.value = $event)
                  }, null, 8, ["active-tab"]),
                  activeTab.value === "section" ? (openBlock(), createElementBlock("div", _hoisted_3$3, [
                    createVNode(unref(SectionHeader), null, {
                      default: withCtx(() => [
                        _cache[6] || (_cache[6] = createElementVNode("p", { class: "form-hint" }, "可用变量: {itemName}, {supportCount}", -1)),
                        _ctx.globalTemplates.sectionTemplates && _ctx.globalTemplates.sectionTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                          key: 0,
                          items: _ctx.globalTemplates.sectionTemplates,
                          "key-extractor": (item) => item.id,
                          onRemove: unref(sectionManager).removeTemplate,
                          onReorder: unref(sectionManager).onReorder
                        }, {
                          content: withCtx(({ item }) => [
                            createElementVNode("div", _hoisted_4$3, [
                              createElementVNode("div", _hoisted_5$3, [
                                _cache[3] || (_cache[3] = createElementVNode("label", null, "模板名称", -1)),
                                withDirectives(createElementVNode("input", {
                                  "onUpdate:modelValue": ($event) => item.name = $event,
                                  type: "text",
                                  placeholder: "输入模板名称"
                                }, null, 8, _hoisted_6$3), [
                                  [vModelText, item.name]
                                ])
                              ]),
                              createElementVNode("div", _hoisted_7$3, [
                                _cache[4] || (_cache[4] = createElementVNode("label", null, "Headline", -1)),
                                withDirectives(createElementVNode("input", {
                                  "onUpdate:modelValue": ($event) => item.headline = $event,
                                  type: "text",
                                  placeholder: "输入 Headline"
                                }, null, 8, _hoisted_8$3), [
                                  [vModelText, item.headline]
                                ])
                              ]),
                              createElementVNode("div", _hoisted_9$3, [
                                _cache[5] || (_cache[5] = createElementVNode("label", null, "Body", -1)),
                                withDirectives(createElementVNode("textarea", {
                                  "onUpdate:modelValue": ($event) => item.body = $event,
                                  rows: "1",
                                  placeholder: "输入 Body"
                                }, null, 8, _hoisted_10$3), [
                                  [vModelText, item.body]
                                ])
                              ])
                            ])
                          ]),
                          _: 1
                        }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_11$3, ' 暂无模板，点击"添加模板"创建 '))
                      ]),
                      _: 1,
                      __: [6]
                    })
                  ])) : activeTab.value === "changelog" ? (openBlock(), createElementBlock("div", _hoisted_12$3, [
                    createVNode(unref(SectionHeader), null, {
                      default: withCtx(() => [
                        _cache[10] || (_cache[10] = createElementVNode("p", { class: "form-hint" }, "可用变量: {date}, {content}", -1)),
                        _ctx.globalTemplates.changelogTemplates && _ctx.globalTemplates.changelogTemplates.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                          key: 0,
                          items: _ctx.globalTemplates.changelogTemplates,
                          "key-extractor": (item) => item.id,
                          onRemove: unref(changelogManager).removeTemplate,
                          onReorder: unref(changelogManager).onReorder
                        }, {
                          content: withCtx(({ item, index }) => [
                            createElementVNode("div", _hoisted_13$3, [
                              createElementVNode("div", _hoisted_14$3, [
                                _cache[7] || (_cache[7] = createElementVNode("label", null, "模板名称", -1)),
                                withDirectives(createElementVNode("input", {
                                  "onUpdate:modelValue": ($event) => item.name = $event,
                                  type: "text",
                                  placeholder: "输入模板名称"
                                }, null, 8, _hoisted_15$3), [
                                  [vModelText, item.name]
                                ])
                              ]),
                              createElementVNode("div", _hoisted_16$3, [
                                _cache[8] || (_cache[8] = createElementVNode("label", null, "模板内容", -1)),
                                withDirectives(createElementVNode("textarea", {
                                  "onUpdate:modelValue": ($event) => item.template = $event,
                                  rows: "1",
                                  placeholder: "输入模板内容"
                                }, null, 8, _hoisted_17$3), [
                                  [vModelText, item.template]
                                ])
                              ]),
                              createElementVNode("div", _hoisted_18$3, [
                                createElementVNode("label", _hoisted_19$3, [
                                  createElementVNode("input", {
                                    type: "checkbox",
                                    checked: item.isDefault,
                                    onChange: ($event) => unref(changelogManager).setDefaultTemplate(index)
                                  }, null, 40, _hoisted_20$3),
                                  _cache[9] || (_cache[9] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                                ])
                              ])
                            ])
                          ]),
                          _: 1
                        }, 8, ["items", "key-extractor", "onRemove", "onReorder"])) : (openBlock(), createElementBlock("div", _hoisted_21$3, ' 暂无模板，点击"添加模板"创建 '))
                      ]),
                      _: 1,
                      __: [10]
                    })
                  ])) : createCommentVNode("", true)
                ])
              ]),
              _: 1
            }, 8, ["show"]);
          };
        }
      });
      const _hoisted_1$2 = ["innerHTML"];
      const _hoisted_2$2 = {
        class: "be-flex be-flex-column",
        style: { "min-height": "400px" }
      };
      const _hoisted_3$2 = { class: "tab-nav" };
      const _hoisted_4$2 = { class: "tab-content" };
      const _hoisted_5$2 = {
        key: 0,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_6$2 = { class: "be-flex be-justify-end" };
      const _hoisted_7$2 = ["innerHTML"];
      const _hoisted_8$2 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_9$2 = ["onUpdate:modelValue"];
      const _hoisted_10$2 = { class: "form-group" };
      const _hoisted_11$2 = ["onUpdate:modelValue"];
      const _hoisted_12$2 = { class: "form-group" };
      const _hoisted_13$2 = ["onUpdate:modelValue"];
      const _hoisted_14$2 = {
        key: 1,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_15$2 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_16$2 = {
        key: 1,
        class: "be-grid be-grid-cols-2 be-gap-sm"
      };
      const _hoisted_17$2 = ["onClick"];
      const _hoisted_18$2 = { class: "be-text-md be-font-bold be-text-primary be-mb-sm" };
      const _hoisted_19$2 = { class: "be-text-sm be-text-secondary" };
      const _hoisted_20$2 = { class: "be-mb-xs be-whitespace-nowrap be-overflow-hidden be-text-ellipsis" };
      const _hoisted_21$2 = { class: "be-text-muted" };
      const _hoisted_22$2 = {
        key: 2,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_23$2 = { class: "be-flex be-justify-end" };
      const _hoisted_24$2 = ["innerHTML"];
      const _hoisted_25$2 = {
        key: 0,
        class: "form-group"
      };
      const _hoisted_26$2 = ["value"];
      const _hoisted_27$2 = {
        key: 1,
        class: "form-group"
      };
      const _hoisted_28$2 = ["value"];
      const _hoisted_29$2 = {
        key: 2,
        class: "empty-hint"
      };
      const _hoisted_30$2 = ["onUpdate:modelValue"];
      const _hoisted_31$2 = { class: "be-flex-1 be-text-sm be-text-secondary be-text-right" };
      const _hoisted_32$2 = ["onUpdate:modelValue"];
      const _hoisted_33$2 = ["innerHTML"];
      const _sfc_main$2 = /* @__PURE__ */ defineComponent({
        __name: "SectionsModal",
        props: {
          show: { type: Boolean },
          itemConfig: {},
          globalTemplates: {}
        },
        emits: ["close"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const activeTab = ref("templates");
          const showTemplateModal = ref(false);
          const selectedChangelogTemplate = computed(
            () => getSelectedChangelogTemplate(props.globalTemplates, props.itemConfig)
          );
          function addSectionTemplate() {
            props.globalTemplates.sectionTemplates.push({
              id: crypto.randomUUID(),
              name: "新模板",
              headline: "",
              body: ""
            });
          }
          function removeSectionTemplate(index) {
            props.globalTemplates.sectionTemplates.splice(index, 1);
          }
          function onTemplateReorder(fromIndex, toIndex) {
            const templates = props.globalTemplates.sectionTemplates;
            const [removed] = templates.splice(fromIndex, 1);
            templates.splice(toIndex, 0, removed);
          }
          function createFromTemplate(templateId) {
            const template = props.globalTemplates.sectionTemplates.find((t) => t.id === templateId);
            if (!template) return;
            props.itemConfig.sections.push(createSectionFromTemplate(template));
            emit("close");
          }
          function addChangelogEntry() {
            props.itemConfig.changelog.unshift({
              id: crypto.randomUUID(),
              date: Date.now(),
              type: "added",
              content: ""
            });
          }
          function removeChangelogEntry(index) {
            props.itemConfig.changelog.splice(index, 1);
          }
          function onChangelogReorder(fromIndex, toIndex) {
            const changelog = props.itemConfig.changelog;
            const [removed] = changelog.splice(fromIndex, 1);
            changelog.splice(toIndex, 0, removed);
          }
          function updateChangelogTemplate(event) {
            if (!props.globalTemplates.changelogTemplates || !props.itemConfig.selectedTemplates) return;
            const target = event.target;
            const template = props.globalTemplates.changelogTemplates.find(
              (t) => t.id === props.itemConfig.selectedTemplates.changelogTemplateId
            );
            if (template) {
              template.template = target.value;
            }
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(Modal, {
                show: _ctx.show,
                title: "Sections 高级配置",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[7] || (_cache[7] = ($event) => emit("close")),
                width: "700px"
              }, {
                "header-actions": withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                    onClick: _cache[0] || (_cache[0] = ($event) => showTemplateModal.value = true),
                    title: "模板配置",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).settings, 18)
                    }, null, 8, _hoisted_1$2)
                  ])
                ]),
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: _cache[6] || (_cache[6] = ($event) => emit("close")),
                    title: "关闭"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_33$2)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_2$2, [
                    createElementVNode("div", _hoisted_3$2, [
                      createElementVNode("button", {
                        class: normalizeClass(["tab-btn", { active: activeTab.value === "templates" }]),
                        onClick: _cache[1] || (_cache[1] = ($event) => activeTab.value = "templates")
                      }, " Section 模板库 ", 2),
                      createElementVNode("button", {
                        class: normalizeClass(["tab-btn", { active: activeTab.value === "create" }]),
                        onClick: _cache[2] || (_cache[2] = ($event) => activeTab.value = "create")
                      }, " 从模板创建 ", 2),
                      createElementVNode("button", {
                        class: normalizeClass(["tab-btn", { active: activeTab.value === "changelog" }]),
                        onClick: _cache[3] || (_cache[3] = ($event) => activeTab.value = "changelog")
                      }, " 更新日志 ", 2)
                    ]),
                    createElementVNode("div", _hoisted_4$2, [
                      activeTab.value === "templates" ? (openBlock(), createElementBlock("div", _hoisted_5$2, [
                        createElementVNode("div", _hoisted_6$2, [
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-sm booth-btn-primary",
                            onClick: addSectionTemplate,
                            title: "添加新的 Section 模板"
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(withSize)(unref(icons).plus, 14)
                            }, null, 8, _hoisted_7$2),
                            _cache[9] || (_cache[9] = createTextVNode(" 添加模板 ", -1))
                          ])
                        ]),
                        !_ctx.globalTemplates.sectionTemplates || _ctx.globalTemplates.sectionTemplates.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_8$2, ' 暂无模板，点击"添加模板"创建 ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                          key: 1,
                          items: _ctx.globalTemplates.sectionTemplates,
                          onRemove: removeSectionTemplate,
                          onReorder: onTemplateReorder
                        }, {
                          actions: withCtx(({ item: template }) => [
                            withDirectives(createElementVNode("input", {
                              "onUpdate:modelValue": ($event) => template.name = $event,
                              type: "text",
                              class: "be-flex-1 be-font-bold be-p-xs be-px-sm be-text-base",
                              style: { "height": "28px" },
                              placeholder: "模板名称"
                            }, null, 8, _hoisted_9$2), [
                              [vModelText, template.name]
                            ])
                          ]),
                          content: withCtx(({ item: template }) => [
                            createElementVNode("div", _hoisted_10$2, [
                              _cache[10] || (_cache[10] = createElementVNode("label", null, "Headline", -1)),
                              withDirectives(createElementVNode("input", {
                                "onUpdate:modelValue": ($event) => template.headline = $event,
                                type: "text",
                                placeholder: "支持变量: {itemName}, {supportCount}"
                              }, null, 8, _hoisted_11$2), [
                                [vModelText, template.headline]
                              ])
                            ]),
                            createElementVNode("div", _hoisted_12$2, [
                              _cache[11] || (_cache[11] = createElementVNode("label", null, "Body", -1)),
                              withDirectives(createElementVNode("textarea", {
                                "onUpdate:modelValue": ($event) => template.body = $event,
                                rows: "1",
                                placeholder: "支持变量: {itemName}, {supportCount}"
                              }, null, 8, _hoisted_13$2), [
                                [vModelText, template.body]
                              ])
                            ])
                          ]),
                          _: 1
                        }, 8, ["items"]))
                      ])) : createCommentVNode("", true),
                      activeTab.value === "create" ? (openBlock(), createElementBlock("div", _hoisted_14$2, [
                        _cache[12] || (_cache[12] = createElementVNode("p", { class: "be-m-0 be-pb-sm be-text-secondary" }, "选择一个模板来创建 Section 实例", -1)),
                        !_ctx.globalTemplates.sectionTemplates || _ctx.globalTemplates.sectionTemplates.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_15$2, ' 暂无模板，请先在"Section 模板库"中创建模板 ')) : (openBlock(), createElementBlock("div", _hoisted_16$2, [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.globalTemplates.sectionTemplates, (template) => {
                            return openBlock(), createElementBlock("div", {
                              key: template.id,
                              class: "be-p-sm be-border be-rounded be-cursor-pointer be-transition",
                              onClick: ($event) => createFromTemplate(template.id)
                            }, [
                              createElementVNode("div", _hoisted_18$2, toDisplayString(template.name), 1),
                              createElementVNode("div", _hoisted_19$2, [
                                createElementVNode("div", _hoisted_20$2, toDisplayString(template.headline || "(无标题)"), 1),
                                createElementVNode("div", _hoisted_21$2, toDisplayString(template.body || "(无内容)"), 1)
                              ])
                            ], 8, _hoisted_17$2);
                          }), 128))
                        ]))
                      ])) : createCommentVNode("", true),
                      activeTab.value === "changelog" ? (openBlock(), createElementBlock("div", _hoisted_22$2, [
                        createElementVNode("div", _hoisted_23$2, [
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-sm booth-btn-primary",
                            onClick: addChangelogEntry,
                            title: "添加新的更新日志"
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(withSize)(unref(icons).plus, 14)
                            }, null, 8, _hoisted_24$2),
                            _cache[13] || (_cache[13] = createTextVNode(" 添加更新 ", -1))
                          ])
                        ]),
                        _ctx.globalTemplates.changelogTemplates && _ctx.globalTemplates.changelogTemplates.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_25$2, [
                          _cache[14] || (_cache[14] = createElementVNode("label", null, "选择模板", -1)),
                          withDirectives(createElementVNode("select", {
                            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.itemConfig.selectedTemplates.changelogTemplateId = $event)
                          }, [
                            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.globalTemplates.changelogTemplates, (template) => {
                              return openBlock(), createElementBlock("option", {
                                key: template.id,
                                value: template.id
                              }, toDisplayString(template.name), 9, _hoisted_26$2);
                            }), 128))
                          ], 512), [
                            [vModelSelect, _ctx.itemConfig.selectedTemplates.changelogTemplateId]
                          ])
                        ])) : createCommentVNode("", true),
                        _ctx.globalTemplates.changelogTemplates && _ctx.globalTemplates.changelogTemplates.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_27$2, [
                          _cache[15] || (_cache[15] = createElementVNode("label", null, [
                            createTextVNode("模板内容 "),
                            createElementVNode("span", { class: "label-hint" }, "(编辑当前选中模板)")
                          ], -1)),
                          _cache[16] || (_cache[16] = createElementVNode("p", { class: "form-hint" }, "支持变量: {date}, {content}", -1)),
                          createElementVNode("textarea", {
                            value: selectedChangelogTemplate.value,
                            onInput: _cache[5] || (_cache[5] = ($event) => updateChangelogTemplate($event)),
                            rows: "2",
                            placeholder: "◆ {date}\n{content}"
                          }, null, 40, _hoisted_28$2)
                        ])) : (openBlock(), createElementBlock("div", _hoisted_29$2, " 请先在全局模板配置中添加更新日志模板 ")),
                        _ctx.itemConfig.changelog.length > 0 ? (openBlock(), createBlock(unref(DraggableCardList), {
                          key: 3,
                          items: _ctx.itemConfig.changelog,
                          onRemove: removeChangelogEntry,
                          onReorder: onChangelogReorder
                        }, {
                          actions: withCtx(({ item: entry }) => [
                            withDirectives(createElementVNode("select", {
                              "onUpdate:modelValue": ($event) => entry.type = $event,
                              class: "be-p-xs be-px-sm be-text-sm be-flex-shrink-0",
                              style: { "height": "24px", "width": "auto" }
                            }, _cache[17] || (_cache[17] = [
                              createElementVNode("option", { value: "release" }, "Released", -1),
                              createElementVNode("option", { value: "added" }, "Added", -1),
                              createElementVNode("option", { value: "fixed" }, "Fixed", -1),
                              createElementVNode("option", { value: "updated" }, "Updated", -1)
                            ]), 8, _hoisted_30$2), [
                              [vModelSelect, entry.type]
                            ]),
                            createElementVNode("span", _hoisted_31$2, toDisplayString(unref(formatDate)(entry.date)), 1)
                          ]),
                          content: withCtx(({ item: entry }) => [
                            withDirectives(createElementVNode("textarea", {
                              "onUpdate:modelValue": ($event) => entry.content = $event,
                              rows: "1",
                              placeholder: "更新内容"
                            }, null, 8, _hoisted_32$2), [
                              [vModelText, entry.content]
                            ])
                          ]),
                          _: 1
                        }, 8, ["items"])) : createCommentVNode("", true)
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(_sfc_main$3, {
                show: showTemplateModal.value,
                "global-templates": _ctx.globalTemplates,
                onClose: _cache[8] || (_cache[8] = ($event) => showTemplateModal.value = false)
              }, null, 8, ["show", "global-templates"])
            ], 64);
          };
        }
      });
      const _hoisted_1$1 = ["innerHTML"];
      const _hoisted_2$1 = { class: "be-flex be-flex-column be-gap-md" };
      const _hoisted_3$1 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_4$1 = {
        class: "be-flex be-align-center be-gap-sm",
        style: { "flex": "1" }
      };
      const _hoisted_5$1 = ["onUpdate:modelValue"];
      const _hoisted_6$1 = {
        key: 0,
        class: "booth-toggle",
        title: "将此 Variation 设为 Fullset（合集包）"
      };
      const _hoisted_7$1 = ["checked", "onChange"];
      const _hoisted_8$1 = { class: "be-flex be-align-center be-gap-sm" };
      const _hoisted_9$1 = {
        key: 0,
        class: "be-text-base be-text-primary"
      };
      const _hoisted_10$1 = { class: "be-text-base be-text-primary be-flex-shrink-0" };
      const _hoisted_11$1 = {
        class: "booth-toggle be-flex-shrink-0",
        title: "自定义此 Variation 的价格"
      };
      const _hoisted_12$1 = ["onUpdate:modelValue"];
      const _hoisted_13$1 = ["onUpdate:modelValue"];
      const _hoisted_14$1 = ["onUpdate:modelValue"];
      const _hoisted_15$1 = { class: "form-group" };
      const _hoisted_16$1 = { class: "form-group" };
      const _hoisted_17$1 = { class: "form-hint" };
      const _hoisted_18$1 = { class: "be-flex be-gap-sm be-flex-wrap" };
      const _hoisted_19$1 = { class: "be-p-xs be-px-sm be-text-sm be-text-secondary" };
      const _hoisted_20$1 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_21$1 = {
        class: "booth-toggle",
        title: "启用打折功能"
      };
      const _hoisted_22$1 = {
        key: 0,
        class: "be-flex be-flex-column be-gap-sm"
      };
      const _hoisted_23$1 = { class: "form-group" };
      const _hoisted_24$1 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_25$1 = { class: "be-flex be-justify-between be-align-center be-text-base" };
      const _hoisted_26$1 = { class: "be-text-primary be-font-bold" };
      const _hoisted_27$1 = { class: "be-flex be-justify-between be-align-center be-text-base" };
      const _hoisted_28$1 = { class: "be-text-primary be-font-bold" };
      const _hoisted_29$1 = ["innerHTML"];
      const _hoisted_30$1 = ["innerHTML"];
      const _hoisted_31$1 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_32$1 = { class: "be-m-0 be-text-base" };
      const _hoisted_33$1 = { class: "be-m-0 be-text-sm be-text-secondary" };
      const _hoisted_34$1 = ["innerHTML"];
      const _hoisted_35$1 = ["innerHTML"];
      const _sfc_main$1 = /* @__PURE__ */ defineComponent({
        __name: "VariationsModal",
        props: {
          show: { type: Boolean },
          itemConfig: {}
        },
        emits: ["close", "save"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const showFullsetConfirm = ref(false);
          const totalSupport = computed(() => calculateTotalSupport(props.itemConfig.variations));
          const hasFullset = computed(
            () => props.itemConfig.variations.some((v) => v.isFullset)
          );
          const suggestedPrice = computed(
            () => suggestFullsetPrice(
              props.itemConfig.pricing.normalVariationPrice,
              totalSupport.value,
              props.itemConfig.discount
            )
          );
          const normalOriginalPrice = computed(() => props.itemConfig.pricing.normalVariationPrice);
          const normalDiscountedPrice = computed(
            () => applyDiscount(normalOriginalPrice.value, props.itemConfig.discount)
          );
          const fullsetOriginalPrice = computed(() => props.itemConfig.pricing.fullsetPrice);
          const fullsetDiscountedPrice = computed(
            () => applyDiscount(fullsetOriginalPrice.value, props.itemConfig.discount)
          );
          function getVariationPrice(variation) {
            if (variation.isFullset) {
              return applyDiscount(props.itemConfig.pricing.fullsetPrice, props.itemConfig.discount);
            }
            if (variation.useCustomPrice && variation.customPrice !== void 0) {
              return applyDiscount(variation.customPrice, props.itemConfig.discount);
            }
            return applyDiscount(props.itemConfig.pricing.normalVariationPrice, props.itemConfig.discount);
          }
          function addVariation() {
            const price = applyDiscount(
              props.itemConfig.pricing.normalVariationPrice,
              props.itemConfig.discount
            );
            props.itemConfig.variations.push({
              name: "",
              supportCount: 1,
              price,
              isFullset: false,
              useCustomPrice: false
            });
          }
          function addFullsetVariation() {
            const existingFullsetIndex = props.itemConfig.variations.findIndex((v) => v.isFullset);
            if (existingFullsetIndex !== -1) {
              props.itemConfig.variations.splice(existingFullsetIndex, 1);
            }
            props.itemConfig.variations.unshift({
              name: "Fullset",
              supportCount: 0,
              price: suggestedPrice.value,
              isFullset: true
            });
          }
          function toggleFullset(variation, index) {
            if (variation.isFullset) {
              variation.isFullset = false;
              variation.supportCount = 1;
            } else {
              const existingFullsetIndex = props.itemConfig.variations.findIndex((v, i) => v.isFullset && i !== index);
              if (existingFullsetIndex !== -1) {
                const existingFullset = props.itemConfig.variations[existingFullsetIndex];
                existingFullset.isFullset = false;
                existingFullset.supportCount = 1;
              }
              variation.isFullset = true;
              variation.supportCount = 0;
            }
          }
          function handleAddVariation() {
            if (props.itemConfig.variations.length === 0 || !hasFullset.value) {
              showFullsetConfirm.value = true;
              return;
            }
            addVariation();
          }
          function confirmCreateFullset() {
            addFullsetVariation();
            showFullsetConfirm.value = false;
          }
          function cancelCreateFullset() {
            addVariation();
            showFullsetConfirm.value = false;
          }
          function removeVariation(index) {
            props.itemConfig.variations.splice(index, 1);
          }
          function onVariationReorder(fromIndex, toIndex) {
            const variations = props.itemConfig.variations;
            const [removed] = variations.splice(fromIndex, 1);
            variations.splice(toIndex, 0, removed);
          }
          function updateVariationPrice(variation) {
            if (variation.isFullset) {
              variation.price = applyDiscount(props.itemConfig.pricing.fullsetPrice, props.itemConfig.discount);
            } else if (variation.useCustomPrice && variation.customPrice !== void 0) {
              variation.price = applyDiscount(variation.customPrice, props.itemConfig.discount);
            } else {
              variation.price = applyDiscount(props.itemConfig.pricing.normalVariationPrice, props.itemConfig.discount);
            }
          }
          function handleSave() {
            props.itemConfig.variations.forEach((variation) => {
              variation.supportCount = Number(variation.supportCount) || 1;
              updateVariationPrice(variation);
            });
            emit("save");
            emit("close");
          }
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              createVNode(Modal, {
                show: _ctx.show,
                title: "Variation 配置",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[5] || (_cache[5] = ($event) => emit("close")),
                width: "700px"
              }, {
                "header-actions": withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                    onClick: handleAddVariation,
                    title: "添加",
                    type: "button"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).plus, 18)
                    }, null, 8, _hoisted_1$1)
                  ])
                ]),
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: _cache[4] || (_cache[4] = ($event) => emit("close")),
                    title: "取消"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_29$1)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: handleSave,
                    title: "保存"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_30$1)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_2$1, [
                    createVNode(unref(SectionHeader), { title: "Variations 管理" }, {
                      default: withCtx(() => [
                        _ctx.itemConfig.variations.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$1, ' 暂无 Variation，点击标题栏"添加"按钮添加 ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                          key: 1,
                          items: _ctx.itemConfig.variations,
                          onRemove: removeVariation,
                          onReorder: onVariationReorder
                        }, {
                          actions: withCtx(({ item: variation, index }) => [
                            createElementVNode("div", _hoisted_4$1, [
                              withDirectives(createElementVNode("input", {
                                "onUpdate:modelValue": ($event) => variation.name = $event,
                                type: "text",
                                class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                                style: { "height": "28px" },
                                placeholder: "Variation 名称"
                              }, null, 8, _hoisted_5$1), [
                                [vModelText, variation.name]
                              ]),
                              !hasFullset.value || variation.isFullset ? (openBlock(), createElementBlock("label", _hoisted_6$1, [
                                createElementVNode("input", {
                                  type: "checkbox",
                                  checked: variation.isFullset,
                                  onChange: ($event) => toggleFullset(variation, index)
                                }, null, 40, _hoisted_7$1),
                                _cache[7] || (_cache[7] = createElementVNode("span", { class: "toggle-slider" }, null, -1)),
                                _cache[8] || (_cache[8] = createElementVNode("span", { class: "toggle-label" }, "Fullset", -1))
                              ])) : createCommentVNode("", true)
                            ])
                          ]),
                          content: withCtx(({ item: variation }) => [
                            createElementVNode("div", _hoisted_8$1, [
                              variation.isFullset ? (openBlock(), createElementBlock("span", _hoisted_9$1, " ¥" + toDisplayString(getVariationPrice(variation)), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                                createElementVNode("span", _hoisted_10$1, " ¥" + toDisplayString(getVariationPrice(variation)), 1),
                                createElementVNode("label", _hoisted_11$1, [
                                  withDirectives(createElementVNode("input", {
                                    type: "checkbox",
                                    "onUpdate:modelValue": ($event) => variation.useCustomPrice = $event
                                  }, null, 8, _hoisted_12$1), [
                                    [vModelCheckbox, variation.useCustomPrice]
                                  ]),
                                  _cache[9] || (_cache[9] = createElementVNode("span", { class: "toggle-slider" }, null, -1))
                                ]),
                                variation.useCustomPrice ? withDirectives((openBlock(), createElementBlock("input", {
                                  key: 0,
                                  "onUpdate:modelValue": ($event) => variation.customPrice = $event,
                                  type: "number",
                                  class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                                  style: { "height": "28px", "min-width": "80px" },
                                  min: "0",
                                  placeholder: "价格"
                                }, null, 8, _hoisted_13$1)), [
                                  [
                                    vModelText,
                                    variation.customPrice,
                                    void 0,
                                    { number: true }
                                  ]
                                ]) : createCommentVNode("", true),
                                withDirectives(createElementVNode("input", {
                                  "onUpdate:modelValue": ($event) => variation.supportCount = $event,
                                  type: "number",
                                  class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                                  style: { "height": "28px", "min-width": "60px" },
                                  min: "1",
                                  placeholder: "数量"
                                }, null, 8, _hoisted_14$1), [
                                  [
                                    vModelText,
                                    variation.supportCount,
                                    void 0,
                                    { number: true }
                                  ]
                                ])
                              ], 64))
                            ])
                          ]),
                          _: 1
                        }, 8, ["items"]))
                      ]),
                      _: 1
                    }),
                    createVNode(unref(SectionHeader), { title: "价格配置" }, {
                      default: withCtx(() => [
                        createElementVNode("div", _hoisted_15$1, [
                          _cache[10] || (_cache[10] = createElementVNode("label", null, "普通 Variation 价格 (¥)", -1)),
                          withDirectives(createElementVNode("input", {
                            type: "number",
                            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.itemConfig.pricing.normalVariationPrice = $event),
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
                        createElementVNode("div", _hoisted_16$1, [
                          _cache[11] || (_cache[11] = createElementVNode("label", null, "Fullset 价格 (¥)", -1)),
                          createElementVNode("p", _hoisted_17$1, "建议: ¥" + toDisplayString(suggestedPrice.value), 1),
                          withDirectives(createElementVNode("input", {
                            type: "number",
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.itemConfig.pricing.fullsetPrice = $event),
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
                        createElementVNode("div", _hoisted_18$1, [
                          createElementVNode("span", _hoisted_19$1, [
                            _cache[12] || (_cache[12] = createTextVNode("总支持数: ", -1)),
                            createElementVNode("strong", null, toDisplayString(totalSupport.value), 1)
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createElementVNode("div", _hoisted_20$1, [
                      createElementVNode("label", _hoisted_21$1, [
                        withDirectives(createElementVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.itemConfig.discount.enabled = $event)
                        }, null, 512), [
                          [vModelCheckbox, _ctx.itemConfig.discount.enabled]
                        ]),
                        _cache[13] || (_cache[13] = createElementVNode("span", { class: "toggle-slider" }, null, -1)),
                        _cache[14] || (_cache[14] = createElementVNode("span", { class: "toggle-label" }, "启用打折", -1))
                      ]),
                      _ctx.itemConfig.discount.enabled ? (openBlock(), createElementBlock("div", _hoisted_22$1, [
                        createElementVNode("div", _hoisted_23$1, [
                          _cache[15] || (_cache[15] = createElementVNode("label", null, "折扣百分比 (%)", -1)),
                          withDirectives(createElementVNode("input", {
                            type: "number",
                            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.itemConfig.discount.discountPercent = $event),
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
                        createElementVNode("div", _hoisted_24$1, [
                          _cache[18] || (_cache[18] = createElementVNode("div", { class: "be-text-sm be-font-bold be-text-secondary" }, "价格预览", -1)),
                          createElementVNode("div", _hoisted_25$1, [
                            _cache[16] || (_cache[16] = createElementVNode("span", { class: "be-text-secondary be-font-medium" }, "普通 Variation:", -1)),
                            createElementVNode("span", _hoisted_26$1, " ¥" + toDisplayString(normalOriginalPrice.value) + " → ¥" + toDisplayString(normalDiscountedPrice.value), 1)
                          ]),
                          createElementVNode("div", _hoisted_27$1, [
                            _cache[17] || (_cache[17] = createElementVNode("span", { class: "be-text-secondary be-font-medium" }, "Fullset:", -1)),
                            createElementVNode("span", _hoisted_28$1, " ¥" + toDisplayString(fullsetOriginalPrice.value) + " → ¥" + toDisplayString(fullsetDiscountedPrice.value), 1)
                          ])
                        ])
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ]),
                _: 1
              }, 8, ["show"]),
              createVNode(Modal, {
                show: showFullsetConfirm.value,
                title: "创建 Fullset",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[6] || (_cache[6] = ($event) => showFullsetConfirm.value = false),
                width: "400px"
              }, {
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-secondary",
                    onClick: cancelCreateFullset,
                    title: "创建普通 Variation"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).close, 18)
                    }, null, 8, _hoisted_34$1)
                  ]),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                    onClick: confirmCreateFullset,
                    title: "创建 Fullset"
                  }, [
                    createElementVNode("span", {
                      innerHTML: unref(withSize)(unref(icons).check, 18)
                    }, null, 8, _hoisted_35$1)
                  ])
                ]),
                default: withCtx(() => [
                  createElementVNode("div", _hoisted_31$1, [
                    createElementVNode("p", _hoisted_32$1, toDisplayString(_ctx.itemConfig.variations.length === 0 ? "这是第一个 Variation，是否创建 Fullset？" : "当前没有 Fullset，是否创建 Fullset？"), 1),
                    createElementVNode("p", _hoisted_33$1, " Fullset 将包含所有支持的商品，建议价格为 ¥" + toDisplayString(suggestedPrice.value), 1)
                  ])
                ]),
                _: 1
              }, 8, ["show"])
            ], 64);
          };
        }
      });
      const _hoisted_1 = ["innerHTML"];
      const _hoisted_2 = { key: 0 };
      const _hoisted_3 = { class: "form-group" };
      const _hoisted_4 = { class: "form-group" };
      const _hoisted_5 = { key: 1 };
      const _hoisted_6 = { class: "be-text-base be-font-normal be-whitespace-pre-wrap be-break-words be-m-0" };
      const _hoisted_7 = ["innerHTML"];
      const _hoisted_8 = ["disabled"];
      const _hoisted_9 = ["innerHTML"];
      const _hoisted_10 = ["innerHTML"];
      const _hoisted_11 = {
        key: 1,
        class: "empty-state"
      };
      const _hoisted_12 = ["innerHTML"];
      const _hoisted_13 = {
        key: 2,
        class: "empty-state"
      };
      const _hoisted_14 = ["innerHTML"];
      const _hoisted_15 = ["innerHTML"];
      const _hoisted_16 = {
        key: 3,
        class: "edit-tab"
      };
      const _hoisted_17 = { class: "edit-tab-scrollable" };
      const _hoisted_18 = ["innerHTML"];
      const _hoisted_19 = ["innerHTML"];
      const _hoisted_20 = { class: "form-group" };
      const _hoisted_21 = { class: "be-flex be-justify-between be-align-center" };
      const _hoisted_22 = { class: "be-text-xs be-text-secondary" };
      const _hoisted_23 = ["innerHTML"];
      const _hoisted_24 = ["innerHTML"];
      const _hoisted_25 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_26 = {
        key: 1,
        class: "be-mt-xs"
      };
      const _hoisted_27 = { class: "be-text-base be-font-normal be-whitespace-pre-wrap be-break-words be-m-0" };
      const _hoisted_28 = ["innerHTML"];
      const _hoisted_29 = ["innerHTML"];
      const _hoisted_30 = ["innerHTML"];
      const _hoisted_31 = ["innerHTML"];
      const _hoisted_32 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_33 = ["onUpdate:modelValue"];
      const _hoisted_34 = ["onClick"];
      const _hoisted_35 = ["innerHTML"];
      const _hoisted_36 = { class: "form-group" };
      const _hoisted_37 = ["onUpdate:modelValue"];
      const _hoisted_38 = ["innerHTML"];
      const _hoisted_39 = ["innerHTML"];
      const _hoisted_40 = ["innerHTML"];
      const _hoisted_41 = {
        key: 0,
        class: "empty-hint"
      };
      const _hoisted_42 = ["onUpdate:modelValue"];
      const _hoisted_43 = { class: "variation-info" };
      const _hoisted_44 = { class: "variation-details" };
      const _hoisted_45 = { class: "support" };
      const _hoisted_46 = { class: "price" };
      const _hoisted_47 = {
        key: 0,
        class: "badge"
      };
      const _hoisted_48 = { class: "be-flex be-flex-column be-gap-sm" };
      const _hoisted_49 = { class: "be-text-base be-font-bold be-text-primary" };
      const _hoisted_50 = { class: "be-text-base be-text-secondary be-whitespace-pre-wrap be-break-words be-m-0" };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "EditTab",
        props: {
          api: {}
        },
        setup(__props) {
          const props = __props;
          const { data } = useStorage();
          const modal = useModal();
          const modalState = computed(() => modal.state.value);
          const isPreviewModal = computed(
            () => {
              var _a;
              return modalState.value.type === "alert" && ((_a = modalState.value.formData) == null ? void 0 : _a.sectionIndex) !== void 0;
            }
          );
          const previewSectionIndex = computed(
            () => {
              var _a;
              return (_a = modalState.value.formData) == null ? void 0 : _a.sectionIndex;
            }
          );
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
            var _a;
            return {
              itemName: ((_a = currentItemConfig.value) == null ? void 0 : _a.itemName) || "",
              supportCount: totalSupport.value
            };
          });
          const previewName = computed(() => {
            if (!currentItemConfig.value) return "";
            const template = getSelectedNameTemplate(globalTemplates.value, currentItemConfig.value);
            return parseTemplate(template, templateVars.value);
          });
          const previewDescription = computed(() => {
            if (!currentItemConfig.value) return "";
            const parts = [];
            const descTemplate = getSelectedDescriptionTemplate(globalTemplates.value, currentItemConfig.value);
            const templateDesc = parseTemplate(descTemplate, templateVars.value);
            if (templateDesc) parts.push(templateDesc);
            if (currentItemConfig.value.customDescription) {
              parts.push(currentItemConfig.value.customDescription);
            }
            if (currentItemConfig.value.discount.enabled) {
              const normalOriginalPrice = currentItemConfig.value.pricing.normalVariationPrice;
              const normalDiscountedPrice = applyDiscount(
                normalOriginalPrice,
                currentItemConfig.value.discount
              );
              const discountTemplate = getSelectedDiscountTemplate(globalTemplates.value, currentItemConfig.value);
              const discountText = parseTemplate(
                discountTemplate,
                {
                  ...templateVars.value,
                  originalPrice: normalOriginalPrice,
                  discountedPrice: normalDiscountedPrice,
                  discountPercent: currentItemConfig.value.discount.discountPercent
                }
              );
              parts.push(discountText);
            }
            return parts.join("\n\n");
          });
          const resolvedSections = computed(() => {
            if (!currentItemConfig.value) return [];
            return currentItemConfig.value.sections.map((section) => {
              const resolved = resolveSectionContent(section, globalTemplates.value.sectionTemplates);
              return {
                headline: parseTemplate(resolved.headline, templateVars.value),
                body: parseTemplate(resolved.body, templateVars.value)
              };
            });
          });
          const showNameModal = ref(false);
          const showSectionsModal = ref(false);
          const showPriceModal = ref(false);
          const showDescTemplateModal = ref(false);
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
          async function handlePreviewSection(index) {
            modal.state.value.formData = { sectionIndex: index };
            modal.state.value.type = "alert";
            modal.state.value.title = "Section 预览";
            modal.state.value.show = false;
            await nextTick();
            modal.state.value.show = true;
          }
          async function handleEditDescription() {
            if (!currentItemConfig.value) return;
            const descTemplate = getSelectedDescriptionTemplate(data.value.globalTemplates, currentItemConfig.value);
            const result = await modal.openModal({
              type: "editDescription",
              title: "编辑描述",
              formData: {
                descriptionTemplate: descTemplate,
                customDescription: currentItemConfig.value.customDescription
              }
            });
            if (result) {
              const templateId = currentItemConfig.value.selectedTemplates.descriptionTemplateId;
              const template = data.value.globalTemplates.descriptionTemplates.find((t) => t.id === templateId);
              if (template) {
                template.template = result.descriptionTemplate;
              }
              data.value.itemConfigs[currentItemId.value].customDescription = result.customDescription;
            }
          }
          function importSections() {
            if (!currentItemConfig.value) return;
            const pageSections = props.api.sections;
            if (pageSections.length === 0) {
              toast.info("页面没有 Sections");
              return;
            }
            currentItemConfig.value.sections = pageSections.map(() => ({
              id: crypto.randomUUID(),
              headline: "",
              body: ""
            }));
            pageSections.forEach((section, index) => {
              var _a, _b, _c;
              const targetSection = (_a = currentItemConfig.value) == null ? void 0 : _a.sections[index];
              if (targetSection) {
                targetSection.headline = ((_b = section.headlineInput) == null ? void 0 : _b.value) || "";
                targetSection.body = ((_c = section.bodyTextarea) == null ? void 0 : _c.value) || "";
              }
            });
            toast.success(`已导入 ${pageSections.length} 个 Sections`);
          }
          function importVariations() {
            if (!currentItemConfig.value) return;
            const pageVariations = props.api.variations;
            if (pageVariations.length === 0) {
              toast.info("页面没有 Variations");
              return;
            }
            currentItemConfig.value.variations = pageVariations.map((variation) => {
              var _a, _b;
              const name = ((_a = variation.nameInput) == null ? void 0 : _a.value) || "";
              const isFullset = name.toLowerCase().includes("fullset");
              const priceStr = ((_b = variation.priceInput) == null ? void 0 : _b.value) || "0";
              const price = parseInt(priceStr.replace(/\D/g, "")) || 0;
              return {
                name,
                supportCount: 1,
                price,
                isFullset
              };
            });
            toast.success(`已导入 ${pageVariations.length} 个 Variations`);
          }
          function addSection() {
            if (!currentItemConfig.value) return;
            currentItemConfig.value.sections.push({
              id: crypto.randomUUID(),
              headline: "",
              body: ""
            });
          }
          function removeSection(index) {
            if (!currentItemConfig.value) return;
            currentItemConfig.value.sections.splice(index, 1);
          }
          function applyName() {
            if (!currentItemConfig.value) return;
            props.api.setName(previewName.value);
            toast.success("已应用商品名");
          }
          function applyDescription() {
            if (!currentItemConfig.value) return;
            props.api.setDescription(previewDescription.value);
            toast.success("已应用描述");
          }
          function applySections() {
            if (!currentItemConfig.value) return;
            resolvedSections.value.forEach((section, index) => {
              props.api.updateSection(index, {
                headline: section.headline,
                body: section.body
              });
            });
            toast.success(`已应用 ${resolvedSections.value.length} 个 Sections`);
          }
          function applyVariations() {
            if (!currentItemConfig.value) return;
            currentItemConfig.value.variations.forEach((variation, index) => {
              props.api.updateVariation(index, {
                name: variation.name,
                price: variation.price.toString()
              });
            });
            toast.success(`已应用 ${currentItemConfig.value.variations.length} 个 Variations`);
          }
          function onSectionReorder(fromIndex, toIndex) {
            if (!currentItemConfig.value) return;
            const [removed] = currentItemConfig.value.sections.splice(fromIndex, 1);
            currentItemConfig.value.sections.splice(toIndex, 0, removed);
          }
          function removeVariation(index) {
            if (!currentItemConfig.value) return;
            currentItemConfig.value.variations.splice(index, 1);
          }
          function onVariationReorder(fromIndex, toIndex) {
            if (!currentItemConfig.value) return;
            const [removed] = currentItemConfig.value.variations.splice(fromIndex, 1);
            currentItemConfig.value.variations.splice(toIndex, 0, removed);
          }
          watch(
            () => {
              var _a;
              return (_a = currentItemConfig.value) == null ? void 0 : _a.discount;
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
          watch(
            () => {
              var _a;
              return (_a = currentItemConfig.value) == null ? void 0 : _a.pricing;
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
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock(Fragment, null, [
              !isPreviewModal.value ? (openBlock(), createBlock(unref(Modal), {
                key: 0,
                show: modalState.value.show,
                title: modalState.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(modal).closeModal,
                width: "500px"
              }, {
                "header-actions": withCtx(() => [
                  modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                    onClick: _cache[0] || (_cache[0] = ($event) => showDescTemplateModal.value = true),
                    title: "模板配置",
                    type: "button"
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
                      onClick: _cache[6] || (_cache[6] = //@ts-ignore
                      (...args) => unref(modal).closeModal && unref(modal).closeModal(...args)),
                      title: "取消"
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).close, 18)
                      }, null, 8, _hoisted_7)
                    ]),
                    modalState.value.type === "createItem" ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      onClick: _cache[7] || (_cache[7] = ($event) => unref(modal).confirmModal(modalState.value.formData)),
                      disabled: !((_a = modalState.value.formData.itemName) == null ? void 0 : _a.trim()),
                      title: "创建配置"
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_9)
                    ], 8, _hoisted_8)) : modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("button", {
                      key: 1,
                      class: "booth-btn booth-btn-md booth-btn-icon booth-btn-primary",
                      onClick: _cache[8] || (_cache[8] = ($event) => unref(modal).confirmModal(modalState.value.formData)),
                      title: "保存"
                    }, [
                      createElementVNode("span", {
                        innerHTML: unref(withSize)(unref(icons).check, 18)
                      }, null, 8, _hoisted_10)
                    ])) : createCommentVNode("", true)
                  ];
                }),
                default: withCtx(() => [
                  modalState.value.type === "createItem" ? (openBlock(), createElementBlock("div", _hoisted_2, [
                    _cache[22] || (_cache[22] = createElementVNode("p", { class: "hint-text" }, " 为当前商品创建编辑配置，配置后可以管理商品名称、描述、Sections 和 Variations。 ", -1)),
                    createElementVNode("div", _hoisted_3, [
                      _cache[19] || (_cache[19] = createElementVNode("label", null, [
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
                      _cache[21] || (_cache[21] = createElementVNode("label", null, "商品类型", -1)),
                      withDirectives(createElementVNode("select", {
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => modalState.value.formData.itemType = $event)
                      }, _cache[20] || (_cache[20] = [
                        createElementVNode("option", { value: "normal" }, "普通商品", -1),
                        createElementVNode("option", { value: "adaptation" }, "适配商品", -1)
                      ]), 512), [
                        [vModelSelect, modalState.value.formData.itemType]
                      ])
                    ])
                  ])) : modalState.value.type === "editDescription" ? (openBlock(), createElementBlock("div", _hoisted_5, [
                    createVNode(unref(SectionHeader), { title: "描述模板 (全局)" }, {
                      default: withCtx(() => [
                        _cache[23] || (_cache[23] = createElementVNode("p", { class: "form-hint" }, "支持变量: {itemName}, {supportCount}", -1)),
                        withDirectives(createElementVNode("textarea", {
                          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => modalState.value.formData.descriptionTemplate = $event),
                          rows: "2",
                          placeholder: "全局描述模板"
                        }, null, 512), [
                          [vModelText, modalState.value.formData.descriptionTemplate]
                        ])
                      ]),
                      _: 1,
                      __: [23]
                    }),
                    createVNode(unref(SectionHeader), { title: "自定义描述 (此商品专属)" }, {
                      default: withCtx(() => [
                        withDirectives(createElementVNode("textarea", {
                          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => modalState.value.formData.customDescription = $event),
                          rows: "3",
                          placeholder: "输入此商品的特殊说明..."
                        }, null, 512), [
                          [vModelText, modalState.value.formData.customDescription]
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(unref(SectionHeader), { title: "最终描述预览" }, {
                      default: withCtx(() => [
                        createElementVNode("pre", _hoisted_6, toDisplayString(previewDescription.value), 1)
                      ]),
                      _: 1
                    })
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])) : createCommentVNode("", true),
              !currentItemId.value ? (openBlock(), createElementBlock("div", _hoisted_11, [
                createElementVNode("div", {
                  class: "empty-icon",
                  innerHTML: unref(withSize)(unref(icons).alertCircle, 48)
                }, null, 8, _hoisted_12),
                _cache[24] || (_cache[24] = createElementVNode("div", { class: "be-text-lg be-font-bold" }, "无法获取商品 ID", -1)),
                _cache[25] || (_cache[25] = createElementVNode("p", null, "请确保在商品编辑页面使用此功能", -1))
              ])) : !hasConfig.value ? (openBlock(), createElementBlock("div", _hoisted_13, [
                createElementVNode("div", {
                  class: "empty-icon",
                  innerHTML: unref(withSize)(unref(icons).file, 64)
                }, null, 8, _hoisted_14),
                _cache[27] || (_cache[27] = createElementVNode("div", { class: "be-text-lg be-font-bold" }, "未配置此商品", -1)),
                _cache[28] || (_cache[28] = createElementVNode("p", null, "为当前商品创建编辑配置，开始管理商品信息", -1)),
                createElementVNode("button", {
                  class: "booth-btn booth-btn-lg booth-btn-primary",
                  onClick: handleCreateItem
                }, [
                  createElementVNode("span", {
                    innerHTML: unref(withSize)(unref(icons).plus, 16)
                  }, null, 8, _hoisted_15),
                  _cache[26] || (_cache[26] = createTextVNode(" 创建商品配置 ", -1))
                ])
              ])) : currentItemConfig.value ? (openBlock(), createElementBlock("div", _hoisted_16, [
                createElementVNode("div", _hoisted_17, [
                  createVNode(unref(SectionHeader), { title: "商品名称" }, {
                    actions: withCtx(() => [
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-secondary",
                        onClick: _cache[9] || (_cache[9] = ($event) => showNameModal.value = true),
                        title: "模板设置"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_18)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-primary",
                        onClick: applyName,
                        title: "应用到页面"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).send, 14)
                        }, null, 8, _hoisted_19)
                      ])
                    ]),
                    default: withCtx(() => [
                      createElementVNode("div", _hoisted_20, [
                        createElementVNode("div", _hoisted_21, [
                          _cache[29] || (_cache[29] = createElementVNode("label", null, "商品基础名称", -1)),
                          createElementVNode("span", _hoisted_22, toDisplayString(previewName.value || "(未设置)"), 1)
                        ]),
                        withDirectives(createElementVNode("input", {
                          "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => currentItemConfig.value.itemName = $event),
                          type: "text",
                          placeholder: "输入商品名称"
                        }, null, 512), [
                          [vModelText, currentItemConfig.value.itemName]
                        ])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(unref(SectionHeader), { title: "商品描述" }, {
                    actions: withCtx(() => [
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-secondary",
                        onClick: handleEditDescription,
                        title: "编辑描述"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_23)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-primary",
                        onClick: applyDescription,
                        title: "应用到页面"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).send, 14)
                        }, null, 8, _hoisted_24)
                      ])
                    ]),
                    default: withCtx(() => [
                      !previewDescription.value ? (openBlock(), createElementBlock("div", _hoisted_25, ' 暂无描述，点击"编辑描述"添加 ')) : (openBlock(), createElementBlock("div", _hoisted_26, [
                        createElementVNode("pre", _hoisted_27, toDisplayString(previewDescription.value), 1)
                      ]))
                    ]),
                    _: 1
                  }),
                  createVNode(unref(SectionHeader), {
                    title: `Sections (${currentItemConfig.value.sections.length})`
                  }, {
                    actions: withCtx(() => [
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-ghost",
                        onClick: importSections,
                        title: "从页面导入"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).download, 14)
                        }, null, 8, _hoisted_28)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-secondary",
                        onClick: addSection,
                        title: "添加"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).plus, 14)
                        }, null, 8, _hoisted_29)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-secondary",
                        onClick: _cache[11] || (_cache[11] = ($event) => showSectionsModal.value = true),
                        title: "高级配置"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_30)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-primary",
                        onClick: applySections,
                        title: "应用到页面"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).send, 14)
                        }, null, 8, _hoisted_31)
                      ])
                    ]),
                    default: withCtx(() => [
                      currentItemConfig.value.sections.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_32, ' 暂无 Sections，点击"添加"或"从页面导入" ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 1,
                        items: currentItemConfig.value.sections,
                        onRemove: removeSection,
                        onReorder: onSectionReorder
                      }, {
                        actions: withCtx(({ item: section, index }) => [
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => section.headline = $event,
                            type: "text",
                            class: "be-flex-1 be-p-xs be-px-sm be-text-base be-min-w-0",
                            style: { "height": "28px" },
                            placeholder: "输入 Headline"
                          }, null, 8, _hoisted_33), [
                            [vModelText, section.headline]
                          ]),
                          createElementVNode("button", {
                            class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                            onClick: withModifiers(($event) => handlePreviewSection(index), ["stop", "prevent"]),
                            title: "预览",
                            type: "button"
                          }, [
                            createElementVNode("span", {
                              innerHTML: unref(withSize)(unref(icons).eye, 14)
                            }, null, 8, _hoisted_35)
                          ], 8, _hoisted_34)
                        ]),
                        content: withCtx(({ item: section }) => [
                          createElementVNode("div", _hoisted_36, [
                            withDirectives(createElementVNode("textarea", {
                              "onUpdate:modelValue": ($event) => section.body = $event,
                              rows: "1",
                              placeholder: "输入 Body"
                            }, null, 8, _hoisted_37), [
                              [vModelText, section.body]
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["items"]))
                    ]),
                    _: 1
                  }, 8, ["title"]),
                  createVNode(unref(SectionHeader), {
                    title: `Variations (${currentItemConfig.value.variations.length})`
                  }, {
                    actions: withCtx(() => [
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-ghost",
                        onClick: importVariations,
                        title: "从页面导入"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).download, 14)
                        }, null, 8, _hoisted_38)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-secondary",
                        onClick: _cache[12] || (_cache[12] = ($event) => showPriceModal.value = true),
                        title: "Variation 配置"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).edit, 14)
                        }, null, 8, _hoisted_39)
                      ]),
                      createElementVNode("button", {
                        class: "booth-btn booth-btn-sm booth-btn-primary",
                        onClick: applyVariations,
                        title: "应用到页面"
                      }, [
                        createElementVNode("span", {
                          innerHTML: unref(withSize)(unref(icons).send, 14)
                        }, null, 8, _hoisted_40)
                      ])
                    ]),
                    default: withCtx(() => [
                      currentItemConfig.value.variations.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_41, ' 暂无 Variations，点击"编辑价格"添加 ')) : (openBlock(), createBlock(unref(DraggableCardList), {
                        key: 1,
                        items: currentItemConfig.value.variations,
                        onRemove: removeVariation,
                        onReorder: onVariationReorder
                      }, {
                        actions: withCtx(({ item: variation }) => [
                          withDirectives(createElementVNode("input", {
                            "onUpdate:modelValue": ($event) => variation.name = $event,
                            type: "text",
                            class: "be-flex-1 be-p-xs be-px-sm be-text-base",
                            style: { "height": "28px" },
                            placeholder: "Variation 名称"
                          }, null, 8, _hoisted_42), [
                            [vModelText, variation.name]
                          ])
                        ]),
                        content: withCtx(({ item: variation }) => [
                          createElementVNode("div", _hoisted_43, [
                            createElementVNode("div", _hoisted_44, [
                              createElementVNode("span", _hoisted_45, "x" + toDisplayString(variation.supportCount), 1),
                              createElementVNode("span", _hoisted_46, "¥" + toDisplayString(variation.price), 1),
                              variation.isFullset ? (openBlock(), createElementBlock("span", _hoisted_47, "Fullset")) : createCommentVNode("", true)
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["items"]))
                    ]),
                    _: 1
                  }, 8, ["title"])
                ]),
                createVNode(_sfc_main$4, {
                  show: showNameModal.value,
                  "item-config": currentItemConfig.value,
                  "global-templates": globalTemplates.value,
                  "total-support": totalSupport.value,
                  onClose: _cache[13] || (_cache[13] = ($event) => showNameModal.value = false),
                  onSave: _cache[14] || (_cache[14] = ($event) => showNameModal.value = false)
                }, null, 8, ["show", "item-config", "global-templates", "total-support"]),
                createVNode(_sfc_main$2, {
                  show: showSectionsModal.value,
                  "item-config": currentItemConfig.value,
                  "global-templates": globalTemplates.value,
                  onClose: _cache[15] || (_cache[15] = ($event) => showSectionsModal.value = false)
                }, null, 8, ["show", "item-config", "global-templates"]),
                createVNode(_sfc_main$1, {
                  show: showPriceModal.value,
                  "item-config": currentItemConfig.value,
                  onClose: _cache[16] || (_cache[16] = ($event) => showPriceModal.value = false),
                  onSave: _cache[17] || (_cache[17] = ($event) => showPriceModal.value = false)
                }, null, 8, ["show", "item-config"]),
                isPreviewModal.value ? (openBlock(), createBlock(unref(Modal), {
                  key: 0,
                  show: modalState.value.show,
                  title: modalState.value.title,
                  width: "500px",
                  "teleport-to": ".booth-enhancer-sidebar",
                  onClose: unref(modal).closeModal
                }, {
                  default: withCtx(() => [
                    previewSectionIndex.value !== void 0 && resolvedSections.value[previewSectionIndex.value] ? (openBlock(), createBlock(unref(SectionHeader), {
                      key: 0,
                      "no-border": ""
                    }, {
                      default: withCtx(() => [
                        createElementVNode("div", _hoisted_48, [
                          createElementVNode("div", null, [
                            _cache[30] || (_cache[30] = createElementVNode("div", { class: "be-text-xs be-font-medium be-text-secondary be-mb-xs" }, "Headline", -1)),
                            createElementVNode("div", _hoisted_49, toDisplayString(resolvedSections.value[previewSectionIndex.value].headline), 1)
                          ]),
                          createElementVNode("div", null, [
                            createElementVNode("pre", _hoisted_50, toDisplayString(resolvedSections.value[previewSectionIndex.value].body), 1)
                          ])
                        ])
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  _: 1
                }, 8, ["show", "title", "onClose"])) : createCommentVNode("", true),
                createVNode(_sfc_main$6, {
                  show: showDescTemplateModal.value,
                  "global-templates": globalTemplates.value,
                  onClose: _cache[18] || (_cache[18] = ($event) => showDescTemplateModal.value = false)
                }, null, 8, ["show", "global-templates"])
              ])) : createCommentVNode("", true)
            ], 64);
          };
        }
      });
      const EditTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f59e0ed0"]]));

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