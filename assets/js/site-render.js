/**
 * site-render.js - Mengisi halaman publik (index.html) dari KindergartenDB.
 * Harus dimuat SEBELUM script.js. Jika DB gagal dimuat, isi HTML bawaan tetap tampil.
 */
(function () {
  'use strict';
  if (!window.KindergartenDB) return;
  var DB = KindergartenDB;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(q) { return document.querySelector(q); }
  try {
    DB.init();
    var p = DB.getProfile();

    // Hero
    var h1 = $('.hero-content h1'), lead = $('.hero-content .lead-l');
    if (h1 && p.tagline) h1.innerHTML = String(p.tagline).split(/\r?\n|<br\s*\/?>/i).map(esc).join('<br>');
    if (lead && p.subtagline) lead.textContent = p.subtagline;

    // Sambutan kepala sekolah
    var kimg = $('.kepala-frame img'), badge = $('.kepala-badge'), sp = $('.sambutan-text p');
    if (kimg && p.principalPhoto) kimg.src = p.principalPhoto;
    if (badge && p.principalName) badge.textContent = p.principalName;
    if (sp && p.principalSpeech) sp.textContent = p.principalSpeech;

    // Visi & Misi
    var vt = $('.visi-text'), ml = $('.misi-list');
    if (vt && p.vision) vt.textContent = p.vision;
    if (ml && p.missions && p.missions.length) ml.innerHTML = p.missions.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');

    // Guru & Staf
    var grid = $('.guru-grid');
    if (grid) {
      var t = DB.getTeachers().filter(function (x) { return x.status !== 'Non-aktif'; });
      grid.innerHTML = t.map(function (x) {
        return '<article class="guru-card"><div class="guru-frame"><div class="guru-photo">' +
          '<span class="guru-placeholder" aria-hidden="true"><svg class="i guru-placeholder-ico" focusable="false"><use href="#i-user"/></svg></span>' +
          (x.photoUrl ? '<img src="' + esc(x.photoUrl) + '" alt="Foto ' + esc(x.name) + '" loading="lazy" onload="this.parentElement.classList.add(\'has-photo\')" onerror="this.remove()">' : '') +
          '</div></div><h3 class="guru-nama">' + esc(x.name) + '</h3><span class="guru-jabatan">' + esc(x.role) + '</span></article>';
      }).join('');
    }

    // Galeri
    var gg = $('.galeri-grid'), icons = ['i-grad', 'i-palette', 'i-book', 'i-mic', 'i-bus', 'i-trophy'];
    if (gg) {
      gg.innerHTML = DB.getGallery().map(function (x, i) {
        return '<button type="button" class="g g' + ((i % 6) + 1) + '" aria-label="Perbesar foto: ' + esc(x.title) + '">' +
          '<img src="' + esc(x.imageUrl) + '" alt="' + esc(x.title) + '" loading="lazy" onload="this.parentElement.classList.add(\'has-photo\')" onerror="this.remove()">' +
          '<span class="g-ico"><svg class="i" aria-hidden="true" focusable="false"><use href="#' + icons[i % 6] + '"/></svg></span>' +
          '<span class="g-cap">' + esc(x.title) + '</span></button>';
      }).join('');
    }

    // Tampil/sembunyi & urutan section
    var main = $('main');
    if (main) DB.getSections().forEach(function (s) {
      var el = $(s.selector); if (!el) return;
      if (s.enabled === false) el.style.display = 'none'; else el.style.display = '';
      main.appendChild(el);
    });
  } catch (e) { console.warn('site-render: memakai isi HTML bawaan.', e); }
})();
