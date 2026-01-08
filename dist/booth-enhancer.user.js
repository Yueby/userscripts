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

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const a=document.createElement("style");a.textContent=e,document.head.append(a)})(' .icon-btn[data-v-996dd7d2]{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:#64748b;border-radius:6px;cursor:pointer;transition:all .15s ease;padding:0}.icon-btn[data-v-996dd7d2] svg{width:18px;height:18px;stroke-width:2}.icon-btn[data-v-996dd7d2]:hover{background:#f1f5f9;color:#475569;border-color:#e2e8f0;transform:translateY(-1px)}.icon-btn[data-v-996dd7d2]:active{transform:translateY(1px)}.icon-btn.variant-danger[data-v-996dd7d2]{color:#64748b}.icon-btn.variant-danger[data-v-996dd7d2]:hover{background:#fef2f2;color:#ef4444;border-color:#fee2e2}.modal-overlay[data-v-b90a005d]{position:fixed;top:0;right:0;bottom:0;left:0;background:#00000080;display:flex;align-items:flex-end;justify-content:center;z-index:10000;padding:0;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}.modal-overlay.modal-in-sidebar[data-v-b90a005d]{position:absolute;z-index:2000}.modal-container[data-v-b90a005d]{background:#fff;border-radius:16px 16px 0 0;box-shadow:0 10px 25px #0003;width:100%;max-width:500px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden}.modal-header[data-v-b90a005d]{padding:16px 20px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#f8fafc}.modal-title[data-v-b90a005d]{margin:0;font-size:16px;font-weight:600;color:#374151}.modal-header .booth-btn[data-v-b90a005d] svg{width:18px;height:18px;stroke-width:2}.modal-body[data-v-b90a005d]{padding:20px;overflow-y:auto;flex:1;min-height:0;font-size:13px;color:#374151}.modal-footer[data-v-b90a005d]{padding:16px 20px;border-top:1px solid #e5e7eb;display:flex;gap:12px;justify-content:flex-end;flex-shrink:0;background:#f8fafc}.modal-footer .booth-btn[data-v-b90a005d]{flex:1;min-width:80px}.modal-enter-active[data-v-b90a005d],.modal-leave-active[data-v-b90a005d]{transition:opacity .3s ease}.modal-enter-active .modal-container[data-v-b90a005d],.modal-leave-active .modal-container[data-v-b90a005d]{transition:transform .3s ease}.modal-enter-from[data-v-b90a005d],.modal-leave-to[data-v-b90a005d]{opacity:0}.modal-enter-from .modal-container[data-v-b90a005d],.modal-leave-to .modal-container[data-v-b90a005d]{transform:translateY(100%)}.modal-body[data-v-b90a005d]::-webkit-scrollbar{width:6px}.modal-body[data-v-b90a005d]::-webkit-scrollbar-track{background:#f5f5f5}.modal-body[data-v-b90a005d]::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-body[data-v-b90a005d]::-webkit-scrollbar-thumb:hover{background:#999}.tab-bar[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb}.tab-list[data-v-ee7eccb8]{display:flex;gap:2px}.tab-btn[data-v-ee7eccb8]{padding:6px 12px;border:1px solid transparent;background:transparent;cursor:pointer;font-size:12px;color:#6b7280;border-radius:6px;transition:all .15s ease;display:flex;align-items:center;gap:6px;font-weight:500}.tab-btn[data-v-ee7eccb8]:hover:not(.active){background:#f3f4f6;color:#374151}.tab-btn.active[data-v-ee7eccb8]{background:#fff;color:#3b82f6;font-weight:600;box-shadow:0 1px 2px #00000014}.tab-icon[data-v-ee7eccb8]{display:flex;align-items:center;justify-content:center}.tab-icon[data-v-ee7eccb8] svg{width:13px;height:13px}.tab-label[data-v-ee7eccb8]{white-space:nowrap}.tab-actions[data-v-ee7eccb8]{display:flex;align-items:center;gap:4px}.tree-item[data-v-4d1147ae]{-webkit-user-select:none;user-select:none}.tree-node-wrapper[data-v-4d1147ae]{position:relative;transition:all .15s ease}.tree-node-wrapper[draggable=true][data-v-4d1147ae]{cursor:move}.tree-node-wrapper[data-v-4d1147ae]:active{cursor:grabbing}.tree-node-wrapper.drag-over-inside[data-v-4d1147ae]{background:#eff6ff;border-radius:4px}.tree-node-wrapper.drag-over-inside[data-v-4d1147ae]:before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;border:2px solid #3b82f6;border-radius:4px;pointer-events:none;animation:pulse-4d1147ae 1s ease-in-out infinite}@keyframes pulse-4d1147ae{0%,to{opacity:1}50%{opacity:.5}}.drop-indicator[data-v-4d1147ae]{position:relative;height:2px;margin:2px 0;pointer-events:none}.drop-indicator[data-v-4d1147ae]:before{content:"";position:absolute;left:0;right:0;height:2px;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.drop-indicator[data-v-4d1147ae]:after{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#3b82f6;box-shadow:0 0 4px #3b82f680}.node-item[data-v-4d1147ae]{border-bottom:1px solid rgba(0,0,0,.06);transition:background .15s ease}.node-item[data-v-4d1147ae]:not(.is-editing):hover{background:#f3f4f6}.tree-node-content[data-v-4d1147ae]{display:flex;align-items:center;padding:4px 8px;min-height:28px;cursor:pointer}.node-item.has-custom-content .tree-node-content[data-v-4d1147ae]{padding-bottom:2px}.node-item.is-editing .tree-node-content[data-v-4d1147ae],.tree-node-content.has-children[data-v-4d1147ae]{cursor:default}.expand-icon[data-v-4d1147ae]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:4px;color:#6b7280;flex-shrink:0;transition:transform .2s ease;cursor:pointer}.expand-icon.placeholder[data-v-4d1147ae]{visibility:hidden;cursor:default}.node-item.is-editing .expand-icon[data-v-4d1147ae]{cursor:default;opacity:.5}.expand-icon[data-v-4d1147ae] svg{width:12px;height:12px}.icon[data-v-4d1147ae]{display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:8px;flex-shrink:0}.icon[data-v-4d1147ae] svg{display:block;width:16px;height:16px;stroke-width:2}.node-custom-content[data-v-4d1147ae]{padding-top:2px;padding-bottom:4px;padding-right:8px}.node-item.is-editing .node-custom-content[data-v-4d1147ae]{opacity:.6;pointer-events:none}.node-name-input[data-v-4d1147ae]{flex:1;padding:2px 6px;border:1px solid #3b82f6;border-radius:3px;font-size:13px;font-family:inherit;outline:none;background:#fff;box-shadow:0 0 0 2px #3b82f61a;line-height:1.4}.node-name-input[data-v-4d1147ae]:focus{border-color:#2563eb}.name[data-v-4d1147ae]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:#374151;line-height:1.4}.count[data-v-4d1147ae]{font-size:11px;color:#9ca3af;margin-left:6px;font-weight:400}.node-header-extra[data-v-4d1147ae]{margin-left:auto;display:flex;align-items:center;gap:8px}.tree-wrapper[data-v-c4c782fd]{display:flex;flex-direction:column;height:100%;overflow:hidden}.tree-search[data-v-c4c782fd]{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;flex-shrink:0}.search-icon[data-v-c4c782fd]{display:flex;align-items:center;color:#9ca3af}.search-icon[data-v-c4c782fd] svg{width:14px;height:14px}.search-input[data-v-c4c782fd]{flex:1;border:none;outline:none;background:transparent;font-size:12px;color:#374151}.search-input[data-v-c4c782fd]::placeholder{color:#9ca3af}.search-results[data-v-c4c782fd]{flex:1;overflow-y:auto;min-height:0}.search-empty[data-v-c4c782fd]{padding:40px 20px;text-align:center;color:#9ca3af;font-size:13px}.node-tree[data-v-c4c782fd]{-webkit-user-select:none;user-select:none;flex:1;overflow-y:auto;min-height:0;position:relative}.tree-content[data-v-c4c782fd]{position:relative;z-index:1}.empty-state[data-v-c4c782fd]{padding:40px 20px;text-align:center;color:#94a3b8;font-size:13px;border:1px dashed #cbd5e1;border-radius:4px;margin:8px;transition:all .15s ease}.context-menu[data-v-c4c782fd]{position:fixed;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 12px #00000026;z-index:10000;min-width:140px;overflow:hidden;padding:4px 0}.menu-item[data-v-c4c782fd]{padding:8px 16px;cursor:pointer;transition:all .15s ease;font-size:12px;color:#374151;display:flex;align-items:center}.menu-item[data-v-c4c782fd]:hover{background:#f3f4f6}.menu-item-danger[data-v-c4c782fd]{color:#ef4444}.menu-item-danger[data-v-c4c782fd]:hover{background:#fef2f2;color:#dc2626}.menu-separator[data-v-c4c782fd]{height:1px;min-height:1px;max-height:1px;background:#e5e7eb;margin:4px 0;font-size:0;line-height:0}:root{--be-color-primary: #3b82f6;--be-color-primary-hover: #2563eb;--be-color-primary-active: #1d4ed8;--be-color-success: #10b981;--be-color-success-hover: #059669;--be-color-danger: #ef4444;--be-color-danger-hover: #dc2626;--be-color-warning: #f59e0b;--be-color-info: #3b82f6;--be-color-gray-50: #f8fafc;--be-color-gray-100: #f3f4f6;--be-color-gray-200: #e5e7eb;--be-color-gray-300: #d1d5db;--be-color-gray-400: #9ca3af;--be-color-gray-500: #6b7280;--be-color-gray-600: #4b5563;--be-color-gray-700: #374151;--be-color-gray-800: #1f2937;--be-color-gray-900: #111827;--be-color-text: #374151;--be-color-text-secondary: #6b7280;--be-color-text-muted: #9ca3af;--be-color-text-inverse: #ffffff;--be-color-bg: #ffffff;--be-color-bg-secondary: #f8fafc;--be-color-bg-tertiary: #f3f4f6;--be-color-bg-hover: #f9fafb;--be-color-bg-active: #f3f4f6;--be-color-border: #e5e7eb;--be-color-border-hover: #d1d5db;--be-color-border-light: #f3f4f6;--be-shadow-sm: 0 1px 2px rgba(0, 0, 0, .05);--be-shadow-md: 0 4px 6px rgba(0, 0, 0, .1);--be-shadow-lg: 0 10px 15px rgba(0, 0, 0, .1);--be-shadow-xl: 0 20px 25px rgba(0, 0, 0, .15);--be-space-xs: 4px;--be-space-sm: 8px;--be-space-md: 16px;--be-space-lg: 24px;--be-space-xl: 32px;--be-radius-sm: 4px;--be-radius: 6px;--be-radius-md: 8px;--be-radius-lg: 12px;--be-radius-xl: 16px;--be-radius-full: 9999px;--be-font-size-xs: 10px;--be-font-size-sm: 11px;--be-font-size-base: 12px;--be-font-size-md: 13px;--be-font-size-lg: 14px;--be-font-size-xl: 16px;--be-font-size-2xl: 18px;--be-transition-fast: .1s ease;--be-transition-normal: .15s ease;--be-transition-slow: .3s ease;--be-z-dropdown: 1000;--be-z-modal: 1500;--be-z-toast: 2000;--be-z-tooltip: 2500}.booth-enhancer-sidebar *{box-sizing:border-box}.booth-enhancer-sidebar input,.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select,.booth-enhancer-sidebar button{font-family:inherit}.booth-btn{display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:6px;font-weight:500;cursor:pointer;transition:all .15s ease;text-decoration:none;white-space:nowrap;-webkit-user-select:none;user-select:none;font-family:inherit}.booth-btn:hover:not(:disabled){transform:translateY(-1px)}.booth-btn:active:not(:disabled){transform:translateY(1px)}.booth-btn:disabled{cursor:not-allowed;opacity:.6}.booth-btn-sm{padding:4px 8px;font-size:11px;min-height:24px}.booth-btn-md{padding:6px 12px;font-size:12px;min-height:32px}.booth-btn-lg{padding:8px 16px;font-size:14px;min-height:40px}.booth-btn-primary{background:#3b82f6;color:#fff;box-shadow:0 1px 3px #3b82f64d}.booth-btn-primary:hover:not(:disabled){background:#2563eb;box-shadow:0 2px 4px #3b82f666}.booth-btn-primary:active:not(:disabled){background:#1d4ed8}.booth-btn-secondary{background:#f3f4f6;color:#374151;border:1px solid #d1d5db}.booth-btn-secondary:hover:not(:disabled){background:#e5e7eb;border-color:#9ca3af}.booth-btn-secondary:active:not(:disabled){background:#d1d5db}.booth-btn-success{background:#10b981;color:#fff;box-shadow:0 1px 3px #10b9814d}.booth-btn-success:hover:not(:disabled){background:#059669;box-shadow:0 2px 4px #10b98166}.booth-btn-danger{background:#ef4444;color:#fff;box-shadow:0 1px 3px #ef44444d}.booth-btn-danger:hover:not(:disabled){background:#dc2626;box-shadow:0 2px 4px #ef444466}.booth-btn-ghost{background:transparent;color:#64748b;border:1px solid transparent}.booth-btn-ghost:hover:not(:disabled){background:#f1f5f9;color:#475569;border-color:#e2e8f0}.booth-btn-icon{padding:6px;min-width:32px;min-height:32px}.booth-btn-icon.booth-btn-sm{padding:4px;min-width:24px;min-height:24px}.booth-btn-icon.booth-btn-lg{padding:8px;min-width:40px;min-height:40px}.booth-btn:focus{outline:none;box-shadow:0 0 0 3px #3b82f61a}.booth-btn:focus:not(:focus-visible){box-shadow:none}.booth-enhancer-sidebar input:not([type=checkbox]):not([type=radio]),.booth-enhancer-sidebar textarea,.booth-enhancer-sidebar select{width:100%;padding:6px 12px;margin:0;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;transition:all .15s ease;box-sizing:border-box;display:block;-webkit-appearance:none;-moz-appearance:none;appearance:none}.booth-enhancer-sidebar input:hover,.booth-enhancer-sidebar textarea:hover,.booth-enhancer-sidebar select:hover{border-color:#9ca3af}.booth-enhancer-sidebar input:focus,.booth-enhancer-sidebar textarea:focus,.booth-enhancer-sidebar select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.booth-enhancer-sidebar input::placeholder,.booth-enhancer-sidebar textarea::placeholder{color:#9ca3af}.booth-enhancer-sidebar textarea{min-height:5em;resize:vertical;line-height:1.5}.modal-content p{margin:0;line-height:1.6;color:#6b7280}.modal-input{width:100%;padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;box-sizing:border-box;transition:all .15s ease;-webkit-appearance:none;-moz-appearance:none;appearance:none}.modal-input:hover{border-color:#9ca3af}.modal-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.modal-input::placeholder{color:#9ca3af}.form-group{margin-bottom:12px}.form-group:last-child{margin-bottom:0}.form-group label{display:block;margin-bottom:6px;font-size:12px;font-weight:500;color:#374151}.form-group .required{color:#ef4444;margin-left:4px}.form-group input,.form-group textarea,.form-group select{width:100%;padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;color:#374151;background:#fff;box-shadow:0 1px 2px #0000000d;outline:none;box-sizing:border-box;transition:all .15s ease;-webkit-appearance:none;-moz-appearance:none;appearance:none}.form-group input:hover,.form-group textarea:hover,.form-group select:hover{border-color:#9ca3af}.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.form-group textarea{min-height:5em;resize:vertical;line-height:1.5}.booth-enhancer-sidebar ::-webkit-scrollbar{width:6px;height:6px}.booth-enhancer-sidebar ::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.booth-enhancer-sidebar ::-webkit-scrollbar-thumb:hover{background:#94a3b8}@media (max-width: 768px){.booth-btn-md{padding:5px 10px;font-size:11px;min-height:28px}.booth-btn-lg{padding:7px 14px;font-size:13px;min-height:36px}}.be-m-0{margin:0!important}.be-mt-0{margin-top:0!important}.be-mr-0{margin-right:0!important}.be-mb-0{margin-bottom:0!important}.be-ml-0{margin-left:0!important}.be-m-xs{margin:var(--be-space-xs)!important}.be-m-sm{margin:var(--be-space-sm)!important}.be-m-md{margin:var(--be-space-md)!important}.be-m-lg{margin:var(--be-space-lg)!important}.be-p-0{padding:0!important}.be-pt-0{padding-top:0!important}.be-pr-0{padding-right:0!important}.be-pb-0{padding-bottom:0!important}.be-pl-0{padding-left:0!important}.be-p-xs{padding:var(--be-space-xs)!important}.be-p-sm{padding:var(--be-space-sm)!important}.be-p-md{padding:var(--be-space-md)!important}.be-p-lg{padding:var(--be-space-lg)!important}.be-flex{display:flex!important}.be-flex-column{flex-direction:column!important}.be-flex-row{flex-direction:row!important}.be-justify-start{justify-content:flex-start!important}.be-justify-center{justify-content:center!important}.be-justify-end{justify-content:flex-end!important}.be-justify-between{justify-content:space-between!important}.be-align-start{align-items:flex-start!important}.be-align-center{align-items:center!important}.be-align-end{align-items:flex-end!important}.be-flex-1{flex:1!important}.be-flex-grow{flex-grow:1!important}.be-flex-shrink-0{flex-shrink:0!important}.be-gap-xs{gap:var(--be-space-xs)!important}.be-gap-sm{gap:var(--be-space-sm)!important}.be-gap-md{gap:var(--be-space-md)!important}.be-gap-lg{gap:var(--be-space-lg)!important}.be-text-left{text-align:left!important}.be-text-center{text-align:center!important}.be-text-right{text-align:right!important}.be-text-xs{font-size:var(--be-font-size-xs)!important}.be-text-sm{font-size:var(--be-font-size-sm)!important}.be-text-md{font-size:var(--be-font-size-md)!important}.be-text-lg{font-size:var(--be-font-size-lg)!important}.be-font-normal{font-weight:400!important}.be-font-medium{font-weight:500!important}.be-font-bold{font-weight:600!important}.be-text-primary{color:var(--be-color-text)!important}.be-text-secondary{color:var(--be-color-text-secondary)!important}.be-text-muted{color:var(--be-color-text-muted)!important}.be-text-danger{color:var(--be-color-danger)!important}.be-text-success{color:var(--be-color-success)!important}.be-hidden{display:none!important}.be-visible{visibility:visible!important}.be-invisible{visibility:hidden!important}.be-block{display:block!important}.be-inline{display:inline!important}.be-inline-block{display:inline-block!important}.be-w-full{width:100%!important}.be-h-full{height:100%!important}.be-border{border:1px solid var(--be-color-border)!important}.be-border-0{border:none!important}.be-border-t{border-top:1px solid var(--be-color-border)!important}.be-border-r{border-right:1px solid var(--be-color-border)!important}.be-border-b{border-bottom:1px solid var(--be-color-border)!important}.be-border-l{border-left:1px solid var(--be-color-border)!important}.be-rounded-sm{border-radius:var(--be-radius-sm)!important}.be-rounded-md{border-radius:var(--be-radius-md)!important}.be-rounded-lg{border-radius:var(--be-radius-lg)!important}.be-rounded-full{border-radius:9999px!important}.be-shadow-sm{box-shadow:var(--be-shadow-sm)!important}.be-shadow-md{box-shadow:var(--be-shadow-md)!important}.be-shadow-lg{box-shadow:var(--be-shadow-lg)!important}.be-shadow-none{box-shadow:none!important}.be-cursor-pointer{cursor:pointer!important}.be-cursor-default{cursor:default!important}.be-cursor-not-allowed{cursor:not-allowed!important}.be-overflow-hidden{overflow:hidden!important}.be-overflow-auto{overflow:auto!important}.be-overflow-scroll{overflow:scroll!important}.be-relative{position:relative!important}.be-absolute{position:absolute!important}.be-fixed{position:fixed!important}.be-sticky{position:sticky!important}.be-transition{transition:all var(--be-transition-normal)!important}.be-transition-fast{transition:all var(--be-transition-fast)!important}.be-transition-slow{transition:all var(--be-transition-slow)!important}.booth-enhancer-sidebar[data-v-0a957ae2]{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:#fffffffa;border:1px solid #e0e0e0;border-radius:12px 0 0 12px;box-shadow:-4px 0 12px #0000001a;font-size:12px;color:#333;overflow:hidden}.sidebar-content[data-v-0a957ae2]{flex:1;overflow:hidden;display:flex;flex-direction:column;background:#fff;min-height:0}.tag-preset-tab[data-v-9e62ff02]{height:100%;display:flex;flex-direction:column;background:#fff}.toolbar[data-v-9e62ff02]{flex-shrink:0;background:#fff;border-bottom:1px solid #e0e0e0}.tree-container[data-v-9e62ff02]{flex:1;overflow-y:auto;padding:4px;min-height:0;scrollbar-width:thin;scrollbar-color:#cbd5e1 #f5f5f5}.tree-container[data-v-9e62ff02]::-webkit-scrollbar{width:6px}.tree-container[data-v-9e62ff02]::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.tree-container[data-v-9e62ff02]::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.tree-container[data-v-9e62ff02]::-webkit-scrollbar-thumb:hover{background:#94a3b8}.folder-content[data-v-9e62ff02]{display:flex;align-items:center;width:100%;padding:6px 8px}.folder-content .icon[data-v-9e62ff02]{color:#fbbf24;display:flex;align-items:center;justify-content:center;margin-right:8px;flex-shrink:0}.folder-content .name[data-v-9e62ff02]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#334155}.folder-content .count[data-v-9e62ff02]{font-size:12px;color:#94a3b8;margin-left:4px}.tag-custom-content[data-v-9e62ff02]{width:100%}.tag-badges-wrapper[data-v-9e62ff02]{display:flex;flex-wrap:wrap;gap:4px}.tag-badge[data-v-9e62ff02]{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:10px;color:#2563eb;line-height:1.2;white-space:nowrap;transition:all .15s ease}.tag-badge[data-v-9e62ff02]:hover{background:#dbeafe;border-color:#93c5fd}.tag-text[data-v-9e62ff02]{flex-shrink:0}.tag-delete-btn[data-v-9e62ff02]{flex-shrink:0;width:14px;height:14px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:50%;color:#3b82f6;font-size:14px;line-height:1;cursor:pointer;transition:all .15s ease;opacity:.7}.tag-delete-btn[data-v-9e62ff02]:hover{opacity:1;background:#3b82f6;color:#fff;transform:scale(1.1)}.item-data-tab[data-v-d8aa8a2f]{height:100%;display:flex;flex-direction:column;background:#fff}.toolbar[data-v-d8aa8a2f]{flex-shrink:0;background:#fff;border-bottom:1px solid #e0e0e0}.tree-container[data-v-d8aa8a2f]{flex:1;overflow-y:auto;padding:4px;min-height:0;scrollbar-width:thin;scrollbar-color:#cbd5e1 #f5f5f5}.tree-container[data-v-d8aa8a2f]::-webkit-scrollbar{width:6px}.tree-container[data-v-d8aa8a2f]::-webkit-scrollbar-track{background:#f5f5f5;border-radius:3px}.tree-container[data-v-d8aa8a2f]::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.tree-container[data-v-d8aa8a2f]::-webkit-scrollbar-thumb:hover{background:#94a3b8}.folder-content[data-v-d8aa8a2f]{display:flex;align-items:center;width:100%;padding:6px 8px}.folder-content .icon[data-v-d8aa8a2f]{color:#fbbf24;display:flex;align-items:center;justify-content:center;margin-right:8px;flex-shrink:0}.folder-content .name[data-v-d8aa8a2f]{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#334155}.folder-content .count[data-v-d8aa8a2f]{font-size:12px;color:#94a3b8;margin-left:4px}.item-custom-content[data-v-d8aa8a2f]{display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;line-height:1.4}.item-field[data-v-d8aa8a2f]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.item-separator[data-v-d8aa8a2f]{flex-shrink:0}.template-section[data-v-d8aa8a2f]{display:flex;flex-direction:column;gap:12px}.section-title[data-v-d8aa8a2f]{margin:0;font-size:13px;font-weight:600;color:#374151}.template-preview[data-v-d8aa8a2f]{padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;color:#374151;white-space:pre-wrap;word-break:break-word;font-family:Consolas,Monaco,monospace;margin-bottom:8px}.template-hint[data-v-d8aa8a2f]{margin:0;font-size:11px;color:#6b7280;font-style:italic}.item-form[data-v-d8aa8a2f]{display:flex;flex-direction:column;gap:1em}.template-tab[data-v-addebd0f]{height:100%;display:flex;flex-direction:column;background:#fff;overflow:hidden}.active-badge[data-v-addebd0f]{padding:2px 6px;background:#3b82f6;color:#fff;font-size:10px;border-radius:3px;font-weight:500;line-height:1.2}.template-preview[data-v-addebd0f]{padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px}.template-preview pre[data-v-addebd0f]{margin:0;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.5;color:#334155;white-space:pre-wrap;word-break:break-all}.modal-input[data-v-addebd0f]{width:100%;padding:10px 12px;font-size:13px;border:1px solid #d1d5db;border-radius:6px;transition:all .2s;background:#fff;color:#1f2937;line-height:1.5}.modal-input[data-v-addebd0f]:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px #3b82f61a}.modal-input[data-v-addebd0f]::placeholder{color:#9ca3af}textarea.modal-input[data-v-addebd0f]{resize:vertical;min-height:80px} ');

