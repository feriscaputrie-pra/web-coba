/**
 * db.js - Database sementara (localStorage) untuk CMS TK.
 * TAHAP FRONTEND: data hanya tersimpan di browser ini.
 * NANTI (backend): ganti ISI fungsi di bawah dengan panggilan Firebase/Supabase,
 * NAMA fungsi jangan diubah supaya admin.js & situs publik tidak perlu diubah.
 */
(function () {
  'use strict';
  var KEY = 'kindergartenDB_v1';
  var teachers = [
    ['Guru Kelas A'], ['Guru Kelas B'], ['Guru Kelompok Bermain'], ['Guru Pendamping'],
    ['Guru Pendamping'], ["Guru Al-Qur'an & Karakter"], ['Staf Tata Usaha'], ['Penjaga Sekolah']
  ].map(function (r, i) {
    return { id: 'T' + (i + 1), name: '[Nama Guru ' + (i + 1) + ']', role: r[0], education: '', experience: '', phone: '', status: 'Aktif', quote: '', photoUrl: 'images/guru-' + (i + 1) + '.jpg' };
  });
  var gal = [['Kegiatan Belajar', 'Belajar Mengajar'], ['Kreasi Seni', 'Ekstrakurikuler'], ['Mengaji & Hafalan', 'Ekstrakurikuler'],
             ['Pentas Seni', 'Pentas Seni & Wisuda'], ['Outing Class', 'Ekstrakurikuler'], ['Lomba & Prestasi', 'Ekstrakurikuler']
  ].map(function (r, i) {
    return { id: 'G' + (i + 1), title: r[0], category: r[1], date: '', imageUrl: 'images/galeri-' + (i + 1) + '.jpg', description: '' };
  });
  var SECS = [
    ['hero', 'Hero / Banner Utama', 'Judul besar dan slideshow foto.', '.hero-section', false],
    ['profil', 'Sambutan Kepala Sekolah', 'Foto dan sambutan kepala sekolah.', '#profil', true],
    ['sejarah', 'Sejarah Singkat', 'Sejarah sekolah per tahun.', '#sejarah', true],
    ['info', 'Informasi Sekolah', 'Informasi umum sekolah.', '#info', true],
    ['prestasi', 'Prestasi', 'Anak berprestasi.', '#prestasi', true],
    ['visi', 'Visi & Misi', 'Visi dan misi sekolah.', '#visi', true],
    ['sasaran', 'Sasaran Kualitas & Agenda', 'Sasaran kualitas dan agenda rutin.', '#sasaran', true],
    ['guru', 'Guru & Staf', 'Profil guru dan staf.', '#guru', true],
    ['akademik', 'Akademik', 'Program akademik.', '#akademik', true],
    ['galeri', 'Galeri Kegiatan', 'Foto-foto kegiatan.', '#galeri', true],
    ['testimoni', 'Testimoni', 'Kesan orang tua.', '#testimoni', true],
    ['lokasi', 'Lokasi', 'Peta dan alamat.', '#lokasi', true]
  ].map(function (r, i) { return { id: r[0], name: r[1], description: r[2], selector: r[3], canToggle: r[4], enabled: true, order: i + 1 }; });

  function seed() {
    return {
      profile: {
        name: "TK Bustanul Athfal 'Aisyiyah Pacitan",
        tagline: 'MEMBENTUK GENERASI\nCERDAS & BERAKHLAK',
        subtagline: 'Pendidikan anak usia dini yang menumbuhkan generasi berakhlak, mandiri, cerdas, kreatif, dan ceria melalui metode belajar sambil bermain.',
        npsn: '', accreditation: 'A', foundedYear: '',
        principalName: 'Ir. Pakde Solo', principalTitle: 'Kepala Sekolah',
        principalSpeech: 'Pendidikan anak usia dini merupakan fondasi penting dalam perjalanan hidup anak. Di TK Bustanul Athfal, kami berkomitmen menciptakan lingkungan belajar yang aman, menyenangkan, dan penuh kasih sayang. Kami percaya bahwa setiap anak memiliki potensi unik yang patut dikembangkan. Melalui metode saintifik serta Learning Through Play, kami menanamkan nilai-nilai keagamaan, kemandirian anak sejak dini agar mereka siap melangkah ke masa depan dengan percaya diri.',
        principalPhoto: 'images/kepala-sekolah.png',
        vision: 'Mewujudkan generasi yang berakhlak mulia, sehat, mandiri, cerdas dan kreatif.',
        missions: ['Membiasakan perilaku islami dalam kehidupan sehari-hari', 'Membiasakan hidup sehat', 'Mengembangkan kemandirian anak melalui kegiatan life skill', 'Melatih dan mengembangkan kecerdasan anak dalam berpikir kritis', 'Menerapkan pembelajaran berbasis IT', 'Menyelenggarakan pembelajaran kreatif dan menyenangkan'],
        history: '', phone: '', whatsapp: '', email: '', address: 'Jl. H. Samanhudi No.05, Pacitan', operatingHours: '', mapsEmbedUrl: '',
        socials: { instagram: '', facebook: '', youtube: '' }
      },
      teachers: teachers, gallery: gal, articles: [], ppdb: [], inbox: [], sections: SECS
    };
  }
  var cache = null;
  function load() {
    if (cache) return cache;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var s = seed();
    if (!d) d = s;
    Object.keys(s).forEach(function (k) { if (d[k] === undefined) d[k] = s[k]; });
    d.profile = Object.assign({}, s.profile, d.profile);
    // pastikan semua section bawaan ada (selector selalu dari kode)
    d.sections = s.sections.map(function (def) {
      var f = (d.sections || []).filter(function (x) { return x.id === def.id; })[0];
      return f ? Object.assign({}, def, { enabled: def.canToggle ? f.enabled !== false : true, order: f.order }) : def;
    });
    return (cache = d);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); }
    catch (e) { alert('Penyimpanan penuh. Gunakan foto yang lebih kecil (maks ±500KB).'); return false; }
    try { window.dispatchEvent(new Event('kindergarten_db_updated')); } catch (e) {}
    return true;
  }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0] || null; }
  function upsert(list, obj, p) {
    var o = Object.assign({}, obj);
    if (!o.id) { o.id = uid(p); list.unshift(o); }
    else { var i = list.findIndex(function (x) { return x.id === o.id; }); if (i < 0) list.unshift(o); else list[i] = Object.assign({}, list[i], o); }
    save(); return o;
  }
  function remove(list, id) { var i = list.findIndex(function (x) { return x.id === id; }); if (i >= 0) list.splice(i, 1); save(); }

  window.KindergartenDB = {
    init: function () { load(); if (!localStorage.getItem(KEY)) save(); },
    getProfile: function () { return load().profile; },
    updateProfile: function (p) { var d = load(); d.profile = Object.assign({}, d.profile, p); save(); },
    getStats: function () {
      var d = load();
      return {
        totalStudents: d.ppdb.length,
        pendingStudents: d.ppdb.filter(function (x) { return x.status === 'Menunggu Verifikasi'; }).length,
        totalGallery: d.gallery.length, totalArticles: d.articles.length, totalTeachers: d.teachers.length,
        totalInbox: d.inbox.length, unreadInbox: d.inbox.filter(function (m) { return !m.isRead; }).length
      };
    },
    getTeachers: function () { return load().teachers; },
    getTeacherById: function (id) { return find(load().teachers, id); },
    saveTeacher: function (t) { return upsert(load().teachers, t, 'T'); },
    deleteTeacher: function (id) { remove(load().teachers, id); },
    getArticles: function () { return load().articles; },
    getArticleById: function (id) { return find(load().articles, id); },
    saveArticle: function (a) { return upsert(load().articles, a, 'A'); },
    deleteArticle: function (id) { remove(load().articles, id); },
    getGallery: function () { return load().gallery; },
    getGalleryById: function (id) { return find(load().gallery, id); },
    saveGallery: function (g) { return upsert(load().gallery, g, 'G'); },
    deleteGallery: function (id) { remove(load().gallery, id); },
    getPPDB: function () { return load().ppdb; },
    getPPDBById: function (id) { return find(load().ppdb, id); },
    addPPDB: function (r) {
      var d = load(), n = d.ppdb.length + 1;
      var o = Object.assign({ id: 'PPDB-' + new Date().getFullYear() + '-' + ('000' + n).slice(-3), status: 'Menunggu Verifikasi', registerDate: new Date().toISOString().slice(0, 10), notes: '' }, r);
      d.ppdb.unshift(o); save(); return o;
    },
    updatePPDBStatus: function (id, status, notes) { var r = find(load().ppdb, id); if (r) { r.status = status; r.notes = notes; save(); } },
    deletePPDB: function (id) { remove(load().ppdb, id); },
    exportPPDBToCSV: function () {
      var l = load().ppdb; if (!l.length) return '';
      var cols = ['id', 'registerDate', 'childName', 'nickname', 'gender', 'birthPlace', 'birthDate', 'programClass', 'parentName', 'parentJob', 'parentPhone', 'address', 'status', 'notes'];
      var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      return [cols.join(',')].concat(l.map(function (r) { return cols.map(function (c) { return q(r[c]); }).join(','); })).join('\n');
    },
    getInbox: function () { return load().inbox; },
    addMessage: function (m) { var o = Object.assign({ id: uid('M'), date: new Date().toISOString().slice(0, 10), isRead: false }, m); load().inbox.unshift(o); save(); return o; },
    markInboxRead: function (id, status) { var m = find(load().inbox, id); if (m) { m.isRead = status !== false; save(); } },
    deleteMessage: function (id) { remove(load().inbox, id); },
    getSections: function () { return load().sections.slice().sort(function (a, b) { return a.order - b.order; }); },
    toggleSection: function (id, enabled) { var s = find(load().sections, id); if (s && s.canToggle) { s.enabled = !!enabled; save(); } },
    reorderSection: function (id, dir) {
      var l = this.getSections(), i = l.findIndex(function (s) { return s.id === id; }), j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= l.length) return;
      var t = l[i].order; l[i].order = l[j].order; l[j].order = t; save();
    },
    exportJSON: function () { return JSON.stringify(load(), null, 2); },
    importJSON: function (str) {
      try { var d = JSON.parse(str); if (!d || typeof d !== 'object' || !d.profile) throw new Error('Format berkas tidak dikenali.'); cache = d; cache = null; localStorage.setItem(KEY, JSON.stringify(d)); load(); save(); return { success: true }; }
      catch (e) { return { success: false, error: e.message }; }
    },
    resetToDefaults: function () { cache = seed(); save(); cache = null; }
  };
})();
