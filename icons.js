// ---- ScriptDrop Custom Icon System ----
// Uso: SD.icon('nome') retorna SVG inline
const SD = {
  icon(name, size = 18, extra = '') {
    const s = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0" ${extra}`;
    const icons = {

      // ↓ Chevron down
      chevdown: `<svg ${s}><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // ⚡ Logo / Home
      bolt: `<svg ${s}><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,

      // 🏠 Home
      home: `<svg ${s}><path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,

      // </> Scripts / Code
      code: `<svg ${s}><path d="M8 6L2 12L8 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 6L22 12L16 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 3L10 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/></svg>`,

      // 🔍 Search
      search: `<svg ${s}><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,

      // 🔔 Bell
      bell: `<svg ${s}><path d="M6 10C6 7 8.7 4 12 4C15.3 4 18 7 18 10V14L20 17H4L6 14V10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 👤 User / Profile
      user: `<svg ${s}><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ⚙️ Settings / Gear
      gear: `<svg ${s}><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 👑 Crown / Owner
      crown: `<svg ${s}><path d="M3 18H21M5 18L3 7L8 12L12 4L16 12L21 7L19 18H5Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="4" r="1.5" fill="#ffd700"/><circle cx="3" cy="7" r="1.5" fill="#ffd700"/><circle cx="21" cy="7" r="1.5" fill="#ffd700"/></svg>`,

      // ➕ Plus / Post
      plus: `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,

      // 📋 Copy
      copy: `<svg ${s}><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4C3 15 3 14 3 13V4C3 3 3 3 4 3H13C14 3 15 3 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ✅ Check / Verified
      check: `<svg ${s}><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🚀 Rocket
      rocket: `<svg ${s}><path d="M12 2C12 2 17 5 17 12L15 14H9L7 12C7 5 12 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 14L7 19L12 17L17 19L15 14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2" fill="currentColor"/></svg>`,

      // 🔥 Fire / Trending
      fire: `<svg ${s}><path d="M12 2C12 2 14 6 13 9C15 7 16 4 16 4C16 4 20 8 19 13C18 17 15 20 12 20C9 20 4 17 4 13C4 9 7 6 7 6C7 6 8 9 10 10C9 7 12 2 12 2Z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M12 20C12 20 10 17 11 15C10 16 9 16 9 16C9 16 10 13 12 13C14 13 15 16 15 16C15 16 14 16 13 15C14 17 12 20 12 20Z" fill="#ff9500" stroke="none"/></svg>`,

      // 💬 Comment
      comment: `<svg ${s}><path d="M4 4H20C21.1 4 22 4.9 22 6V16C22 17.1 21.1 18 20 18H8L4 22V6C4 4.9 4.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,

      // 👥 Follow / Users
      users: `<svg ${s}><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="2"/><path d="M3 20C3 17.2 5.7 15 9 15C12.3 15 15 17.2 15 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" stroke-width="1.8" opacity="0.6"/><path d="M17 14C19.2 14 21 15.8 21 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/></svg>`,

      // ➕ User Follow
      userplus: `<svg ${s}><circle cx="10" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M2 20C2 16.7 5.6 14 10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 14V20M14 17H20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,

      // ✔️ User Following
      usercheck: `<svg ${s}><circle cx="10" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M2 20C2 16.7 5.6 14 10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 17L16 19L20 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🎵 Music
      music: `<svg ${s}><path d="M9 18V6L21 4V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/></svg>`,

      // 🔊 Volume
      volume: `<svg ${s}><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 5.5C21 7.5 22 9.7 22 12C22 14.3 21 16.5 19 18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🔇 Mute
      mute: `<svg ${s}><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M23 9L17 15M17 9L23 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ▶ Play
      play: `<svg ${s}><path d="M6 4L20 12L6 20V4Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,

      // ⏸ Pause
      pause: `<svg ${s}><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>`,

      // 🏆 Trophy / Award
      trophy: `<svg ${s}><path d="M8 2H16V10C16 13.3 14.2 15 12 15C9.8 15 8 13.3 8 10V2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 5H4C4 5 3 9 6 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 5H20C20 5 21 9 18 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 15V18M9 22H15M9 18H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🛡️ Shield / Verified
      shield: `<svg ${s}><path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🗑️ Trash
      trash: `<svg ${s}><path d="M3 6H21M8 6V4H16V6M19 6L18 20H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11V17M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ⚠️ Warn
      warn: `<svg ${s}><path d="M12 2L22 20H2L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9V13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/></svg>`,

      // 🚫 Ban
      ban: `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M5.6 5.6L18.4 18.4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,

      // 🔓 Unban
      unlock: `<svg ${s}><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7C7 4.8 9.2 3 12 3C14.8 3 17 4.8 17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,

      // ⏱ Timeout / Clock
      clock: `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 📌 Pin / Tag
      tag: `<svg ${s}><path d="M12 2H7C5.9 2 5 2.9 5 4V9L11.3 15.3C12.1 16.1 13.4 16.1 14.2 15.3L18.3 11.2C19.1 10.4 19.1 9.1 18.3 8.3L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8.5" cy="6.5" r="1.5" fill="currentColor"/></svg>`,

      // 👁 Eye / Views
      eye: `<svg ${s}><path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>`,

      // 📅 Calendar
      calendar: `<svg ${s}><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9H21M8 2V6M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🎮 Gamepad
      gamepad: `<svg ${s}><rect x="2" y="7" width="20" height="12" rx="4" stroke="currentColor" stroke-width="2"/><path d="M7 11V13M6 12H8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>`,

      // 📁 File / Raw
      file: `<svg ${s}><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 13H16M8 17H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ✉️ Message / Envelope
      envelope: `<svg ${s}><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M2 7L12 13L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🔗 Link / Chain
      link: `<svg ${s}><path d="M10 13C10.6 13.8 11.5 14.4 12.5 14.4C13.5 14.4 14.5 14 15.2 13.3L18.2 10.3C19.6 8.9 19.6 6.6 18.2 5.2C16.8 3.8 14.5 3.8 13.1 5.2L11.6 6.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 11C13.4 10.2 12.5 9.6 11.5 9.6C10.5 9.6 9.5 10 8.8 10.7L5.8 13.7C4.4 15.1 4.4 17.4 5.8 18.8C7.2 20.2 9.5 20.2 10.9 18.8L12.4 17.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ↩ Sign out
      signout: `<svg ${s}><path d="M9 21H5C4 21 3 20 3 19V5C3 4 4 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🖼 Image / Banner
      image: `<svg ${s}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15L16 10L11 15L8 12L3 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🎨 Paint / Appearance
      paint: `<svg ${s}><path d="M12 2C7 2 3 6 3 11C3 14 4.5 16.5 7 18L8 22H16L17 18C19.5 16.5 21 14 21 11C21 6 17 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/></svg>`,

      // 🔒 Lock / Security
      lock: `<svg ${s}><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7C7 4.8 9.2 3 12 3C14.8 3 17 4.8 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,

      // 📊 Stats / Chart
      chart: `<svg ${s}><path d="M3 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="5" y="12" width="3" height="8" rx="1" fill="currentColor"/><rect x="10.5" y="7" width="3" height="13" rx="1" fill="currentColor"/><rect x="16" y="4" width="3" height="16" rx="1" fill="currentColor"/></svg>`,

      // 🏷 Tags
      tags: `<svg ${s}><path d="M12 2H7C5.9 2 5 2.9 5 4V9L11.3 15.3C12.1 16.1 13.4 16.1 14.2 15.3L18.3 11.2C19.1 10.4 19.1 9.1 18.3 8.3L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8.5" cy="6.5" r="1.5" fill="currentColor"/><path d="M3 7L3 12L9 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>`,

      // 🕐 Recent / Time
      recent: `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L9 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 📤 Upload / Send
      send: `<svg ${s}><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,

      // ℹ Info
      info: `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8V8.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M12 11V16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,

      // 🔄 Refresh / Reset
      reset: `<svg ${s}><path d="M3 12C3 7 7 3 12 3C15.3 3 18.2 4.7 20 7.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 12C21 17 17 21 12 21C8.7 21 5.8 19.3 4 16.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 21V16H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🌐 Layers / More Scripts
      layers: `<svg ${s}><path d="M12 2L22 7L12 12L2 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // ✏️ Edit / Pen
      edit: `<svg ${s}><path d="M11 4H4C3 4 2 5 2 6V20C2 21 3 22 4 22H18C19 22 20 21 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,

      // 🏅 Badge / Medal
      medal: `<svg ${s}><circle cx="12" cy="14" r="7" stroke="currentColor" stroke-width="2"/><path d="M8.5 3L7 7H17L15.5 3H8.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 7L8 10M15 7L16 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><path d="M10 14L11.5 16L14 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

      // 🔑 Key / Password
      key: `<svg ${s}><circle cx="8" cy="12" r="5" stroke="currentColor" stroke-width="2"/><path d="M13 12H22M19 9V12M22 9V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,

      // 🗂 Folder / Category
      folder: `<svg ${s}><path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,

    };
    return icons[name] || `<svg ${s}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>`;
  },

  // Substitui todos os <sd-icon name="x"> no DOM
  render() {
    document.querySelectorAll('sd-icon').forEach(el => {
      const name = el.getAttribute('name');
      const size = parseInt(el.getAttribute('size') || '18');
      const cls  = el.getAttribute('class') || '';
      const wrapper = document.createElement('span');
      wrapper.className = 'sd-icon ' + cls;
      wrapper.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;';
      wrapper.innerHTML = SD.icon(name, size);
      el.replaceWith(wrapper);
    });
  }
};

// Auto-render on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SD.render());
} else {
  SD.render();
}