System.addImportMap({ imports: {"vue":"user:vue"} });
System.set("user:vue", (()=>{const _=Vue;('default' in _)||(_.default=_);return _})());

System.register("./__entry.js", ['./__monkey.entry-CiFzQCYM.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {



		})
	};
}));

System.register("./__monkey.entry-CiFzQCYM.js", ['vue'], (function (exports, module) {
  'use strict';
  var createApp, ref, watch, defineComponent, defineAsyncComponent, computed, onMounted, onUnmounted, createElementBlock, openBlock, createVNode, createElementVNode, unref, withCtx, createBlock, KeepAlive, resolveDynamicComponent, createCommentVNode, Fragment, renderList, normalizeClass, toDisplayString, renderSlot;
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
      KeepAlive = module.KeepAlive;
      resolveDynamicComponent = module.resolveDynamicComponent;
      createCommentVNode = module.createCommentVNode;
      Fragment = module.Fragment;
      renderList = module.renderList;
      normalizeClass = module.normalizeClass;
      toDisplayString = module.toDisplayString;
      renderSlot = module.renderSlot;
    }],
    execute: (function () {

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
          const { input, inputContainer } = this._data.tagElements;
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
            await new Promise((resolve) => setTimeout(resolve, 100));
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
         * 监听 Section 列表变化
         */
        onSectionsChange(callback) {
          this._sectionsChangeCallback = callback;
          this._data.sections.forEach((section) => {
            var _a, _b;
            (_a = section.headlineInput) == null ? void 0 : _a.addEventListener("input", () => callback());
            (_b = section.bodyTextarea) == null ? void 0 : _b.addEventListener("input", () => callback());
          });
          const originalCallback = this._newSectionCallback;
          this._newSectionCallback = (section) => {
            var _a, _b;
            (_a = section.headlineInput) == null ? void 0 : _a.addEventListener("input", () => callback());
            (_b = section.bodyTextarea) == null ? void 0 : _b.addEventListener("input", () => callback());
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
            var _a, _b;
            (_a = variation.nameInput) == null ? void 0 : _a.addEventListener("input", () => callback());
            (_b = variation.priceInput) == null ? void 0 : _b.addEventListener("input", () => callback());
          });
          const originalCallback = this._newVariationCallback;
          this._newVariationCallback = (variation) => {
            var _a, _b;
            (_a = variation.nameInput) == null ? void 0 : _a.addEventListener("input", () => callback());
            (_b = variation.priceInput) == null ? void 0 : _b.addEventListener("input", () => callback());
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
      const _hoisted_1$2 = ["title"];
      const _hoisted_2$1 = ["innerHTML"];
      const _sfc_main$2 = /* @__PURE__ */ defineComponent({
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
              createElementVNode("span", { innerHTML: _ctx.icon }, null, 8, _hoisted_2$1)
            ], 10, _hoisted_1$2);
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
      const IconButton = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-996dd7d2"]]);
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
        folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
        folderOpen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
  </svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
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
    <path d="M12 1v6m0 6v6m5.2-12.8l4.2-4.2m-4.2 17.4l4.2 4.2M1 12h6m6 0h6M6.8 6.8l-4.2-4.2m0 0L6.8 17.2m4.2 4.2l-4.2 4.2"></path>
  </svg>`,
        // 状态
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
      const _hoisted_1$1 = { class: "tab-bar" };
      const _hoisted_2 = { class: "tab-list" };
      const _hoisted_3 = ["onClick"];
      const _hoisted_4 = ["innerHTML"];
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
              createElementVNode("div", _hoisted_2, [
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
                    }, null, 8, _hoisted_4)) : createCommentVNode("", true),
                    createElementVNode("span", _hoisted_5, toDisplayString(tab.label), 1)
                  ], 10, _hoisted_3);
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
      const createDefaultData = () => {
        const defaultTemplateId = "default-template-node";
        const now = Date.now();
        return {
          tagTree: {
            rootIds: [],
            nodes: {}
          },
          itemTree: {
            rootIds: [],
            nodes: {}
          },
          templateTree: {
            rootIds: [defaultTemplateId],
            nodes: {
              [defaultTemplateId]: {
                id: defaultTemplateId,
                parentId: null,
                name: "默认模板",
                children: [],
                expanded: false,
                data: {
                  content: "{{authorName}} - {{itemName}}\n{{itemUrl}}"
                },
                createdAt: now,
                updatedAt: now
              }
            }
          },
          activeTemplateId: defaultTemplateId,
          ui: {
            sidebarOpen: false,
            activeTab: "tags"
          }
        };
      };
      const STORAGE_KEY = "booth-enhancer-config-v2";
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
              const parsed = JSON.parse(stored);
              const defaults = createDefaultData();
              return {
                tagTree: parsed.tagTree || defaults.tagTree,
                itemTree: parsed.itemTree || defaults.itemTree,
                templateTree: parsed.templateTree || defaults.templateTree,
                activeTemplateId: parsed.activeTemplateId || defaults.activeTemplateId,
                ui: parsed.ui || defaults.ui
              };
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
        /**
         * 导出数据为 JSON
         */
        exportData() {
          return JSON.stringify(this._data.value, null, 2);
        }
        /**
         * 导入数据从 JSON
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
          const iconMap = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
          };
          toast2.innerHTML = `
      <div class="toast-icon">${iconMap[type]}</div>
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
      const _hoisted_1 = { class: "sidebar-content" };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "App",
        props: {
          api: {},
          itemId: {}
        },
        setup(__props) {
          const props = __props;
          const TagPresetTab = defineAsyncComponent(() => __vitePreload(() => module.import('./TagPresetTab-DVcME_pW-D31CGrBe.js'), void 0 ));
          const ItemDataTab = defineAsyncComponent(() => __vitePreload(() => module.import('./ItemDataTab-KajnemCJ-o4-TvZuQ.js'), void 0 ));
          const TemplateTab = defineAsyncComponent(() => __vitePreload(() => module.import('./TemplateTab-CgNQY4kC-Dgd1Ngrf.js'), void 0 ));
          const storage = ConfigStorage.getInstance();
          const uiState = computed(() => storage.data.value.ui);
          const sidebarRef = ref(null);
          const tabs = [
            { id: "tags", label: "Tag预设" },
            { id: "items", label: "商品数据" },
            { id: "templates", label: "模板配置" }
          ];
          watch(() => uiState.value.sidebarOpen, (isOpen) => {
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
            uiState.value.sidebarOpen = false;
          };
          const handleExport = () => {
            try {
              const json = JSON.stringify(storage.data.value, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `booth-enhancer-config-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("导出成功");
            } catch (error) {
              console.error("导出失败:", error);
              toast.error("导出失败");
            }
          };
          const handleImport = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = async (e) => {
              var _a;
              try {
                const file = (_a = e.target.files) == null ? void 0 : _a[0];
                if (!file) return;
                const text = await file.text();
                const data = JSON.parse(text);
                if (!data.tagTree || !data.itemTree) {
                  throw new Error("无效的配置文件格式");
                }
                storage.data.value = data;
                toast.success("导入成功");
              } catch (error) {
                console.error("导入失败:", error);
                toast.error("导入失败：" + error.message);
              }
            };
            input.click();
          };
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
                "active-tab": uiState.value.activeTab,
                tabs,
                "onUpdate:activeTab": _cache[0] || (_cache[0] = (val) => uiState.value.activeTab = val)
              }, {
                actions: withCtx(() => [
                  createVNode(unref(IconButton), {
                    icon: unref(icons).upload,
                    title: "导出配置",
                    onClick: handleExport
                  }, null, 8, ["icon"]),
                  createVNode(unref(IconButton), {
                    icon: unref(icons).download,
                    title: "导入配置",
                    onClick: handleImport
                  }, null, 8, ["icon"]),
                  createVNode(unref(IconButton), {
                    icon: unref(icons).close,
                    title: "关闭",
                    onClick: closeSidebar
                  }, null, 8, ["icon"])
                ]),
                _: 1
              }, 8, ["active-tab"]),
              createElementVNode("div", _hoisted_1, [
                (openBlock(), createBlock(KeepAlive, null, [
                  (openBlock(), createBlock(resolveDynamicComponent(uiState.value.activeTab === "tags" ? unref(TagPresetTab) : uiState.value.activeTab === "items" ? unref(ItemDataTab) : unref(TemplateTab)), {
                    api: props.api
                  }, null, 8, ["api"]))
                ], 1024))
              ])
            ], 512);
          };
        }
      });
      const AppVue = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0a957ae2"]]);
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
                await Utils.sleep(10);
                Simulate.pressEnter(input);
                await Utils.sleep(10);
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
            const isOpen = storage.data.value.ui.sidebarOpen;
            storage.data.value.ui.sidebarOpen = !isOpen;
            this.toggleBtn.innerHTML = !isOpen ? chevronRight : chevronLeft;
            if (this.container) {
              if (!isOpen) {
                this.container.classList.add("panel-open");
              } else {
                this.container.classList.remove("panel-open");
              }
            }
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
          const { sidebarOpen } = storage.data.value.ui;
          if (sidebarOpen) {
            this.container.classList.add("panel-open");
            if (this.toggleBtn) {
              this.toggleBtn.innerHTML = withSize(icons.chevronRight, 20, 2.5);
            }
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
         * 创建变体列表折叠标题（使用 API 数据）
         */
        createVariationHeader(itemElement) {
          const { variations, variationsUl } = itemElement;
          const count = variations.length;
          const totalSales = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
          const totalRevenue = variations.reduce((sum, v) => sum + v.data.revenue, 0);
          const header = document.createElement("div");
          header.className = "item-collapse-header";
          const titleSection = document.createElement("div");
          titleSection.className = "item-collapse-title";
          titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>变体列表</span>
        `;
          const badgesContainer = document.createElement("div");
          badgesContainer.className = "item-collapse-badges";
          badgesContainer.innerHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${totalRevenue.toLocaleString()}</strong></span>
        `;
          header.appendChild(titleSection);
          header.appendChild(badgesContainer);
          const icon = header.querySelector(".item-collapse-icon");
          let isCollapsed = true;
          header.onclick = () => {
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
              variationsUl.classList.add("collapsed");
              icon.classList.add("collapsed");
            } else {
              variationsUl.classList.remove("collapsed");
              icon.classList.remove("collapsed");
            }
          };
          return header;
        }
        /**
         * 创建标签列表折叠标题
         */
        createTagHeader(tagsUl) {
          const header = document.createElement("div");
          header.className = "item-collapse-header";
          const titleSection = document.createElement("div");
          titleSection.className = "item-collapse-title";
          titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>标签列表</span>
        `;
          header.appendChild(titleSection);
          const icon = header.querySelector(".item-collapse-icon");
          let isCollapsed = true;
          header.onclick = () => {
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
              tagsUl.classList.add("collapsed");
              icon.classList.add("collapsed");
            } else {
              tagsUl.classList.remove("collapsed");
              icon.classList.remove("collapsed");
            }
          };
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
              text: result.data.expires_at ? `Session已复制
过期时间: ${new Date(result.data.expires_at).toLocaleString()}` : "Session已复制到剪贴板",
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

System.register("./TagPresetTab-DVcME_pW-D31CGrBe.js", ['vue', './useModal-BO7CSXzk-BX-jwFXE.js', './useSearch-CPWiNq88-JrnLEP43.js', './__monkey.entry-CiFzQCYM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, ref, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createCommentVNode, createElementVNode, Fragment, renderList, toDisplayString, withModifiers, withDirectives, withKeys, vModelText, createTextVNode, useModal, Tree, Modal, tagSearchFilter, _export_sfc, ConfigStorage;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      ref = module.ref;
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
      useModal = module.u;
      Tree = module.T;
      Modal = module.M;
    }, module => {
      tagSearchFilter = module.t;
    }, module => {
      _export_sfc = module._;
      ConfigStorage = module.C;
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
      const _hoisted_7 = {
        key: 1,
        class: "form-group"
      };
      const _hoisted_8 = { key: 2 };
      const _hoisted_9 = { key: 3 };
      const _hoisted_10 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _hoisted_11 = { key: 4 };
      const _hoisted_12 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_13 = ["placeholder"];
      const _hoisted_14 = { key: 5 };
      const _hoisted_15 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_16 = ["placeholder"];
      const _hoisted_17 = { key: 6 };
      const _hoisted_18 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "TagPresetTab",
        props: {
          api: {}
        },
        setup(__props) {
          const props = __props;
          const storage = ConfigStorage.getInstance();
          const selectedNodeId = ref(null);
          const modal = useModal();
          const tree = computed(() => storage.data.value.tagTree);
          const handleSelect = (node) => {
            selectedNodeId.value = node.id;
          };
          const handleApplyTags = (node) => {
            var _a;
            const tags = (_a = node.data) == null ? void 0 : _a.tags;
            if (tags && Array.isArray(tags) && tags.length > 0) {
              props.api.addTags(tags);
            }
          };
          const customMenuItems = computed(() => [
            {
              label: "应用标签",
              action: (node) => {
                if (node) {
                  handleApplyTags(node);
                }
              },
              show: (node) => {
                var _a;
                return node !== null && ((_a = node.data) == null ? void 0 : _a.tags) && Array.isArray(node.data.tags) && node.data.tags.length > 0;
              }
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
          const handleCreateFolder = (parentId) => {
            const newNode = storage.createNode(tree.value, "新建文件夹", void 0, parentId);
            return newNode.id;
          };
          const handleCreateTag = (parentId) => {
            const data = { tags: [] };
            const newNode = storage.createNode(tree.value, "新建 Tag 预设", data, parentId);
            return newNode.id;
          };
          const handleEditTag = async (nodeId) => {
            const node = storage.data.value.tagTree.nodes[nodeId];
            if (!node || !node.data) return;
            const result = await modal.openModal({
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
                storage.renameNode(tree.value, nodeId, result.name.trim());
                node.data.tags = tags;
                storage["saveWithDebounce"]();
              }
            }
          };
          const handleRename = (nodeId, newName) => {
            const trimmedName = newName.trim();
            if (trimmedName) {
              storage.renameNode(tree.value, nodeId, trimmedName);
            }
          };
          const handleDelete = async (nodeId) => {
            const node = storage.data.value.tagTree.nodes[nodeId];
            if (!node) return;
            const confirmed = await modal.openModal({
              type: "delete",
              title: "确认删除",
              formData: { message: `确定要删除"${node.name}"吗？` }
            });
            if (confirmed) {
              storage.deleteNode(tree.value, nodeId);
            }
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              createVNode(Tree, {
                tree: tree.value,
                "search-placeholder": "搜索 Tag...",
                "search-filter": unref(tagSearchFilter),
                "custom-menu-items": customMenuItems.value,
                "on-create-folder": handleCreateFolder,
                "on-create-item": handleCreateTag,
                "on-rename": handleRename,
                "on-delete": handleDelete,
                "on-edit": handleEditTag,
                onSelect: handleSelect
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
              }, 8, ["tree", "search-filter", "custom-menu-items"]),
              createVNode(Modal, {
                show: unref(modal).state.value.show,
                title: unref(modal).state.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(modal).closeModal
              }, {
                footer: withCtx(() => [
                  unref(modal).state.value.type !== "alert" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-md booth-btn-secondary",
                    onClick: _cache[9] || (_cache[9] = //@ts-ignore
                    (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                  }, " 取消 ")) : createCommentVNode("", true),
                  unref(modal).state.value.type === "createTag" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[10] || (_cache[10] = ($event) => unref(modal).confirmModal(unref(modal).state.value.formData))
                  }, " 确定 ")) : unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-danger",
                    onClick: _cache[11] || (_cache[11] = ($event) => unref(modal).confirmModal(true))
                  }, " 删除 ")) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[12] || (_cache[12] = ($event) => unref(modal).confirmModal())
                  }, " 确定 ")) : (openBlock(), createElementBlock("button", {
                    key: 4,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[13] || (_cache[13] = ($event) => unref(modal).confirmModal())
                  }, " 确定 "))
                ]),
                default: withCtx(() => [
                  unref(modal).state.value.type === "createFolder" ? (openBlock(), createElementBlock("div", _hoisted_6, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: "文件夹名称",
                      onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "createTag" ? (openBlock(), createElementBlock("div", _hoisted_7, [
                    _cache[14] || (_cache[14] = createElementVNode("label", null, [
                      createTextVNode("预设名称 "),
                      createElementVNode("span", { class: "required" }, "*")
                    ], -1)),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(modal).state.value.formData.name = $event),
                      type: "text",
                      placeholder: "例如：イチゴ配布物"
                    }, null, 512), [
                      [vModelText, unref(modal).state.value.formData.name]
                    ]),
                    _cache[15] || (_cache[15] = createElementVNode("label", { style: { "margin-top": "12px" } }, [
                      createTextVNode("标签列表 "),
                      createElementVNode("span", { class: "required" }, "*")
                    ], -1)),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(modal).state.value.formData.tagsText = $event),
                      placeholder: '支持两种格式：\n1. JSON 数组（从 Booth 复制）：["アクセサリー","眼鏡","イチゴ"]\n2. 普通文本（逗号/换行/空格分隔）：アクセサリー,眼鏡,イチゴ',
                      rows: "8",
                      style: { "font-family": "'Consolas', 'Monaco', monospace", "line-height": "1.5", "font-size": "11px" }
                    }, null, 512), [
                      [vModelText, unref(modal).state.value.formData.tagsText]
                    ]),
                    _cache[16] || (_cache[16] = createElementVNode("small", { style: { "display": "block", "margin-top": "6px", "color": "#6b7280", "font-size": "11px" } }, ' 💡 直接粘贴从 Booth "复制标签"功能得到的 JSON 数据，或手动输入 ', -1))
                  ])) : unref(modal).state.value.type === "rename" ? (openBlock(), createElementBlock("div", _hoisted_8, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: "新名称",
                      onKeyup: _cache[5] || (_cache[5] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_9, [
                    createElementVNode("p", _hoisted_10, toDisplayString(unref(modal).state.value.formData.message), 1)
                  ])) : unref(modal).state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_12, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      onKeyup: _cache[7] || (_cache[7] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_13), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_14, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_15, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(modal).state.value.inputValue = $event),
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      rows: "8",
                      style: { "font-family": "'Consolas', 'Monaco', monospace", "line-height": "1.5", "font-size": "12px" }
                    }, null, 8, _hoisted_16), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("div", _hoisted_17, [
                    createElementVNode("p", _hoisted_18, toDisplayString(unref(modal).state.value.message), 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])
            ]);
          };
        }
      });
      const TagPresetTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9e62ff02"]]));

    })
  };
}));

System.register("./ItemDataTab-KajnemCJ-o4-TvZuQ.js", ['vue', './useModal-BO7CSXzk-BX-jwFXE.js', './useSearch-CPWiNq88-JrnLEP43.js', './__monkey.entry-CiFzQCYM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, ref, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createCommentVNode, createElementVNode, toDisplayString, withDirectives, withKeys, vModelText, createTextVNode, useModal, Tree, Modal, itemDataSearchFilter, _export_sfc, ConfigStorage, toast;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      ref = module.ref;
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
      useModal = module.u;
      Tree = module.T;
      Modal = module.M;
    }, module => {
      itemDataSearchFilter = module.i;
    }, module => {
      _export_sfc = module._;
      ConfigStorage = module.C;
      toast = module.t;
    }],
    execute: (function () {

      function useTemplates() {
        const storage = ConfigStorage.getInstance();
        const templates = computed(() => {
          const tree = storage.data.value.templateTree;
          const result = [];
          for (const nodeId in tree.nodes) {
            const node = tree.nodes[nodeId];
            if (node.data) {
              result.push({
                id: node.id,
                name: node.name,
                content: node.data.content
              });
            }
          }
          return result;
        });
        const selectedTemplateId = computed(() => storage.data.value.activeTemplateId);
        const applyTemplate = (template, data) => {
          return template.replace(/\{\{authorName\}\}/g, data.data.authorName).replace(/\{\{itemName\}\}/g, data.name).replace(/\{\{itemUrl\}\}/g, data.data.itemUrl);
        };
        const copyToClipboard = async (text) => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(text);
              toast.success("已复制到剪贴板");
              return true;
            } else {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.opacity = "0";
              document.body.appendChild(textarea);
              textarea.select();
              const success = document.execCommand("copy");
              document.body.removeChild(textarea);
              if (success) {
                toast.success("已复制到剪贴板");
                return true;
              } else {
                throw new Error("复制失败");
              }
            }
          } catch (error) {
            console.error("复制到剪贴板失败:", error);
            toast.error("复制失败");
            return false;
          }
        };
        const applyAndCopy = async (templateId, data) => {
          const template = templates.value.find((t) => t.id === templateId);
          if (!template) {
            toast.error("模板不存在");
            return false;
          }
          const result = applyTemplate(template.content, data);
          return await copyToClipboard(result);
        };
        const getSelectedTemplate = () => {
          return templates.value.find((t) => t.id === selectedTemplateId.value);
        };
        const previewTemplate = (templateId, data) => {
          const template = templates.value.find((t) => t.id === templateId);
          if (!template) return "";
          return applyTemplate(template.content, data);
        };
        return {
          templates,
          selectedTemplateId,
          applyTemplate,
          copyToClipboard,
          applyAndCopy,
          getSelectedTemplate,
          previewTemplate
        };
      }
      const _hoisted_1 = { class: "item-data-tab" };
      const _hoisted_2 = {
        key: 0,
        class: "item-custom-content"
      };
      const _hoisted_3 = { class: "item-field" };
      const _hoisted_4 = { class: "item-field" };
      const _hoisted_5 = {
        key: 0,
        class: "template-section"
      };
      const _hoisted_6 = { class: "section-title" };
      const _hoisted_7 = { class: "template-preview" };
      const _hoisted_8 = { key: 0 };
      const _hoisted_9 = {
        key: 1,
        class: "item-form"
      };
      const _hoisted_10 = { class: "form-group" };
      const _hoisted_11 = { class: "form-group" };
      const _hoisted_12 = { class: "form-group" };
      const _hoisted_13 = { key: 2 };
      const _hoisted_14 = { key: 3 };
      const _hoisted_15 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _hoisted_16 = { key: 4 };
      const _hoisted_17 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_18 = ["placeholder"];
      const _hoisted_19 = { key: 5 };
      const _hoisted_20 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_21 = ["placeholder"];
      const _hoisted_22 = { key: 6 };
      const _hoisted_23 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "ItemDataTab",
        setup(__props) {
          const storage = ConfigStorage.getInstance();
          const selectedNodeId = ref(null);
          const showTemplateModal = ref(false);
          const selectedItem = ref(null);
          const modal = useModal();
          const templates = useTemplates();
          const tree = computed(() => storage.data.value.itemTree);
          const handleSelect = (node) => {
            var _a, _b;
            if (((_a = node.data) == null ? void 0 : _a.authorName) || ((_b = node.data) == null ? void 0 : _b.itemUrl)) {
              selectedItem.value = {
                name: node.name,
                data: node.data
              };
              showTemplateModal.value = true;
            } else {
              selectedNodeId.value = node.id;
            }
          };
          const handleCreateFolder = (parentId) => {
            const newNode = storage.createNode(tree.value, "新建文件夹", void 0, parentId);
            return newNode.id;
          };
          const handleCreateItem = (parentId) => {
            const data = {
              authorName: "",
              itemName: "",
              itemUrl: ""
            };
            const newNode = storage.createNode(tree.value, "新建商品数据", data, parentId);
            return newNode.id;
          };
          const handleEditItem = async (nodeId) => {
            const node = storage.data.value.itemTree.nodes[nodeId];
            if (!node || !node.data) return;
            const result = await modal.openModal({
              type: "createItem",
              title: "编辑商品数据",
              formData: {
                name: node.name,
                authorName: node.data.authorName || "",
                itemUrl: node.data.itemUrl || ""
              }
            });
            if (result && result.name && result.name.trim()) {
              storage.renameNode(tree.value, nodeId, result.name.trim());
              node.data.authorName = result.authorName.trim();
              node.data.itemName = result.name.trim();
              node.data.itemUrl = result.itemUrl.trim();
              storage["saveWithDebounce"]();
            }
          };
          const handleRename = (nodeId, newName) => {
            const trimmedName = newName.trim();
            if (trimmedName) {
              storage.renameNode(tree.value, nodeId, trimmedName);
            }
          };
          const handleDelete = async (nodeId) => {
            const node = storage.data.value.itemTree.nodes[nodeId];
            if (!node) return;
            const confirmed = await modal.openModal({
              type: "delete",
              title: "确认删除",
              formData: { message: `确定要删除"${node.name}"吗？` }
            });
            if (confirmed) {
              storage.deleteNode(tree.value, nodeId);
            }
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              createVNode(unref(Tree), {
                tree: tree.value,
                "search-placeholder": "搜索商品数据...",
                "search-filter": unref(itemDataSearchFilter),
                "on-create-folder": handleCreateFolder,
                "on-create-item": handleCreateItem,
                "on-rename": handleRename,
                "on-delete": handleDelete,
                "on-edit": handleEditItem,
                onSelect: handleSelect
              }, {
                default: withCtx(({ node }) => {
                  var _a, _b;
                  return [
                    ((_a = node.data) == null ? void 0 : _a.authorName) || ((_b = node.data) == null ? void 0 : _b.itemUrl) ? (openBlock(), createElementBlock("div", _hoisted_2, [
                      createElementVNode("span", _hoisted_3, toDisplayString(node.data.authorName || "—"), 1),
                      _cache[18] || (_cache[18] = createElementVNode("span", { class: "item-separator" }, "·", -1)),
                      createElementVNode("span", _hoisted_4, toDisplayString(node.name), 1)
                    ])) : createCommentVNode("", true)
                  ];
                }),
                _: 1
              }, 8, ["tree", "search-filter"]),
              createVNode(Modal, {
                show: showTemplateModal.value,
                title: "复制商品数据",
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: _cache[2] || (_cache[2] = ($event) => showTemplateModal.value = false)
              }, {
                footer: withCtx(() => [
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-secondary",
                    onClick: _cache[0] || (_cache[0] = ($event) => showTemplateModal.value = false)
                  }, "取消"),
                  createElementVNode("button", {
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[1] || (_cache[1] = ($event) => selectedItem.value && unref(templates).applyAndCopy(unref(templates).selectedTemplateId.value, selectedItem.value).then(() => showTemplateModal.value = false))
                  }, " 复制 ")
                ]),
                default: withCtx(() => {
                  var _a;
                  return [
                    selectedItem.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
                      createElementVNode("h4", _hoisted_6, " 当前模板：" + toDisplayString(((_a = unref(templates).getSelectedTemplate()) == null ? void 0 : _a.name) || "无"), 1),
                      createElementVNode("div", _hoisted_7, toDisplayString(unref(templates).previewTemplate(unref(templates).selectedTemplateId.value, selectedItem.value)), 1),
                      _cache[19] || (_cache[19] = createElementVNode("p", { class: "template-hint" }, ' 💡 在"模板配置"标签页中管理模板 ', -1))
                    ])) : createCommentVNode("", true)
                  ];
                }),
                _: 1
              }, 8, ["show"]),
              createVNode(Modal, {
                show: unref(modal).state.value.show,
                title: unref(modal).state.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(modal).closeModal
              }, {
                footer: withCtx(() => [
                  unref(modal).state.value.type !== "alert" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-md booth-btn-secondary",
                    onClick: _cache[13] || (_cache[13] = //@ts-ignore
                    (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                  }, " 取消 ")) : createCommentVNode("", true),
                  unref(modal).state.value.type === "createItem" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[14] || (_cache[14] = ($event) => unref(modal).confirmModal(unref(modal).state.value.formData))
                  }, " 确定 ")) : unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-danger",
                    onClick: _cache[15] || (_cache[15] = ($event) => unref(modal).confirmModal(true))
                  }, " 删除 ")) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[16] || (_cache[16] = ($event) => unref(modal).confirmModal())
                  }, " 确定 ")) : (openBlock(), createElementBlock("button", {
                    key: 4,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[17] || (_cache[17] = ($event) => unref(modal).confirmModal())
                  }, " 确定 "))
                ]),
                default: withCtx(() => [
                  unref(modal).state.value.type === "createFolder" ? (openBlock(), createElementBlock("div", _hoisted_8, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: "文件夹名称",
                      onKeyup: _cache[4] || (_cache[4] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "createItem" ? (openBlock(), createElementBlock("div", _hoisted_9, [
                    createElementVNode("div", _hoisted_10, [
                      _cache[20] || (_cache[20] = createElementVNode("label", null, [
                        createTextVNode("商品名称 "),
                        createElementVNode("span", { class: "required" }, "*")
                      ], -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(modal).state.value.formData.name = $event),
                        type: "text",
                        placeholder: "例如：イチゴ - Ichigo"
                      }, null, 512), [
                        [vModelText, unref(modal).state.value.formData.name]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_11, [
                      _cache[21] || (_cache[21] = createElementVNode("label", null, "作者名称", -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(modal).state.value.formData.authorName = $event),
                        type: "text",
                        placeholder: "例如：みゅ"
                      }, null, 512), [
                        [vModelText, unref(modal).state.value.formData.authorName]
                      ])
                    ]),
                    createElementVNode("div", _hoisted_12, [
                      _cache[22] || (_cache[22] = createElementVNode("label", null, "商品链接", -1)),
                      withDirectives(createElementVNode("input", {
                        "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(modal).state.value.formData.itemUrl = $event),
                        type: "text",
                        placeholder: "https://booth.pm/..."
                      }, null, 512), [
                        [vModelText, unref(modal).state.value.formData.itemUrl]
                      ])
                    ])
                  ])) : unref(modal).state.value.type === "rename" ? (openBlock(), createElementBlock("div", _hoisted_13, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: "新名称",
                      onKeyup: _cache[9] || (_cache[9] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 544), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_14, [
                    createElementVNode("p", _hoisted_15, toDisplayString(unref(modal).state.value.formData.message), 1)
                  ])) : unref(modal).state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_16, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_17, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      onKeyup: _cache[11] || (_cache[11] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_18), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_19, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_20, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(modal).state.value.inputValue = $event),
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      rows: "8",
                      style: { "font-family": "'Consolas', 'Monaco', monospace", "line-height": "1.5", "font-size": "12px" }
                    }, null, 8, _hoisted_21), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("div", _hoisted_22, [
                    createElementVNode("p", _hoisted_23, toDisplayString(unref(modal).state.value.message), 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])
            ]);
          };
        }
      });
      const ItemDataTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d8aa8a2f"]]));

    })
  };
}));

System.register("./useSearch-CPWiNq88-JrnLEP43.js", ['vue'], (function (exports, module) {
  'use strict';
  return {
    setters: [null],
    execute: (function () {

      exports({
        i: itemDataSearchFilter,
        t: tagSearchFilter
      });

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

    })
  };
}));

System.register("./TemplateTab-CgNQY4kC-Dgd1Ngrf.js", ['vue', './useModal-BO7CSXzk-BX-jwFXE.js', './__monkey.entry-CiFzQCYM.js'], (function (exports, module) {
  'use strict';
  var defineComponent, computed, createElementBlock, openBlock, createVNode, unref, withCtx, createElementVNode, toDisplayString, createCommentVNode, withDirectives, withKeys, vModelText, useModal, Tree, Modal, _export_sfc, ConfigStorage;
  return {
    setters: [module => {
      defineComponent = module.defineComponent;
      computed = module.computed;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createVNode = module.createVNode;
      unref = module.unref;
      withCtx = module.withCtx;
      createElementVNode = module.createElementVNode;
      toDisplayString = module.toDisplayString;
      createCommentVNode = module.createCommentVNode;
      withDirectives = module.withDirectives;
      withKeys = module.withKeys;
      vModelText = module.vModelText;
    }, module => {
      useModal = module.u;
      Tree = module.T;
      Modal = module.M;
    }, module => {
      _export_sfc = module._;
      ConfigStorage = module.C;
    }],
    execute: (function () {

      const _hoisted_1 = { class: "template-tab" };
      const _hoisted_2 = {
        key: 0,
        class: "active-badge"
      };
      const _hoisted_3 = { class: "template-custom-content" };
      const _hoisted_4 = { class: "template-preview" };
      const _hoisted_5 = { key: 0 };
      const _hoisted_6 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_7 = ["placeholder"];
      const _hoisted_8 = { key: 1 };
      const _hoisted_9 = {
        key: 0,
        style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6", "margin-bottom": "12px" }
      };
      const _hoisted_10 = ["placeholder"];
      const _hoisted_11 = { key: 2 };
      const _hoisted_12 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _hoisted_13 = { key: 3 };
      const _hoisted_14 = { style: { "color": "#6b7280", "font-size": "13px", "line-height": "1.6" } };
      const _sfc_main = /* @__PURE__ */ defineComponent({
        __name: "TemplateTab",
        props: {
          api: {}
        },
        setup(__props) {
          const storage = ConfigStorage.getInstance();
          const modal = useModal();
          const tree = computed(() => storage.data.value.templateTree);
          const activeTemplateId = computed(() => storage.data.value.activeTemplateId);
          const handleCreateTemplate = () => {
            const data = { content: "{{authorName}} - {{itemName}}\n{{itemUrl}}" };
            const newNode = storage.createNode(tree.value, "新建模板", data, null);
            return newNode.id;
          };
          const handleEditTemplate = async (nodeId) => {
            const node = storage.data.value.templateTree.nodes[nodeId];
            if (!node || !node.data) return;
            const result = await modal.openModal({
              type: "textarea",
              title: "编辑模板内容",
              message: "可用占位符：{{authorName}}, {{itemName}}, {{itemUrl}}",
              placeholder: "输入模板内容...",
              defaultValue: node.data.content
            });
            if (result === null || result === node.data.content) return;
            node.data.content = result;
            node.updatedAt = Date.now();
            storage["saveWithDebounce"]();
          };
          const handleRename = (nodeId, newName) => {
            storage.renameNode(tree.value, nodeId, newName);
          };
          const handleDelete = async (nodeId) => {
            const node = tree.value.nodes[nodeId];
            if (!node) return;
            if (nodeId === activeTemplateId.value) {
              await modal.openModal({
                type: "alert",
                title: "无法删除",
                message: "不能删除当前激活的模板，请先激活其他模板"
              });
              return;
            }
            const confirmed = await modal.openModal({
              type: "delete",
              title: "确认删除",
              message: `确定要删除"${node.name}"吗？`
            });
            if (!confirmed) return;
            storage.deleteNode(tree.value, nodeId);
          };
          const handleActivateTemplate = (nodeId) => {
            const node = tree.value.nodes[nodeId];
            if (!node || !node.data) return;
            storage.data.value.activeTemplateId = nodeId;
            storage["saveWithDebounce"]();
          };
          const customMenuItems = computed(() => [
            {
              label: "选择此模板",
              action: (node) => {
                if (node && node.id !== activeTemplateId.value) {
                  handleActivateTemplate(node.id);
                }
              },
              show: (node) => node !== null && node.data && node.id !== activeTemplateId.value
              // 只在非当前模板的数据节点显示
            }
          ]);
          const getExamplePreview = (content) => {
            return content.replace(/\{\{authorName\}\}/g, "示例作者").replace(/\{\{itemName\}\}/g, "示例商品名称").replace(/\{\{itemUrl\}\}/g, "https://booth.pm/items/1234567");
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              createVNode(unref(Tree), {
                tree: tree.value,
                mode: "list",
                "search-placeholder": "搜索模板...",
                "search-filter": (node, searchText) => node.name.toLowerCase().includes(searchText.toLowerCase()),
                "custom-menu-items": customMenuItems.value,
                "on-create-item": handleCreateTemplate,
                "on-rename": handleRename,
                "on-delete": handleDelete,
                "on-edit": handleEditTemplate
              }, {
                header: withCtx(({ node }) => [
                  node.data && node.id === activeTemplateId.value ? (openBlock(), createElementBlock("span", _hoisted_2, "当前")) : createCommentVNode("", true)
                ]),
                default: withCtx(({ node }) => [
                  createElementVNode("div", _hoisted_3, [
                    createElementVNode("div", _hoisted_4, [
                      createElementVNode("pre", null, toDisplayString(getExamplePreview(node.data.content)), 1)
                    ])
                  ])
                ]),
                _: 1
              }, 8, ["tree", "search-filter", "custom-menu-items"]),
              createVNode(Modal, {
                show: unref(modal).state.value.show,
                title: unref(modal).state.value.title,
                "teleport-to": ".booth-enhancer-sidebar",
                onClose: unref(modal).closeModal
              }, {
                footer: withCtx(() => [
                  unref(modal).state.value.type !== "alert" ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "booth-btn booth-btn-md booth-btn-secondary",
                    onClick: _cache[3] || (_cache[3] = //@ts-ignore
                    (...args) => unref(modal).closeModal && unref(modal).closeModal(...args))
                  }, " 取消 ")) : createCommentVNode("", true),
                  unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("button", {
                    key: 1,
                    class: "booth-btn booth-btn-md booth-btn-danger",
                    onClick: _cache[4] || (_cache[4] = ($event) => unref(modal).confirmModal(true))
                  }, " 删除 ")) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("button", {
                    key: 2,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[5] || (_cache[5] = ($event) => unref(modal).confirmModal())
                  }, " 确定 ")) : (openBlock(), createElementBlock("button", {
                    key: 3,
                    class: "booth-btn booth-btn-md booth-btn-primary",
                    onClick: _cache[6] || (_cache[6] = ($event) => unref(modal).confirmModal())
                  }, " 确定 "))
                ]),
                default: withCtx(() => [
                  unref(modal).state.value.type === "input" ? (openBlock(), createElementBlock("div", _hoisted_5, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(modal).state.value.inputValue = $event),
                      type: "text",
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => unref(modal).confirmModal(), ["enter"]))
                    }, null, 40, _hoisted_7), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "textarea" ? (openBlock(), createElementBlock("div", _hoisted_8, [
                    unref(modal).state.value.message ? (openBlock(), createElementBlock("p", _hoisted_9, toDisplayString(unref(modal).state.value.message), 1)) : createCommentVNode("", true),
                    withDirectives(createElementVNode("textarea", {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(modal).state.value.inputValue = $event),
                      class: "modal-input",
                      placeholder: unref(modal).state.value.placeholder,
                      rows: "8",
                      style: { "font-family": "'Consolas', 'Monaco', monospace", "line-height": "1.5", "font-size": "12px" }
                    }, null, 8, _hoisted_10), [
                      [vModelText, unref(modal).state.value.inputValue]
                    ])
                  ])) : unref(modal).state.value.type === "delete" ? (openBlock(), createElementBlock("div", _hoisted_11, [
                    createElementVNode("p", _hoisted_12, toDisplayString(unref(modal).state.value.message), 1)
                  ])) : unref(modal).state.value.type === "alert" ? (openBlock(), createElementBlock("div", _hoisted_13, [
                    createElementVNode("p", _hoisted_14, toDisplayString(unref(modal).state.value.message), 1)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["show", "title", "onClose"])
            ]);
          };
        }
      });
      const TemplateTab = exports("default", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-addebd0f"]]));

    })
  };
}));

System.register("./useModal-BO7CSXzk-BX-jwFXE.js", ['vue', './__monkey.entry-CiFzQCYM.js'], (function (exports, module) {
  'use strict';
  var ref, defineComponent, computed, createElementBlock, openBlock, createCommentVNode, createBlock, createElementVNode, withDirectives, unref, vModelText, Fragment, renderList, createSlots, withCtx, renderSlot, mergeProps, withModifiers, normalizeClass, Teleport, normalizeStyle, toDisplayString, onMounted, onUnmounted, createVNode, Transition, watch, nextTick, resolveComponent, _export_sfc, ConfigStorage, withSize, icons;
  return {
    setters: [module => {
      ref = module.ref;
      defineComponent = module.defineComponent;
      computed = module.computed;
      createElementBlock = module.createElementBlock;
      openBlock = module.openBlock;
      createCommentVNode = module.createCommentVNode;
      createBlock = module.createBlock;
      createElementVNode = module.createElementVNode;
      withDirectives = module.withDirectives;
      unref = module.unref;
      vModelText = module.vModelText;
      Fragment = module.Fragment;
      renderList = module.renderList;
      createSlots = module.createSlots;
      withCtx = module.withCtx;
      renderSlot = module.renderSlot;
      mergeProps = module.mergeProps;
      withModifiers = module.withModifiers;
      normalizeClass = module.normalizeClass;
      Teleport = module.Teleport;
      normalizeStyle = module.normalizeStyle;
      toDisplayString = module.toDisplayString;
      onMounted = module.onMounted;
      onUnmounted = module.onUnmounted;
      createVNode = module.createVNode;
      Transition = module.Transition;
      watch = module.watch;
      nextTick = module.nextTick;
      resolveComponent = module.resolveComponent;
    }, module => {
      _export_sfc = module._;
      ConfigStorage = module.C;
      withSize = module.w;
      icons = module.i;
    }],
    execute: (function () {

      exports("u", useModal);

      const _hoisted_1$2 = { class: "modal-header" };
      const _hoisted_2$2 = { class: "modal-title" };
      const _hoisted_3$2 = ["innerHTML"];
      const _hoisted_4$2 = { class: "modal-body" };
      const _hoisted_5$2 = {
        key: 0,
        class: "modal-footer"
      };
      const _hoisted_6$2 = ["onClick"];
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
                        createElementVNode("h3", _hoisted_2$2, toDisplayString(_ctx.title || "提示"), 1),
                        createElementVNode("button", {
                          class: "booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm",
                          onClick: handleClose,
                          type: "button"
                        }, [
                          createElementVNode("span", {
                            innerHTML: unref(icons).close
                          }, null, 8, _hoisted_3$2)
                        ])
                      ]),
                      createElementVNode("div", _hoisted_4$2, [
                        renderSlot(_ctx.$slots, "default", {}, void 0, true)
                      ]),
                      _ctx.$slots.footer || _ctx.buttons && _ctx.buttons.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_5$2, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.buttons, (btn) => {
                            return openBlock(), createElementBlock("button", {
                              key: btn.action,
                              class: normalizeClass(["booth-btn booth-btn-md", [`booth-btn-${btn.variant || "secondary"}`]]),
                              onClick: ($event) => handleButtonClick(btn.action),
                              type: "button"
                            }, toDisplayString(btn.text), 11, _hoisted_6$2);
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
      const Modal = exports("M", /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-b90a005d"]]));
      const _hoisted_1$1 = { class: "tree-item" };
      const _hoisted_2$1 = ["innerHTML"];
      const _hoisted_3$1 = {
        key: 1,
        class: "expand-icon placeholder"
      };
      const _hoisted_4$1 = ["innerHTML"];
      const _hoisted_5$1 = ["innerHTML"];
      const _hoisted_6$1 = { class: "name" };
      const _hoisted_7$1 = {
        key: 0,
        class: "count"
      };
      const _hoisted_8$1 = {
        key: 1,
        class: "node-header-extra"
      };
      const _hoisted_9$1 = {
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
          showChildren: { type: Boolean, default: true }
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
          watch(isEditing, async (newValue) => {
            if (newValue) {
              editingName.value = props.node.name;
              await nextTick();
              setTimeout(() => {
                if (inputRef.value) {
                  inputRef.value.focus();
                  inputRef.value.select();
                }
              }, 0);
            }
          }, { immediate: true });
          watch(() => props.editingNodeId, async (newId) => {
            if (newId === props.node.id) {
              editingName.value = props.node.name;
              await nextTick();
              setTimeout(() => {
                if (inputRef.value) {
                  inputRef.value.focus();
                  inputRef.value.select();
                }
              }, 0);
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
          const handleSelect = (node) => {
            emit("select", node);
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
                  class: normalizeClass(["node-item", { "has-custom-content": _ctx.$slots.default, "is-editing": isEditing.value }])
                }, [
                  createElementVNode("div", {
                    class: normalizeClass(["tree-node-content", { "expanded": _ctx.node.expanded, "has-children": hasChildren.value }]),
                    style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + "px" }),
                    onClick: _cache[2] || (_cache[2] = ($event) => !isEditing.value && (hasChildren.value ? toggleExpanded() : handleSelect(_ctx.node))),
                    onContextmenu: _cache[3] || (_cache[3] = withModifiers(($event) => handleContextmenu($event, _ctx.node), ["prevent"]))
                  }, [
                    _ctx.showChildren && hasChildren.value ? (openBlock(), createElementBlock("span", {
                      key: 0,
                      class: "expand-icon",
                      onClick: _cache[0] || (_cache[0] = withModifiers(($event) => !isEditing.value && toggleExpanded(), ["stop"])),
                      innerHTML: unref(withSize)(_ctx.node.expanded ? unref(icons).chevronDown : unref(icons).chevronRight, 12)
                    }, null, 8, _hoisted_2$1)) : (openBlock(), createElementBlock("span", _hoisted_3$1)),
                    isEditing.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                      createElementVNode("span", {
                        class: "icon",
                        innerHTML: unref(withSize)(_ctx.node.data ? unref(icons).file : unref(icons).folder, 16),
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
                    ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
                      createElementVNode("span", {
                        class: "icon",
                        innerHTML: unref(withSize)(_ctx.node.data ? unref(icons).file : unref(icons).folder, 16),
                        style: normalizeStyle({ color: _ctx.node.data ? "#94a3b8" : "#fbbf24" })
                      }, null, 12, _hoisted_5$1),
                      createElementVNode("span", _hoisted_6$1, toDisplayString(_ctx.node.name), 1),
                      hasChildren.value ? (openBlock(), createElementBlock("span", _hoisted_7$1, "(" + toDisplayString(_ctx.node.children.length) + ")", 1)) : createCommentVNode("", true),
                      _ctx.$slots.header ? (openBlock(), createElementBlock("div", _hoisted_8$1, [
                        renderSlot(_ctx.$slots, "header", {
                          node: _ctx.node,
                          level: currentLevel.value
                        }, void 0, true)
                      ])) : createCommentVNode("", true)
                    ], 64))
                  ], 38),
                  _ctx.$slots.default ? (openBlock(), createElementBlock("div", {
                    key: 0,
                    class: "node-custom-content",
                    style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + 36 + "px" }),
                    onContextmenu: _cache[4] || (_cache[4] = withModifiers(($event) => handleContextmenu($event, _ctx.node), ["prevent"]))
                  }, [
                    renderSlot(_ctx.$slots, "default", {
                      node: _ctx.node,
                      level: currentLevel.value
                    }, void 0, true)
                  ], 36)) : createCommentVNode("", true)
                ], 2)
              ], 34),
              isDragOver.value && dropPosition.value === "after" ? (openBlock(), createElementBlock("div", {
                key: 1,
                class: "drop-indicator drop-indicator-after",
                style: normalizeStyle({ paddingLeft: currentLevel.value * 20 + "px" })
              }, null, 4)) : createCommentVNode("", true),
              _ctx.showChildren && _ctx.node.expanded && hasChildren.value ? (openBlock(), createElementBlock("div", _hoisted_9$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(children.value, (child) => {
                  return openBlock(), createBlock(_component_TreeNode, {
                    key: child.id,
                    node: child,
                    tree: _ctx.tree,
                    level: currentLevel.value + 1,
                    "editing-node-id": _ctx.editingNodeId,
                    "show-children": _ctx.showChildren,
                    onSelect: handleSelect,
                    onContextmenu: handleContextmenu,
                    onRename: _cache[5] || (_cache[5] = (nodeId, newName) => emit("rename", nodeId, newName))
                  }, createSlots({ _: 2 }, [
                    renderList(_ctx.$slots, (_, name) => {
                      return {
                        name,
                        fn: withCtx((slotData) => [
                          renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData || {}), void 0, true)
                        ])
                      };
                    })
                  ]), 1032, ["node", "tree", "level", "editing-node-id", "show-children"]);
                }), 128))
              ])) : createCommentVNode("", true)
            ]);
          };
        }
      });
      const TreeNode = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4d1147ae"]]);
      const _hoisted_1 = { class: "tree-wrapper" };
      const _hoisted_2 = {
        key: 0,
        class: "tree-search"
      };
      const _hoisted_3 = ["innerHTML"];
      const _hoisted_4 = ["placeholder"];
      const _hoisted_5 = {
        key: 1,
        class: "search-results"
      };
      const _hoisted_6 = {
        key: 0,
        class: "search-results-list"
      };
      const _hoisted_7 = {
        key: 1,
        class: "search-empty"
      };
      const _hoisted_8 = {
        key: 0,
        class: "empty-state"
      };
      const _hoisted_9 = {
        key: 1,
        class: "tree-content"
      };
      const _hoisted_10 = {
        key: 2,
        class: "menu-separator"
      };
      const _hoisted_11 = ["onClick"];
      const _hoisted_12 = {
        key: 0,
        class: "menu-separator"
      };
      const _hoisted_13 = {
        key: 1,
        class: "menu-separator"
      };
      const _hoisted_14 = ["onClick"];
      const _hoisted_15 = {
        key: 0,
        class: "menu-separator"
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
          onCreateFolder: {},
          onCreateItem: {},
          onRename: {},
          onDelete: {},
          onEdit: {}
        },
        emits: ["select"],
        setup(__props, { emit: __emit }) {
          const props = __props;
          const emit = __emit;
          const configStorage = ConfigStorage.getInstance();
          const searchText = ref("");
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
          const visibleCustomMenuItems = computed(() => {
            if (!props.customMenuItems || props.customMenuItems.length === 0) {
              return [];
            }
            return props.customMenuItems.filter(
              (item) => !item.show || item.show(targetNode.value)
            );
          });
          const visibleCustomMenuItemsForRoot = computed(() => {
            if (!props.customMenuItems || props.customMenuItems.length === 0) {
              return [];
            }
            return props.customMenuItems.filter(
              (item) => !item.show || item.show(null)
            );
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
            const closeMenu = () => {
              contextMenu.value.show = false;
              document.removeEventListener("click", closeMenu);
            };
            setTimeout(() => document.addEventListener("click", closeMenu), 0);
          };
          const handleCreateFolder = () => {
            var _a;
            const parentId = getParentId();
            const newNodeId = (_a = props.onCreateFolder) == null ? void 0 : _a.call(props, parentId);
            contextMenu.value.show = false;
            if (newNodeId) {
              editingNodeId.value = newNodeId;
            }
          };
          const handleCreateItem = () => {
            var _a;
            const parentId = getParentId();
            const newNodeId = (_a = props.onCreateItem) == null ? void 0 : _a.call(props, parentId);
            contextMenu.value.show = false;
            if (newNodeId) {
              editingNodeId.value = newNodeId;
            }
          };
          const handleEdit = () => {
            var _a;
            if (!contextMenu.value.targetId) return;
            (_a = props.onEdit) == null ? void 0 : _a.call(props, contextMenu.value.targetId);
            contextMenu.value.show = false;
          };
          const handleRename = () => {
            if (!contextMenu.value.targetId) return;
            editingNodeId.value = contextMenu.value.targetId;
            contextMenu.value.show = false;
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
              contextMenu.value.show = false;
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
          const handleSelect = (node) => {
            emit("select", node);
          };
          const handleContextmenu = (event, node) => {
            showContextMenu(event, node);
          };
          return (_ctx, _cache) => {
            return openBlock(), createElementBlock("div", _hoisted_1, [
              _ctx.searchFilter ? (openBlock(), createElementBlock("div", _hoisted_2, [
                createElementVNode("span", {
                  class: "search-icon",
                  innerHTML: unref(withSize)(unref(icons).search, 14)
                }, null, 8, _hoisted_3),
                withDirectives(createElementVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchText.value = $event),
                  type: "text",
                  placeholder: _ctx.searchPlaceholder || "搜索...",
                  class: "search-input"
                }, null, 8, _hoisted_4), [
                  [vModelText, searchText.value]
                ])
              ])) : createCommentVNode("", true),
              isSearching.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
                hasSearchResults.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(searchResults.value, (node) => {
                    return openBlock(), createBlock(TreeNode, {
                      key: node.id,
                      node,
                      tree: _ctx.tree,
                      level: 0,
                      "editing-node-id": editingNodeId.value,
                      "show-children": false,
                      onSelect: handleSelect,
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
                    ]), 1032, ["node", "tree", "editing-node-id"]);
                  }), 128))
                ])) : (openBlock(), createElementBlock("div", _hoisted_7, " 没有找到匹配的结果 "))
              ])) : (openBlock(), createElementBlock("div", {
                key: 2,
                class: normalizeClass(["node-tree", { "tree-drag-over": isTreeDragOver.value }]),
                onContextmenu: withModifiers(handleRootContextmenu, ["prevent"]),
                onDragover: handleTreeDragOver,
                onDragleave: handleTreeDragLeave,
                onDrop: handleTreeDrop
              }, [
                rootNodes.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_8, " 暂无数据，右键新建 ")) : (openBlock(), createElementBlock("div", _hoisted_9, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(rootNodes.value, (node) => {
                    return openBlock(), createBlock(TreeNode, {
                      key: node.id,
                      node,
                      tree: _ctx.tree,
                      level: 0,
                      "editing-node-id": editingNodeId.value,
                      "show-children": _ctx.mode === "tree",
                      onSelect: handleSelect,
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
                    ]), 1032, ["node", "tree", "editing-node-id", "show-children"]);
                  }), 128))
                ]))
              ], 34)),
              (openBlock(), createBlock(Teleport, { to: "body" }, [
                contextMenu.value.show ? (openBlock(), createElementBlock("div", {
                  key: 0,
                  class: "context-menu",
                  style: normalizeStyle({ left: contextMenu.value.x + "px", top: contextMenu.value.y + "px" })
                }, [
                  targetNode.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    _ctx.mode === "tree" ? (openBlock(), createElementBlock("div", {
                      key: 0,
                      class: "menu-item",
                      onClick: handleCreateFolder
                    }, "新建文件夹节点")) : createCommentVNode("", true),
                    createElementVNode("div", {
                      class: "menu-item",
                      onClick: handleCreateItem
                    }, "新建数据节点"),
                    _cache[1] || (_cache[1] = createElementVNode("div", { class: "menu-separator" }, null, -1)),
                    createElementVNode("div", {
                      class: "menu-item",
                      onClick: handleRename
                    }, "重命名"),
                    targetNode.value.data && _ctx.onEdit ? (openBlock(), createElementBlock("div", {
                      key: 1,
                      class: "menu-item",
                      onClick: handleEdit
                    }, "编辑数据")) : createCommentVNode("", true),
                    visibleCustomMenuItems.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_10)) : createCommentVNode("", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(visibleCustomMenuItems.value, (item, index) => {
                      return openBlock(), createElementBlock(Fragment, { key: index }, [
                        createElementVNode("div", {
                          class: normalizeClass(["menu-item", { "menu-item-danger": item.danger }]),
                          onClick: () => {
                            item.action(targetNode.value);
                            contextMenu.value.show = false;
                          }
                        }, toDisplayString(item.label), 11, _hoisted_11),
                        item.separator ? (openBlock(), createElementBlock("div", _hoisted_12)) : createCommentVNode("", true)
                      ], 64);
                    }), 128)),
                    _cache[2] || (_cache[2] = createElementVNode("div", { class: "menu-separator" }, null, -1)),
                    createElementVNode("div", {
                      class: "menu-item menu-item-danger",
                      onClick: handleDelete
                    }, "删除")
                  ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    _ctx.mode === "tree" ? (openBlock(), createElementBlock("div", {
                      key: 0,
                      class: "menu-item",
                      onClick: handleCreateFolder
                    }, "新建文件夹节点")) : createCommentVNode("", true),
                    createElementVNode("div", {
                      class: "menu-item",
                      onClick: handleCreateItem
                    }, "新建数据节点"),
                    visibleCustomMenuItemsForRoot.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_13)) : createCommentVNode("", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(visibleCustomMenuItemsForRoot.value, (item, index) => {
                      return openBlock(), createElementBlock(Fragment, { key: index }, [
                        createElementVNode("div", {
                          class: normalizeClass(["menu-item", { "menu-item-danger": item.danger }]),
                          onClick: () => {
                            item.action(null);
                            contextMenu.value.show = false;
                          }
                        }, toDisplayString(item.label), 11, _hoisted_14),
                        item.separator ? (openBlock(), createElementBlock("div", _hoisted_15)) : createCommentVNode("", true)
                      ], 64);
                    }), 128))
                  ], 64))
                ], 4)) : createCommentVNode("", true)
              ]))
            ]);
          };
        }
      });
      const Tree = exports("T", /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c4c782fd"]]));
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
        let rejectPromise = null;
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
          return new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
        };
        const closeModal = () => {
          state.value.show = false;
          if (rejectPromise) {
            rejectPromise();
            resolvePromise = null;
            rejectPromise = null;
          }
        };
        const confirmModal = (result) => {
          state.value.show = false;
          if (resolvePromise) {
            resolvePromise(result !== void 0 ? result : state.value.inputValue);
            resolvePromise = null;
            rejectPromise = null;
          }
        };
        const confirm = (title, message) => {
          return openModal({
            type: "delete",
            title,
            defaultValue: message || ""
          }).then(() => true).catch(() => false);
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